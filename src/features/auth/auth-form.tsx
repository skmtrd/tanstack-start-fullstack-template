import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { authClient } from "#/lib/auth-client";

type AuthMode = "signin" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === "signup";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async () => {
      const result = isSignUp
        ? await authClient.signUp.email({
            email,
            name: name.trim() || email,
            password,
          })
        : await authClient.signIn.email({
            email,
            password,
          });

      if (result.error) {
        throw new Error(result.error.message ?? "Authentication failed");
      }
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      await navigate({ to: "/todo" });
    },
    onError: (nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    authMutation.mutate();
  }

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--sea-ink)] md:px-8 md:py-10">
      <section className="mx-auto grid min-h-[560px] w-full max-w-5xl overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface)] shadow-xl md:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-between gap-8 border-b border-[var(--line)] p-6 md:border-r md:border-b-0 md:p-8">
          <div>
            <p className="text-sm font-semibold text-[var(--lagoon-deep)]">tss-cf</p>
            <h1 className="display-title mt-4 max-w-2xl text-4xl font-bold text-[var(--sea-ink)] md:text-6xl">
              Todos
            </h1>
          </div>

          <div className="grid gap-3 text-sm text-[var(--sea-ink-soft)] md:grid-cols-3">
            <div className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-4">
              <p className="font-semibold text-[var(--sea-ink)]">Better Auth</p>
              <p className="mt-1">Email sessions stored in D1.</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-4">
              <p className="font-semibold text-[var(--sea-ink)]">TanStack Start</p>
              <p className="mt-1">Server functions own writes.</p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-4">
              <p className="font-semibold text-[var(--sea-ink)]">Cloudflare D1</p>
              <p className="mt-1">Todos stay scoped per user.</p>
            </div>
          </div>
        </div>

        <form
          className="flex flex-col gap-5 bg-[var(--surface-strong)] p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <div>
            <div className="inline-flex rounded-md border border-[var(--line)] bg-[var(--chip-bg)] p-1">
              <Button type="button" variant={isSignUp ? "ghost" : "default"} size="sm" asChild>
                <Link to="/sign-in">
                  <LogIn aria-hidden="true" />
                  Sign in
                </Link>
              </Button>
              <Button type="button" variant={isSignUp ? "default" : "ghost"} size="sm" asChild>
                <Link to="/sign-up">
                  <UserPlus aria-hidden="true" />
                  Sign up
                </Link>
              </Button>
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
          </div>

          {isSignUp ? (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={authMutation.isPending}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={authMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={authMutation.isPending}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={authMutation.isPending} className="mt-2">
            {authMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : isSignUp ? (
              <UserPlus aria-hidden="true" />
            ) : (
              <LogIn aria-hidden="true" />
            )}
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
