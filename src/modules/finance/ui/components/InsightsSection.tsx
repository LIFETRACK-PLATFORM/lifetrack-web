"use client";

import { Card, CardContent } from "@lifetrack/system-design";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { BudgetListItem } from "@/modules/finance/domain/BudgetListItem";
import { Category } from "@/modules/finance/domain/Category";
import { MonthlySummary } from "@/modules/finance/domain/MonthlySummary";
import { formatMoney } from "@/modules/finance/domain/formatMoney";
import { getCurrentPeriod } from "@/modules/finance/domain/financePeriod";

type Tone = "success" | "warning" | "error" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  neutral: "text-text-1",
};

interface Insight {
  icon: IconName;
  label: string;
  value: string;
  note: string;
  tone: Tone;
}

function findPenSummary(summaries: MonthlySummary[]): MonthlySummary | undefined {
  return summaries.find((s) => s.currency === "PEN") ?? summaries[0];
}

export function InsightsSection({
  summaries,
  previousSummaries,
  budgets,
  categories,
  month,
  year,
}: {
  summaries: MonthlySummary[];
  previousSummaries: MonthlySummary[];
  budgets: BudgetListItem[];
  categories: Category[];
  month: number;
  year: number;
}) {
  const current = findPenSummary(summaries);
  const previous = findPenSummary(previousSummaries);
  const expense = current?.totalExpense ?? 0;
  const prevExpense = previous?.totalExpense ?? 0;
  const byCategory = current?.expensesByCategory ?? [];

  const insights: Insight[] = [];

  insights.push(spendVsLastMonthInsight(expense, prevExpense));
  insights.push(availableInsight(budgets, byCategory));
  insights.push(topCategoryInsight(byCategory, categories));

  const projection = projectionInsight(month, year, expense);
  if (projection) insights.push(projection);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {insights.map((insight) => (
        <Card key={insight.label}>
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2 text-text-3">
              <Icon name={insight.icon} className="text-[15px]" />
              <p className="font-label text-label-md">{insight.label}</p>
            </div>
            <p
              className={`font-metric text-metric-sm ${TONE_CLASS[insight.tone]}`}
            >
              {insight.value}
            </p>
            <p className="text-body-md text-text-3">{insight.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function spendVsLastMonthInsight(expense: number, prevExpense: number): Insight {
  if (prevExpense <= 0) {
    return {
      icon: "trending_up",
      label: "Gastos del mes",
      value: formatMoney(expense, "PEN"),
      note: "Todavía no hay gasto del mes pasado para comparar.",
      tone: "neutral",
    };
  }
  const deltaPct = Math.round(((expense - prevExpense) / prevExpense) * 100);
  const isIncrease = deltaPct > 0;
  return {
    icon: isIncrease ? "trending_up" : "trending_down",
    label: "Gastos del mes",
    value: `${isIncrease ? "+" : ""}${deltaPct}%`,
    note: `Llevás ${formatMoney(expense, "PEN")}, ${Math.abs(deltaPct)}% ${
      isIncrease ? "más" : "menos"
    } que el mes pasado.`,
    tone: isIncrease ? "warning" : "success",
  };
}

function availableInsight(
  budgets: BudgetListItem[],
  byCategory: { categoryId: string; amount: number }[],
): Insight {
  if (budgets.length === 0) {
    return {
      icon: "target",
      label: "Disponible",
      value: "—",
      note: "Configurá un presupuesto para ver tu disponible.",
      tone: "neutral",
    };
  }
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const spentOnBudgeted = budgets.reduce((sum, b) => {
    const spent =
      byCategory.find((e) => e.categoryId === b.categoryId)?.amount ?? 0;
    return sum + spent;
  }, 0);
  const available = totalBudgeted - spentOnBudgeted;
  return {
    icon: "target",
    label: "Disponible",
    value: formatMoney(available, "PEN"),
    note:
      available >= 0
        ? "Dentro de lo presupuestado este mes."
        : "Te pasaste del presupuesto configurado.",
    tone: available >= 0 ? "success" : "error",
  };
}

function topCategoryInsight(
  byCategory: { categoryId: string; amount: number }[],
  categories: Category[],
): Insight {
  const top = [...byCategory].sort((a, b) => b.amount - a.amount)[0];
  if (!top || top.amount <= 0) {
    return {
      icon: "label",
      label: "Categoría con más gasto",
      value: "—",
      note: "Registrá gastos para ver tu categoría principal.",
      tone: "neutral",
    };
  }
  const name = categories.find((c) => c.id === top.categoryId)?.name ?? "—";
  return {
    icon: "label",
    label: "Categoría con más gasto",
    value: name,
    note: `${formatMoney(top.amount, "PEN")} gastados en ${name} este mes.`,
    tone: "neutral",
  };
}

function projectionInsight(
  month: number,
  year: number,
  expense: number,
): Insight | null {
  const now = new Date();
  const current = getCurrentPeriod();
  if (month !== current.month || year !== current.year) return null;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();
  if (dayOfMonth <= 0) return null;

  const projected = (expense / dayOfMonth) * daysInMonth;
  return {
    icon: "schedule",
    label: "Proyección de gasto",
    value: formatMoney(projected, "PEN"),
    note: `Si seguís este ritmo, gastarás esto a fin de mes.`,
    tone: projected > expense * 1.4 ? "warning" : "neutral",
  };
}
