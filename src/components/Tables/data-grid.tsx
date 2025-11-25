"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Column definition for DataGrid
 */
export interface ColumnDef<T> {
  /** Key of the field in the data object */
  key: keyof T;
  /** Header text for the column */
  header: string;
  /** Optional custom render function */
  render?: (value: any, row: T) => React.ReactNode;
  /** Optional column width */
  width?: string;
}

/**
 * DataGrid component props
 */
export interface DataGridProps<T> {
  /** API endpoint to fetch data from */
  endpoint: string;
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Title for the table */
  title: string;
  /** Optional function to transform API response data */
  transformData?: (data: any) => T[];
}

/**
 * Component state type
 */
type DataGridState<T> =
  | { status: "loading" }
  | { status: "error"; message: string; statusCode: number }
  | { status: "success"; data: T[] };

/**
 * Error messages for different status codes
 */
const ERROR_MESSAGES: Record<number, string> = {
  401: "Sesión expirada. Por favor inicia sesión nuevamente.",
  403: "No tienes permisos para acceder a esta información.",
  404: "No se encontraron datos.",
  500: "Error del servidor. Por favor intenta nuevamente más tarde.",
  0: "Error de conexión. Por favor verifica tu conexión a internet.",
};

/**
 * Reusable DataGrid component for displaying tabular data
 */
export function DataGrid<T extends Record<string, any>>({
  endpoint,
  columns,
  title,
  transformData,
}: DataGridProps<T>) {
  const [state, setState] = useState<DataGridState<T>>({ status: "loading" });

  const fetchData = async () => {
    try {
      setState({ status: "loading" });
      const response = await apiClient.get<any>(endpoint);

      // Transform data if transformer provided, otherwise use response directly
      let data: T[];
      if (transformData) {
        data = transformData(response);
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response.member && Array.isArray(response.member)) {
        // Handle JSON-LD format
        data = response.member;
      } else if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else {
        data = [];
      }

      setState({ status: "success", data });
    } catch (err: any) {
      const error = err as ApiError;
      const statusCode = error.statusCode || 0;
      const message =
        ERROR_MESSAGES[statusCode] || error.message || ERROR_MESSAGES[0];

      setState({ status: "error", message, statusCode });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const renderContent = () => {
    if (state.status === "loading") {
      return <LoadingState columns={columns} />;
    }

    if (state.status === "error") {
      return (
        <ErrorState
          message={state.message}
          onRetry={fetchData}
        />
      );
    }

    if (state.data.length === 0) {
      return <EmptyState />;
    }

    return <DataTable columns={columns} data={state.data} />;
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      {renderContent()}
    </div>
  );
}

/**
 * Loading state with skeleton rows
 */
function LoadingState<T>({ columns }: { columns: ColumnDef<T>[] }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="h-12 px-4 text-left align-middle font-medium text-neutral-500 dark:text-neutral-400"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[#eee] dark:border-dark-3"
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="p-4 align-middle">
                  <Skeleton className="h-5 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Error state with retry button
 */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <p className="mb-4 text-center text-red-600 dark:text-red-400">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="rounded-md bg-primary px-6 py-2.5 text-white hover:bg-opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}

/**
 * Empty state when no data is available
 */
function EmptyState() {
  return (
    <div className="py-10 text-center text-gray-5 dark:text-gray-4">
      No se encontraron datos.
    </div>
  );
}

/**
 * Data table rendering
 */
function DataTable<T extends Record<string, any>>({
  columns,
  data,
}: {
  columns: ColumnDef<T>[];
  data: T[];
}) {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-[#eee] dark:border-dark-3"
            >
              {columns.map((column) => {
                const value = row[column.key];
                const content = column.render
                  ? column.render(value, row)
                  : value;

                return (
                  <TableCell key={String(column.key)}>
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
