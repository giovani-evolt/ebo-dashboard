"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function NewSettlementPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    total: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Validar que todos los archivos sean CSV o TXT
    const invalidFiles = selectedFiles.filter(
      file => 
        file.type !== "text/csv" && 
        file.type !== "text/plain" &&
        !file.name.endsWith(".csv") && 
        !file.name.endsWith(".txt")
    );

    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length} archivo(s) no son CSV o TXT válidos`);
      setFiles([]);
      return;
    }

    setFiles(selectedFiles);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setError("Por favor selecciona al menos un archivo para subir");
      return;
    }

    setIsUploading(true);
    setError(null);

    let successful = 0;
    let failed = 0;

    try {
      // Subir cada archivo individualmente
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "1000");

          await apiClient.post("/csvs", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          successful++;
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failed++;
        }
      }

      setUploadResults({
        successful,
        failed,
        total: files.length,
      });

      setSuccess(true);
      setFiles([]);
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      if (failed > 0) {
        setError(`${failed} de ${files.length} archivo(s) no se pudieron subir`);
      }
    } catch (err) {
      console.error("Failed to upload settlements:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al subir los archivos. Por favor intenta de nuevo."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadAnother = () => {
    setSuccess(false);
    setFiles([]);
    setError(null);
    setUploadResults(null);
  };

  const handleGoToSettlements = () => {
    router.push("/csvs");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark dark:text-white">
          Importar Nuevos Settlements
        </h1>
        <p className="mt-2 text-body text-gray-5 dark:text-gray-4">
          Sube uno o varios archivos CSV o TXT con tus datos de settlements
        </p>
      </div>

      {success ? (
        <div className="rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="size-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
              {uploadResults && uploadResults.successful > 0
                ? `${uploadResults.successful} Archivo(s) Subido(s) Exitosamente`
                : "Archivos Procesados"}
            </h3>
            
            <p className="mb-6 text-body text-gray-5 dark:text-gray-4">
              {uploadResults && uploadResults.failed > 0
                ? `${uploadResults.successful} de ${uploadResults.total} archivos se subieron correctamente`
                : "Tus archivos han sido procesados y están disponibles"}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleLoadAnother}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-stroke px-6 py-3 font-medium text-dark transition hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
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
                Cargar Más Archivos
              </button>

              <button
                onClick={handleGoToSettlements}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
              >
                Ver Todos los Archivos
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="file-upload"
                className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
              >
                Archivos CSV o TXT (límite: 100Mb por archivo)
              </label>

              <div className="relative">
                <input
                  id="file-upload"
                  multiple
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full cursor-pointer rounded-[7px] border border-stroke bg-transparent px-5 py-3 outline-none transition file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-5 dark:text-gray-4">
                    {files.length} archivo(s) seleccionado(s):
                  </p>
                  <div className="max-h-40 overflow-y-auto rounded-md border border-stroke p-3 dark:border-dark-3">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1 text-sm"
                      >
                        <span className="truncate text-dark dark:text-white">
                          {file.name}
                        </span>
                        <span className="ml-2 text-gray-5 dark:text-gray-4">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex">
                  <svg
                    className="size-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="ml-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isUploading}
                className="flex-1 rounded-md border border-stroke px-6 py-3 font-medium text-dark transition hover:bg-gray-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={files.length === 0 || isUploading}
                className="flex-1 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="size-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subiendo {files.length} archivo(s)...
                  </span>
                ) : (
                  `Subir ${files.length > 0 ? files.length : ""} Archivo(s)`
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
