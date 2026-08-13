"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock } from "lucide-react";
import {
  Button,
  Badge,
  Calendar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@lifetrack/system-design";
import { Icon } from "@/shared/ui/Icon";
import { Appointment } from "@/modules/rehab/domain/Appointment";
import { AddAppointmentInput } from "@/modules/rehab/domain/RehabRepository";

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

export function RescheduleAppointmentDialog({
  appointment,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  appointment: Appointment;
  onClose: () => void;
  onSubmit: (input: AddAppointmentInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}) {
  const originalDate = useMemo(
    () => new Date(appointment.date),
    [appointment.date],
  );
  const [day, setDay] = useState<Date | undefined>(originalDate);
  const [time, setTime] = useState(
    `${String(originalDate.getHours()).padStart(2, "0")}:${String(
      originalDate.getMinutes(),
    ).padStart(2, "0")}`,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    if (!day) return "Seleccioná una fecha";
    return format(day, "d 'de' MMMM yyyy", { locale: es });
  }, [day]);

  const previousDateLabel = useMemo(
    () => format(originalDate, "d 'de' MMMM · HH:mm", { locale: es }),
    [originalDate],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!day) {
      setClientError("La fecha es obligatoria.");
      return;
    }
    if (!time) {
      setClientError("La hora es obligatoria.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduled = new Date(day);
    scheduled.setHours(hours || 0, minutes || 0, 0, 0);

    const success = await onSubmit({
      title: appointment.title,
      date: scheduled.toISOString(),
      provider: appointment.provider,
      type: appointment.type,
      notes: appointment.notes ?? undefined,
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-[480px]"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end px-5 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <Icon name="close" />
              </Button>
            </DialogClose>
          </div>

          <div className="flex flex-col gap-4 px-5 pb-2 pt-1">
            <div>
              <Badge variant="default" className="mb-2 gap-1.5">
                <CalendarClock size={12} />
                Reprogramar
              </Badge>
              <DialogTitle className="mt-1 font-heading text-body-lg">
                Reprogramar cita
              </DialogTitle>
              <DialogDescription className="mt-1 text-label-md text-text-3">
                Elegí la nueva fecha y hora para &quot;{appointment.title}&quot;.
              </DialogDescription>
            </div>

            <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase text-text-3">
                Fecha actual
              </p>
              <p className="mt-1 text-sm font-semibold text-text-1">
                {previousDateLabel}
              </p>
            </div>

            <Calendar
              mode="single"
              selected={day}
              onSelect={setDay}
              className="w-full rounded-xl border border-border bg-surface-1"
            />
            {day && (
              <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase text-success">
                  Nueva fecha
                </p>
                <p className="mt-1 text-sm font-semibold text-text-1">
                  {dateLabel}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-label text-label-md text-text-3">
                Hora
              </label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-10 w-full bg-surface-1">
                  <SelectValue placeholder="Elegir hora" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(clientError || error) && (
              <p className="text-body-md text-error">{clientError ?? error}</p>
            )}
          </div>

          <DialogFooter className="gap-2 border-t border-border px-5 py-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="min-w-[108px]"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="min-w-[140px]" disabled={submitting}>
              {submitting ? "Reprogramando…" : "Reprogramar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
