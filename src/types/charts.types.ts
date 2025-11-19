// Tipos compartidos para los datos de gráficos

export type ChartDataPoint = {
  x: string | number;
  y: number;
};

export type FinancialData = {
  gross: ChartDataPoint[];
  taxes: ChartDataPoint[];
  frsh: ChartDataPoint[];
  disc: ChartDataPoint[];
};

export type PaymentsOverviewData = {
  received: ChartDataPoint[];
  due: ChartDataPoint[];
};

export type WeeksProfitData = {
  sales: ChartDataPoint[];
  revenue: ChartDataPoint[];
};

export type DeviceUsedData = {
  name: string;
  percentage: number;
  amount: number;
};

export type CampaignVisitorsData = {
  total_visitors: number;
  performance: number;
  chart: ChartDataPoint[];
};

export type CostsPerInteractionData = {
  avg_cost: number;
  growth: number;
  chart: {
    name: string;
    data: ChartDataPoint[];
  }[];
};
