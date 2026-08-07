"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SESSION_TIMEOUT_MS } from "../../domain/crypto/constants";
import { SetupOrUnlockVaultUseCase } from "../../application/SetupOrUnlockVaultUseCase";
import { VaultRepository } from "../../domain/VaultRepository";

interface VaultSessionContextValue {
  isUnlocked: boolean;
  masterKey: CryptoKey | null;
  unlocking: boolean;
  unlockError: string | null;
  unlock: (masterPassword: string) => Promise<boolean>;
  lock: () => void;
  touchActivity: () => void;
}

const VaultSessionContext = createContext<VaultSessionContextValue | null>(
  null,
);

export function VaultSessionProvider({
  repository,
  children,
}: {
  repository: VaultRepository;
  children: ReactNode;
}) {
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    setMasterKey(null);
    setUnlockError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const touchActivity = useCallback(() => {
    if (!masterKey) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      lock();
    }, SESSION_TIMEOUT_MS);
  }, [masterKey, lock]);

  const unlock = useCallback(
    async (masterPassword: string): Promise<boolean> => {
      setUnlocking(true);
      setUnlockError(null);
      try {
        const useCase = new SetupOrUnlockVaultUseCase(repository);
        const key = await useCase.execute(masterPassword);
        setMasterKey(key);
        return true;
      } catch (err) {
        setUnlockError(
          err instanceof Error
            ? err.message
            : "No se pudo desbloquear la bóveda.",
        );
        return false;
      } finally {
        setUnlocking(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    if (masterKey) {
      touchActivity();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [masterKey, touchActivity]);

  useEffect(() => {
    if (!masterKey) return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const;
    const handler = () => touchActivity();
    events.forEach((event) => window.addEventListener(event, handler));
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
    };
  }, [masterKey, touchActivity]);

  const value = useMemo(
    () => ({
      isUnlocked: masterKey !== null,
      masterKey,
      unlocking,
      unlockError,
      unlock,
      lock,
      touchActivity,
    }),
    [masterKey, unlocking, unlockError, unlock, lock, touchActivity],
  );

  return (
    <VaultSessionContext.Provider value={value}>
      {children}
    </VaultSessionContext.Provider>
  );
}

export function useVaultSessionContext(): VaultSessionContextValue {
  const ctx = useContext(VaultSessionContext);
  if (!ctx) {
    throw new Error(
      "useVaultSessionContext debe usarse dentro de VaultSessionProvider",
    );
  }
  return ctx;
}
