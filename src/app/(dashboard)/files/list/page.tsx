"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataGrid, ColumnDef } from "@/components/Tables/data-grid";
import { Settlement } from "@/types/settlement.types";

/**
 * Column definitions for settlements table
 */
const settlementColumns: ColumnDef<Settlement>[] = [
  {
    key: "settlementId",
    header: "Settlement ID",
    width: "200px",
    render: (value, row) => (
      <div>
        <h5 className="text-dark dark:text-white">{value || row.id}</h5>
        {row.code && (
          <p className="mt-[3px] text-body-sm font-medium text-gray-5">
            Code: {row.code}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "depositDate",
    header: "Deposit Date",
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return (
        <div>
          <p className="text-dark dark:text-white">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      );
    },
  },
  {
    key: "startDate",
    header: "Start Date",
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return (
        <div>
          <p className="text-dark dark:text-white">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      );
    },
  },
  {
    key: "endDate",
    header: "End Date",
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return (
        <div>
          <p className="text-dark dark:text-white">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      );
    },
  },
  {
    key: "totalAmount",
    header: "Amount",
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
  }
];

/**
 * Settlements List Page
 * Displays a list of all settlements in a data grid
 */
export default function SettlementsListPage() {
  return (
      <div className="space-y-6">
        <Breadcrumb pageName="Settlements" />

        <DataGrid<Settlement>
          endpoint="/api/settlements"
          title="Settlements"
          columns={settlementColumns}
        />
      </div>
  );
}
