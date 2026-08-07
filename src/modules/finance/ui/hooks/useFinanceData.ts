"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FinanceRepository } from "../../domain/FinanceRepository";
import { GetFinanceOverviewUseCase } from "../../application/GetFinanceOverviewUseCase";
import { GetMonthlySummaryUseCase } from "../../application/GetMonthlySummaryUseCase";
import { ListBudgetsUseCase } from "../../application/ListBudgetsUseCase";
import { ListRecurringItemsUseCase } from "../../application/ListRecurringItemsUseCase";
import { ProcessRecurringItemsUseCase } from "../../application/ProcessRecurringItemsUseCase";
import { getMonthDateRange } from "../../domain/financePeriod";
import { FinanceOverview } from "../../application/GetFinanceOverviewUseCase";
import { MonthlySummary } from "../../domain/MonthlySummary";
import { BudgetListItem } from "../../domain/BudgetListItem";
import { RecurringItem } from "../../domain/RecurringItem";
import { Transaction } from "../../domain/Transaction";

export function useFinanceData(
  repository: FinanceRepository,
  month: number,
  year: number,
) {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [budgets, setBudgets] = useState<BudgetListItem[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  const [pendingReminders, setPendingReminders] = useState<RecurringItem[]>(
    [],
  );
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const dateRange = useMemo(
    () => getMonthDateRange(month, year),
    [month, year],
  );

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const overviewUseCase = new GetFinanceOverviewUseCase(repository);
        const summaryUseCase = new GetMonthlySummaryUseCase(repository);
        const budgetsUseCase = new ListBudgetsUseCase(repository);
        const recurringUseCase = new ListRecurringItemsUseCase(repository);
        const processUseCase = new ProcessRecurringItemsUseCase(repository);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [overviewData, summaryData, budgetData, recurringData, processResult, todayTransactions] =
          await Promise.all([
            overviewUseCase.execute({
              fromDate: dateRange.fromDate,
              toDate: dateRange.toDate,
            }),
            summaryUseCase.execute({ periodMonth: month, periodYear: year }),
            budgetsUseCase.execute({ periodMonth: month, periodYear: year }),
            recurringUseCase.execute(),
            processUseCase.execute(),
            repository.getTransactions({
              fromDate: todayStart.toISOString(),
              toDate: todayEnd.toISOString(),
            }),
          ]);

        if (cancelled) return;
        setOverview(overviewData);
        setSummaries(summaryData);
        setBudgets(budgetData);
        setRecurringItems(recurringData);
        setPendingReminders(processResult.pendingReminders);
        setTodayTransactions(todayTransactions);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar finanzas",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repository, month, year, dateRange, reloadToken]);

  return {
    overview,
    summaries,
    budgets,
    recurringItems,
    pendingReminders,
    setPendingReminders,
    todayTransactions,
    loading,
    error,
    reload,
    dateRange,
  };
}
