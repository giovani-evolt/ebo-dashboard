"use client";

import { EmailIcon, UserIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerData {
  id: string;
  name: string;
  legalName?: string;
  rfc?: string;
  createdAt: string;
}

interface FormData {
  name: string;
  legalName: string;
  rfc: string;
}

export function SellerInfoForm() {
  const { user } = useAuth();
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rfcError, setRfcError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    legalName: "",
    rfc: "",
  });

  // RFC validation regexp: ^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$
  const RFC_REGEXP = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;

  const validateRFC = (rfc: string): boolean => {
    if (!rfc) {
      setRfcError(null);
      return false;
    }
    
    const isValid = RFC_REGEXP.test(rfc);
    if (!isValid) {
      setRfcError("El RFC debe tener el formato: 3 letras mayúsculas, 6 dígitos y 3 caracteres alfanuméricos (ej: ABC123456XYZ)");
    } else {
      setRfcError(null);
    }
    
    return isValid;
  };

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!user?.seller) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.get<SellerData>(user.seller);
        setSellerData(data);
        // Initialize form data with fetched data
        setFormData({
          name: data.name || "",
          legalName: data.legalName || "",
          rfc: data.rfc || "",
        });
      } catch (err: any) {
        console.error("Error fetching seller data:", err);
        setError(err.message || "Error al cargar información del seller");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [user?.seller]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert RFC to uppercase
    const processedValue = name === "rfc" ? value.toUpperCase() : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    
    // Validate RFC in real-time
    if (name === "rfc") {
      if (processedValue.length > 0) {
        validateRFC(processedValue);
      } else {
        setRfcError(null);
      }
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleRfcBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      validateRFC(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    // Validate RFC before submitting
    if (!validateRFC(formData.rfc)) {
      setIsSaving(false);
      return;
    }
    
    setIsSaving(true);

    try {
      // Build user URI - assuming format is /users/{id}
      const userUri = `/users/${user?.id}`;

      // Prepare payload
      const payload = {
        name: formData.name,
        legalName: formData.legalName,
        rfc: formData.rfc,
        users: [userUri],
      };

      await apiClient.post("/sellers", payload);
      
      setSuccessMessage("Información guardada exitosamente");
      
      // Refresh seller data
      if (user?.seller) {
        const updatedData = await apiClient.get<SellerData>(user.seller);
        setSellerData(updatedData);
      }
    } catch (err: any) {
      console.error("Error saving seller data:", err);
      setError(err.message || "Error al guardar la información");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ShowcaseSection title="Seller Information" className="!p-7">
      {isLoading ? (
        <div className="space-y-5.5">
          <div className="flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="w-full sm:w-1/2">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-5.5 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5.5 rounded-lg bg-green-50 p-4 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <InputGroup
              className="w-full sm:w-1/2"
              type="text"
              name="name"
              label="Name"
              placeholder="Name"
              value={formData.name}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              handleChange={handleInputChange}
              maxLength={255}
              required
            />

            <InputGroup
              className="w-full sm:w-1/2"
              type="text"
              name="createdAt"
              label="Created At"
              placeholder="Creation Date"
              value={sellerData?.createdAt ? formatDate(sellerData.createdAt) : ""}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              disabled
            />
          </div>

          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <InputGroup
              className="w-full sm:w-1/2"
              type="text"
              name="legalName"
              label="Legal Name"
              placeholder="Legal Name"
              value={formData.legalName}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              handleChange={handleInputChange}
              maxLength={255}
              required
            />

            <div className="w-full sm:w-1/2">
              <InputGroup
                type="text"
                name="rfc"
                label="RFC"
                placeholder="RFC (ej: ABC123456XYZ)"
                value={formData.rfc}
                icon={<UserIcon />}
                iconPosition="left"
                height="sm"
                handleChange={handleInputChange}
                handleBlur={handleRfcBlur}
                required
                isInvalid={!!rfcError}
                isValid={formData.rfc.length > 0 && !rfcError}
              />
              {rfcError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {rfcError}
                </p>
              )}
            </div>
          </div>

          <InputGroup
            className="mb-5.5"
            type="email"
            name="email"
            label="Email Address"
            placeholder="user@gmail.com"
            value={user?.email || ""}
            icon={<EmailIcon />}
            iconPosition="left"
            height="sm"
            disabled
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </ShowcaseSection>
  );
}
