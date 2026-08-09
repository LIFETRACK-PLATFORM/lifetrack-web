"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, CalendarDays, Stethoscope } from "lucide-react";
import {
  Button,
  Badge,
  Calendar,
  Input,
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
import {
  AddAppointmentInput,
  AppointmentType,
} from "@/modules/rehab/domain/RehabRepository";

const TIME_SLOTS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const TYPE_OPTIONS: {
  value: AppointmentType;
  label: string;
  hint: string;
  icon: typeof Activity;
}[] = [
  { value: "THERAPY", label: "Terapia", hint: "Sesión con fisioterapeuta", icon: Activity },
  { value: "MEDICAL", label: "Médica", hint: "Control o evaluación", icon: Stethoscope },
];

export function AddAppointmentDialog({
  onClose,
  onSubmit,
  submitting,
  error,
  appointmentId,
  initial,
}: {
  onClose: () => void;
  onSubmit: (input: AddAppointmentInput) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
  appointmentId?: string;
  initial?: {
    title: string;
    date: string;
    provider: string;
    type: AppointmentType;
    notes?: string;
  };
}) {
  const isEdit = Boolean(appointmentId);
  const initialDate = initial ? new Date(initial.date) : undefined;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [day, setDay] = useState<Date | undefined>(initialDate);
  const [time, setTime] = useState(
    initialDate
      ? `${String(initialDate.getHours()).padStart(2, "0")}:${String(
          initialDate.getMinutes(),
        ).padStart(2, "0")}`
      : "09:00",
  );
  const [provider, setProvider] = useState(initial?.provider ?? "");
  const [type, setType] = useState<AppointmentType>(initial?.type ?? "THERAPY");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [repeatWeeks, setRepeatWeeks] = useState("0");
  const [clientError, setClientError] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    if (!day) return "Seleccioná una fecha";
    return format(day, "d 'de' MMMM yyyy", { locale: es });
  }, [day]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!title.trim()) {
      setClientError("El título es obligatorio.");
      return;
    }
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
      title: title.trim(),
      date: scheduled.toISOString(),
      provider: provider.trim(),
      type,
      notes: notes.trim() || undefined,
      repeatWeeks: isEdit ? undefined : repeats,
    });
    if (success) onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-[720px]"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,300px)_1fr]">
            <div className="border-b border-primary/20 bg-gradient-to-br from-primary/15 via-success/5 to-transparent p-5 md:border-b-0 md:border-r">
              <Badge variant="default" className="mb-2 gap-1.5">
                <CalendarDays size={12} />
                Agenda
              </Badge>
              <DialogTitle className="mt-1 font-heading text-body-lg">
                Elegí el día
              </DialogTitle>
              <DialogDescription className="mb-3 mt-1 text-label-md text-text-3">
                El calendario queda fijo mientras completás los datos.
              </DialogDescription>
              <Calendar
                mode="single"
                selected={day}
                onSelect={setDay}
                className="w-full rounded-xl border border-border bg-surface-1"
              />
              {day && (
                <div className="mt-3 rounded-lg border border-success/40 bg-success/10 px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase text-success">
                    Fecha seleccionada
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-1">{dateLabel}</p>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
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
                <div className="space-y-1.5">
                  <label
                    htmlFor="appointment-title"
                    className="font-label text-label-md text-text-3"
                  >
                    Título de la cita
                  </label>
                  <Input
                    id="appointment-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Control post-operatorio"
                    autoFocus
                  />
                </div>

                <div>
                  <span className="text-xs font-semibold text-text-3">Tipo de cita</span>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    {TYPE_OPTIONS.map((option) => {
                      const active = type === option.value;
                      const OptionIcon = option.icon;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setType(option.value)}
                          className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                            active
                              ? "border-primary bg-primary/10"
                              : "border-border bg-surface-1 opacity-90 hover:opacity-100"
                          }`}
                        >
                          <OptionIcon
                            size={18}
                            className={active ? "text-primary" : "text-text-3"}
                          />
                          <span
                            className={`text-sm font-semibold ${
                              active ? "text-primary" : "text-text-1"
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

                <div className="space-y-1.5">
                  <label className="font-label text-label-md text-text-3">Hora</label>
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

                <div className="space-y-1.5">
                  <label
                    htmlFor="appointment-provider"
                    className="font-label text-label-md text-text-3"
                  >
                    Profesional / centro
                  </label>
                  <Input
                    id="appointment-provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Ej. Centro Médico Apex"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="appointment-notes"
                    className="font-label text-label-md text-text-3"
                  >
                    Notas (opcional)
                  </label>
                  <Input
                    id="appointment-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Llevar resonancia"
                  />
                </div>

                {!isEdit && (
                  <div className="space-y-1.5 rounded-lg border border-warning/35 bg-warning/8 px-3 py-2.5">
                    <label
                      htmlFor="appointment-repeat"
                      className="font-label text-label-md text-text-2"
                    >
                      Repetir cada semana (0-12 veces)
                    </label>
                    <Input
                      id="appointment-repeat"
                      type="number"
                      min={0}
                      max={12}
                      value={repeatWeeks}
                      onChange={(e) => setRepeatWeeks(e.target.value)}
                    />
                  </div>
                )}

                {title.trim() && day && provider.trim() && (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/35 bg-primary/5 p-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                      <CalendarDays size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-label-md font-semibold text-text-3">Vista previa</p>
                      <p className="truncate text-body-md font-semibold text-text-1">
                        {title.trim()}
                      </p>
                      <p className="truncate text-label-md text-text-3">{provider.trim()}</p>
                    </div>
                    <Badge variant="default" className="shrink-0 uppercase">
                      {type === "THERAPY" ? "Terapia" : "Médica"}
                    </Badge>
                  </div>
                )}

                {(clientError || error) && (
                  <p className="text-body-md text-error">{clientError ?? error}</p>
                )}
              </div>

              <DialogFooter className="gap-2 border-t border-border px-5 py-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="min-w-[108px]" onClick={onClose}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="min-w-[140px]" disabled={submitting}>
                  {submitting ? "Guardando…" : isEdit ? "Guardar" : "Confirmar cita"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
