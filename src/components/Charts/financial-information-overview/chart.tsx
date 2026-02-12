"use client";

import { WaterfallChart } from "./waterfall-chart";
import type { WaterfallChartData } from "@/services/charts.services";

type PropsType = {
  waterfallData: WaterfallChartData;
};

export function FinancialInformationChart({ waterfallData }: PropsType) {
  return (
    <div className="-ml-4 -mr-5">
      <WaterfallChart data={waterfallData} />
    </div>
  );
}
