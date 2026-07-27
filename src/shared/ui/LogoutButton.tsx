"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { HttpAuthRepository } from "@/modules/auth/infrastructure/HttpAuthRepository";
import { useLogout } from "@/modules/auth/ui/hooks/useLogout";

export function LogoutButton({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const repository = useMemo(() => new HttpAuthRepository(), []);
  const { loading, logout } = useLogout(repository);

  async function handleClick() {
    await logout();
    router.push("/login");
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {children}
    </button>
  );
}
