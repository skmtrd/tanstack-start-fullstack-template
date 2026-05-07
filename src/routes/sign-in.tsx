import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthForm } from "#/features/auth/components/auth-form";
import { getCurrentSession } from "#/features/auth/server/auth.functions";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    const session = await getCurrentSession();

    if (session) {
      throw redirect({ to: "/todo" });
    }
  },
  component: SignIn,
});

function SignIn() {
  return <AuthForm mode="signin" />;
}
