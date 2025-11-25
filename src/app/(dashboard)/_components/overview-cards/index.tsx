"use client";

import { moneyFormat } from "@/lib/format-number";
import { FinancialData } from "@/types/charts.types";
import { extractLastMonthData } from "@/lib/financial-data-utils";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export { OverviewCardsSkeleton } from "./skeleton";

type OverviewCardsGroupProps = {
  financialData: FinancialData;
};

export function OverviewCardsGroup({ financialData }: OverviewCardsGroupProps) {
  // Extract last month values from financial data
  const lastMonthData = extractLastMonthData(financialData);

  // Map financial data to card data structure
  // gross → views, taxes → profit, frsh → products, disc → users
  const views = {
    value: lastMonthData.gross,
    growthRate: 0,
  };

  const profit = {
    value: lastMonthData.taxes,
    growthRate: 0,
  };

  const products = {
    value: lastMonthData.frsh,
    growthRate: 0,
  };

  const users = {
    value: lastMonthData.disc,
    growthRate: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Gross Sale"
        data={{
          ...views,
          value: moneyFormat(views.value),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Taxes"
        data={{
          ...profit,
          value: moneyFormat(profit.value),
        }}
        Icon={icons.Taxes}
      />

      <OverviewCard
        label="Freight & Shipping"
        data={{
          ...products,
          value: moneyFormat(products.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Discounts"
        data={{
          ...users,
          value: moneyFormat(users.value),
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
