"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Label, Alert, AlertDescription, Skeleton } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { ProfileRepository } from "@/modules/profile/domain/ProfileRepository";
import { UserProfile } from "@/modules/profile/domain/UserProfile";
import { createProfileRepository } from "@/modules/profile/infrastructure/createProfileRepository";
import { useProfile } from "@/modules/profile/ui/hooks/useProfile";
import { useUpdateProfile } from "@/modules/profile/ui/hooks/useUpdateProfile";
import { useAuthenticatedUser } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { oauthStartUrl } from "@/modules/auth/infrastructure/oauthUrls";

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: "Email y contraseña",
  GOOGLE: "Google",
  GITHUB: "GitHub",
};

const SWITCHABLE_PROVIDERS: Array<{ id: "google" | "github"; provider: string }> = [
  { id: "google", provider: "GOOGLE" },
  { id: "github", provider: "GITHUB" },
];

function LoginMethodSection() {
  const user = useAuthenticatedUser();
  const searchParams = useSearchParams();
  const switchResult = searchParams.get("providerSwitch");
  const switchErrorReason = searchParams.get("reason");

  const alternateProviders = SWITCHABLE_PROVIDERS.filter(
    (option) => option.provider !== user.provider,
  );

  return (
    <div className="mt-10 w-full max-w-lg">
      <h2 className="font-heading text-heading-5 font-semibold text-text-1">
        Método de inicio de sesión
      </h2>
      <p className="mt-1 text-body-md text-text-3">
        Actualmente entrás con {PROVIDER_LABELS[user.provider] ?? user.provider}.
      </p>

      {switchResult === "success" && (
        <Alert className="mt-4">
          <AlertDescription>
            Se actualizó el proveedor de inicio de sesión.
          </AlertDescription>
        </Alert>
      )}
      {switchResult === "error" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            {switchErrorReason ?? "No se pudo cambiar el proveedor de inicio de sesión."}
          </AlertDescription>
        </Alert>
      )}

      {alternateProviders.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {alternateProviders.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = oauthStartUrl(option.id, {
                  intent: "switch",
                });
              }}
            >
              Cambiar a {PROVIDER_LABELS[option.provider]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=7C5CFF&color=fff&name=LT";

type FormState = {
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  phone: string;
  timezone: string;
  language: string;
};

function formStateFromProfile(profile: UserProfile): FormState {
  return {
    displayName: profile.displayName,
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    phone: profile.phone ?? "",
    timezone: profile.timezone,
    language: profile.language,
  };
}

function ProfileForm({
  profile,
  onSaved,
  repository,
}: {
  profile: UserProfile;
  onSaved: (updated: UserProfile) => void;
  repository: ProfileRepository;
}) {
  const {
    saving,
    success,
    error: saveError,
    update,
    setSuccess,
  } = useUpdateProfile(repository);

  const [form, setForm] = useState<FormState>(() =>
    formStateFromProfile(profile),
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    const updated = await update({
      displayName: form.displayName.trim(),
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      avatarUrl: form.avatarUrl.trim() || null,
      phone: form.phone.trim() || null,
      timezone: form.timezone.trim(),
      language: form.language.trim(),
    });
    if (updated) onSaved(updated);
  }

  const avatarSrc =
    form.avatarUrl.trim() ||
    `https://ui-avatars.com/api/?background=7C5CFF&color=fff&name=${encodeURIComponent(
      form.displayName || "LT",
    )}`;

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-surface-3">
          <Image
            src={avatarSrc || DEFAULT_AVATAR}
            alt={form.displayName || "Avatar"}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="font-heading truncate text-heading-4 font-semibold text-text-1">
            {form.displayName || profile.displayName}
          </p>
          <p className="truncate text-body-md text-text-3">{profile.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg flex-col gap-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled readOnly />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayName">Nombre para mostrar</Label>
          <Input
            id="displayName"
            name="displayName"
            required
            value={form.displayName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, displayName: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="avatarUrl">URL del avatar</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://..."
            value={form.avatarUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Zona horaria</Label>
            <Input
              id="timezone"
              name="timezone"
              required
              value={form.timezone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timezone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="language">Idioma</Label>
            <Input
              id="language"
              name="language"
              required
              value={form.language}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, language: e.target.value }))
              }
            />
          </div>
        </div>

        {saveError && (
          <Alert variant="destructive">
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>Perfil actualizado correctamente</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={saving}
          className="mt-2 w-full sm:w-auto"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </>
  );
}

export function ProfileView({
  repository,
}: { repository?: ProfileRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? createProfileRepository(),
    [repository],
  );
  const { profile, loading, error, setProfile } = useProfile(activeRepository);

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-5 pb-24 pt-8 md:px-10 md:pb-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-md" />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-24 pt-8">
        <Icon name="person" className="text-[40px] text-text-3" />
        <p className="text-body-md text-text-3">
          {error ?? "No se pudo cargar el perfil"}
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-24 pt-8 md:px-10 md:pb-10">
      <header className="mb-8">
        <h1 className="font-heading text-heading-3 font-semibold text-text-1">
          Perfil
        </h1>
        <p className="mt-1 text-body-md text-text-3">
          Actualiza tu información personal
        </p>
      </header>

      <ProfileForm
        key={profile.id}
        profile={profile}
        repository={activeRepository}
        onSaved={setProfile}
      />

      <LoginMethodSection />
    </main>
  );
}
