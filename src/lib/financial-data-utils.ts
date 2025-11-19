import { FinancialData, ChartDataPoint } from "@/types/charts.types";

/**
 * Type representing the financial data for the last month
 */
export type LastMonthFinancialData = {
  gross: number;
  taxes: number;
  frsh: number;
  disc: number;
};

/**
 * Validates if the provided data has the correct FinancialData structure
 * @param data - The data to validate
 * @returns true if the data structure is valid, false otherwise
 */
export function isValidFinancialData(data: any): data is FinancialData {
  if (!data || typeof data !== "object") {
    console.error("Financial data validation failed: data is not an object", data);
    return false;
  }

  const requiredFields = ["gross", "taxes", "frsh", "disc"];
  
  for (const field of requiredFields) {
    if (!Array.isArray(data[field])) {
      console.error(`Financial data validation failed: field "${field}" is not an array`, data[field]);
      return false;
    }
    
    // Validate each data point in the array
    for (const point of data[field]) {
      if (!isValidChartDataPoint(point)) {
        console.error(`Financial data validation failed: invalid data point in "${field}"`, point);
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates if a data point has the correct ChartDataPoint structure
 * @param point - The data point to validate
 * @returns true if the data point is valid, false otherwise
 */
function isValidChartDataPoint(point: any): point is ChartDataPoint {
  if (!point || typeof point !== "object") {
    return false;
  }

  const hasValidX = typeof point.x === "string" || typeof point.x === "number";
  const hasValidY = typeof point.y === "number";

  return hasValidX && hasValidY;
}

/**
 * Extracts the last month's financial data values from FinancialData
 * @param data - The complete financial data containing all months
 * @returns An object with the last month values for each financial metric
 * @throws Error if the data structure is invalid or empty
 */
export function extractLastMonthData(
  data: FinancialData
): LastMonthFinancialData {
  // Validate the data structure
  if (!isValidFinancialData(data)) {
    console.error("Failed to extract last month data: invalid data structure", data);
    throw new Error("Invalid financial data structure");
  }

  // Check if all arrays have at least one element
  if (
    data.gross.length === 0 ||
    data.taxes.length === 0 ||
    data.frsh.length === 0 ||
    data.disc.length === 0
  ) {
    const emptyFields = [];
    if (data.gross.length === 0) emptyFields.push("gross");
    if (data.taxes.length === 0) emptyFields.push("taxes");
    if (data.frsh.length === 0) emptyFields.push("frsh");
    if (data.disc.length === 0) emptyFields.push("disc");
    
    console.error(`Failed to extract last month data: empty arrays for fields: ${emptyFields.join(", ")}`);
    throw new Error("Financial data arrays cannot be empty");
  }

  // Extract the last element from each array
  const lastGross = data.gross[data.gross.length - 1];
  const lastTaxes = data.taxes[data.taxes.length - 1];
  const lastFrsh = data.frsh[data.frsh.length - 1];
  const lastDisc = data.disc[data.disc.length - 1];

  console.debug("Successfully extracted last month data:", {
    gross: lastGross.y,
    taxes: lastTaxes.y,
    frsh: lastFrsh.y,
    disc: lastDisc.y,
  });

  return {
    gross: lastGross.y,
    taxes: lastTaxes.y,
    frsh: lastFrsh.y,
    disc: lastDisc.y,
  };
}

/**
 * Safely extracts the last month's financial data with fallback values
 * @param data - The complete financial data containing all months
 * @returns An object with the last month values or zeros if data is invalid/empty
 */
export function extractLastMonthDataSafe(
  data: FinancialData | null | undefined
): LastMonthFinancialData {
  const fallbackData: LastMonthFinancialData = {
    gross: 0,
    taxes: 0,
    frsh: 0,
    disc: 0,
  };

  if (!data) {
    console.warn("extractLastMonthDataSafe: No data provided, returning fallback values");
    return fallbackData;
  }

  try {
    return extractLastMonthData(data);
  } catch (error) {
    console.error("Error extracting last month data, returning fallback values:", error);
    return fallbackData;
  }
}
