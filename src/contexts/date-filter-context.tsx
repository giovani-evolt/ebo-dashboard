"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAvailableYearsAndMonths, type YearMonthOption } from "@/services/charts.services";

interface DateFilterContextType {
  selectedYear: number | null;
  selectedMonth: number | null;
  availableData: YearMonthOption[];
  setSelectedYear: (year: number | null) => void;
  setSelectedMonth: (month: number | null) => void;
  isLoading: boolean;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error("useDateFilter must be used within a DateFilterProvider");
  }
  return context;
}

interface DateFilterProviderProps {
  children: ReactNode;
}

export function DateFilterProvider({ children }: DateFilterProviderProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableData, setAvailableData] = useState<YearMonthOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load available years and months
  useEffect(() => {
    async function loadAvailableData() {
      try {
        const data = await getAvailableYearsAndMonths();
        setAvailableData(data);
        
        // Set default to most recent year only (no month selected)
        if (data.length > 0) {
          const mostRecent = data[0];
          setSelectedYear(mostRecent.year);
          // Don't set month by default - show all data for the year
          setSelectedMonth(null);
        }
      } catch (err) {
        console.error('Failed to load available years and months:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAvailableData();
  }, []);

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    // Reset month when year changes - show all data for the year by default
    setSelectedMonth(null);
  };

  const value: DateFilterContextType = {
    selectedYear,
    selectedMonth,
    availableData,
    setSelectedYear: handleYearChange,
    setSelectedMonth,
    isLoading,
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
}
