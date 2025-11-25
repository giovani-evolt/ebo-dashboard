/**
 * Settlement Types
 * Type definitions for settlement data from the API
 */

export interface Settlement {
  id: string | number;
  settlementId?: string;
  date: string;
  amount: number;
  currency?: string;
  status?: string;
  period?: string;
  // Allow additional fields from API response
  [key: string]: any;
}
