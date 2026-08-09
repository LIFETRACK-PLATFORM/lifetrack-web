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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@lifetrack/system-design";
import type { MeasurementPoint } from "@/modules/rehab/domain/RehabPlan";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_UNITS,
  measurementDisplayLabel,
} from "@/modules/rehab/ui/lib/measurementLabels";
import { formatDateIsoCalendar } from "@/modules/rehab/domain/protocolSchedule";

function formatShortDate(dateIso: string): string {
  return formatDateIsoCalendar(dateIso.slice(0, 10), {
    day: "2-digit",
    month: "short",
  });
}

/** Clave de serie: para OTHER, cada customLabel distinto es su propia serie
 * (si no, "Muleta" y "Brazo" se mezclarían en un mismo trazo "Otro"). */
function seriesKey(point: MeasurementPoint): string {
  return point.type === "OTHER"
    ? `OTHER:${point.customLabel ?? ""}`
    : point.type;
}

export function MeasurementTrendChart({
  measurements,
}: {
  measurements: MeasurementPoint[];
}) {
  const seriesByKey = useMemo(() => {
    const map = new Map<string, MeasurementPoint>();
    for (const m of measurements) {
      if (!map.has(seriesKey(m))) map.set(seriesKey(m), m);
    }
    return map;
  }, [measurements]);

  const availableKeys = useMemo(() => {
    const known = MEASUREMENT_TYPES.filter((type) => type !== "OTHER").filter(
      (type) => seriesByKey.has(type),
    );
    const custom = Array.from(seriesByKey.keys())
      .filter((key) => key.startsWith("OTHER:"))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...custom];
  }, [seriesByKey]);

  const [selectedKey, setSelectedKey] = useState<string | null>(
    availableKeys[0] ?? null,
  );
  const activeKey = selectedKey ?? availableKeys[0] ?? null;
  const activePoint = activeKey ? seriesByKey.get(activeKey) : undefined;
  const activeLabel = activePoint ? measurementDisplayLabel(activePoint) : "";
  const activeUnit = activePoint ? MEASUREMENT_TYPE_UNITS[activePoint.type] : "";

  const series = useMemo(
    () =>
      activeKey
        ? measurements
            .filter((m) => seriesKey(m) === activeKey)
            .map((m) => ({ date: m.date, value: m.value }))
        : [],
    [measurements, activeKey],
  );

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-label text-label-md text-text-3">
          Evolución de mediciones
        </h4>
        {activeKey && (
          <Select value={activeKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableKeys.map((key) => {
                const point = seriesByKey.get(key);
                return (
                  <SelectItem key={key} value={key}>
                    {point ? measurementDisplayLabel(point) : key}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      {!activeKey && (
        <p className="text-body-md text-text-3">
          Todavía no registraste ninguna medición.
        </p>
      )}

      {activeKey && series.length < 2 && (
        <p className="text-body-md text-text-3">
          Registrá al menos dos mediciones de {activeLabel} para ver la
          evolución en el tiempo.
        </p>
      )}

      {activeKey && series.length >= 2 && (
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
                unit={activeUnit}
              />
              <Tooltip
                labelFormatter={(date) => formatShortDate(String(date))}
                formatter={(value: unknown) => [
                  `${value}${activeUnit}`,
                  activeLabel,
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
