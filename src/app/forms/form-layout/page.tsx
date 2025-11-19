"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { ContactForm } from "./_components/contact-form";
import { SignInForm } from "./_components/sign-in-form";
import { SignUpForm } from "./_components/sign-up-form";

export default function Page() {
  return (
    <ProtectedRoute>
      <Breadcrumb pageName="Form Layout" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-9">
          <SignInForm />

          <SignUpForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
