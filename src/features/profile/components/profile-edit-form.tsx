import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, Trash2, Upload } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import {
  removeProfileAvatar,
  uploadProfileAvatar,
} from "#/features/profile/client/profile-avatar.api";
import { ProfileAvatar } from "#/features/profile/components/profile-avatar";
import { updateProfile } from "#/features/profile/server/profile.functions";
import {
  profileAvatarConfig,
  profileKeys,
  type Profile,
  type ProfileAvatar as ProfileAvatarData,
} from "#/features/profile/shared/profile.types";

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState<ProfileAvatarData | null>(profile.avatar);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => updateProfile({ data: { name, bio } }),
    onMutate: () => {
      setError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.current });
      await router.invalidate();
      await navigate({ to: "/profile" });
    },
    onError: (nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Profile could not be saved");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadProfileAvatar,
    onMutate: () => {
      setError(null);
    },
    onSuccess: async (nextAvatar) => {
      setAvatar(nextAvatar);
      await queryClient.invalidateQueries({ queryKey: profileKeys.current });
      await router.invalidate();
    },
    onError: (nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Avatar could not be uploaded");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeProfileAvatar,
    onMutate: () => {
      setError(null);
    },
    onSuccess: async (nextAvatar) => {
      setAvatar(nextAvatar);
      await queryClient.invalidateQueries({ queryKey: profileKeys.current });
      await router.invalidate();
    },
    onError: (nextError) => {
      setError(nextError instanceof Error ? nextError.message : "Avatar could not be removed");
    },
  });

  const isAvatarPending = uploadMutation.isPending || removeMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate();
  }

  function handleAvatarChange(event: FormEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (file) {
      uploadMutation.mutate(file);
    }
  }

  return (
    <form className="grid gap-5 lg:grid-cols-[320px_1fr]" onSubmit={handleSubmit}>
      <aside className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm">
        <ProfileAvatar avatar={avatar} name={name} className="size-32" />
        <input
          ref={fileInputRef}
          type="file"
          accept={profileAvatarConfig.allowedContentTypes.join(",")}
          className="sr-only"
          onChange={handleAvatarChange}
          disabled={isAvatarPending}
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAvatarPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload aria-hidden="true" />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => removeMutation.mutate()}
            disabled={!avatar || isAvatarPending}
          >
            {removeMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            Remove
          </Button>
        </div>
      </aside>

      <div className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-xs font-bold text-[var(--kicker)] uppercase">Profile</p>
            <h2 className="mt-1 text-2xl font-bold">Edit profile</h2>
          </div>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/profile">
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              className="min-h-40 resize-y"
              disabled={updateMutation.isPending}
            />
            <p className="text-right text-xs font-semibold text-[var(--sea-ink-soft)]">
              {bio.length}/500
            </p>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link to="/profile">
                <ArrowLeft aria-hidden="true" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !name.trim()}>
              {updateMutation.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
