"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataGrid, ColumnDef } from "@/components/Tables/data-grid";
import { UnitSold } from "@/types/unit-sold.types";

/**
 * Column definitions for units sold table
 */
const unitsSoldColumns: ColumnDef<UnitSold>[] = [
  {
    key: "sku",
    header: "Sku",
    width: "250px",
    render: (value, row) => (
      <div>
        <h5 className="text-dark dark:text-white">{value || "-"}</h5>
        {row.productId && (
          <p className="mt-[3px] text-body-sm font-medium text-gray-5">
            ID: {row.productId}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "quantityPurchased",
    header: "Qty Purchased",
    render: (value) => (
      <p className="text-dark dark:text-white">
        {value !== undefined && value !== null ? value : "-"}
      </p>
    ),
  },
  {
    key: "totalAmount",
    header: "Total Amount",
    render: (value, row) => {
      if (value === undefined || value === null) return "-";
      const currency = row.currency || "USD";
      return (
        <p className="text-dark dark:text-white">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
          }).format(value)}
        </p>
      );
    },
  },
  {
    key: "month",
    header: "Month",
    render: (value) => {
      return (
        <div>
          <p className="text-dark dark:text-white">
            { value }
          </p>
        </div>
      );
    },
  },
  {
    key: "year",
    header: "Year",
    render: (value) => {
      return (
        <div>
          <p className="text-dark dark:text-white">
            { value }
          </p>
        </div>
      );
    },
  }
];

/**
 * Units Sold List Page
 * Displays a list of all units sold in a data grid
 */
export default function UnitsSoldListPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Units Sold" />

      <DataGrid<UnitSold>
        endpoint="/units_solds"
        title="Units Sold"
        columns={unitsSoldColumns}
      />
    </div>
  );
}
