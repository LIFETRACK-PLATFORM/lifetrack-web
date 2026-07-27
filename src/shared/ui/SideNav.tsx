"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";
import { LogoutButton } from "@/shared/ui/LogoutButton";

interface SideNavUser {
  name: string;
  avatar: string;
  membership: string;
}

export function SideNav({ user }: { user: SideNavUser }) {
  const pathname = usePathname();
  const rehabActive = pathname.startsWith("/rehab");

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-[280px] flex-col border-r border-outline-variant/30 bg-surface-container-lowest px-4 py-6 glass-nav md:flex">
      <div className="mb-10 px-2">
        <h1 className="text-headline-md font-bold text-primary">LifeTrack OS</h1>
        <p className="font-label text-label-md text-on-surface-variant opacity-70">
          Health & Productivity
        </p>
      </div>
      <nav className="flex-1 space-y-2">
        <Link
          href="/rehab"
          className="flex items-center gap-4 rounded-lg px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <Icon name="dashboard" />
          <span className="text-body-md">Dashboard</span>
        </Link>
        <Link
          href="/rehab"
          className={`flex items-center gap-4 rounded-lg px-4 py-2 transition-colors ${
            rehabActive
              ? "border-r-4 border-primary bg-surface-container-low text-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <Icon name="stabilization" filled={rehabActive} />
          <span className={`text-body-md ${rehabActive ? "font-bold" : ""}`}>
            Rehab
          </span>
        </Link>
        <Link
          href="/rehab"
          className="flex items-center gap-4 rounded-lg px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <Icon name="person" />
          <span className="text-body-md">Profile</span>
        </Link>
      </nav>
      <div className="mt-auto flex items-center gap-4 border-t border-outline-variant/20 px-2 pt-4">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-highest">
          <Image
            src={user.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-label text-label-md font-bold">{user.name}</p>
          <p className="text-[12px] text-on-surface-variant">{user.membership}</p>
        </div>
        <LogoutButton className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-error">
          <Icon name="logout" />
        </LogoutButton>
      </div>
    </aside>
  );
}
