"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { VaultRepository } from "../../domain/VaultRepository";
import { VaultItem } from "../../domain/VaultItem";
import { createVaultRepository } from "../../infrastructure/createVaultRepository";
import {
  VaultSessionProvider,
  useVaultSessionContext,
} from "../context/VaultSessionContext";
import { useVaultItems } from "../hooks/useVaultItems";
import { UnlockVaultDialog } from "../components/UnlockVaultDialog";
import { CreateVaultItemDialog } from "../components/CreateVaultItemDialog";
import { VaultItemCard } from "../components/VaultItemCard";

type DialogKind = "create" | "edit" | null;

function VaultViewContent({ repository }: { repository: VaultRepository }) {
  const { isUnlocked, masterKey, unlocking, unlockError, unlock, lock } =
    useVaultSessionContext();
  const {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    revealPassword,
  } = useVaultItems(repository, masterKey);

  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.site.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const closeDialog = () => {
    setOpenDialog(null);
    setEditingItem(null);
    setSubmitError(null);
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-background p-6 pb-32 text-text-1 md:p-10 md:pb-10">
        <div className="mx-auto flex max-w-app flex-col items-center">
          <div className="mb-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-2 text-primary">
                <Icon name="encrypted" className="text-[36px]" />
              </div>
            </div>
            <h2 className="mb-2 text-headline-lg text-text-1">Bóveda</h2>
            <p className="text-body-lg text-text-3">
              Tus contraseñas cifradas de extremo a extremo. Solo vos podés
              descifrarlas con tu contraseña maestra.
            </p>
          </div>
          <UnlockVaultDialog
            onUnlock={unlock}
            unlocking={unlocking}
            error={unlockError}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 pb-32 text-text-1 md:p-10 md:pb-10">
      <div className="mx-auto max-w-app">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-text-1">Bóveda</h2>
            <p className="text-body-lg text-text-3">
              Contraseñas cifradas. La sesión expira tras 15 minutos de
              inactividad.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenDialog("create")}
              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground hover:opacity-90"
            >
              <Icon name="add" className="text-[16px]" />
              Nueva
            </button>
            <button
              type="button"
              onClick={lock}
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-4 py-2 font-label text-label-md text-text-2 hover:bg-surface-3"
            >
              <Icon name="lock" className="text-[16px]" />
              Bloquear
            </button>
          </div>
        </header>

        <section className="rounded-xl border border-border bg-surface-1 p-6 card-elevation">
          {!loading && !error && items.length > 0 && (
            <div className="relative mb-4">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-3"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por sitio o usuario…"
                className="w-full rounded-lg border border-border bg-surface-1 py-2.5 pl-10 pr-3 text-body-md text-text-1 placeholder:text-text-3 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {loading && (
            <p className="text-body-md text-text-3">Cargando contraseñas…</p>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-error">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <VaultItemCard
                  key={item.id}
                  item={item}
                  onReveal={revealPassword}
                  onEdit={(vaultItem) => {
                    setEditingItem(vaultItem);
                    setOpenDialog("edit");
                  }}
                  onDelete={deleteItem}
                />
              ))}
              {items.length === 0 && (
                <p className="py-8 text-center text-body-md text-text-3">
                  Todavía no guardaste ninguna contraseña. Creá la primera.
                </p>
              )}
              {items.length > 0 && filteredItems.length === 0 && (
                <p className="py-8 text-center text-body-md text-text-3">
                  Ninguna contraseña coincide con tu búsqueda.
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {openDialog === "create" && (
        <CreateVaultItemDialog
          mode="create"
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (site, username, password) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await createItem(site, username, password);
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : "No se pudo guardar la contraseña",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}

      {openDialog === "edit" && editingItem && (
        <CreateVaultItemDialog
          mode="edit"
          initial={{
            site: editingItem.site,
            username: editingItem.username,
          }}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (site, username, password) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await updateItem(editingItem.id, site, username, password);
              return true;
            } catch (err) {
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : "No se pudo actualizar la contraseña",
              );
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </main>
  );
}

export function VaultView({
  repository,
}: { repository?: VaultRepository } = {}) {
  const activeRepository = useMemo(
    () => repository ?? createVaultRepository(),
    [repository],
  );

  return (
    <VaultSessionProvider repository={activeRepository}>
      <VaultViewContent repository={activeRepository} />
    </VaultSessionProvider>
  );
}
