import { eq } from "drizzle-orm";

import { db } from "#/db";
import { user } from "#/db/schema";
import { createImageObjectKey } from "#/features/uploads/server/image-key.server";
import {
  deleteImageObject,
  deleteImageObjectSafely,
  getImageObject,
  putImageObject,
} from "#/features/uploads/server/r2-object.server";
import {
  serializeProfileAvatar,
  versionedProfileAvatarUrl,
  type UserProfileRow,
} from "#/features/profile/server/profile.serializers.server";

export async function findProfileByUserId(userId: string) {
  const [profile] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  return profile ?? null;
}

export function getProfileAvatar(profile: UserProfileRow) {
  return getImageObject(profile.avatarImageKey);
}

export async function replaceProfileAvatar(profile: UserProfileRow, image: File) {
  const previousImageKey = profile.avatarImageKey;
  const imageKey = createImageObjectKey({
    prefix: "profile-avatars",
    ownerId: profile.id,
    resourceId: "avatar",
    file: image,
  });
  const now = new Date();

  await putImageObject({
    key: imageKey,
    file: image,
    customMetadata: {
      userId: profile.id,
      originalName: image.name,
    },
  });

  const [updatedProfile] = await db
    .update(user)
    .set({
      image: versionedProfileAvatarUrl(now),
      avatarImageKey: imageKey,
      avatarImageName: image.name,
      avatarImageContentType: image.type,
      avatarImageSize: image.size,
      updatedAt: now,
    })
    .where(eq(user.id, profile.id))
    .returning();

  if (!updatedProfile) {
    await deleteImageObject(imageKey);
    return null;
  }

  if (previousImageKey && previousImageKey !== imageKey) {
    await deleteProfileAvatarObject(previousImageKey);
  }

  return serializeProfileAvatar(updatedProfile);
}

export async function clearProfileAvatar(profile: UserProfileRow) {
  const previousImageKey = profile.avatarImageKey;
  const now = new Date();

  const [updatedProfile] = await db
    .update(user)
    .set({
      image: null,
      avatarImageKey: null,
      avatarImageName: null,
      avatarImageContentType: null,
      avatarImageSize: null,
      updatedAt: now,
    })
    .where(eq(user.id, profile.id))
    .returning();

  if (!updatedProfile) {
    return undefined;
  }

  if (previousImageKey) {
    await deleteProfileAvatarObject(previousImageKey);
  }

  return null;
}

export async function deleteProfileAvatarObject(imageKey: string | null) {
  await deleteImageObjectSafely(imageKey, { logContext: { feature: "profile-avatar" } });
}
