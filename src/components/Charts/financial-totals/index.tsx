"use client";

import { standardFormat } from "@/lib/format-number";
import { FinancialData } from "@/types/charts.types";
import { cn } from "@/lib/utils";

type PropsType = {
  data: FinancialData;
  className?: string;
};

export function FinancialTotals({ data, className }: PropsType) {
  return (
    <dl className={cn(
      "grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-4 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1",
      className
    )}>
      <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
        <dt className="text-xl font-bold text-dark dark:text-white">
          ${standardFormat(data.gross.reduce((acc, { y }) => acc + y, 0))}
        </dt>
        <dd className="font-medium dark:text-dark-6">Total Gross Sales Amount</dd>
      </div>

      <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
        <dt className="text-xl font-bold text-dark dark:text-white">
          ${standardFormat(data.taxes.reduce((acc, { y }) => acc + y, 0))}
        </dt>
        <dd className="font-medium dark:text-dark-6">Total Taxes Amount</dd>
      </div>

      <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
        <dt className="text-xl font-bold text-dark dark:text-white">
          ${standardFormat(data.frsh.reduce((acc, { y }) => acc + y, 0))}
        </dt>
        <dd className="font-medium dark:text-dark-6">Total Freight & Shipping Amount</dd>
      </div>

      <div>
        <dt className="text-xl font-bold text-dark dark:text-white">
          ${standardFormat(data.disc.reduce((acc, { y }) => acc + y, 0))}
        </dt>
        <dd className="font-medium dark:text-dark-6">Total Discount Amount</dd>
      </div>
    </dl>
  );
}
