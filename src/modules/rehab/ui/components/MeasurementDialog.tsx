"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import {
  Button,
  Badge,
  Calendar,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogCloseButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import type {
  AddMeasurementInput,
  MeasurementType,
} from "@/modules/rehab/domain/RehabRepository";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_TYPE_UNITS,
} from "@/modules/rehab/ui/lib/measurementLabels";

export function MeasurementDialog({
  defaultType = "WEIGHT_KG",
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  defaultType?: MeasurementType;
  initial?: {
    type: MeasurementType;
    customLabel?: string;
    value: number;
    date: string;
  };
  onClose: () => void;
  onSubmit: (input: AddMeasurementInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const isEditing = Boolean(initial);
  const [type, setType] = useState<MeasurementType>(
    initial?.type ?? defaultType,
  );
  const [customLabel, setCustomLabel] = useState(initial?.customLabel ?? "");
  const [value, setValue] = useState(initial ? String(initial.value) : "");
  const [day, setDay] = useState<Date | undefined>(
    initial ? new Date(initial.date) : new Date(),
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    if (!day) return "Elegir fecha";
    return format(day, "d 'de' MMMM yyyy", { locale: es });
  }, [day]);

  const unit = MEASUREMENT_TYPE_UNITS[type];
  const numericValue = Number(value);
  const valueIsValid = value.trim() !== "" && Number.isFinite(numericValue) && numericValue > 0;
  const previewLabel =
    type === "OTHER" ? customLabel.trim() || "Otro" : MEASUREMENT_TYPE_LABELS[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (!valueIsValid) {
      setClientError("Ingresá un valor numérico mayor a 0.");
      return;
    }
    if (!day) {
      setClientError("Elegí una fecha.");
      return;
    }
    if (type === "OTHER" && !customLabel.trim()) {
      setClientError("Ingresá un nombre para el tipo personalizado.");
      return;
    }

    const success = await onSubmit({
      type,
      customLabel: type === "OTHER" ? customLabel.trim() : undefined,
      value: numericValue,
      unit,
      date: day.toISOString(),
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-4 px-6 pt-5">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2.5">
                <Badge variant="default" className="gap-1.5">
                  <TrendingUp size={12} />
                  Medición
                </Badge>
                <Badge variant="secondary">Seguimiento</Badge>
              </div>
              <DialogTitle className="font-heading text-body-lg">
                {isEditing ? "Editar medición" : "Registrar medición"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-label-md text-text-3">
                Elegí el tipo, cargá el valor y la fecha del registro.
              </DialogDescription>
            </div>
            <DialogCloseButton onClick={onClose} />
          </div>

          <div className="flex flex-col gap-3.5 px-6 py-4">
            <div className="space-y-1.5">
              <label className="font-label text-label-md text-text-3">Tipo</label>
              <Select value={type} onValueChange={(next) => setType(next as MeasurementType)}>
                <SelectTrigger className="h-10 w-full bg-surface-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {MEASUREMENT_TYPE_LABELS[option]}
                      {MEASUREMENT_TYPE_UNITS[option] ? ` (${MEASUREMENT_TYPE_UNITS[option]})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "OTHER" && (
              <div className="space-y-1.5">
                <label
                  htmlFor="measurement-custom-label"
                  className="font-label text-label-md text-text-3"
                >
                  Nombre
                </label>
                <Input
                  id="measurement-custom-label"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Ej. Muleta"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-surface-2 p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase text-primary">
                  Valor a registrar
                </p>
                <p className="mt-1 font-metric text-metric-md text-primary">
                  {valueIsValid ? `${numericValue}${unit}` : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase text-text-3">Fecha</p>
                <p className="mt-1 text-sm font-semibold text-text-1">
                  {day ? dateLabel : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="measurement-value" className="font-label text-label-md text-text-3">
                  Valor{unit ? ` (${unit})` : ""}
                </label>
                <Input
                  id="measurement-value"
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ej. 5"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-label-md text-text-3">Fecha</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={`h-10 w-full justify-start font-normal ${!day ? "text-text-3" : ""}`}
                    >
                      <Icon name="calendar_today" className="text-[16px]" />
                      {dateLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-border bg-surface-1 p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={day}
                      onSelect={(value) => {
                        setDay(value);
                        setCalendarOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {valueIsValid && day && (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/12 text-primary">
                  <TrendingUp size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-md font-semibold text-text-3">Vista previa</p>
                  <p className="text-body-md font-semibold text-text-1">
                    {previewLabel} · {numericValue}
                    {unit}
                  </p>
                  <p className="text-label-md text-text-3">{dateLabel}</p>
                </div>
                <Badge variant="default" className="shrink-0">
                  Nuevo
                </Badge>
              </div>
            )}

            {(clientError || error) && (
              <p className="text-body-md text-error">{clientError ?? error}</p>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-border px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-w-[108px]" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="min-w-[120px]" disabled={submitting}>
              {submitting ? "Guardando…" : isEditing ? "Actualizar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
