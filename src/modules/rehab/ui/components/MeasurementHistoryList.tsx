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
import type { MeasurementPoint } from "@/modules/rehab/domain/RehabPlan";
import { measurementDisplayLabel } from "@/modules/rehab/ui/lib/measurementLabels";
import { formatDateIsoCalendar } from "@/modules/rehab/domain/protocolSchedule";

export function MeasurementHistoryList({
  measurements,
  onEdit,
  onDelete,
  deletingId,
}: {
  measurements: MeasurementPoint[];
  onEdit: (measurement: MeasurementPoint) => void;
  onDelete: (measurementId: string) => void;
  deletingId: string | null;
}) {
  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <h4 className="mb-3 font-label text-label-md text-text-3">
        Historial de mediciones
      </h4>
      {sorted.length === 0 ? (
        <p className="text-body-md text-text-3">
          Todavía no registraste ninguna medición.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((measurement) => (
            <div
              key={measurement.measurementId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/30 bg-surface-2 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-label text-label-md font-semibold text-text-1">
                  {measurementDisplayLabel(measurement)}
                </p>
                <p className="font-label text-label-md text-text-3">
                  {measurement.value}
                  {measurement.unit} ·{" "}
                  {formatDateIsoCalendar(measurement.date.slice(0, 10), {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(measurement)}
                  aria-label={`Editar medición ${measurementDisplayLabel(measurement)}`}
                >
                  <Icon name="edit" className="text-[18px] text-text-3" />
                </Button>
                <DeleteMeasurementButton
                  label={measurementDisplayLabel(measurement)}
                  deleting={deletingId === measurement.measurementId}
                  onConfirm={() => onDelete(measurement.measurementId)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteMeasurementButton({
  label,
  deleting,
  onConfirm,
}: {
  label: string;
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
          aria-label={`Eliminar medición ${label}`}
        >
          <Icon name="trash" className="text-[18px]" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar medición</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Eliminar el registro de &quot;{label}&quot;? Esta acción no se
            puede deshacer.
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
