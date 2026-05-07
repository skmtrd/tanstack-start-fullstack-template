import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "#/db";
import { user } from "#/db/schema";
import { auth } from "#/features/auth/server/auth.server";
import { serializeProfile } from "#/features/profile/server/profile.serializers.server";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  bio: z.string().trim().max(500).default(""),
});

async function requireSession() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
    asResponse: false,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

async function requireProfileRow(userId: string) {
  const [profile] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
}

export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession();
  const profile = await requireProfileRow(session.user.id);

  return serializeProfile(profile);
});

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const now = new Date();

    const [profile] = await db
      .update(user)
      .set({
        name: data.name,
        bio: data.bio || null,
        updatedAt: now,
      })
      .where(eq(user.id, session.user.id))
      .returning();

    if (!profile) {
      throw new Error("Profile not found");
    }

    return serializeProfile(profile);
  });
