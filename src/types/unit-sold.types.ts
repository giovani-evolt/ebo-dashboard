/**
 * Unit Sold Types
 * Type definitions for units sold data from the API
 */

export interface UnitSold {
  id: string | number;
  productId?: string;
  productName?: string;
  quantity: number;
  price: number;
  currency?: string;
  date: string;
  orderId?: string;
  // Allow additional fields from API response
  [key: string]: any;
}
