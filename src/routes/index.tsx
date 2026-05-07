import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckSquare, LogIn, UserRound, UserPlus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { getCurrentSession } from "#/features/auth/server/auth.functions";

export const Route = createFileRoute("/")({
  loader: () => getCurrentSession(),
  component: Home,
});

function Home() {
  const session = Route.useLoaderData();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[var(--sea-ink)]">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-center shadow-sm">
        <div>
          <p className="text-sm font-semibold text-[var(--lagoon-deep)]">tss-cf</p>
          <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)]">Todos</h1>
        </div>

        {session ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/todo">
                <CheckSquare aria-hidden="true" />
                Todo
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/profile">
                <UserRound aria-hidden="true" />
                Profile
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/sign-in">
                <LogIn aria-hidden="true" />
                Sign in
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/sign-up">
                <UserPlus aria-hidden="true" />
                Sign up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
