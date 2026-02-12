import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirmar correo electrónico",
};

export default function ConfirmEmailPage() {
  return (
    <>
      <Breadcrumb pageName="Confirmar correo electrónico" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-wrap items-center">
          <div className="w-full xl:w-1/2">
            <div className="w-full p-4 sm:p-12.5 xl:p-15">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <svg
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-title-xl2">
                  Confirma tu correo electrónico
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Hemos enviado un enlace de confirmación a tu correo electrónico.
                  Por favor, revisa tu bandeja de entrada y haz clic en el enlace para
                  activar tu cuenta.
                </p>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-500">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden w-full p-7.5 xl:block xl:w-1/2">
            <div className="custom-gradient-1 overflow-hidden rounded-2xl px-12.5 pt-12.5 dark:!bg-dark-2 dark:bg-none">
              <Link className="mb-10 inline-block" href="/">
                <Image
                  src={"/images/logo/evolt-logo.webp"}
                  alt="Evolt Logo"
                  width={176}
                  height={32}
                />
              </Link>
              <p className="mb-3 text-xl font-medium text-dark dark:text-white">
                Verifica tu cuenta
              </p>

              <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                ¡Estás a un paso!
              </h1>

              <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
                Confirma tu correo electrónico para completar el registro y comenzar
                a usar nuestra plataforma.
              </p>

              <div className="mt-31">
                <Image
                  src={"/images/grids/grid-02.svg"}
                  alt="Logo"
                  width={405}
                  height={325}
                  className="mx-auto dark:opacity-30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
