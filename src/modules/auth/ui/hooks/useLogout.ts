import { useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { LogoutUseCase } from "../../application/LogoutUseCase";
import { resetSessionBootstrap } from "../../infrastructure/sessionBootstrap";

export function useLogout(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setLoading(true);
    setError(null);
    try {
      const useCase = new LogoutUseCase(repository);
      await useCase.execute();
      resetSessionBootstrap();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cerrar sesión",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, logout };
}
