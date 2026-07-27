import { CurrentUser } from "@/modules/auth/domain/CurrentUser";
import { createContext, useContext } from "react";

export const AuthenticatedUserContext = createContext<CurrentUser | null>(null);

export function useAuthenticatedUser(): CurrentUser {
  const user = useContext(AuthenticatedUserContext);
  if (!user) {
    throw new Error("Usuario autenticado no disponible");
  }
  return user;
}
