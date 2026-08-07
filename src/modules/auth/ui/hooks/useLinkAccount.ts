"use client";

import { useCallback, useState } from "react";
import { AuthRepository } from "@/modules/auth/domain/AuthRepository";
import { LinkAccountUseCase } from "@/modules/auth/application/LinkAccountUseCase";

export function useLinkAccount(repository: AuthRepository) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkAccount = useCallback(
    async (provider: string, linkToken: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const useCase = new LinkAccountUseCase(repository);
        await useCase.execute({ provider, linkToken, password });
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo vincular la cuenta",
        );
      } finally {
        setLoading(false);
      }
    },
    [repository],
  );

  return { loading, success, error, linkAccount };
}
