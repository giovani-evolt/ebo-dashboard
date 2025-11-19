"use client";

import { FinancialInformation } from "@/components/Charts/financial-information-overview";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { OverviewCardsGroup, OverviewCardsSkeleton } from "./_components/overview-cards";
import { getFinancialInformationData } from "@/services/charts.services";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { isValidFinancialData } from "@/lib/financial-data-utils";
import { useEffect, useState } from "react";
import { FinancialData } from "@/types/charts.types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "./_components/empty-state";

export default function Home() {
  const searchParams = useSearchParams();
  const selected_time_frame = searchParams?.get("selected_time_frame") || undefined;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFinancialData() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getFinancialInformationData();

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
  }, []);

  if (error) {
    return (
      <ErrorFallback
        title="Failed to load financial data"
        message={error}
      />
    );
  }

  if (isLoading || !financialData) {
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
      <OverviewCardsGroup financialData={financialData} />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <FinancialInformation
          data={financialData}
          className="col-span-12 xl:col-span-12"
          key={extractTimeFrame("payments_overview")}
          timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
        />

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
