"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";
import { useSessionCheck } from "@/modules/auth/ui/hooks/useSessionCheck";
import { AuthenticatedUserContext } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { createProfileRepository } from "@/modules/profile/infrastructure/createProfileRepository";
import { BottomNav } from "@/shared/ui/BottomNav";
import { SideNav } from "@/shared/ui/SideNav";

const authRepository = new HttpAuthRepository();
const profileRepository = createProfileRepository();

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=LT";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, user, error } = useSessionCheck(authRepository);
  const [navName, setNavName] = useState<string | null>(null);
  const [navAvatar, setNavAvatar] = useState<string | null>(null);
  const showAppNav =
    pathname.startsWith("/rehab") || pathname.startsWith("/profile");

  useEffect(() => {
    if (!loading && (error || !user)) {
      router.replace("/login");
    }
  }, [loading, user, error, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    profileRepository
      .getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        setNavName(profile.displayName);
        setNavAvatar(profile.avatarUrl);
      })
      .catch(() => {
        // Fallback al email de la sesión si el perfil aún no está disponible
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-text-1">
        <p className="text-sm text-text-3">Verificando sesión…</p>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  const fallbackName = user.email.split("@")[0] ?? user.email;
  const navUser = {
    name: navName ?? fallbackName,
    email: user.email,
    membership: user.roles.join(", ") || "Miembro",
    avatar:
      navAvatar ||
      `https://ui-avatars.com/api/?background=7C5CFF&color=fff&name=${encodeURIComponent(
        navName ?? fallbackName,
      )}` ||
      DEFAULT_AVATAR,
  };

  return (
    <AuthenticatedUserContext.Provider value={user}>
      <div className="flex min-h-full flex-1 bg-background">
        {showAppNav && <SideNav user={navUser} />}
        <div
          className={`flex min-h-full flex-1 flex-col ${
            showAppNav ? "md:pl-[280px]" : ""
          }`}
        >
          {children}
        </div>
        {showAppNav && <BottomNav />}
      </div>
    </AuthenticatedUserContext.Provider>
  );
}
