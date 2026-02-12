"use client";

import { Select } from "@/components/FormElements/select";
import { useDateFilter } from "@/contexts/date-filter-context";

export function DateFilterSelector() {
  const {
    selectedYear,
    selectedMonth,
    availableData,
    setSelectedYear,
    setSelectedMonth,
    isLoading,
  } = useDateFilter();

  // Get available months for selected year
  const availableMonths = selectedYear
    ? availableData.find(d => d.year === selectedYear)?.months || []
    : [];

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearChange = (value: string) => {
    const year = parseInt(value, 10);
    setSelectedYear(year);
  };

  const handleMonthChange = (value: string) => {
    if (value === "") {
      // "All Months" selected - show all data for the year
      setSelectedMonth(null);
    } else {
      setSelectedMonth(parseInt(value, 10));
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 flex items-center justify-end gap-4">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-end gap-4">
      <div className="w-32">
        <Select
          label=""
          placeholder="Select Year"
          items={availableData.map(d => ({
            value: d.year.toString(),
            label: d.year.toString()
          }))}
          value={selectedYear?.toString() || ""}
          onChange={handleYearChange}
          className="space-y-0"
        />
      </div>
      
      <div className="w-40">
        <Select
          label=""
          placeholder={selectedYear ? "All Months" : "Select Month"}
          items={[
            { value: "", label: "All Months" },
            ...availableMonths.map(m => ({
              value: m.toString(),
              label: monthNames[m - 1] || `Month ${m}`
            }))
          ]}
          value={selectedMonth?.toString() || ""}
          onChange={handleMonthChange}
          className="space-y-0"
          disabled={!selectedYear || availableMonths.length === 0}
        />
      </div>
    </div>
  );
}
