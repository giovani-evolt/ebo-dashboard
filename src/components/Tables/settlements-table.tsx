"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import dayjs from "dayjs";
import { TrashIcon } from "@/assets/icons";
import { DownloadIcon, PreviewIcon } from "../Tables/icons";

interface Settlement {
  "@id": string;
  "@type": string;
  code: string;
  filename: string;
  created_at: string;
  status: number;
  type: number;
}

interface SettlementsResponse {
  "@context": string;
  "@id": string;
  "@type": string;
  totalItems: number;
  member: Settlement[];
}

function getSettlementStatus(status: number){
  let label = '';
  switch(status){
      case 1000: label = 'Pending'; break;
      case 2000: label = 'Processing'; break;
      case 3000: label = 'Done'; break;
  }

  return label;
}

export function SettlementsTable() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    settlement: Settlement | null;
  }>({ isOpen: false, settlement: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSettlements = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<SettlementsResponse>("/api/csvs");
      setSettlements(response.member || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch settlements:", err);
      setError("Failed to load settlements");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleDeleteClick = (settlement: Settlement) => {
    setDeleteDialog({ isOpen: true, settlement });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.settlement) return;

    try {
      setIsDeleting(true);
      // Extract ID from @id (e.g., "/api/csvs/1" -> "1")
      const id = deleteDialog.settlement["@id"].split("/").pop();

      console.log(deleteDialog.settlement);

      await apiClient.delete(deleteDialog.settlement["@id"]);
      
      // Close dialog
      setDeleteDialog({ isOpen: false, settlement: null });
      
      // Refresh the list
      await fetchSettlements();
    } catch (err) {
      console.error("Failed to delete settlement:", err);
      setError("Failed to delete settlement. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteDialog({ isOpen: false, settlement: null });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex items-center justify-center py-10">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="py-10 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="py-10 text-center text-gray-5 dark:text-gray-4">
          No settlements found. Upload your first settlement to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] dark:bg-dark-2 [&>th]:py-4 [&>th]:text-base [&>th]:text-dark [&>th]:dark:text-white">
            <TableHead className="min-w-[200px] xl:pl-7.5">File Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {settlements.map((settlement) => (
            <TableRow key={settlement.code} className="border-[#eee] dark:border-dark-3">
              <TableCell className="min-w-[200px] xl:pl-7.5">
                <h5 className="text-dark dark:text-white">{settlement.filename}</h5>
                <p className="mt-[3px] text-body-sm font-medium text-gray-5">
                  Code: {settlement.code}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-dark dark:text-white">
                  {dayjs(settlement.created_at).format("MMM DD, YYYY")}
                </p>
                <p className="mt-[3px] text-body-sm text-gray-5">
                  {dayjs(settlement.created_at).format("HH:mm")}
                </p>
              </TableCell>

              <TableCell>
                <div className="max-w-fit rounded-full bg-[#219653]/[0.08] px-3.5 py-1 text-sm font-medium text-[#219653]">
                  {getSettlementStatus(settlement.status)}
                </div>
              </TableCell>

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button className="hover:text-primary">
                    <span className="sr-only">View Settlement</span>
                    <PreviewIcon />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(settlement)}
                    className="hover:text-red-600"
                  >
                    <span className="sr-only">Delete Settlement</span>
                    <TrashIcon />
                  </button>

                  <button className="hover:text-primary">
                    <span className="sr-only">Download Settlement</span>
                    <DownloadIcon />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Settlement"
        message={`Are you sure you want to delete "${deleteDialog.settlement?.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}
