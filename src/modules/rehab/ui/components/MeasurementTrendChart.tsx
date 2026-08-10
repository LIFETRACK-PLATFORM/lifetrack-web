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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@lifetrack/system-design";
import type { MeasurementPoint } from "@/modules/rehab/domain/RehabPlan";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_TYPE_UNITS,
  measurementDisplayLabel,
  measurementSeriesKey as seriesKey,
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
    <Card className="border-t-[3px] border-t-primary bg-primary/[0.03]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-body-md">Evolución de mediciones</CardTitle>
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
      </CardHeader>
      <CardContent>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fill: "var(--text-3)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
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
                  dot={{
                    r: 3.5,
                    fill: "var(--surface-1)",
                    stroke: "var(--primary)",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "var(--primary)",
                    stroke: "var(--surface-1)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
