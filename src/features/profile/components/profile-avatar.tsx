import { UserRound } from "lucide-react";

import { cn } from "#/lib/utils";
import type { ProfileAvatar as ProfileAvatarData } from "#/features/profile/shared/profile.types";

export function ProfileAvatar({
  avatar,
  name,
  className,
}: {
  avatar: ProfileAvatarData | null;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid size-28 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--chip-bg)] text-3xl font-bold text-[var(--lagoon-deep)] shadow-sm",
        className,
      )}
    >
      {avatar?.url ? (
        <img src={avatar.url} alt={`${name} avatar`} className="size-full object-cover" />
      ) : (
        <span className="flex items-center gap-1">
          {profileInitials(name) || <UserRound className="size-10" aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}

function profileInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("");
}
