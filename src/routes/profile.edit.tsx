import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { getCurrentSession } from "#/features/auth/server/auth.functions";
import { ProfileEditForm } from "#/features/profile/components/profile-edit-form";
import { getProfile } from "#/features/profile/server/profile.functions";

export const Route = createFileRoute("/profile/edit")({
  beforeLoad: async () => {
    const session = await getCurrentSession();

    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  loader: () => getProfile(),
  pendingComponent: ProfileEditPending,
  component: ProfileEdit,
});

function ProfileEdit() {
  const profile = Route.useLoaderData();

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="border-b border-[var(--line)] pb-5">
          <p className="text-xs font-bold text-[var(--kicker)] uppercase">tss-cf</p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)] md:text-5xl">
            Edit profile
          </h1>
        </header>

        <ProfileEditForm profile={profile} />
      </div>
    </main>
  );
}

function ProfileEditPending() {
  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[360px] w-full max-w-6xl items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)]">
        <Loader2 className="size-5 animate-spin text-[var(--lagoon-deep)]" aria-hidden="true" />
      </div>
    </main>
  );
}
