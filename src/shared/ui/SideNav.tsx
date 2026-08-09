"use client";

import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CircleDot, Wallet, Lock, User as UserIcon } from "lucide-react";
import { AppSidebar, type AppSidebarItem } from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { LogoutButton } from "@/shared/ui/LogoutButton";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

interface SideNavUser {
  name: string;
  avatar: string;
  membership: string;
}

export function SideNav({ user }: { user: SideNavUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const rehabActive = pathname.startsWith("/rehab");
  const financeActive = pathname.startsWith("/finance");
  const vaultActive = pathname.startsWith("/vault");
  const profileActive = pathname.startsWith("/profile");

  const items: AppSidebarItem[] = [
    { label: "Panel", icon: LayoutDashboard, onClick: () => router.push("/rehab") },
    {
      label: "Rehabilitación",
      icon: CircleDot,
      active: rehabActive,
      onClick: () => router.push("/rehab"),
    },
    {
      label: "Finanzas",
      icon: Wallet,
      active: financeActive,
      onClick: () => router.push("/finance"),
    },
    {
      label: "Bóveda",
      icon: Lock,
      active: vaultActive,
      onClick: () => router.push("/vault"),
    },
    {
      label: "Perfil",
      icon: UserIcon,
      active: profileActive,
      onClick: () => router.push("/profile"),
    },
  ];

  return (
    <div className="fixed left-0 top-0 z-50 hidden h-full w-[220px] flex-col border-r border-border bg-surface-1 md:flex">
      <div className="flex items-center justify-end px-5 pt-4">
        <ThemeToggle />
      </div>
      <AppSidebar
        items={items}
        user={{ name: user.name, subtitle: user.membership, imageSrc: user.avatar }}
        className="flex-1 pt-3"
      />
      <div className="border-t border-border p-5 pt-3">
        <LogoutButton className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-body-md text-text-3 transition-colors hover:bg-surface-2/80 hover:text-error">
          <Icon name="logout" className="text-[17px]" />
          Cerrar sesión
        </LogoutButton>
      </div>
    </div>
  );
}
