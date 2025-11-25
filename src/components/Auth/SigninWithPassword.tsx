"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useAuth } from "@/contexts/auth-context";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";

// Zod validation schema for login form
const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { message: "Password is required" }).trim(),
});

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function SigninWithPassword() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setData({
      ...data,
      [name]: value,
    });

    // Clear field-specific error when user modifies the field
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }

    // Clear general error when any field is modified
    if (errors.general) {
      setErrors({
        ...errors,
        general: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data with Zod
    const validationResult = LoginFormSchema.safeParse({
      email: data.email,
      password: data.password,
    });

    if (!validationResult.success) {
      // Extract validation errors
      const fieldErrors: FormErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      // Call login method from Auth Context
      await login({
        username: data.email,
        password: data.password,
      });

      // Redirect to dashboard on successful login
      router.push("/");
    } catch (error: any) {
      // Handle API errors
      if (error.statusCode === 401) {
        setErrors({
          general: "Invalid email or password",
        });
      } else if (error.statusCode === 0) {
        setErrors({
          general: "Unable to connect. Please check your internet connection.",
        });
      } else if (error.errors) {
        // Handle field-specific errors from API
        const apiErrors: FormErrors = {};
        Object.keys(error.errors).forEach((field) => {
          apiErrors[field as keyof FormErrors] = error.errors[field][0];
        });
        setErrors(apiErrors);
      } else {
        setErrors({
          general: error.message || "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* General error message */}
      {errors.general && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.general}
        </div>
      )}

      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />
      {errors.email && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.email}
        </p>
      )}

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />
      {errors.password && (
        <p className="-mt-4 mb-4 text-sm text-red-500 dark:text-red-400">
          {errors.password}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Remember me"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <Link
          href="/auth/forgot-password"
          className="hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign In
          {isLoading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
