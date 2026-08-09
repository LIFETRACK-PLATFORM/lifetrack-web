"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Button,
  Calendar,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { cn } from "@/shared/lib/utils";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const numericValue = Number(value);
    if (!value.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
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
      unit: MEASUREMENT_TYPE_UNITS[type],
      date: day.toISOString(),
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            {isEditing ? "Editar medición" : "Registrar medición"}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="font-label text-label-md text-text-3">
              Tipo
            </Label>
            <Select
              value={type}
              onValueChange={(next) => setType(next as MeasurementType)}
            >
              <SelectTrigger className="h-10 w-full bg-surface-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                {MEASUREMENT_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {MEASUREMENT_TYPE_LABELS[option]}
                    {MEASUREMENT_TYPE_UNITS[option]
                      ? ` (${MEASUREMENT_TYPE_UNITS[option]})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "OTHER" && (
            <div className="space-y-1">
              <Label
                htmlFor="measurement-custom-label"
                className="font-label text-label-md text-text-3"
              >
                Nombre
              </Label>
              <Input
                id="measurement-custom-label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Ej. Muleta"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                htmlFor="measurement-value"
                className="font-label text-label-md text-text-3"
              >
                Valor{MEASUREMENT_TYPE_UNITS[type] ? ` (${MEASUREMENT_TYPE_UNITS[type]})` : ""}
              </Label>
              <Input
                id="measurement-value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ej. 5"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-label text-label-md text-text-3">
                Fecha
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start font-normal",
                      !day && "text-text-3",
                    )}
                  >
                    <CalendarIcon strokeWidth={1.75} className="size-4" />
                    {dateLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[110] w-auto border-border bg-surface-1 p-0"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={16}
                >
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

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando…" : isEditing ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
