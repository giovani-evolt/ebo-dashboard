"use client";

import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  const handleImportClick = () => {
    router.push("/settlements/new");
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gray-2 dark:bg-gray-dark">
          <svg
            className="size-10 text-gray-5 dark:text-gray-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-2xl font-semibold text-dark dark:text-white">
          No Financial Data Available
        </h3>
        
        <p className="mb-6 text-body text-gray-5 dark:text-gray-4">
          Get started by importing your first settlement to view financial insights
        </p>

        <button
          onClick={handleImportClick}
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
          Import Settlement
        </button>
      </div>
    </div>
  );
}
