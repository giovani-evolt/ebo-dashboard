"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function ConfirmEmailTokenPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const confirmEmail = async () => {
      const token = params?.token as string;

      if (!token) {
        setStatus("error");
        setMessage("Token no válido");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        // Llamar al backend para confirmar el email
        await apiClient.post(`/user/confirm/${token}`);

        setStatus("success");
        setMessage("Correo electrónico confirmado exitosamente. Redirigiendo al login...");
        
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        
        // Manejar diferentes tipos de errores
        if (error.statusCode === 400) {
          setMessage(error.message || "Token inválido o expirado");
        } else if (error.statusCode === 404) {
          setMessage("Token no encontrado");
        } else if (error.statusCode >= 500) {
          setMessage("Error del servidor. Por favor intenta nuevamente más tarde");
        } else {
          setMessage(error.message || "Error al confirmar el correo electrónico");
        }

        // Redirigir a login después de 3 segundos en caso de error
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    confirmEmail();
  }, [params, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Confirmando correo electrónico...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor espera mientras verificamos tu correo.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
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
              <h2 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
                ¡Confirmación exitosa!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">
                Error de confirmación
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
                Serás redirigido al login en unos segundos...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
