"use client";

import { useMemo, useState } from "react";
import { Lock, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SearchInput,
  Skeleton,
} from "@lifetrack/system-design";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { VaultRepository } from "../../domain/VaultRepository";
import { VaultItem } from "../../domain/VaultItem";
import { groupVaultItemsByCategory } from "../../domain/groupVaultItemsByCategory";
import {
  getCategoryIcon,
  getCategorySortIndex,
  normalizeVaultCategory,
  VAULT_CATEGORIES,
} from "../../domain/vaultCategories";
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
type VaultTab = "entradas" | "categorias";

const VAULT_TABS: { id: VaultTab; label: string }[] = [
  { id: "entradas", label: "Entradas" },
  { id: "categorias", label: "Categorías" },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<VaultTab>("entradas");

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const category = normalizeVaultCategory(item.category);
      const matchesCategory =
        !selectedCategory || category === selectedCategory;
      if (!matchesCategory) return false;

      if (!query) return true;

      return (
        item.site.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  }, [items, searchQuery, selectedCategory]);

  const groupedItems = useMemo(
    () => groupVaultItemsByCategory(filteredItems),
    [filteredItems],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const category = normalizeVaultCategory(item.category);
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const categoryList = useMemo(
    () =>
      Array.from(categoryCounts.keys()).sort((a, b) => {
        const indexDiff = getCategorySortIndex(a) - getCategorySortIndex(b);
        return indexDiff !== 0 ? indexDiff : a.localeCompare(b);
      }),
    [categoryCounts],
  );

  const categoryDirectory = useMemo(() => {
    const used = new Set(categoryCounts.keys());
    const custom = categoryList.filter(
      (c) => !(VAULT_CATEGORIES as readonly string[]).includes(c),
    );
    return [...VAULT_CATEGORIES, ...custom].map((category) => ({
      category,
      count: categoryCounts.get(category) ?? 0,
      used: used.has(category),
    }));
  }, [categoryCounts, categoryList]);

  const closeDialog = () => {
    setOpenDialog(null);
    setEditingItem(null);
    setSubmitError(null);
  };

  const openCategory = (category: string) => {
    setSelectedCategory(category);
    setTab("entradas");
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-background p-6 pb-32 text-text-1 md:p-10 md:pb-10">
        <div className="mx-auto flex max-w-app flex-col items-center">
          <div className="mb-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Lock className="size-8" />
              </div>
            </div>
            <h2 className="mb-2 text-headline-lg text-text-1">Bóveda</h2>
            <p className="mx-auto max-w-md text-body-lg text-text-3">
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
      <div className="mx-auto flex max-w-app flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-text-1">Bóveda</h2>
            <p className="text-body-lg text-text-3">
              Contraseñas cifradas. La sesión expira tras 15 minutos de
              inactividad.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={() => setOpenDialog("create")}>
              <Plus />
              Nueva
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={lock}>
              <Lock />
              Bloquear
            </Button>
          </div>
        </header>

        <div className="sticky top-0 z-30 -mx-1 flex gap-2 overflow-x-auto bg-background/95 px-1 py-2 no-scrollbar">
          {VAULT_TABS.map((item) => {
            const active = tab === item.id;
            const count =
              item.id === "entradas"
                ? items.length
                : categoryDirectory.filter((c) => c.used).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2 font-label text-label-md transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-text-3 hover:bg-surface-3 hover:text-text-1"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-surface-3 text-text-3"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "entradas" && (
          <Card className="border-t-[3px] border-t-primary bg-primary/[0.02]">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-body-md">
                      {selectedCategory
                        ? `Entradas · ${selectedCategory}`
                        : "Todas las entradas"}
                    </CardTitle>
                    <p className="mt-1 font-label text-label-md text-text-3">
                      Buscá y filtrá tus contraseñas guardadas
                    </p>
                  </div>
                  {selectedCategory ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Quitar filtro
                    </Button>
                  ) : null}
                </div>

                {!loading && !error && items.length > 0 ? (
                  <>
                    <SearchInput
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por sitio, usuario o categoría…"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-label text-label-md transition-colors ${
                          selectedCategory === null
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-2 text-text-2 hover:bg-surface-3"
                        }`}
                      >
                        Todas
                        <span className="opacity-80">({items.length})</span>
                      </button>
                      {categoryList.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-label text-label-md transition-colors ${
                            selectedCategory === category
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-2 text-text-2 hover:bg-surface-3"
                          }`}
                        >
                          <Icon
                            name={getCategoryIcon(category) as IconName}
                            className="text-[14px]"
                          />
                          {category}
                          <span className="opacity-80">
                            ({categoryCounts.get(category)})
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : null}

              {error ? (
                <p className="py-6 text-center text-body-md text-error">{error}</p>
              ) : null}

              {!loading && !error && items.length === 0 ? (
                <div className="flex justify-center py-6">
                  <EmptyState
                    icon={<Lock className="size-6" />}
                    title="Tu bóveda está vacía"
                    description="Guardá la primera contraseña cifrada para empezar."
                    action={
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setOpenDialog("create")}
                      >
                        <Plus />
                        Nueva entrada
                      </Button>
                    }
                  />
                </div>
              ) : null}

              {!loading && !error && items.length > 0 && filteredItems.length === 0 ? (
                <p className="py-8 text-center text-body-md text-text-3">
                  Ninguna contraseña coincide con tu búsqueda o filtro.
                </p>
              ) : null}

              {!loading && !error && filteredItems.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {groupedItems.map((group) => (
                    <div key={group.category} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-1">
                        <Icon
                          name={
                            getCategoryIcon(
                              normalizeVaultCategory(group.category),
                            ) as IconName
                          }
                          className="text-[16px] text-primary"
                        />
                        <p className="font-label text-label-md text-text-3">
                          {group.category}
                        </p>
                        <Badge variant="secondary">{group.items.length}</Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        {group.items.map((item) => (
                          <VaultItemCard
                            key={item.id}
                            item={item}
                            showCategoryBadge={false}
                            onReveal={revealPassword}
                            onEdit={(vaultItem) => {
                              setEditingItem(vaultItem);
                              setOpenDialog("edit");
                            }}
                            onDelete={deleteItem}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {tab === "categorias" && (
          <Card className="border-t-[3px] border-t-accent-tint bg-accent-tint/[0.03]">
            <CardHeader>
              <CardTitle className="text-body-md">Categorías</CardTitle>
              <p className="mt-1 font-label text-label-md text-text-3">
                Organizá tus entradas. Tocá una categoría para filtrar.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {categoryDirectory.map(({ category, count, used }) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => openCategory(category)}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-surface-2/70"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-[10px] ${
                        used
                          ? "bg-primary/12 text-primary"
                          : "bg-surface-2 text-text-3"
                      }`}
                    >
                      <Icon
                        name={getCategoryIcon(category) as IconName}
                        className="text-[16px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-md text-text-1">
                        {category}
                      </p>
                      <p className="font-label text-label-md text-text-3">
                        {used
                          ? `${count} entrada${count === 1 ? "" : "s"}`
                          : "Sin entradas todavía"}
                      </p>
                    </div>
                    <Badge variant={used ? "default" : "secondary"}>{count}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {openDialog === "create" && (
        <CreateVaultItemDialog
          mode="create"
          existingCategories={categoryList}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (site, username, password, category) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await createItem(site, username, password, category);
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
            category: editingItem.category,
          }}
          existingCategories={categoryList}
          onClose={closeDialog}
          submitting={submitting}
          error={submitError}
          onSubmit={async (site, username, password, category) => {
            setSubmitting(true);
            setSubmitError(null);
            try {
              await updateItem(
                editingItem.id,
                site,
                username,
                password,
                category,
              );
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
