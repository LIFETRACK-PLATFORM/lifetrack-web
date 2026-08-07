"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateVaultItemUseCase } from "../../application/CreateVaultItemUseCase";
import { DeleteVaultItemUseCase } from "../../application/DeleteVaultItemUseCase";
import { ListVaultItemsUseCase } from "../../application/ListVaultItemsUseCase";
import { RevealVaultItemUseCase } from "../../application/RevealVaultItemUseCase";
import { UpdateVaultItemUseCase } from "../../application/UpdateVaultItemUseCase";
import { VaultItem } from "../../domain/VaultItem";
import { VaultRepository } from "../../domain/VaultRepository";

export function useVaultItems(
  repository: VaultRepository,
  masterKey: CryptoKey | null,
) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    if (!masterKey) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });

    const listUseCase = new ListVaultItemsUseCase(repository);
    listUseCase
      .execute()
      .then((fetched) => {
        if (!cancelled) setItems(fetched);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar la bóveda",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, masterKey, reloadToken]);

  const visibleItems = masterKey ? items : [];

  const createItem = useCallback(
    async (
      site: string,
      username: string,
      password: string,
      category?: string,
    ) => {
      if (!masterKey) throw new Error("La bóveda está bloqueada.");
      const useCase = new CreateVaultItemUseCase(repository);
      await useCase.execute({ site, username, password, category, masterKey });
      reload();
    },
    [repository, masterKey, reload],
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      site: string,
      username: string,
      password: string,
      category?: string,
    ) => {
      if (!masterKey) throw new Error("La bóveda está bloqueada.");
      const useCase = new UpdateVaultItemUseCase(repository);
      await useCase.execute({
        itemId,
        site,
        username,
        password,
        category,
        masterKey,
      });
      reload();
    },
    [repository, masterKey, reload],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      const useCase = new DeleteVaultItemUseCase(repository);
      await useCase.execute(itemId);
      reload();
    },
    [repository, reload],
  );

  const revealPassword = useCallback(
    async (itemId: string): Promise<string> => {
      if (!masterKey) throw new Error("La bóveda está bloqueada.");
      const useCase = new RevealVaultItemUseCase(repository);
      return useCase.execute(itemId, masterKey);
    },
    [repository, masterKey],
  );

  return {
    items: visibleItems,
    loading,
    error,
    reload,
    createItem,
    updateItem,
    deleteItem,
    revealPassword,
  };
}
