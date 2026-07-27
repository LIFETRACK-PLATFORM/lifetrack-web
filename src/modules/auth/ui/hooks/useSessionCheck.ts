"use client";

import { useEffect, useState } from "react";
import { AuthRepository } from "../../domain/AuthRepository";
import { CurrentUser } from "../../domain/CurrentUser";
import { resolveSession } from "../../infrastructure/sessionBootstrap";

export function useSessionCheck(repository: AuthRepository) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const currentUser = await resolveSession(repository);
        if (!cancelled) {
          setUser(currentUser);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          setError(
            err instanceof Error ? err.message : "No hay sesión activa",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return { loading, user, error };
}
