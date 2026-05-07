import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { ProfileView } from "#/features/profile/components/profile-view";
import { getProfile } from "#/features/profile/server/profile.functions";

export const Route = createFileRoute("/profile/")({
  loader: () => getProfile(),
  pendingComponent: ProfilePending,
  component: Profile,
});

function Profile() {
  const profile = Route.useLoaderData();

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="border-b border-[var(--line)] pb-5">
          <p className="text-xs font-bold text-[var(--kicker)] uppercase">tss-cf</p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)] md:text-5xl">
            Profile
          </h1>
        </header>

        <ProfileView profile={profile} />
      </div>
    </main>
  );
}

function ProfilePending() {
  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[360px] w-full max-w-6xl items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)]">
        <Loader2 className="size-5 animate-spin text-[var(--lagoon-deep)]" aria-hidden="true" />
      </div>
    </main>
  );
}
