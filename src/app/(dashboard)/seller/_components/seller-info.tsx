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
  createdAt: string;
}

export function SellerInfoForm() {
  const { user } = useAuth();
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    console.log(user);

    const fetchSellerData = async () => {
      if (!user?.seller) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.get<SellerData>(user.seller);
        console.log(data)
        setSellerData(data);
      } catch (err: any) {
        console.error("Error fetching seller data:", err);
        setError(err.message || "Error al cargar información del seller");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [user?.seller]);

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
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div>
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <InputGroup
              className="w-full sm:w-1/2"
              type="text"
              name="sellerName"
              label="Seller Name"
              placeholder="Seller Name"
              value={sellerData?.name || ""}
              icon={<UserIcon />}
              iconPosition="left"
              height="sm"
              disabled
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
        </div>
      )}
    </ShowcaseSection>
  );
}
