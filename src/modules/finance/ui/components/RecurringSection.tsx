"use client";

import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lifetrack/system-design";
import { RecurringItem } from "@/modules/finance/domain/RecurringItem";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { formatMoney } from "@/modules/finance/domain/formatMoney";
import {
  CreateRecurringItemInput,
  RecurringCandidate,
} from "@/modules/finance/domain/FinanceRepository";

export function CreateRecurringDialog({
  accounts,
  categories,
  onClose,
  onSubmit,
  submitting,
  error,
  initial,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateRecurringItemInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
  initial?: {
    name?: string;
    amount?: number;
    kind?: "INCOME" | "EXPENSE";
    accountId?: string;
    categoryId?: string;
    dayOfMonth?: number;
  };
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(
    initial?.amount !== undefined ? String(initial.amount) : "",
  );
  const [kind, setKind] = useState<"INCOME" | "EXPENSE">(
    initial?.kind ?? "EXPENSE",
  );
  const [accountId, setAccountId] = useState(
    initial?.accountId ?? accounts[0]?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    initial?.dayOfMonth !== undefined ? String(initial.dayOfMonth) : "1",
  );
  const [mode, setMode] = useState<"AUTO" | "REMIND">("REMIND");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (!name.trim()) {
      setClientError("El nombre es obligatorio.");
      return;
    }
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      setClientError("El monto debe ser mayor a 0.");
      return;
    }
    const day = Number(dayOfMonth);
    if (day < 1 || day > 28) {
      setClientError("El día debe estar entre 1 y 28.");
      return;
    }
    const success = await onSubmit({
      name: name.trim(),
      amount: value,
      kind,
      accountId,
      categoryId,
      dayOfMonth: day,
      mode,
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo recurrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Alquiler" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Monto</label>
              <Input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Día del mes</label>
              <Input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Modo</label>
            <div className="flex gap-2">
              <Button type="button" variant={mode === "AUTO" ? "default" : "secondary"} className="flex-1" onClick={() => setMode("AUTO")}>Automático</Button>
              <Button type="button" variant={mode === "REMIND" ? "default" : "secondary"} className="flex-1" onClick={() => setMode("REMIND")}>Recordatorio</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Cuenta</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[60]">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Categoría</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[60]">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Tipo</label>
            <div className="flex gap-2">
              <Button type="button" variant={kind === "EXPENSE" ? "default" : "secondary"} className="flex-1" onClick={() => setKind("EXPENSE")}>Gasto</Button>
              <Button type="button" variant={kind === "INCOME" ? "default" : "secondary"} className="flex-1" onClick={() => setKind("INCOME")}>Ingreso</Button>
            </div>
          </div>
          {(clientError || error) && <p className="text-body-md text-error">{clientError ?? error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Guardando…" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditRecurringDialog({
  item,
  accounts,
  categories,
  onClose,
  onSubmit,
  onDeactivate,
  submitting,
  error,
}: {
  item: RecurringItem;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: import("@/modules/finance/domain/FinanceRepository").UpdateRecurringItemInput) => Promise<boolean>;
  onDeactivate: () => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(String(item.amount));
  const [kind, setKind] = useState(item.kind);
  const [accountId, setAccountId] = useState(item.accountId);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [dayOfMonth, setDayOfMonth] = useState(String(item.dayOfMonth));
  const [mode, setMode] = useState(item.mode);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const value = Number(amount);
    const day = Number(dayOfMonth);
    if (!name.trim() || Number.isNaN(value) || value <= 0 || day < 1 || day > 28) {
      setClientError("Revisá los campos.");
      return;
    }
    const success = await onSubmit({
      name: name.trim(),
      amount: value,
      kind,
      accountId,
      categoryId,
      dayOfMonth: day,
      mode,
      active: item.active,
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar recurrente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Monto</label>
              <Input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Día</label>
              <Input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Modo</label>
            <div className="flex gap-2">
              <Button type="button" variant={mode === "AUTO" ? "default" : "secondary"} className="flex-1" onClick={() => setMode("AUTO")}>Automático</Button>
              <Button type="button" variant={mode === "REMIND" ? "default" : "secondary"} className="flex-1" onClick={() => setMode("REMIND")}>Recordatorio</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Cuenta</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[60]">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">Categoría</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[60]">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">Tipo</label>
            <div className="flex gap-2">
              <Button type="button" variant={kind === "EXPENSE" ? "default" : "secondary"} className="flex-1" onClick={() => setKind("EXPENSE")}>Gasto</Button>
              <Button type="button" variant={kind === "INCOME" ? "default" : "secondary"} className="flex-1" onClick={() => setKind("INCOME")}>Ingreso</Button>
            </div>
          </div>
          {(clientError || error) && <p className="text-body-md text-error">{clientError ?? error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" className="text-error hover:bg-error/10" disabled={submitting} onClick={async () => { if (await onDeactivate()) onClose(); }}>Desactivar</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RecurringSection({
  items,
  accounts,
  categories,
  candidates = [],
  pendingIds = [],
  onCreate,
  onEdit,
  onAddCandidate,
}: {
  items: RecurringItem[];
  accounts: Account[];
  categories: Category[];
  candidates?: RecurringCandidate[];
  pendingIds?: string[];
  onCreate: () => void;
  onEdit: (item: RecurringItem) => void;
  onAddCandidate: (candidate: RecurringCandidate) => void;
}) {
  const active = items.filter((i) => i.active);
  const pendingSet = new Set(pendingIds);
  const accountName = (id: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Recurrentes</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
            <Plus />
            Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {candidates.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-surface-2 p-3">
            <p className="font-label text-label-md text-text-3">
              Detectamos estos pagos
            </p>
            {candidates.map((candidate) => (
              <div
                key={`${candidate.accountId}-${candidate.categoryId}-${candidate.amount}`}
                className="flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-md text-text-1">
                    {candidate.suggestedName || categoryName(candidate.categoryId)}
                  </p>
                  <p className="truncate font-label text-label-md text-text-3">
                    Día {candidate.dayOfMonth} · {candidate.occurrences} veces ·{" "}
                    {accountName(candidate.accountId)}
                  </p>
                </div>
                <p className="shrink-0 font-metric text-body-md text-text-1">
                  {formatMoney(
                    candidate.amount,
                    accounts.find((a) => a.id === candidate.accountId)
                      ?.currency ?? "PEN",
                  )}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddCandidate(candidate)}
                >
                  Agregar
                </Button>
              </div>
            ))}
          </div>
        )}
        {active.map((item) => {
          const isPending = pendingSet.has(item.recurringItemId);
          return (
            <div
              key={item.recurringItemId}
              className="flex items-center gap-3"
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: isPending
                    ? "color-mix(in srgb, var(--warning) 15%, transparent)"
                    : "color-mix(in srgb, var(--primary) 15%, transparent)",
                  color: isPending ? "var(--warning)" : "var(--primary)",
                }}
              >
                <TrendingUp size={15} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md text-text-1">{item.name}</p>
                <p className="truncate font-label text-label-md text-text-3">
                  Día {item.dayOfMonth} ·{" "}
                  {item.mode === "AUTO" ? "Automático" : "Recordatorio"} ·{" "}
                  {accountName(item.accountId)}
                </p>
              </div>
              <p className="shrink-0 font-metric text-body-md text-text-1">
                {formatMoney(
                  item.amount,
                  accounts.find((a) => a.id === item.accountId)?.currency ??
                    "PEN",
                )}
              </p>
              {isPending ? (
                <Badge variant="warning" showDot>
                  Pendiente
                </Badge>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
              >
                Editar
              </Button>
            </div>
          );
        })}
        {active.length === 0 && (
          <p className="text-body-md text-text-3">
            No tenés ítems recurrentes activos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
