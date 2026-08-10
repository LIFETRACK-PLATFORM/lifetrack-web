"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@lifetrack/system-design";
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
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => shift(-1)}
        aria-label="Mes anterior"
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-[140px] text-center font-label text-label-md text-text-1">
        {formatMonthLabel(month, year)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => shift(1)}
        aria-label="Mes siguiente"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
