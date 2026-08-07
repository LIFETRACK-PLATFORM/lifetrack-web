"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MeasurementPoint } from "@/modules/rehab/domain/RehabPlan";
import type { MeasurementType } from "@/modules/rehab/domain/RehabRepository";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_LABELS,
  MEASUREMENT_TYPE_UNITS,
} from "@/modules/rehab/ui/lib/measurementLabels";
import { formatDateIsoCalendar } from "@/modules/rehab/domain/protocolSchedule";

function formatShortDate(dateIso: string): string {
  return formatDateIsoCalendar(dateIso.slice(0, 10), {
    day: "2-digit",
    month: "short",
  });
}

export function MeasurementTrendChart({
  measurements,
}: {
  measurements: MeasurementPoint[];
}) {
  const availableTypes = useMemo(
    () =>
      MEASUREMENT_TYPES.filter((type) =>
        measurements.some((m) => m.type === type),
      ),
    [measurements],
  );

  const [selectedType, setSelectedType] = useState<MeasurementType | null>(
    availableTypes[0] ?? null,
  );
  const activeType = selectedType ?? availableTypes[0] ?? null;

  const series = useMemo(
    () =>
      activeType
        ? measurements
            .filter((m) => m.type === activeType)
            .map((m) => ({ date: m.date, value: m.value }))
        : [],
    [measurements, activeType],
  );

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-label text-label-md text-text-3">
          Evolución de mediciones
        </h4>
        {activeType && (
          <Select
            value={activeType}
            onValueChange={(next) => setSelectedType(next as MeasurementType)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((option) => (
                <SelectItem key={option} value={option}>
                  {MEASUREMENT_TYPE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!activeType && (
        <p className="text-body-md text-text-3">
          Todavía no registraste ninguna medición.
        </p>
      )}

      {activeType && series.length < 2 && (
        <p className="text-body-md text-text-3">
          Registrá al menos dos mediciones de {MEASUREMENT_TYPE_LABELS[activeType]}{" "}
          para ver la evolución en el tiempo.
        </p>
      )}

      {activeType && series.length >= 2 && (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: "var(--text-3)", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "var(--text-3)", fontSize: 11 }}
                unit={MEASUREMENT_TYPE_UNITS[activeType]}
              />
              <Tooltip
                labelFormatter={(date) => formatShortDate(String(date))}
                formatter={(value: unknown) => [
                  `${value}${MEASUREMENT_TYPE_UNITS[activeType]}`,
                  MEASUREMENT_TYPE_LABELS[activeType],
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
