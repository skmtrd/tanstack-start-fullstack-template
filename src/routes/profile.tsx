import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getCurrentSession } from "#/features/auth/server/auth.functions";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const session = await getCurrentSession();

    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: Profile,
});

function Profile() {
  return <Outlet />;
}
