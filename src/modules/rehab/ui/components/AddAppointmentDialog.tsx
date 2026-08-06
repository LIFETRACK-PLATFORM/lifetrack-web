"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import {
  AddAppointmentInput,
  AppointmentType,
} from "@/modules/rehab/domain/RehabRepository";

export function AddAppointmentDialog({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: AddAppointmentInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [date, setDate] = useState("");
  const [provider, setProvider] = useState("");
  const [type, setType] = useState<AppointmentType>("THERAPY");
  const [notes, setNotes] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState("0");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!date) {
      setClientError("La fecha es obligatoria.");
      return;
    }
    if (!provider.trim()) {
      setClientError("El profesional o centro es obligatorio.");
      return;
    }
    const repeats = Number(repeatWeeks);
    if (!Number.isInteger(repeats) || repeats < 0 || repeats > 12) {
      setClientError("Las repeticiones deben ser un número entre 0 y 12.");
      return;
    }

    const success = await onSubmit({
      date: new Date(date).toISOString(),
      provider: provider.trim(),
      type,
      notes: notes.trim() || undefined,
      repeatWeeks: repeats,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-[0px_8px_30px_rgba(0,0,0,0.15)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-on-surface">
            Agregar cita
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-container-high"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Tipo de cita
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("THERAPY")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-all ${
                  type === "THERAPY"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                Terapia
              </button>
              <button
                type="button"
                onClick={() => setType("MEDICAL")}
                className={`flex-1 rounded-lg py-2 font-label text-label-md transition-all ${
                  type === "MEDICAL"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                Médica
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Profesional / centro
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
              placeholder="Ej. Centro Médico Apex"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Repetir cada semana (0-12 veces)
            </label>
            <input
              type="number"
              min={0}
              max={12}
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-label text-label-md text-on-surface-variant hover:bg-surface-container-high"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-on-primary transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
