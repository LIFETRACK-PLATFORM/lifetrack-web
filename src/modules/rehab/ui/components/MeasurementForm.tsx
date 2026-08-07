"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AddMeasurementInput,
  MeasurementType,
} from "@/modules/rehab/domain/RehabRepository";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_TYPE_UNITS,
} from "@/modules/rehab/ui/lib/measurementLabels";
import { todayDateIso } from "@/modules/rehab/domain/protocolSchedule";

export function MeasurementForm({
  defaultType = "WEIGHT_KG",
  initial,
  onSubmit,
  onCancel,
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
  onSubmit: (input: AddMeasurementInput) => Promise<boolean>;
  onCancel?: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [type, setType] = useState<MeasurementType>(
    initial?.type ?? defaultType,
  );
  const [customLabel, setCustomLabel] = useState(initial?.customLabel ?? "");
  const [value, setValue] = useState(
    initial ? String(initial.value) : "",
  );
  const [date, setDate] = useState(
    initial ? initial.date.slice(0, 10) : todayDateIso(),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const isEditing = Boolean(initial);

  const handleSubmit = async () => {
    setClientError(null);
    const numericValue = Number(value);
    if (!value.trim() || !Number.isFinite(numericValue) || numericValue <= 0) {
      setClientError("Ingresá un valor numérico mayor a 0.");
      return;
    }
    if (!date) {
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
      date: new Date(date).toISOString(),
    });
    if (success && !isEditing) {
      setValue("");
      setCustomLabel("");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h4 className="mb-3 font-label text-label-md text-text-3">
        {isEditing ? "Editar medición" : "Registrar medición"}
      </h4>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Tipo
          </label>
          <Select
            value={type}
            onValueChange={(next) => setType(next as MeasurementType)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Nombre
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Ej. Muleta"
              className="w-40 rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Valor{MEASUREMENT_TYPE_UNITS[type] ? ` (${MEASUREMENT_TYPE_UNITS[type]})` : ""}
          </label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ej. 5"
            className="w-28 rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
        >
          {submitting ? "Guardando…" : isEditing ? "Actualizar" : "Registrar"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3"
          >
            Cancelar
          </button>
        )}
      </div>
      {(clientError || error) && (
        <p className="mt-2 text-body-md text-error">{clientError ?? error}</p>
      )}
    </div>
  );
}
