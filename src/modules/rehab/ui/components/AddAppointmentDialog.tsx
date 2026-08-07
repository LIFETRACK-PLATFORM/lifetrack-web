"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/shared/ui/Icon";
import {
  AddAppointmentInput,
  AppointmentType,
} from "@/modules/rehab/domain/RehabRepository";
import { cn } from "@/shared/lib/utils";

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

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
  const [day, setDay] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [provider, setProvider] = useState("");
  const [type, setType] = useState<AppointmentType>("THERAPY");
  const [notes, setNotes] = useState("");
  const [repeatWeeks, setRepeatWeeks] = useState("0");
  const [clientError, setClientError] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    if (!day) return "Elegir fecha";
    return format(day, "d 'de' MMMM yyyy", { locale: es });
  }, [day]);

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
    if (!provider.trim()) {
      setClientError("El profesional o centro es obligatorio.");
      return;
    }
    const repeats = Number(repeatWeeks);
    if (!Number.isInteger(repeats) || repeats < 0 || repeats > 12) {
      setClientError("Las repeticiones deben ser un número entre 0 y 12.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduled = new Date(day);
    scheduled.setHours(hours || 0, minutes || 0, 0, 0);

    const success = await onSubmit({
      date: scheduled.toISOString(),
      provider: provider.trim(),
      type,
      notes: notes.trim() || undefined,
      repeatWeeks: repeats,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-text-1">
            Agregar cita
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 font-label text-label-md text-text-3">
              Tipo de cita
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "THERAPY" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setType("THERAPY")}
              >
                Terapia
              </Button>
              <Button
                type="button"
                variant={type === "MEDICAL" ? "default" : "secondary"}
                className="flex-1"
                onClick={() => setType("MEDICAL")}
              >
                Médica
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="font-label text-label-md text-text-3">
                Fecha
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start font-normal",
                      !day && "text-text-3",
                    )}
                  >
                    <CalendarIcon strokeWidth={1.75} className="size-4" />
                    {dateLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[110] w-auto border-border bg-surface-1 p-0"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={16}
                >
                  <Calendar
                    mode="single"
                    selected={day}
                    onSelect={(value) => {
                      setDay(value);
                      setCalendarOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="font-label text-label-md text-text-3">
                Hora
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-10 w-full bg-surface-1">
                  <SelectValue placeholder="Elegir hora" />
                </SelectTrigger>
                <SelectContent className="z-[110] max-h-60">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="appointment-provider"
              className="font-label text-label-md text-text-3"
            >
              Profesional / centro
            </Label>
            <Input
              id="appointment-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Ej. Centro Médico Apex"
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="appointment-notes"
              className="font-label text-label-md text-text-3"
            >
              Notas (opcional)
            </Label>
            <Input
              id="appointment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <details className="rounded-lg border border-border/40 bg-surface-2/50 px-3 py-2">
            <summary className="cursor-pointer font-label text-label-md text-text-3">
              Repetir semanalmente (opcional)
            </summary>
            <div className="mt-3 space-y-1">
              <Label
                htmlFor="appointment-repeat"
                className="font-label text-label-md text-text-3"
              >
                Número de semanas extra (0-12)
              </Label>
              <Input
                id="appointment-repeat"
                type="number"
                min={0}
                max={12}
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(e.target.value)}
              />
              <p className="text-[12px] text-text-3">
                Crea citas adicionales cada 7 días. Deja 0 para una sola cita.
              </p>
            </div>
          </details>

          {(clientError || error) && (
            <p className="text-body-md text-error">{clientError ?? error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando…" : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
