import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { AccountMenu } from "#/features/auth/account-menu";
import { getCurrentSession } from "#/features/auth/auth.functions";
import { TodoWorkspace } from "#/features/todos/todo-workspace";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/todo")({
  beforeLoad: async () => {
    const session = await getCurrentSession();

    if (!session) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: Todo,
});

function Todo() {
  const session = authClient.useSession();
  const user = session.data?.user;

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--kicker)] uppercase">tss-cf</p>
            <h1 className="display-title mt-2 text-4xl font-bold text-[var(--sea-ink)] md:text-5xl">
              Todos
            </h1>
          </div>

          {user ? <AccountMenu email={user.email} name={user.name} /> : null}
        </header>

        {session.isPending ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)]">
            <Loader2 className="size-5 animate-spin text-[var(--lagoon-deep)]" aria-hidden="true" />
          </div>
        ) : user ? (
          <TodoWorkspace />
        ) : null}
      </div>
    </main>
  );
}
