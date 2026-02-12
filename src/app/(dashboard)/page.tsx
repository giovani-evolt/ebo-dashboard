"use client";

import { FinancialInformation } from "@/components/Charts/financial-information-overview";
import { FinancialTotals } from "@/components/Charts/financial-totals";
import { DateFilterProvider, useDateFilter } from "@/contexts/date-filter-context";
import { DateFilterSelector } from "@/components/date-filter-selector";
import { OverviewCardsGroup, OverviewCardsSkeleton } from "./_components/overview-cards";
import { getFinancialInformationData, getWaterfallChartData, type WaterfallChartData } from "@/services/charts.services";
import { isValidFinancialData } from "@/lib/financial-data-utils";
import { useEffect, useState } from "react";
import { FinancialData } from "@/types/charts.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { EmptyState } from "./_components/empty-state";

function DashboardContent() {
  const router = useRouter();
  const { selectedYear, selectedMonth, isLoading: isLoadingFilters } = useDateFilter();

  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [waterfallData, setWaterfallData] = useState<WaterfallChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when filters change
  useEffect(() => {
    if (isLoadingFilters || selectedYear === null) return;

    const year = selectedYear; // Type narrowing
    const month = selectedMonth !== null ? selectedMonth : undefined;

    async function fetchFinancialData() {
      setIsLoading(true);
      setError(null);

      try {
        const [data, waterfall] = await Promise.all([
          getFinancialInformationData(year, month),
          getWaterfallChartData(year, month)
        ]);

        // Validate the data structure
        if (!data) {
          console.error('Failed to load financial data: received null or undefined');
          setError('No data was returned from the server. Please try refreshing the page.');
          return;
        }

        if (!isValidFinancialData(data)) {
          console.error('Failed to load financial data: invalid data structure', data);
          setError('The data received from the server is not in the expected format. Please contact support if this issue persists.');
          return;
        }

        // Check if data arrays are empty
        const hasEmptyArrays =
          data.gross.length === 0 ||
          data.taxes.length === 0 ||
          data.frsh.length === 0 ||
          data.disc.length === 0;

        if (hasEmptyArrays) {
          console.warn('Financial data contains empty arrays', {
            gross: data.gross.length,
            taxes: data.taxes.length,
            frsh: data.frsh.length,
            disc: data.disc.length,
          });
          // Set empty data to trigger empty state
          setFinancialData(data);
          return;
        }

        console.log('Successfully loaded and validated financial data');
        setFinancialData(data);
        setWaterfallData(waterfall);
      } catch (err) {
        console.error('Failed to load financial data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error details:', errorMessage);
        setError('An error occurred while loading the data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFinancialData();
  }, [selectedYear, selectedMonth, isLoadingFilters]);

  if (error) {
    const handleImportClick = () => {
      router.push("/csvs/new");
    };

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-meta-1/10">
            <svg
              className="size-10 fill-meta-1"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-2xl font-semibold text-dark dark:text-white">
            Failed to load financial data
          </h3>
          
          <p className="mb-6 text-body text-gray-5 dark:text-gray-4">
            {error}
          </p>

          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload Files
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !financialData || !waterfallData) {
    return (
      <>
        <OverviewCardsSkeleton />

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
          {/* FinancialInformation Skeleton */}
          <div className="col-span-12 xl:col-span-12">
            <div className="grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-40" />
              </div>

              {/* Chart skeleton */}
              <div className="mt-4">
                <Skeleton className="h-[350px] w-full" />
              </div>

              {/* Stats skeleton */}
              <div className="mt-4 grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-4 sm:divide-x">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col-reverse gap-1">
                    <Skeleton className="mx-auto h-6 w-32" />
                    <Skeleton className="mx-auto h-7 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Check if financial data is empty
  const hasEmptyArrays =
    financialData.gross.length === 0 ||
    financialData.taxes.length === 0 ||
    financialData.frsh.length === 0 ||
    financialData.disc.length === 0;

  if (hasEmptyArrays) {
    return <EmptyState />;
  }

  return (
    <>
      <DateFilterSelector />
      
      <OverviewCardsGroup financialData={financialData} />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <FinancialInformation
          waterfallData={waterfallData}
          className="col-span-12 xl:col-span-12"
        />

        {/* <div className="col-span-12 xl:col-span-12">
          <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <FinancialTotals data={financialData} />
          </div>
        </div> */}

        {/* <WeeksProfit
          key={extractTimeFrame("weeks_profit")}
          timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame("used_devices")}
          timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
        />

        <RegionLabels />

        <div className="col-span-12 grid xl:col-span-8">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense> */}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <DateFilterProvider>
      <DashboardContent />
    </DateFilterProvider>
  );
}
