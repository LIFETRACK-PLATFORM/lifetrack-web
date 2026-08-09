"use client";

import { useState } from "react";
import { Activity, Clock, TrendingUp } from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogCloseButton,
} from "@lifetrack/system-design";
import {
  AddExerciseInput,
  ExerciseMetricType,
} from "@/modules/rehab/domain/RehabRepository";

const WEEKDAYS = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
];

const WEEKDAY_COLOR = ["primary", "success", "warning"] as const;

const MEASURE_MODE_OPTIONS: {
  value: ExerciseMetricType;
  label: string;
  hint: string;
  icon: typeof TrendingUp;
}[] = [
  { value: "REPS", label: "Repeticiones", hint: "Contar series × reps", icon: TrendingUp },
  { value: "DURATION", label: "Duración", hint: "Medir en minutos", icon: Clock },
];

export function ExerciseFormDialog({
  onClose,
  onSubmit,
  submitting,
  error,
  exerciseId,
  initial,
}: {
  onClose: () => void;
  onSubmit: (input: AddExerciseInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
  exerciseId?: string;
  initial?: AddExerciseInput;
}) {
  const isEdit = Boolean(exerciseId);
  const [name, setName] = useState(initial?.name ?? "");
  const [metricType, setMetricType] = useState<ExerciseMetricType>(
    initial?.metricType ?? "REPS",
  );
  const [targetSets, setTargetSets] = useState(
    initial ? String(initial.targetSets) : "3",
  );
  const [targetReps, setTargetReps] = useState(
    initial ? String(initial.targetReps) : "20",
  );
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(
    initial?.targetDurationMinutes ? String(initial.targetDurationMinutes) : "1",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initial?.daysOfWeek ?? [],
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
  };

  const setsValue = Math.max(1, Number(targetSets) || 1);
  const repsValue = Math.max(1, Number(targetReps) || 1);
  const durationValue = Math.max(1, Number(targetDurationMinutes) || 1);
  const previewTotal = metricType === "REPS" ? setsValue * repsValue : setsValue;
  const previewMeta =
    metricType === "REPS"
      ? `${setsValue} series · ${repsValue} reps`
      : `${setsValue} series · ${durationValue} min`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!name.trim()) {
      setClientError("El nombre del ejercicio es obligatorio.");
      return;
    }

    let input: AddExerciseInput;
    if (metricType === "DURATION") {
      const minutes = Number(targetDurationMinutes);
      if (!Number.isInteger(minutes) || minutes < 1) {
        setClientError(
          "Los minutos objetivo deben ser un número entero mayor a 0.",
        );
        return;
      }
      input = {
        name: name.trim(),
        metricType,
        targetSets: 1,
        targetReps: 1,
        targetDurationMinutes: minutes,
        notes: notes.trim() || undefined,
        daysOfWeek,
      };
    } else {
      const sets = Number(targetSets);
      const reps = Number(targetReps);
      if (!Number.isInteger(sets) || sets < 1) {
        setClientError(
          "Los sets objetivo deben ser un número entero mayor a 0.",
        );
        return;
      }
      if (!Number.isInteger(reps) || reps < 1) {
        setClientError(
          "Las repeticiones objetivo deben ser un número entero mayor a 0.",
        );
        return;
      }
      input = {
        name: name.trim(),
        metricType,
        targetSets: sets,
        targetReps: reps,
        notes: notes.trim() || undefined,
        daysOfWeek,
      };
    }

    const success = await onSubmit(input);
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start gap-4 px-6 pt-5">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2.5">
                <Badge variant="default" className="gap-1.5">
                  <Activity size={12} />
                  Ejercicio
                </Badge>
                <Badge variant="secondary">Protocolo</Badge>
              </div>
              <DialogTitle className="font-heading text-body-lg">
                {isEdit ? "Editar ejercicio" : "Configurar volumen"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-label-md text-text-3">
                Definí series, repeticiones y frecuencia semanal.
              </DialogDescription>
            </div>
            <DialogCloseButton onClick={onClose} />
          </div>

          <div className="px-6 pt-4">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2.5 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-success/6 p-4">
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase text-primary">Series</p>
                <p className="mt-1 font-metric text-metric-md text-primary">{setsValue}</p>
              </div>
              <span className="font-metric text-xl text-text-3">×</span>
              <div className="text-center">
                <p
                  className={`text-[11px] font-semibold uppercase ${
                    metricType === "DURATION" ? "text-warning" : "text-accent-tint"
                  }`}
                >
                  {metricType === "REPS" ? "Reps" : "Min"}
                </p>
                <p
                  className={`mt-1 font-metric text-metric-md ${
                    metricType === "DURATION" ? "text-warning" : "text-accent-tint"
                  }`}
                >
                  {metricType === "REPS" ? repsValue : durationValue}
                </p>
              </div>
              <span className="font-metric text-xl text-text-3">=</span>
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase text-success">Total</p>
                <p className="mt-1 font-metric text-metric-md text-success">
                  {previewTotal}
                  <span className="ml-0.5 text-label-md text-text-3">
                    {metricType === "REPS" ? "reps" : "min"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {MEASURE_MODE_OPTIONS.map((option) => {
                const active = metricType === option.value;
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMetricType(option.value)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? option.value === "DURATION"
                          ? "border-warning bg-warning/10"
                          : "border-accent-tint bg-accent-tint/10"
                        : "border-border bg-surface-1 opacity-90 hover:opacity-100"
                    }`}
                  >
                    <OptionIcon
                      size={16}
                      className={
                        active
                          ? option.value === "DURATION"
                            ? "text-warning"
                            : "text-accent-tint"
                          : "text-text-3"
                      }
                    />
                    <span
                      className={`text-sm font-semibold ${
                        active ? "text-text-1" : "text-text-1"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="text-[11px] text-text-3">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3.5 px-6 py-4">
            <div className="space-y-1.5">
              <label htmlFor="exercise-name" className="font-label text-label-md text-text-3">
                Nombre del ejercicio
              </label>
              <Input
                id="exercise-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Elevaciones de talón"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="exercise-sets" className="font-label text-label-md text-text-3">
                  Series
                </label>
                <Input
                  id="exercise-sets"
                  type="number"
                  min={1}
                  value={targetSets}
                  onChange={(e) => setTargetSets(e.target.value)}
                />
              </div>
              {metricType === "REPS" ? (
                <div className="space-y-1.5">
                  <label htmlFor="exercise-reps" className="font-label text-label-md text-text-3">
                    Repeticiones
                  </label>
                  <Input
                    id="exercise-reps"
                    type="number"
                    min={1}
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label htmlFor="exercise-duration" className="font-label text-label-md text-text-3">
                    Minutos
                  </label>
                  <Input
                    id="exercise-duration"
                    type="number"
                    min={1}
                    value={targetDurationMinutes}
                    onChange={(e) => setTargetDurationMinutes(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-text-3">
                Frecuencia semanal (vacío = todos los días)
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day, index) => {
                  const selected = daysOfWeek.includes(day.value);
                  const color = WEEKDAY_COLOR[index % WEEKDAY_COLOR.length];
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      aria-label={`Día ${day.label}`}
                      onClick={() => toggleDay(day.value)}
                      className={`flex size-8 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                        selected
                          ? color === "primary"
                            ? "border border-primary bg-primary text-primary-foreground"
                            : color === "success"
                              ? "border border-success bg-success text-white"
                              : "border border-warning bg-warning text-white"
                          : "border border-border bg-surface-1 text-text-3"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="exercise-notes" className="font-label text-label-md text-text-3">
                Indicaciones (opcional)
              </label>
              <Textarea
                id="exercise-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ej. Banda mediana, espalda recta"
              />
            </div>

            {name.trim() && (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <Activity size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-md font-semibold text-text-3">Vista previa</p>
                  <p className="truncate text-body-md font-semibold text-text-1">{name.trim()}</p>
                  <p className="text-label-md text-text-3">{previewMeta}</p>
                </div>
                <Badge variant="secondary" showDot className="ml-auto shrink-0">
                  Pendiente
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
            <Button type="submit" className="min-w-[156px]" disabled={submitting}>
              {submitting ? "Guardando…" : isEdit ? "Guardar" : "Agregar al protocolo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
