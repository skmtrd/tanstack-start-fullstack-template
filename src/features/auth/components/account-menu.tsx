import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "#/components/ui/button";
import { authClient } from "#/features/auth/client/auth-client";

export function AccountMenu({ email, name }: { email: string; name: string }) {
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
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 shadow-sm md:min-w-72">
      <div className="min-w-0">
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
