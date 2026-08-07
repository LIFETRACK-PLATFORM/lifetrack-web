"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlySummary } from "@/modules/finance/domain/MonthlySummary";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { Category } from "@/modules/finance/domain/Category";
import { Account } from "@/modules/finance/domain/Account";
import { useMediaQuery } from "@/modules/finance/ui/hooks/useMediaQuery";
import { formatMoney } from "@/modules/finance/domain/formatMoney";

const CHART_COLORS = [
  "#6366F1",
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EC4899",
  "#EAB308",
];

function tooltipMoney(currency: string) {
  return (value: unknown) => formatMoney(Number(value ?? 0), currency);
}

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
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const summary = summaries.find((s) => s.currency === currency) ?? summaries[0];

  const incomeExpenseData = useMemo(
    () =>
      summary
        ? [
            { name: "Ingresos", value: summary.totalIncome, fill: "#22C55E" },
            { name: "Gastos", value: summary.totalExpense, fill: "#EF4444" },
          ]
        : [],
    [summary],
  );

  const categoryData = useMemo(() => {
    if (!summary) return [];
    return summary.expensesByCategory.map((e, i) => ({
      name: categories.find((c) => c.id === e.categoryId)?.name ?? "Otro",
      value: e.amount,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [summary, categories]);

  const dailyData = useMemo(
    () =>
      buildDailyCumulative(transactions, month, year, currency, accounts),
    [transactions, month, year, currency, accounts],
  );

  if (!summary) {
    return (
      <p className="text-body-md text-text-3">Sin datos para gráficos.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/30 bg-surface-2 p-4">
        <h4 className="mb-4 font-label text-label-md text-text-3">
          Ingresos vs gastos ({currency})
        </h4>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeExpenseData} layout={isDesktop ? "horizontal" : "vertical"}>
              {isDesktop ? (
                <>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-3)", fontSize: 12 }} />
                  <YAxis tick={{ fill: "var(--text-3)", fontSize: 12 }} />
                </>
              ) : (
                <>
                  <XAxis type="number" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                </>
              )}
              <Tooltip formatter={tooltipMoney(currency)} />
              <Bar dataKey="value" radius={4}>
                {incomeExpenseData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/30 bg-surface-2 p-4">
        <h4 className="mb-4 font-label text-label-md text-text-3">
          Gastos por categoría
        </h4>
        <div className={isDesktop ? "h-64" : "h-52"}>
          <ResponsiveContainer width="100%" height="100%">
            {isDesktop ? (
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipMoney(currency)} />
              </PieChart>
            ) : (
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                <Tooltip formatter={tooltipMoney(currency)} />
                <Bar dataKey="value" radius={4}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/30 bg-surface-2 p-4">
        <h4 className="mb-4 font-label text-label-md text-text-3">
          Gasto acumulado diario
        </h4>
        <div className={isDesktop ? "h-56" : "h-32"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              {!isDesktop ? null : (
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              )}
              <XAxis dataKey="day" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
              {!isDesktop ? null : (
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} />
              )}
              <Tooltip formatter={tooltipMoney(currency)} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366F1"
                fill="url(#expenseGrad)"
                strokeWidth={isDesktop ? 2 : 1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
