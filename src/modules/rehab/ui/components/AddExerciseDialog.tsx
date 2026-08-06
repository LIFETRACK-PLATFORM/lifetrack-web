"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { AddExerciseInput } from "@/modules/rehab/domain/RehabRepository";

const WEEKDAYS = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
];

export function AddExerciseDialog({
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  onClose: () => void;
  onSubmit: (input: AddExerciseInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const [phase, setPhase] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const sets = Number(targetSets);
    const reps = Number(targetReps);
    const phaseValue = Number(phase);

    if (!name.trim()) {
      setClientError("El nombre del ejercicio es obligatorio.");
      return;
    }
    if (!Number.isInteger(sets) || sets < 1) {
      setClientError("Los sets objetivo deben ser un número entero mayor a 0.");
      return;
    }
    if (!Number.isInteger(reps) || reps < 1) {
      setClientError(
        "Las repeticiones objetivo deben ser un número entero mayor a 0.",
      );
      return;
    }
    if (!Number.isInteger(phaseValue) || phaseValue < 1) {
      setClientError("La fase debe ser un número entero mayor a 0.");
      return;
    }

    const success = await onSubmit({
      name: name.trim(),
      targetSets: sets,
      targetReps: reps,
      phase: phaseValue,
      daysOfWeek,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Agregar ejercicio
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-3"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              placeholder="Ej. Elevaciones de talón"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Sets objetivo
              </label>
              <input
                type="number"
                min={1}
                value={targetSets}
                onChange={(e) => setTargetSets(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-text-3">
                Reps objetivo
              </label>
              <input
                type="number"
                min={1}
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Fase
            </label>
            <input
              type="number"
              min={1}
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-body-md text-text-1 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-text-3">
              Días de la semana (opcional — vacío = todos los días)
            </label>
            <div className="flex gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full font-label text-label-md transition-all ${
                    daysOfWeek.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-3 text-text-3 hover:bg-surface-4"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-label text-label-md text-text-3 hover:bg-surface-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label-md text-primary-foreground transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
