import { createFileRoute } from "@tanstack/react-router";

import {
  clearProfileAvatar,
  findProfileByUserId,
  getProfileAvatar,
  replaceProfileAvatar,
} from "./-avatar.server";
import { auth } from "#/features/auth/server/auth.server";
import { profileAvatarConfig } from "#/features/profile/shared/profile.types";
import { parseImageUploadFile } from "#/features/uploads/server/image-file.server";

function jsonError(message: string, status: number) {
  return Response.json({ message }, { status });
}

async function requireAvatarProfile(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    asResponse: false,
  });

  if (!session) {
    return { response: jsonError("Unauthorized", 401) };
  }

  const profile = await findProfileByUserId(session.user.id);

  if (!profile) {
    return { response: jsonError("Profile not found", 404) };
  }

  return { profile };
}

export const Route = createFileRoute("/api/profile/avatar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const result = await requireAvatarProfile(request);

        if ("response" in result) {
          return result.response;
        }

        const object = await getProfileAvatar(result.profile);

        if (!object) {
          return jsonError("Avatar not found", 404);
        }

        const headers = new Headers();
        headers.set(
          "content-type",
          result.profile.avatarImageContentType ??
            object.httpMetadata?.contentType ??
            "application/octet-stream",
        );
        headers.set("content-length", String(object.size));
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "private, max-age=300");

        return new Response(object.body, { headers });
      },
      POST: async ({ request }) => {
        const result = await requireAvatarProfile(request);

        if ("response" in result) {
          return result.response;
        }

        const formData = await request.formData();
        const image = formData.get(profileAvatarConfig.fieldName);
        const parsedImage = parseImageUploadFile(image, profileAvatarConfig);

        if ("error" in parsedImage) {
          return jsonError(parsedImage.error.message, parsedImage.error.status);
        }

        const nextAvatar = await replaceProfileAvatar(result.profile, parsedImage.file);

        if (!nextAvatar) {
          return jsonError("Profile not found", 404);
        }

        return Response.json({ avatar: nextAvatar });
      },
      DELETE: async ({ request }) => {
        const result = await requireAvatarProfile(request);

        if ("response" in result) {
          return result.response;
        }

        const nextAvatar = await clearProfileAvatar(result.profile);

        if (nextAvatar === undefined) {
          return jsonError("Profile not found", 404);
        }

        return Response.json({ avatar: nextAvatar });
      },
    },
  },
});
