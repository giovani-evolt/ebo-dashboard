"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { SettlementsTable } from "@/components/Tables/settlements-table";
import Link from "next/link";

export default function SettlementsPage() {
  return (
    <>
      <Breadcrumb pageName="Settlements" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Your Settlements
          </h2>
          <p className="mt-1 text-body text-gray-5 dark:text-gray-4">
            View and manage all your uploaded settlement files
          </p>
        </div>
        
        <Link
          href="/settlements/csvs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Settlement
        </Link>
      </div>

      <SettlementsTable />
    </>
  );
}
