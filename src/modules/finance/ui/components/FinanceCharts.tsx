"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@lifetrack/system-design";
import { MonthlySummary } from "@/modules/finance/domain/MonthlySummary";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { Category } from "@/modules/finance/domain/Category";
import { Account } from "@/modules/finance/domain/Account";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

/** Escala alrededor de primary para que los 3 charts compartan la misma familia. */
const CHART_PALETTE = [
  "var(--primary)",
  "color-mix(in srgb, var(--primary) 72%, #818cf8)",
  "color-mix(in srgb, var(--primary) 58%, #a78bfa)",
  "color-mix(in srgb, var(--primary) 48%, #c4b5fd)",
  "color-mix(in srgb, var(--primary) 65%, #6366f1)",
  "color-mix(in srgb, var(--primary) 55%, #7c3aed)",
];

const CHART_CARD =
  "border-t-[3px] border-t-primary bg-primary/[0.03]";

const TOOLTIP_STYLE = {
  background: "var(--surface-1)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  boxShadow: "0 8px 24px color-mix(in srgb, var(--text-1) 8%, transparent)",
  fontSize: 12,
  color: "var(--text-1)",
  padding: "8px 12px",
};

const AXIS_TICK = { fill: "var(--text-3)", fontSize: 11 };

function buildDailyCumulative(
  transactions: Transaction[],
  month: number,
  year: number,
  currency: string,
  accounts: Account[],
): { day: string; total: number }[] {
  const accountIds = new Set(
    accounts.filter((a) => a.currency === currency).map((a) => a.id),
  );
  const daysInMonth = new Date(year, month, 0).getDate();
  const daily = new Map<number, number>();

  for (let d = 1; d <= daysInMonth; d++) daily.set(d, 0);

  transactions
    .filter(
      (t) =>
        accountIds.has(t.accountId) &&
        t.kind === "EXPENSE" &&
        new Date(t.occurredAt).getMonth() + 1 === month &&
        new Date(t.occurredAt).getFullYear() === year,
    )
    .forEach((t) => {
      const day = new Date(t.occurredAt).getDate();
      daily.set(day, (daily.get(day) ?? 0) + t.amount);
    });

  let cumulative = 0;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    cumulative += daily.get(day) ?? 0;
    return { day: String(day), total: cumulative };
  });
}

function moneyTooltip(currency: string) {
  return (value: unknown) => formatMoney(Number(value ?? 0), currency);
}

function BarValueLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
  currency: string;
}) {
  const { x = 0, y = 0, width = 0, value = 0, currency } = props;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const numX = Number(x);
  const numY = Number(y);
  const numW = Number(width);
  return (
    <text
      x={numX + numW / 2}
      y={numY - 8}
      fill="var(--text-1)"
      textAnchor="middle"
      className="font-metric"
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      {formatMoney(amount, currency)}
    </text>
  );
}

export function FinanceCharts({
  summaries,
  transactions,
  categories,
  accounts,
  month,
  year,
  currency = "PEN",
}: {
  summaries: MonthlySummary[];
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  month: number;
  year: number;
  currency?: string;
}) {
  const summary = summaries.find((s) => s.currency === currency) ?? summaries[0];

  const incomeExpenseData = useMemo(
    () =>
      summary
        ? [
            {
              name: "Ingresos",
              value: summary.totalIncome,
              fill: "color-mix(in srgb, var(--primary) 55%, #a78bfa)",
            },
            {
              name: "Gastos",
              value: summary.totalExpense,
              fill: "var(--primary)",
            },
          ]
        : [],
    [summary],
  );

  const categoryData = useMemo(() => {
    if (!summary || summary.expensesByCategory.length === 0) return [];
    const total = summary.expensesByCategory.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    if (total <= 0) return [];

    return summary.expensesByCategory.map((e, i) => {
      const category = categories.find((c) => c.id === e.categoryId);
      return {
        name: category?.name ?? "Otro",
        value: e.amount,
        pct: Math.round((e.amount / total) * 100),
        fill: CHART_PALETTE[i % CHART_PALETTE.length],
      };
    });
  }, [summary, categories]);

  const dailyData = useMemo(
    () =>
      summary
        ? buildDailyCumulative(
            transactions,
            month,
            year,
            summary.currency,
            accounts,
          )
        : [],
    [summary, transactions, month, year, accounts],
  );

  if (!summary) {
    return (
      <Card className={CHART_CARD}>
        <CardContent>
          <p className="text-body-md text-text-3">Sin datos para gráficos.</p>
        </CardContent>
      </Card>
    );
  }

  const chartCurrency = summary.currency;
  const barMax = Math.max(summary.totalIncome, summary.totalExpense, 1) * 1.25;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className={CHART_CARD}>
        <CardHeader>
          <CardTitle className="text-body-md">
            Ingresos vs gastos ({chartCurrency})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeExpenseData}
                margin={{ top: 28, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_TICK}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, barMax]}
                  width={48}
                  tickFormatter={(v) =>
                    Number(v) >= 1000
                      ? `${Math.round(Number(v) / 1000)}k`
                      : String(v)
                  }
                />
                <Tooltip
                  formatter={moneyTooltip(chartCurrency)}
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{
                    fill: "color-mix(in srgb, var(--primary) 6%, transparent)",
                    radius: 8,
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={64}>
                  {incomeExpenseData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    content={(props) => {
                      const raw = props.value;
                      const value =
                        typeof raw === "number" || typeof raw === "string"
                          ? raw
                          : 0;
                      return (
                        <BarValueLabel
                          x={props.x}
                          y={props.y}
                          width={props.width}
                          value={value}
                          currency={chartCurrency}
                        />
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={CHART_CARD}>
        <CardHeader>
          <CardTitle className="text-body-md">Gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="flex h-56 items-center text-body-md text-text-3">
              Sin gastos este mes.
            </p>
          ) : (
            <div className="flex h-56 items-center gap-4">
              <div className="h-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={categoryData.length > 1 ? 2 : 0}
                      stroke="var(--surface-1)"
                      strokeWidth={3}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={moneyTooltip(chartCurrency)}
                      contentStyle={TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex w-[42%] min-w-[120px] flex-col gap-2">
                {categoryData.map((slice) => (
                  <div
                    key={slice.name}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: slice.fill }}
                    />
                    <span className="truncate font-label text-label-md text-text-1">
                      {slice.name}
                    </span>
                    <span className="ml-auto shrink-0 font-label text-label-md text-text-3">
                      {slice.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD}>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-body-md">Gasto acumulado diario</CardTitle>
            <span className="font-label text-label-md text-text-3">
              {formatMoney(summary.totalExpense, chartCurrency)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={AXIS_TICK}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={24}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) =>
                    Number(v) >= 1000
                      ? `${Math.round(Number(v) / 1000)}k`
                      : String(Math.round(Number(v)))
                  }
                />
                <Tooltip
                  formatter={moneyTooltip(chartCurrency)}
                  labelFormatter={(day) => `Día ${day}`}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Acumulado"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--surface-1)",
                    stroke: "var(--primary)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
