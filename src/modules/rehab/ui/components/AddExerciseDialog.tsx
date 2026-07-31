"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { AddExerciseInput } from "@/modules/rehab/domain/RehabRepository";

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
  const [clientError, setClientError] = useState<string | null>(null);

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
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-[0px_8px_30px_rgba(0,0,0,0.15)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-on-surface">
            Agregar ejercicio
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
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
              placeholder="Ej. Elevaciones de talón"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-label text-label-md text-on-surface-variant">
                Sets objetivo
              </label>
              <input
                type="number"
                min={1}
                value={targetSets}
                onChange={(e) => setTargetSets(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-label text-label-md text-on-surface-variant">
                Reps objetivo
              </label>
              <input
                type="number"
                min={1}
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-md text-on-surface-variant">
              Fase
            </label>
            <input
              type="number"
              min={1}
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
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
