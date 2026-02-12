import { apiClient } from '@/lib/api-client';
import type {
  FinancialData,
  PaymentsOverviewData,
  WeeksProfitData,
  DeviceUsedData,
  CampaignVisitorsData,
  CostsPerInteractionData,
  ChartDataPoint,
} from '@/types/charts.types';

import { standardMonth } from "@/lib/format-number";

export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<DeviceUsedData[]> {
  // Example: Replace with actual API call when backend is ready
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "Desktop",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "Tablet",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "Mobile",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "Unknown",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

interface TransactionTotalItem {
  year: number;
  month: number;
  PNLAccount: string;
  PNLSubAccount: string;
  totalAmount: string;
}

interface WaterfallDataPoint {
  name: string;
  value: number;
  itemStyle?: {
    color: string;
  };
}

export interface WaterfallChartData {
  categories: string[];
  data: WaterfallDataPoint[];
}

// Cache for transaction totals data
let transactionTotalsCache: TransactionTotalItem[] | null = null;
let transactionTotalsCachePromise: Promise<TransactionTotalItem[]> | null = null;

/**
 * Fetches transaction totals data with caching to avoid duplicate API calls
 */
async function getTransactionTotalsData(): Promise<TransactionTotalItem[]> {
  // If we already have cached data, return it
  if (transactionTotalsCache !== null) {
    return transactionTotalsCache;
  }

  // If there's already a request in progress, wait for it
  if (transactionTotalsCachePromise !== null) {
    return transactionTotalsCachePromise;
  }

  // Make the API call and cache the result
  transactionTotalsCachePromise = (async () => {
    try {
      const json = await apiClient.get<any>('/transaction-totals/total-type/');
      const data = json.member || [];
      transactionTotalsCache = data;
      return data;
    } finally {
      transactionTotalsCachePromise = null;
    }
  })();

  return transactionTotalsCachePromise;
}

/**
 * Clears the transaction totals cache (useful for testing or forced refresh)
 */
export function clearTransactionTotalsCache() {
  transactionTotalsCache = null;
  transactionTotalsCachePromise = null;
}

export async function getFinancialInformationData(year?: number, month?: number): Promise<FinancialData> {
  const allData = await getTransactionTotalsData();

  // Filter by year/month if provided
  let filteredData: TransactionTotalItem[] = allData;
  
  if (year && month) {
    // Filter by both year and month
    filteredData = allData.filter(
      (item: TransactionTotalItem) => item.year === year && item.month === month
    );
  } else if (year) {
    // Filter by year only - aggregate all months of that year
    filteredData = allData.filter(
      (item: TransactionTotalItem) => item.year === year
    );
  }

  const graph: FinancialData = {
    gross: [],
    taxes: [],
    frsh: [],
    disc: []
  };

  // Group data by year-month for waterfall calculation
  const groupedData: Record<string, TransactionTotalItem[]> = {};
  
  filteredData.forEach((element: TransactionTotalItem) => {
    const key = `${element.year}-${element.month}`;
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(element);
  });

  // Process each month
  Object.keys(groupedData).forEach((key) => {
    const [year, month] = key.split('-').map(Number);
    const monthData = groupedData[key];
    
    // Calculate totals for each category
    let grossPrincipal = 0;
    let shipping = 0;
    let tax = 0;
    let discounts = 0;
    let refunds = 0;
    let amazonFees = 0;
    let orderFees = 0;
    let otherFees = 0;
    let freightShipping = 0;

    monthData.forEach((item) => {
      const amount = parseFloat(item.totalAmount);
      
      if (item.PNLAccount === 'Gross') {
        if (item.PNLSubAccount === 'Gross Principal') grossPrincipal += amount;
        else if (item.PNLSubAccount === 'Shipping') shipping += amount;
        else if (item.PNLSubAccount === 'Tax') tax += amount;
      } else if (item.PNLAccount === 'Discounts') {
        discounts += Math.abs(amount); // Already negative, make positive for calculation
      } else if (item.PNLAccount === 'Refund') {
        refunds += Math.abs(amount); // Already negative
      } else if (item.PNLAccount === 'Comms & Fees') {
        if (item.PNLSubAccount === 'Amazon Fees') amazonFees += Math.abs(amount);
        else if (item.PNLSubAccount === 'Order Fees') orderFees += Math.abs(amount);
        else if (item.PNLSubAccount === 'Others') otherFees += Math.abs(amount);
      } else if (item.PNLAccount === 'Freight & Shipping') {
        freightShipping += Math.abs(amount); // Already negative
      }
    });

    const monthLabel = standardMonth(month);
    const grossTotal = grossPrincipal + shipping + tax;
    const commsFees = amazonFees + orderFees + otherFees;

    graph.gross.push({ x: monthLabel, y: grossTotal });
    graph.taxes.push({ x: monthLabel, y: tax });
    graph.frsh.push({ x: monthLabel, y: freightShipping });
    graph.disc.push({ x: monthLabel, y: discounts });
  });
  
  return graph as FinancialData;
}

export interface YearMonthOption {
  year: number;
  months: number[];
}

export async function getAvailableYearsAndMonths(): Promise<YearMonthOption[]> {
  const allData = await getTransactionTotalsData();
  
  // Extract unique year-month combinations
  const yearMonthMap = new Map<number, Set<number>>();
  
  allData.forEach((item: TransactionTotalItem) => {
    if (!yearMonthMap.has(item.year)) {
      yearMonthMap.set(item.year, new Set());
    }
    yearMonthMap.get(item.year)!.add(item.month);
  });
  
  // Convert to array and sort
  const result: YearMonthOption[] = Array.from(yearMonthMap.entries())
    .map(([year, months]) => ({
      year,
      months: Array.from(months).sort((a, b) => a - b)
    }))
    .sort((a, b) => b.year - a.year); // Sort years descending
  
  return result;
}

export async function getWaterfallChartData(year?: number, month?: number): Promise<WaterfallChartData> {
  const allData = await getTransactionTotalsData();
  
  // Filter by year/month if provided, otherwise use the most recent month
  let filteredData: TransactionTotalItem[] = allData;
  
  if (year && month) {
    // Filter by both year and month
    filteredData = allData.filter(
      (item: TransactionTotalItem) => item.year === year && item.month === month
    );
  } else if (year) {
    // Filter by year only - aggregate all months of that year
    filteredData = allData.filter(
      (item: TransactionTotalItem) => item.year === year
    );
  } else if (allData.length > 0) {
    // Get the most recent month if no filters provided
    const sorted = [...allData].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    const latest = sorted[0];
    filteredData = allData.filter(
      (item: TransactionTotalItem) => item.year === latest.year && item.month === latest.month
    );
  }

  // Calculate totals
  let grossPrincipal = 0;
  let shipping = 0;
  let tax = 0;
  let discounts = 0;
  let refunds = 0;
  let amazonFees = 0;
  let orderFees = 0;
  let otherFees = 0;
  let freightShipping = 0;

  filteredData.forEach((item: TransactionTotalItem) => {
    const amount = parseFloat(item.totalAmount);
    
    if (item.PNLAccount === 'Gross') {
      if (item.PNLSubAccount === 'Gross Principal') grossPrincipal += amount;
      else if (item.PNLSubAccount === 'Shipping') shipping += amount;
      else if (item.PNLSubAccount === 'Tax') tax += amount;
    } else if (item.PNLAccount === 'Discounts') {
      discounts += Math.abs(amount);
    } else if (item.PNLAccount === 'Refund') {
      refunds += Math.abs(amount);
    } else if (item.PNLAccount === 'Comms & Fees') {
      if (item.PNLSubAccount === 'Amazon Fees') amazonFees += Math.abs(amount);
      else if (item.PNLSubAccount === 'Order Fees') orderFees += Math.abs(amount);
      else if (item.PNLSubAccount === 'Others') otherFees += Math.abs(amount);
    } else if (item.PNLAccount === 'Freight & Shipping') {
      freightShipping += Math.abs(amount);
    }
  });

  // Calculate waterfall values
  // Gross Sales includes Principal + Shipping + Tax
  const grossSales = grossPrincipal + shipping + tax;
  const netSales = grossSales - discounts - refunds;
  // Net Sales after Taxes = Net Sales - Tax (tax is deducted separately)
  const netSalesAfterTaxes = netSales - tax;
  const grossMargin = netSalesAfterTaxes; // Assuming no cost of product
  const commsFees = amazonFees + orderFees + otherFees;
  const contributionMargin = grossMargin - commsFees - freightShipping;
  const ebitda = contributionMargin; // Assuming no marketing expense or OPEX

  // Build waterfall data
  const categories: string[] = [];
  const data: WaterfallDataPoint[] = [];
  let runningTotal = 0;

  // Gross Sales (initial bar - dark grey)
  categories.push('Gross Sales');
  data.push({
    name: 'Gross Sales',
    value: grossSales,
    itemStyle: { color: '#6B7280' } // Dark grey
  });
  runningTotal = grossSales;

  // Proms & Discounts (negative - orange)
  categories.push('Proms & Discounts');
  data.push({
    name: 'Proms & Discounts',
    value: -discounts,
    itemStyle: { color: '#F97316' } // Orange
  });
  runningTotal -= discounts;

  // Refunds (negative - orange)
  categories.push('Refunds');
  data.push({
    name: 'Refunds',
    value: -refunds,
    itemStyle: { color: '#F97316' } // Orange
  });
  runningTotal -= refunds;

  // Net Sales (intermediate - light green)
  categories.push('Net Sales');
  data.push({
    name: 'Net Sales',
    value: netSales,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // Taxes (negative - orange)
  categories.push('Taxes');
  data.push({
    name: 'Taxes',
    value: -tax,
    itemStyle: { color: '#F97316' } // Orange
  });
  runningTotal = netSalesAfterTaxes;

  // Net Sales after Taxes (intermediate - light green)
  categories.push('Net Sales after Taxes');
  data.push({
    name: 'Net Sales after Taxes',
    value: netSalesAfterTaxes,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // Cost of Product (0 or not applicable)
  categories.push('Cost of Product');
  data.push({
    name: 'Cost of Product',
    value: 0,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // Gross Margin (intermediate - light green)
  categories.push('Gross Margin');
  data.push({
    name: 'Gross Margin',
    value: grossMargin,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // Comms & Fees (negative - orange)
  categories.push('Comms & Fees');
  data.push({
    name: 'Comms & Fees',
    value: -commsFees,
    itemStyle: { color: '#F97316' } // Orange
  });
  runningTotal -= commsFees;

  // Freight & Shipping (negative - orange)
  categories.push('Freight & Shipping');
  data.push({
    name: 'Freight & Shipping',
    value: -freightShipping,
    itemStyle: { color: '#F97316' } // Orange
  });
  runningTotal -= freightShipping;

  // Contribution Margin (intermediate - light green)
  categories.push('Contribution Margin');
  data.push({
    name: 'Contribution Margin',
    value: contributionMargin,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // Marketing Expense (0 or not applicable)
  categories.push('Marketing Expense');
  data.push({
    name: 'Marketing Expense',
    value: 0,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // OPEX (0 or not applicable)
  categories.push('OPEX');
  data.push({
    name: 'OPEX',
    value: 0,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  // EBITDA (final - light green)
  categories.push('EBITDA');
  data.push({
    name: 'EBITDA',
    value: ebitda,
    itemStyle: { color: '#86EFAC' } // Light green
  });

  return {
    categories,
    data
  };
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
): Promise<PaymentsOverviewData> {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/analytics/payments', { params: { timeFrame } });
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (timeFrame === "yearly") {
    return {
      received: [
        { x: '2020', y: 450 },
        { x: '2021', y: 620 },
        { x: '2022', y: 780 },
        { x: '2023', y: 920 },
        { x: '2024', y: 1080 },
      ],
      due: [
        { x: '2020', y: 1480 },
        { x: '2021', y: 1720 },
        { x: '2022', y: 1950 },
        { x: '2023', y: 2300 },
        { x: '2024', y: 1200 },
      ],
    };
  }

  return {
    received: [
      { x: "Jan", y: 0 },
      { x: "Feb", y: 20 },
      { x: "Mar", y: 35 },
      { x: "Apr", y: 45 },
      { x: "May", y: 35 },
      { x: "Jun", y: 55 },
      { x: "Jul", y: 65 },
      { x: "Aug", y: 50 },
      { x: "Sep", y: 65 },
      { x: "Oct", y: 75 },
      { x: "Nov", y: 60 },
      { x: "Dec", y: 75 },
    ],
    due: [
      { x: "Jan", y: 15 },
      { x: "Feb", y: 9 },
      { x: "Mar", y: 17 },
      { x: "Apr", y: 32 },
      { x: "May", y: 25 },
      { x: "Jun", y: 68 },
      { x: "Jul", y: 80 },
      { x: "Aug", y: 68 },
      { x: "Sep", y: 84 },
      { x: "Oct", y: 94 },
      { x: "Nov", y: 74 },
      { x: "Dec", y: 62 },
    ],
  };
}

export async function getWeeksProfitData(timeFrame?: string): Promise<WeeksProfitData> {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/analytics/profit', { params: { timeFrame } });
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (timeFrame === "last week") {
    return {
      sales: [
        { x: "Sat", y: 33 },
        { x: "Sun", y: 44 },
        { x: "Mon", y: 31 },
        { x: "Tue", y: 57 },
        { x: "Wed", y: 12 },
        { x: "Thu", y: 33 },
        { x: "Fri", y: 55 },
      ],
      revenue: [
        { x: "Sat", y: 10 },
        { x: "Sun", y: 20 },
        { x: "Mon", y: 17 },
        { x: "Tue", y: 7 },
        { x: "Wed", y: 10 },
        { x: "Thu", y: 23 },
        { x: "Fri", y: 13 },
      ],
    };
  }

  return {
    sales: [
      { x: "Sat", y: 44 },
      { x: "Sun", y: 55 },
      { x: "Mon", y: 41 },
      { x: "Tue", y: 67 },
      { x: "Wed", y: 22 },
      { x: "Thu", y: 43 },
      { x: "Fri", y: 65 },
    ],
    revenue: [
      { x: "Sat", y: 13 },
      { x: "Sun", y: 23 },
      { x: "Mon", y: 20 },
      { x: "Tue", y: 8 },
      { x: "Wed", y: 13 },
      { x: "Thu", y: 27 },
      { x: "Fri", y: 15 },
    ],
  };
}

export async function getCampaignVisitorsData(): Promise<CampaignVisitorsData> {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/analytics/campaign-visitors');
  
  // Fake delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData(): Promise<ChartDataPoint[]> {
  // Example: Replace with actual API call when backend is ready
  // return apiClient.get('/api/analytics/visitors');
  
  // Fake dela

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}

export async function getCostsPerInteractionData(): Promise<CostsPerInteractionData> {
  return {
    avg_cost: 560.93,
    growth: 2.5,
    chart: [
      {
        name: "Google Ads",
        data: [
          { x: "Sep", y: 15 },
          { x: "Oct", y: 12 },
          { x: "Nov", y: 61 },
          { x: "Dec", y: 118 },
          { x: "Jan", y: 78 },
          { x: "Feb", y: 125 },
          { x: "Mar", y: 165 },
          { x: "Apr", y: 61 },
          { x: "May", y: 183 },
          { x: "Jun", y: 238 },
          { x: "Jul", y: 237 },
          { x: "Aug", y: 235 },
        ],
      },
      {
        name: "Facebook Ads",
        data: [
          { x: "Sep", y: 75 },
          { x: "Oct", y: 77 },
          { x: "Nov", y: 151 },
          { x: "Dec", y: 72 },
          { x: "Jan", y: 7 },
          { x: "Feb", y: 58 },
          { x: "Mar", y: 60 },
          { x: "Apr", y: 185 },
          { x: "May", y: 239 },
          { x: "Jun", y: 135 },
          { x: "Jul", y: 119 },
          { x: "Aug", y: 124 },
        ],
      },
    ],
  };
}