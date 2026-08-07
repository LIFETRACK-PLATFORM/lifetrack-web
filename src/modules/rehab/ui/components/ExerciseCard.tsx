"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/shared/ui/Icon";
import { Exercise } from "@/modules/rehab/domain/Exercise";
import { ExerciseMediaThumb } from "@/modules/rehab/ui/components/ExerciseMediaThumb";
import { exerciseDomId } from "@/modules/rehab/ui/rehabRoutes";

export function ExerciseCard({
  exercise,
  current,
  highlighted,
  pendingCompletion,
  deleting,
  showMedia = true,
  onAdjust,
  onToggleCompletion,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  current: number;
  highlighted: boolean;
  pendingCompletion: boolean;
  deleting: boolean;
  showMedia?: boolean;
  onAdjust: (delta: number) => void;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const target = exercise.target;
  const repsGoalReached = current >= target && target > 0;
  const isDoneToday = exercise.completedToday;

  return (
    <article
      id={exerciseDomId(exercise.id)}
      className={`rounded-xl border bg-surface-1 p-3 transition-all sm:p-4 ${
        isDoneToday
          ? "border-success/35 bg-success/5"
          : exercise.urgent
            ? "border-error/35 bg-error/5"
            : "border-warning/25 bg-warning/5"
      } ${repsGoalReached && !isDoneToday ? "ring-1 ring-primary/25" : ""} ${
        highlighted
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {showMedia ? (
          <ExerciseMediaThumb
            mediaUrl={exercise.image}
            name={exercise.name}
            className="mx-auto h-20 w-20 shrink-0 sm:mx-0 sm:h-16 sm:w-16"
          />
        ) : (
          <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-2 sm:mx-0 sm:h-16 sm:w-16">
            <Icon name={exercise.icon} className="text-[28px] text-primary" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded bg-primary/15 px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider text-primary">
                  {exercise.category}
                </span>
                <ExerciseDayStatus
                  completedToday={isDoneToday}
                  urgent={exercise.urgent}
                />
              </div>
              <h4 className="truncate text-body-lg font-semibold text-text-1">
                {exercise.name}
              </h4>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <DailyDoneToggle
                completedToday={exercise.completedToday}
                pending={pendingCompletion}
                onToggle={onToggleCompletion}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onEdit}
                aria-label={`Editar ${exercise.name}`}
              >
                <Icon name="edit" className="text-[18px] text-text-3" />
              </Button>
              <DeleteExerciseButton
                exerciseName={exercise.name}
                deleting={deleting}
                onConfirm={onDelete}
              />
            </div>
          </div>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-label-md text-text-3">
            <span className="inline-flex items-center gap-1">
              <Icon name="repeat" className="text-[14px]" />
              {exercise.sets} series
            </span>
            <span className="inline-flex items-center gap-1">
              <Icon name="history" className="text-[14px]" />
              {exercise.reps} reps
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <Icon name="target" className="text-[14px]" />
              {current}/{target}
            </span>
          </p>

          <ExerciseRepCounter
            current={current}
            target={target}
            onAdjust={onAdjust}
          />
        </div>
      </div>
    </article>
  );
}

function ExerciseDayStatus({
  completedToday,
  urgent,
}: {
  completedToday: boolean;
  urgent: boolean;
}) {
  if (completedToday) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
        <Icon name="check_circle" className="text-[13px]" />
        Realizado
      </span>
    );
  }

  if (urgent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-error/40 bg-error/15 px-2 py-0.5 text-[11px] font-semibold text-error">
        <Icon name="priority_high" className="text-[13px]" />
        Vencido
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
      <Icon name="radio_button_unchecked" className="text-[13px]" />
      Pendiente
    </span>
  );
}

function DailyDoneToggle({
  completedToday,
  pending,
  onToggle,
}: {
  completedToday: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      title={completedToday ? "Hecho hoy" : "Marcar hecho hoy"}
      aria-label={completedToday ? "Hecho hoy" : "Marcar hecho hoy"}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-60 ${
        completedToday
          ? "bg-success/20 text-success hover:bg-success/30"
          : "bg-warning/15 text-warning hover:bg-warning/25"
      }`}
    >
      <Icon
        name={completedToday ? "check_circle" : "radio_button_unchecked"}
        className="text-[22px]"
      />
    </button>
  );
}

function ExerciseRepCounter({
  current,
  target,
  onAdjust,
}: {
  current: number;
  target: number;
  onAdjust: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-1.5">
      <button
        type="button"
        onClick={() => onAdjust(-1)}
        disabled={current <= 0}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-4 transition-transform active:scale-95 disabled:opacity-40 sm:h-8 sm:w-8"
        aria-label="Reducir repeticiones"
      >
        <Icon name="remove" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <span className="font-metric text-[18px] font-bold text-primary">
          {current}
        </span>
        <span className="font-label text-label-md text-text-3">/{target}</span>
      </div>
      <button
        type="button"
        onClick={() => onAdjust(1)}
        disabled={current >= target}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40 sm:h-8 sm:w-8"
        aria-label="Aumentar repeticiones"
      >
        <Icon name="add" />
      </button>
    </div>
  );
}

function DeleteExerciseButton({
  exerciseName,
  deleting,
  onConfirm,
}: {
  exerciseName: string;
  deleting: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-text-3 hover:text-error"
          disabled={deleting}
          aria-label={`Eliminar ${exerciseName}`}
        >
          <Icon name="trash" className="text-[18px]" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que quieres eliminar &quot;{exerciseName}&quot;? Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
