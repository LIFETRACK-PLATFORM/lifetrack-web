"use client";

import { useMemo } from "react";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import type { MeasurementPoint } from "@/modules/rehab/domain/RehabPlan";
import {
  measurementDisplayLabel,
  measurementSeriesKey,
} from "@/modules/rehab/ui/lib/measurementLabels";
import { formatDateIsoCalendar } from "@/modules/rehab/domain/protocolSchedule";

const GROUP_BORDER_COLORS = [
  "border-l-primary",
  "border-l-success",
  "border-l-warning",
  "border-l-error",
  "border-l-accent-tint",
];

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
  const groups = useMemo(() => {
    const map = new Map<string, MeasurementPoint[]>();
    for (const m of measurements) {
      const key = measurementSeriesKey(m);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: measurementDisplayLabel(items[0]),
      items: [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }));
  }, [measurements]);

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-body-md">Historial por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-text-3">
            Todavía no registraste ninguna medición.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-headline-md font-semibold text-text-1">Historial por tipo</h4>
        <p className="text-body-md text-text-3">
          Cada medición en su propia sección — sin mezclar tipos distintos.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group, index) => (
          <Card
            key={group.key}
            className={`border-l-[3px] ${GROUP_BORDER_COLORS[index % GROUP_BORDER_COLORS.length]}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-body-md">{group.label}</CardTitle>
                <Badge variant="secondary">{group.items.length} registros</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.items.map((measurement) => (
                <div
                  key={measurement.measurementId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-metric text-sm font-semibold text-text-1">
                      {measurement.value}
                      {measurement.unit}
                    </p>
                    <p className="font-label text-label-md text-text-3">
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
            </CardContent>
          </Card>
        ))}
      </div>
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
