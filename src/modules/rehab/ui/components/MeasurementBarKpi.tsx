"use client";

import { Card, CardContent } from "@lifetrack/system-design";

type KpiTone = "primary" | "success" | "warning" | "error";

const TONE_VAR: Record<KpiTone, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
};

export function MeasurementBarKpi({
  label,
  values,
  unit,
  tone = "primary",
}: {
  label: string;
  values: number[];
  unit: string;
  tone?: KpiTone;
}) {
  const latest = values.at(-1) ?? 0;
  const max = Math.max(...values, 1);
  const color = TONE_VAR[tone];

  return (
    <Card
      className="border-t-[3px]"
      style={{
        borderTopColor: color,
        background: `color-mix(in srgb, ${color} 4%, var(--surface-1))`,
      }}
    >
      <CardContent className="p-4">
        <p className="font-label text-label-md text-text-3">{label}</p>
        <p className="mt-2 font-metric text-metric-lg" style={{ color }}>
          {latest}
          {unit}
        </p>
        {values.length > 0 && (
          <div className="mt-4 flex h-[72px] items-end gap-2">
            {values.map((value, index) => {
              const heightPct = Math.max(12, Math.round((value / max) * 100));
              const isLatest = index === values.length - 1;
              return (
                <div
                  key={`${value}-${index}`}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full min-h-[10px] rounded-lg border"
                    style={{
                      height: `${heightPct}%`,
                      background: isLatest
                        ? color
                        : `color-mix(in srgb, ${color} 28%, var(--surface-3))`,
                      borderColor: `color-mix(in srgb, ${color} 40%, var(--border))`,
                    }}
                  />
                  <span className="text-[10px] text-text-3">
                    {value}
                    {unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MeasurementKpiCard({
  label,
  value,
  delta,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: KpiTone;
}) {
  const color = TONE_VAR[tone];

  return (
    <Card
      className="border-t-[3px]"
      style={{
        borderTopColor: color,
        background: `color-mix(in srgb, ${color} 4%, var(--surface-1))`,
      }}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="font-label text-label-md text-text-3">{label}</span>
          {delta ? (
            <span className="font-label text-label-md" style={{ color }}>
              {delta}
            </span>
          ) : null}
        </div>
        <div className="font-metric text-metric-lg text-text-1">{value}</div>
        <div
          className="mt-3 h-0.5 w-full rounded-full"
          style={{ background: color }}
        />
      </CardContent>
    </Card>
  );
}
