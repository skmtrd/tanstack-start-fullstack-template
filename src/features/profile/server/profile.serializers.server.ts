import { user } from "#/db/schema";
import {
  profileAvatarUrl,
  type Profile,
  type ProfileAvatar,
} from "#/features/profile/shared/profile.types";

export type UserProfileRow = typeof user.$inferSelect;

export function serializeProfile(profile: UserProfileRow): Profile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio ?? "",
    avatar: serializeProfileAvatar(profile),
    createdAt: profile.createdAt?.toISOString() ?? null,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function serializeProfileAvatar(profile: UserProfileRow): ProfileAvatar | null {
  if (!profile.image) {
    return null;
  }

  return {
    url: profile.image,
    name: profile.avatarImageName,
    contentType: profile.avatarImageContentType,
    size: profile.avatarImageSize,
  };
}

export function versionedProfileAvatarUrl(updatedAt: Date) {
  return profileAvatarUrl(updatedAt.getTime());
}
