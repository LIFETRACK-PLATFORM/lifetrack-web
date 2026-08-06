"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";
import { LogoutButton } from "@/shared/ui/LogoutButton";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

interface SideNavUser {
  name: string;
  avatar: string;
  membership: string;
}

export function SideNav({ user }: { user: SideNavUser }) {
  const pathname = usePathname();
  const rehabActive = pathname.startsWith("/rehab");
  const profileActive = pathname.startsWith("/profile");

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-[280px] flex-col border-r border-border bg-surface-1 px-4 py-6 md:flex">
      <div className="mb-10 flex items-start justify-between gap-2 px-2">
        <div>
          <h1 className="font-heading text-heading-4 font-bold text-primary">
            LifeTrack OS
          </h1>
          <p className="font-label text-label-md text-text-3">
            Precisión silenciosa
          </p>
        </div>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1">
        <Link
          href="/rehab"
          className="flex items-center gap-4 rounded-[10px] px-4 py-2.5 text-text-3 transition-colors hover:bg-surface-3 hover:text-text-1"
        >
          <Icon name="dashboard" className="text-[20px]" />
          <span className="text-body-md">Panel</span>
        </Link>
        <Link
          href="/rehab"
          className={`flex items-center gap-4 rounded-[10px] px-4 py-2.5 transition-colors ${
            rehabActive
              ? "bg-surface-2 text-primary"
              : "text-text-3 hover:bg-surface-3 hover:text-text-1"
          }`}
        >
          <Icon name="stabilization" className="text-[20px]" />
          <span className={`text-body-md ${rehabActive ? "font-semibold" : ""}`}>
            Rehabilitación
          </span>
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-4 rounded-[10px] px-4 py-2.5 transition-colors ${
            profileActive
              ? "bg-surface-2 text-primary"
              : "text-text-3 hover:bg-surface-3 hover:text-text-1"
          }`}
        >
          <Icon name="person" className="text-[20px]" />
          <span
            className={`text-body-md ${profileActive ? "font-semibold" : ""}`}
          >
            Perfil
          </span>
        </Link>
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-border px-2 pt-4">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-3">
          <Image
            src={user.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-label truncate text-label-md font-semibold text-text-1">
            {user.name}
          </p>
          <p className="truncate text-[12px] text-text-3">{user.membership}</p>
        </div>
        <LogoutButton className="rounded-[10px] p-2 text-text-3 transition-colors hover:bg-surface-3 hover:text-error">
          <Icon name="logout" className="text-[20px]" />
        </LogoutButton>
      </div>
    </aside>
  );
}
