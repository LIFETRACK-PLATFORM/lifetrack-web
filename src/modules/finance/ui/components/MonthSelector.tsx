"use client";

import { Icon } from "@/shared/ui/Icon";
import { formatMonthLabel } from "@/modules/finance/domain/financePeriod";

export function MonthSelector({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  function shift(delta: number) {
    const date = new Date(year, month - 1 + delta, 1);
    onChange(date.getMonth() + 1, date.getFullYear());
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-text-3 hover:bg-surface-4"
        aria-label="Mes anterior"
      >
        <Icon name="chevron_left" />
      </button>
      <span className="min-w-[140px] text-center font-label text-label-md text-text-1">
        {formatMonthLabel(month, year)}
      </span>
      <button
        type="button"
        onClick={() => shift(1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 text-text-3 hover:bg-surface-4"
        aria-label="Mes siguiente"
      >
        <Icon name="chevron_right" />
      </button>
    </div>
  );
}
