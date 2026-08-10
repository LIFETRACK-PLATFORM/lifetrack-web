"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@lifetrack/system-design";
import { TransactionList } from "@/modules/finance/ui/components/TransactionList";
import { Transaction } from "@/modules/finance/domain/Transaction";
import { Account } from "@/modules/finance/domain/Account";
import { Category } from "@/modules/finance/domain/Category";
import { isSameDay } from "@/modules/finance/domain/financePeriod";

export function TodaySection({
  transactions,
  accounts,
  categories,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  const today = new Date();
  const todayTx = transactions.filter((t) => isSameDay(t.occurredAt, today));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionList
          transactions={todayTx}
          accounts={accounts}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}
