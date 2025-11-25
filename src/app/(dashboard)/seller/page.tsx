"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { SellerInfoForm } from "./_components/seller-info";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <SellerInfoForm />
          </div>
          {/* <div className="col-span-5 xl:col-span-2">
            <UploadPhotoForm />
          </div> */}
        </div>
      </div>
    </ProtectedRoute>
  );
}

