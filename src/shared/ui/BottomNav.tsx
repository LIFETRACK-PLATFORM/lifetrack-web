"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";
import { LogoutButton } from "@/shared/ui/LogoutButton";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export function BottomNav({
  active = "rehab",
}: {
  active?: "home" | "rehab" | "profile";
}) {
  const pathname = usePathname();
  const rehabActive = pathname.startsWith("/rehab");
  const profileActive = pathname.startsWith("/profile") || active === "profile";

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-border bg-surface-1/95 px-3 py-2 pb-safe md:hidden">
      <Link
        href="/rehab"
        className={`flex flex-col items-center justify-center rounded-[10px] p-2 transition-colors active:scale-95 ${
          active === "home" ? "text-primary" : "text-text-3"
        }`}
      >
        <Icon name="home" className="text-[22px]" />
        <span className="font-label mt-1 text-label-md">Inicio</span>
      </Link>
      <Link
        href="/rehab"
        className={`relative flex flex-col items-center justify-center rounded-[10px] p-2 transition-colors active:scale-95 ${
          rehabActive ? "text-primary" : "text-text-3"
        }`}
      >
        <Icon name="stabilization" className="text-[22px]" />
        <span
          className={`font-label mt-1 text-label-md ${
            rehabActive ? "font-semibold" : ""
          }`}
        >
          Rehab
        </span>
        {rehabActive && (
          <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
        )}
      </Link>
      <div className="flex flex-col items-center justify-center rounded-[10px] p-2 text-text-3">
        <ThemeToggle size="icon-sm" className="h-auto w-auto p-0" />
        <span className="font-label mt-1 text-label-md">Tema</span>
      </div>
      <Link
        href="/profile"
        className={`relative flex flex-col items-center justify-center rounded-[10px] p-2 transition-colors active:scale-95 ${
          profileActive ? "text-primary" : "text-text-3"
        }`}
      >
        <Icon name="person" className="text-[22px]" />
        <span
          className={`font-label mt-1 text-label-md ${
            profileActive ? "font-semibold" : ""
          }`}
        >
          Perfil
        </span>
        {profileActive && (
          <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
        )}
      </Link>
      <LogoutButton className="flex flex-col items-center justify-center rounded-[10px] p-2 text-text-3 transition-colors active:scale-95">
        <Icon name="logout" className="text-[22px]" />
        <span className="font-label mt-1 text-label-md">Salir</span>
      </LogoutButton>
    </nav>
  );
}
