"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddMeasurementInput, MeasurementType } from "@/modules/rehab/domain/RehabRepository";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_TYPE_UNITS,
} from "@/modules/rehab/ui/lib/measurementLabels";
import { todayDateIso } from "@/modules/rehab/domain/protocolSchedule";

export function MeasurementForm({
  defaultType = "WEIGHT_KG",
  onSubmit,
  submitting,
  error,
}: {
  defaultType?: MeasurementType;
  onSubmit: (input: AddMeasurementInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [type, setType] = useState<MeasurementType>(defaultType);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayDateIso());
  const [clientError, setClientError] = useState<string | null>(null);

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

    const success = await onSubmit({
      type,
      value: numericValue,
      unit: MEASUREMENT_TYPE_UNITS[type],
      date: new Date(date).toISOString(),
    });
    if (success) setValue("");
  };

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h4 className="mb-3 font-label text-label-md text-text-3">
        Registrar medición
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
                  {MEASUREMENT_TYPE_LABELS[option]} ({MEASUREMENT_TYPE_UNITS[option]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block font-label text-label-md text-text-3">
            Valor ({MEASUREMENT_TYPE_UNITS[type]})
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
          {submitting ? "Guardando…" : "Registrar"}
        </button>
      </div>
      {(clientError || error) && (
        <p className="mt-2 text-body-md text-error">{clientError ?? error}</p>
      )}
    </div>
  );
}
