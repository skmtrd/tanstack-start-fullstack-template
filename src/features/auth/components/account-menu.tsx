import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, UserRound } from "lucide-react";

import { Button } from "#/components/ui/button";
import { authClient } from "#/features/auth/client/auth-client";

export function AccountMenu({
  email,
  image,
  name,
}: {
  email: string;
  image?: string | null;
  name: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/sign-in" });
    },
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 shadow-sm md:min-w-80">
      <Button variant="ghost" className="min-w-0 justify-start px-1.5" aria-label="Profile" asChild>
        <Link to="/profile">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--chip-bg)] text-sm font-bold text-[var(--lagoon-deep)]">
            {image ? (
              <img src={image} alt={`${name || email} avatar`} className="size-full object-cover" />
            ) : (
              <UserRound className="size-4" aria-hidden="true" />
            )}
          </span>
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name || email}</p>
        <p className="truncate text-xs text-[var(--sea-ink-soft)]">{email}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => signOutMutation.mutate()}
        disabled={signOutMutation.isPending}
      >
        {signOutMutation.isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <LogOut aria-hidden="true" />
        )}
        Sign out
      </Button>
    </div>
  );
}
