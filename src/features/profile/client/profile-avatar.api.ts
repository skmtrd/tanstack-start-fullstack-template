import {
  profileAvatarConfig,
  profileAvatarEndpoint,
  type ProfileAvatar,
} from "#/features/profile/shared/profile.types";

async function responseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function uploadProfileAvatar(file: File) {
  const formData = new FormData();
  formData.set(profileAvatarConfig.fieldName, file);

  const response = await fetch(profileAvatarEndpoint(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await responseError(response, "Avatar could not be uploaded"));
  }

  const body = (await response.json()) as { avatar: ProfileAvatar | null };
  return body.avatar;
}

export async function removeProfileAvatar() {
  const response = await fetch(profileAvatarEndpoint(), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await responseError(response, "Avatar could not be removed"));
  }

  const body = (await response.json()) as { avatar: ProfileAvatar | null };
  return body.avatar;
}
