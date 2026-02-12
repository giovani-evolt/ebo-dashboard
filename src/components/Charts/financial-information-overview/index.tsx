"use client";

import { cn } from "@/lib/utils";
import { FinancialInformationChart } from "./chart";
import type { WaterfallChartData } from "@/services/charts.services";

type PropsType = {
  waterfallData: WaterfallChartData;
  className?: string;
};

export function FinancialInformation({
  waterfallData,
  className,
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
      </div>

      <FinancialInformationChart waterfallData={waterfallData} />
    </div>
  );
}
