"use client";

import {
  Button,
  Badge,
  Checkbox,
  Progress,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { Exercise } from "@/modules/rehab/domain/Exercise";
import { ExerciseMediaThumb } from "@/modules/rehab/ui/components/ExerciseMediaThumb";
import { exerciseDomId } from "@/modules/rehab/ui/rehabRoutes";

type ExerciseCardStatus = "completed" | "future" | "urgent" | "pending";

const STATUS_STYLE: Record<
  ExerciseCardStatus,
  { border: string; tint: string | null; badgeVariant: "success" | "secondary" | "destructive" | "warning"; label: string; icon: string; progress: string }
> = {
  completed: {
    border: "border-l-success",
    tint: "color-mix(in srgb, var(--success) 5%, var(--surface-1))",
    badgeVariant: "success",
    label: "Realizado",
    icon: "check_circle",
    progress: "bg-success",
  },
  future: {
    border: "border-l-border",
    tint: null,
    badgeVariant: "secondary",
    label: "Agendado",
    icon: "schedule",
    progress: "bg-text-3",
  },
  urgent: {
    border: "border-l-error",
    tint: "color-mix(in srgb, var(--error) 5%, var(--surface-1))",
    badgeVariant: "destructive",
    label: "Vencido",
    icon: "priority_high",
    progress: "bg-error",
  },
  pending: {
    border: "border-l-warning",
    tint: "color-mix(in srgb, var(--warning) 5%, var(--surface-1))",
    badgeVariant: "warning",
    label: "Pendiente",
    icon: "radio_button_unchecked",
    progress: "bg-primary",
  },
};

function getCardStatus(
  completedOnDate: boolean,
  isFutureDay: boolean,
  urgent: boolean,
): ExerciseCardStatus {
  if (completedOnDate) return "completed";
  if (isFutureDay) return "future";
  if (urgent) return "urgent";
  return "pending";
}

export function ExerciseCard({
  exercise,
  current,
  highlighted,
  pendingCompletion,
  deleting,
  showMedia = true,
  completedOnDate,
  isFutureDay,
  isViewingToday,
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
  completedOnDate: boolean;
  isFutureDay: boolean;
  isViewingToday: boolean;
  onAdjust: (delta: number) => void;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const target = exercise.target;
  const showUrgent = isViewingToday && exercise.urgent && !completedOnDate;
  const status = getCardStatus(completedOnDate, isFutureDay, showUrgent);
  const style = STATUS_STYLE[status];
  const checkboxId = `exercise-done-${exercise.id}`;

  return (
    <article
      id={exerciseDomId(exercise.id)}
      className={`overflow-hidden rounded-xl border border-border border-l-[3px] p-3 transition-all sm:p-4 ${style.border} ${
        highlighted
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : ""
      }`}
      style={{ backgroundColor: style.tint ?? "var(--surface-1)" }}
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
              <Badge variant={style.badgeVariant} showDot>
                <Icon name={style.icon} className="text-[12px]" />
                {style.label}
              </Badge>
              <h4 className="truncate text-body-lg font-semibold text-text-1">
                {exercise.name}
              </h4>
            </div>

            <div className="flex shrink-0 items-center gap-1">
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
            {exercise.metricType === "DURATION" ? (
              <span className="inline-flex items-center gap-1">
                <Icon name="history" className="text-[14px]" />
                {exercise.targetDurationMinutes} min
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <Icon name="repeat" className="text-[14px]" />
                  {exercise.sets} series
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="history" className="text-[14px]" />
                  {exercise.reps} reps
                </span>
              </>
            )}
            {isViewingToday && (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-primary">
                {current}/{target}
              </span>
            )}
          </p>

          {exercise.notes && (
            <p className="text-label-md text-text-3">{exercise.notes}</p>
          )}

          {isViewingToday && !isFutureDay && (
            <label
              htmlFor={checkboxId}
              className={`mt-1 flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                completedOnDate
                  ? "border-success/35 bg-success/10"
                  : "border-border bg-surface-2"
              } ${pendingCompletion ? "opacity-60" : ""}`}
            >
              <Checkbox
                id={checkboxId}
                checked={completedOnDate}
                disabled={pendingCompletion}
                onCheckedChange={onToggleCompletion}
              />
              <span
                className={`font-label text-label-md font-medium ${
                  completedOnDate ? "text-success" : "text-text-3"
                }`}
              >
                {completedOnDate ? "Completado" : "Marcar como completado"}
              </span>
            </label>
          )}

          {isViewingToday && (
            <ExerciseRepCounter
              current={current}
              target={target}
              progressClassName={style.progress}
              onAdjust={onAdjust}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function ExerciseRepCounter({
  current,
  target,
  progressClassName,
  onAdjust,
}: {
  current: number;
  target: number;
  progressClassName: string;
  onAdjust: (delta: number) => void;
}) {
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <div className="flex items-center gap-2.5 pt-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => onAdjust(-1)}
        disabled={current <= 0}
        aria-label="Reducir repeticiones"
      >
        <Icon name="remove" />
      </Button>
      <Progress
        value={percent}
        className="flex-1 bg-surface-3"
        indicatorClassName={progressClassName}
      />
      <Button
        type="button"
        size="icon-sm"
        onClick={() => onAdjust(1)}
        disabled={current >= target}
        aria-label="Aumentar repeticiones"
      >
        <Icon name="add" />
      </Button>
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
