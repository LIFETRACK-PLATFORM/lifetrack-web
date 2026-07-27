"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";
import { LogoutButton } from "@/shared/ui/LogoutButton";

export function BottomNav({ active = "rehab" }: { active?: "home" | "rehab" | "profile" }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-surface-container/80 px-5 py-2 pb-safe shadow-lg glass-nav md:hidden">
      <Link
        href="/rehab"
        className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all active:scale-90 ${
          active === "home" ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Icon name="home" />
        <span className="font-label mt-1 text-label-md">Home</span>
      </Link>
      <Link
        href="/rehab"
        className={`relative flex flex-col items-center justify-center rounded-lg p-2 transition-all active:scale-90 ${
          pathname.startsWith("/rehab") ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Icon name="stabilization" filled={pathname.startsWith("/rehab")} />
        <span
          className={`font-label mt-1 text-label-md ${
            pathname.startsWith("/rehab") ? "font-bold" : ""
          }`}
        >
          Rehab
        </span>
        {pathname.startsWith("/rehab") && (
          <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
        )}
      </Link>
      <Link
        href="/rehab"
        className="flex flex-col items-center justify-center rounded-lg p-2 text-on-surface-variant transition-all active:scale-90"
      >
        <Icon name="person" />
        <span className="font-label mt-1 text-label-md">Profile</span>
      </Link>
      <LogoutButton className="flex flex-col items-center justify-center rounded-lg p-2 text-on-surface-variant transition-all active:scale-90">
        <Icon name="logout" />
        <span className="font-label mt-1 text-label-md">Logout</span>
      </LogoutButton>
    </nav>
  );
}
