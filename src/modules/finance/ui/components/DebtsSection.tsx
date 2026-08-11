"use client";

import { useState } from "react";
import { Landmark, MoreHorizontal, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Combobox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from "@lifetrack/system-design";
import { Debt, DebtType } from "@/modules/finance/domain/Debt";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { formatMoney } from "@/modules/finance/domain/formatMoney";
import { isDueSoon, isOverdue } from "@/modules/finance/domain/debtStatus";
import {
  CreateDebtInput,
  UpdateDebtInput,
} from "@/modules/finance/domain/FinanceRepository";

const TYPE_LABEL: Record<DebtType, string> = {
  CREDIT_CARD: "Tarjeta de crédito",
  LOAN: "Préstamo",
  OTHER: "Otro",
};

function DebtFormFields({
  name,
  setName,
  lender,
  setLender,
  type,
  setType,
  currency,
  setCurrency,
  originalAmount,
  setOriginalAmount,
  minimumPayment,
  setMinimumPayment,
  dueDay,
  setDueDay,
  accountId,
  setAccountId,
  categoryId,
  setCategoryId,
  accounts,
  categories,
}: {
  name: string;
  setName: (v: string) => void;
  lender: string;
  setLender: (v: string) => void;
  type: DebtType;
  setType: (v: DebtType) => void;
  currency: string;
  setCurrency: (v: string) => void;
  originalAmount: string;
  setOriginalAmount: (v: string) => void;
  minimumPayment: string;
  setMinimumPayment: (v: string) => void;
  dueDay: string;
  setDueDay: (v: string) => void;
  accountId: string;
  setAccountId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  accounts: Account[];
  categories: Category[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block font-label text-label-md text-text-3">
          Nombre
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Tarjeta BCP"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Acreedor (opcional)
          </label>
          <Input
            value={lender}
            onChange={(e) => setLender(e.target.value)}
            placeholder="Ej. BCP, Caja Piura"
          />
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Tipo
          </label>
          <Select value={type} onValueChange={(v) => setType(v as DebtType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABEL) as DebtType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Moneda
          </label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PEN">Soles (PEN)</SelectItem>
              <SelectItem value="USD">Dólares (USD)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Día de pago (opcional)
          </label>
          <Input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="Ej. 15"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Monto original (opcional)
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Pago mínimo (opcional)
          </label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Cuenta para pagar (opcional)
          </label>
          <Combobox
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            value={accountId}
            onValueChange={setAccountId}
            placeholder="Sin cuenta preferida"
          />
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Categoría
          </label>
          <Combobox
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onValueChange={setCategoryId}
            placeholder="Elegí una categoría"
          />
        </div>
      </div>
    </div>
  );
}

export function CreateDebtDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
  onSubmit: (input: CreateDebtInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const defaultCategory =
    categories.find((c) => /deuda/i.test(c.name)) ?? categories[0];
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [type, setType] = useState<DebtType>("CREDIT_CARD");
  const [currency, setCurrency] = useState("PEN");
  const [totalOwed, setTotalOwed] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategory?.id ?? "");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setClientError(null);
    const owed = Number(totalOwed);
    if (!name.trim()) {
      setClientError("El nombre es obligatorio.");
      return;
    }
    if (Number.isNaN(owed) || owed <= 0) {
      setClientError("Ingresá cuánto debés actualmente.");
      return;
    }
    if (!categoryId) {
      setClientError("Elegí una categoría.");
      return;
    }
    const success = await onSubmit({
      name: name.trim(),
      lender: lender.trim() || undefined,
      type,
      currency,
      totalOwed: owed,
      originalAmount: originalAmount ? Number(originalAmount) : undefined,
      minimumPayment: minimumPayment ? Number(minimumPayment) : undefined,
      dueDay: dueDay ? Number(dueDay) : undefined,
      accountId: accountId || undefined,
      categoryId,
    });
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva deuda</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              ¿Cuánto debés hoy?
            </label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              value={totalOwed}
              onChange={(e) => setTotalOwed(e.target.value)}
              placeholder="Ej. 1800"
            />
          </div>
          <DebtFormFields
            name={name}
            setName={setName}
            lender={lender}
            setLender={setLender}
            type={type}
            setType={setType}
            currency={currency}
            setCurrency={setCurrency}
            originalAmount={originalAmount}
            setOriginalAmount={setOriginalAmount}
            minimumPayment={minimumPayment}
            setMinimumPayment={setMinimumPayment}
            dueDay={dueDay}
            setDueDay={setDueDay}
            accountId={accountId}
            setAccountId={setAccountId}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            accounts={accounts}
            categories={categories}
          />
          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Guardando…" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditDebtDialog({
  debt,
  open,
  onOpenChange,
  accounts,
  categories,
  onSubmit,
  onArchive,
  submitting,
  error,
}: {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  categories: Category[];
  onSubmit: (input: UpdateDebtInput) => Promise<boolean>;
  onArchive: () => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(debt.name);
  const [lender, setLender] = useState(debt.lender ?? "");
  const [type, setType] = useState<DebtType>(debt.type);
  const [currency, setCurrency] = useState(debt.currency);
  const [originalAmount, setOriginalAmount] = useState(
    debt.originalAmount !== undefined ? String(debt.originalAmount) : "",
  );
  const [minimumPayment, setMinimumPayment] = useState(
    debt.minimumPayment !== undefined ? String(debt.minimumPayment) : "",
  );
  const [dueDay, setDueDay] = useState(
    debt.dueDay !== undefined ? String(debt.dueDay) : "",
  );
  const [accountId, setAccountId] = useState(debt.accountId ?? "");
  const [categoryId, setCategoryId] = useState(debt.categoryId);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setClientError(null);
    if (!name.trim()) {
      setClientError("El nombre es obligatorio.");
      return;
    }
    if (!categoryId) {
      setClientError("Elegí una categoría.");
      return;
    }
    const success = await onSubmit({
      name: name.trim(),
      lender: lender.trim() || undefined,
      type,
      currency,
      originalAmount: originalAmount ? Number(originalAmount) : undefined,
      minimumPayment: minimumPayment ? Number(minimumPayment) : undefined,
      dueDay: dueDay ? Number(dueDay) : undefined,
      accountId: accountId || undefined,
      categoryId,
    });
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar deuda</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <DebtFormFields
            name={name}
            setName={setName}
            lender={lender}
            setLender={setLender}
            type={type}
            setType={setType}
            currency={currency}
            setCurrency={setCurrency}
            originalAmount={originalAmount}
            setOriginalAmount={setOriginalAmount}
            minimumPayment={minimumPayment}
            setMinimumPayment={setMinimumPayment}
            dueDay={dueDay}
            setDueDay={setDueDay}
            accountId={accountId}
            setAccountId={setAccountId}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            accounts={accounts}
            categories={categories}
          />
          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            className="text-error"
            disabled={submitting}
            onClick={async () => {
              if (await onArchive()) onOpenChange(false);
            }}
          >
            Archivar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DebtsSection({
  debts,
  accounts,
  onCreate,
  onEdit,
  onDelete,
  onRegisterPayment,
}: {
  debts: Debt[];
  accounts: Account[];
  onCreate: () => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onRegisterPayment: (debt: Debt) => void;
}) {
  const today = new Date();
  const active = debts.filter((d) => d.status === "ACTIVE");
  const paidOff = debts.filter((d) => d.status === "PAID_OFF");
  const accountName = (id?: string) =>
    accounts.find((a) => a.id === id)?.name ?? "—";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Deudas</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onCreate}>
            <Plus />
            Nueva
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {active.map((debt) => {
          const overdue = isOverdue(debt, today);
          const dueSoon = isDueSoon(debt, today);
          return (
            <div key={debt.debtId} className="flex items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Landmark size={15} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md text-text-1">
                  {debt.name}
                </p>
                <p className="truncate font-label text-label-md text-text-3">
                  {debt.dueDay ? `Día ${debt.dueDay}` : "Sin fecha de pago"} ·{" "}
                  {accountName(debt.accountId)}
                </p>
              </div>
              {overdue ? (
                <StatusBadge status="overdue" />
              ) : dueSoon ? (
                <StatusBadge status="pending" label="Por vencer" />
              ) : null}
              <p className="shrink-0 font-metric text-body-md text-error">
                {formatMoney(debt.totalOwed, debt.currency)}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onRegisterPayment(debt)}
              >
                Registrar pago
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Opciones"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(debt)}>
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-error"
                    onClick={() => onDelete(debt)}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
        {active.length === 0 && (
          <p className="text-body-md text-text-3">
            No tenés deudas activas. Si tenés una tarjeta o préstamo, agregalo
            para llevar el control.
          </p>
        )}

        {paidOff.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <p className="font-label text-label-md text-text-3">Pagadas</p>
            {paidOff.map((debt) => (
              <div key={debt.debtId} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-md text-text-3">
                    {debt.name}
                  </p>
                </div>
                <StatusBadge status="completed" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
