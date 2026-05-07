import {
  defaultImageUploadConfig,
  type UploadedImage,
} from "#/features/uploads/shared/image-upload.types";

export type ProfileAvatar = UploadedImage;

export type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: ProfileAvatar | null;
  createdAt: string | null;
  updatedAt: string;
};

export const profileKeys = {
  current: ["profile"] as const,
};

export const profileAvatarConfig = defaultImageUploadConfig;

export function profileAvatarEndpoint() {
  return "/api/profile/avatar";
}

export function profileAvatarUrl(version: number) {
  return `${profileAvatarEndpoint()}?v=${version}`;
}
