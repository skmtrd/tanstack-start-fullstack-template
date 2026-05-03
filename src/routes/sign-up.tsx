import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthForm } from "#/features/auth/auth-form";
import { getCurrentSession } from "#/features/auth/auth.functions";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: async () => {
    const session = await getCurrentSession();

    if (session) {
      throw redirect({ to: "/todo" });
    }
  },
  component: SignUp,
});

function SignUp() {
  return <AuthForm mode="signup" />;
}
