import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckSquare, Edit3, Mail } from "lucide-react";

import { Button } from "#/components/ui/button";
import { ProfileAvatar } from "#/features/profile/components/profile-avatar";
import type { Profile } from "#/features/profile/shared/profile.types";

export function ProfileView({ profile }: { profile: Profile }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm">
        <ProfileAvatar avatar={profile.avatar} name={profile.name} className="size-32" />
        <div className="mt-5 min-w-0">
          <h2 className="break-words text-2xl font-bold text-[var(--sea-ink)]">{profile.name}</h2>
          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{profile.email}</span>
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/profile/edit">
              <Edit3 aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/todo">
              <CheckSquare aria-hidden="true" />
              Todo
            </Link>
          </Button>
        </div>
      </aside>

      <div className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs font-bold text-[var(--kicker)] uppercase">Profile</p>
            <h2 className="mt-1 text-2xl font-bold">About</h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/todo">
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
        </div>

        <div className="mt-5 min-h-48 whitespace-pre-wrap text-base leading-7 text-[var(--sea-ink)]">
          {profile.bio || <p className="text-sm text-[var(--sea-ink-soft)]">No bio yet.</p>}
        </div>
      </div>
    </section>
  );
}
