"use client";

import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { FinancialInformationChart } from "./chart";
import type { FinancialData } from "@/types/charts.types";

type PropsType = {
  data: FinancialData;
  timeFrame?: string;
  className?: string;
};

export function FinancialInformation({
  data,
  className,
  timeFrame,
}: PropsType) {

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Financial Information Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
      </div>

      <FinancialInformationChart data={data} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-4 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
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
    </div>
  );
}
