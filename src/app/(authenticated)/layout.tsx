"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";
import { useSessionCheck } from "@/modules/auth/ui/hooks/useSessionCheck";
import { AuthenticatedUserContext } from "@/modules/auth/ui/context/AuthenticatedUserContext";
import { BottomNav } from "@/shared/ui/BottomNav";
import { SideNav } from "@/shared/ui/SideNav";

const authRepository = new HttpAuthRepository();

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
  const showRehabNav = pathname.startsWith("/rehab");

  useEffect(() => {
    if (!loading && (error || !user)) {
      router.replace("/login");
    }
  }, [loading, user, error, router]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-on-surface">
        <p className="text-sm text-on-surface-variant">Verificando sesión…</p>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  const navUser = {
    name: user.email.split("@")[0] ?? user.email,
    email: user.email,
    membership: user.roles.join(", ") || "Miembro",
    avatar: DEFAULT_AVATAR,
  };

  return (
    <AuthenticatedUserContext.Provider value={user}>
      <div className="flex min-h-full flex-1 bg-background">
        {showRehabNav && <SideNav user={navUser} />}
        <div className={`flex min-h-full flex-1 flex-col ${showRehabNav ? "md:pl-[280px]" : ""}`}>
          {children}
        </div>
        {showRehabNav && <BottomNav />}
      </div>
    </AuthenticatedUserContext.Provider>
  );
}
