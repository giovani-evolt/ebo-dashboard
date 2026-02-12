"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import type { WaterfallChartData } from "@/services/charts.services";
import { useTheme } from "next-themes";

type PropsType = {
  data: WaterfallChartData;
};

export function WaterfallChart({ data }: PropsType) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    const chart = echarts.init(chartRef.current);
    setChartInstance(chart);

    // Cleanup on unmount
    return () => {
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance || !data || !data.data.length) return;

    // Extract values and calculate running total for intermediate totals
    const values: number[] = [];
    const colors: string[] = [];
    const isIntermediate: boolean[] = [];
    const needsOffsetFlag: boolean[] = [];

    const offsets: number[] = [];
    let lastTop = 0;
    data.data.forEach((point, index) => {
      

      const isIntermediateTotal = [
        'Gross Sales',
        'Net Sales',
        'Net Sales after Taxes',
        'Gross Margin',
        'Contribution Margin',
        'EBITDA'
      ].includes(point.name);

      values.push(point.value);

      if(!isIntermediateTotal) {
        lastTop -= Math.abs(point.value);
        offsets.push(lastTop);
      } else {
        lastTop = point.value;
        offsets.push(0);
      }
      colors.push(point.itemStyle?.color || '#6B7280');
    });

    // Build visible bars data with colors
    // For columns that need offset, show absolute value of the change
    // For columns that don't need offset, show the full value from 0
    const visibleBars = values.map((value, index) => {
      if (needsOffsetFlag[index]) {
        // Deductions/expenses: show absolute value of the change
        return {
          value: Math.abs(value),
          itemStyle: {
            color: colors[index],
          },
        };
      } else {
        // Totals/intermediates: show full value from 0
        return {
          value: Math.abs(value),
          itemStyle: {
            color: colors[index],
          },
        };
      }
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          const paramsArray = Array.isArray(params) ? params : [params];
          // Get the visible bar (second series)
          const visibleParam = paramsArray[1] || paramsArray[0];
          const index = visibleParam.dataIndex as number;
          const displayValue = isIntermediate[index] 
            ? values[index] 
            : values[index];
          const name = data.categories[index];
          
          const formattedValue = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(Math.abs(displayValue));
          
          return `${name}<br/>${formattedValue}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.categories,
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10,
          color: isDark ? "#FFFFFF" : "#374151",
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
              maximumFractionDigits: 0,
            }).format(value);
          },
          color: isDark ? "#FFFFFF" : "#374151",
        },
      },
      series: [
        {
          // Barra invisible (offset)
          name: "Offset",
          type: "bar",
          stack: "total",
          itemStyle: {
            borderColor: "transparent",
            color: "transparent",
          },
          emphasis: {
            itemStyle: {
              borderColor: "transparent",
              color: "transparent",
            },
          },
          data: offsets,
          silent: true,
        },
        {
          // Barras visibles
          name: "Financial Flow",
          type: "bar",
          stack: "total",
          data: visibleBars,
          label: {
            show: true,
            position: "top",
            formatter: (params: any) => {
              const index = params.dataIndex as number;
              const displayValue = isIntermediate[index] 
                ? values[index] 
                : values[index];
              if (Math.abs(displayValue) < 100) return "";
              return new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(Math.abs(displayValue));
            },
            fontSize: 9,
            color: isDark ? "#FFFFFF" : "#374151",
          },
          emphasis: {
            focus: "series",
          },
        },
      ],
    };

    chartInstance.setOption(option, true);

    // Handle resize
    const handleResize = () => {
      chartInstance.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartInstance, data, isDark]);

  return (
    <div className="h-[400px] w-full">
      <div ref={chartRef} className="h-full w-full" />
    </div>
  );
}
