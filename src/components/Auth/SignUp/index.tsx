"use client";
import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import InputGroup from "../../FormElements/InputGroup";
import {
  validateRegistrationField,
  validateConfirmPassword,
  isRegistrationFormValid,
  type RegistrationFormData,
  type RegistrationFormErrors,
  type TouchedFields,
  type ValidFields,
} from "@/app/lib/definitions";
import { useAuth } from "@/contexts/auth-context";

export default function SignUpForm() {
  // Requirement 7.1, 7.2: Connect to AuthContext for signup and loading states
  const { signup, registrationStep } = useAuth();

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    sellerName: "",
  });

  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [validFields, setValidFields] = useState<ValidFields>({});
  
  // Requirement 7.2: Track submitting state
  const isSubmitting = registrationStep !== 'idle';

  // Requirement 9.5: Disable submit button while form is invalid
  const isFormValid = useMemo(() => {
    return isRegistrationFormValid(formData);
  }, [formData]);

  // Requirement 9.1: Validate field on blur event
  const handleFieldBlur = (field: keyof RegistrationFormData) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true,
    });

    // Validate the field
    let errorMessage: string | null = null;

    if (field === "confirmPassword") {
      errorMessage = validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      );
    } else {
      errorMessage = validateRegistrationField(
        field as keyof Omit<RegistrationFormData, "confirmPassword">,
        formData[field]
      );
    }

    // Requirement 9.2: Display error message below field
    if (errorMessage) {
      setErrors({
        ...errors,
        [field]: errorMessage,
      });
      setValidFields({
        ...validFields,
        [field]: false,
      });
    } else {
      // Requirement 9.4: Show visual indicator when field is valid
      setErrors({
        ...errors,
        [field]: undefined,
      });
      setValidFields({
        ...validFields,
        [field]: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name as keyof RegistrationFormData;

    setFormData({
      ...formData,
      [field]: value,
    });

    // Requirement 9.3: Clear error when user corrects the field
    if (touchedFields[field] && errors[field]) {
      // Re-validate on change if field was already touched
      let errorMessage: string | null = null;

      if (field === "confirmPassword") {
        errorMessage = validateConfirmPassword(formData.password, value);
      } else {
        errorMessage = validateRegistrationField(
          field as keyof Omit<RegistrationFormData, "confirmPassword">,
          value
        );
      }

      if (!errorMessage) {
        setErrors({
          ...errors,
          [field]: undefined,
        });
        setValidFields({
          ...validFields,
          [field]: true,
        });
      } else {
        setErrors({
          ...errors,
          [field]: errorMessage,
        });
        setValidFields({
          ...validFields,
          [field]: false,
        });
      }
    }

    // Clear general error when any field is modified
    if (errors.general) {
      setErrors({
        ...errors,
        general: undefined,
      });
    }
  };

  // Requirement 8.4: Clear password fields after errors
  const clearPasswordFields = () => {
    setFormData({
      ...formData,
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear any previous general errors
    setErrors({
      ...errors,
      general: undefined,
    });

    try {
      // Requirement 7.1: Connect form to AuthContext signup method
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        sellerName: formData.sellerName,
      });

      // If successful, user will be redirected to dashboard by AuthContext
      // Requirement 6.1, 6.2: Redirect handled by signup method
    } catch (error: any) {
      // Requirements 3.4, 3.5, 4.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5: Handle errors appropriately
      console.error("Registration error:", error);

      // Requirement 8.4: Clear password fields for security
      clearPasswordFields();

      // Requirement 8.3: Maintain form data (except passwords)
      // Form data is preserved automatically since we only clear passwords

      // Requirement 8.1, 8.2: Display appropriate error messages for different error types
      let errorMessage = "An error occurred during registration. Please try again.";

      // Handle specific error types based on step and status code
      if (error.step === 'register') {
        // Errors from user creation step
        if (error.statusCode === 409) {
          // Requirement 3.4: Duplicate email error
          errorMessage = error.message || 'Este email ya está registrado';
        } else if (error.statusCode === 400) {
          // Requirement 3.5: Validation errors from server
          errorMessage = error.message || 'Error de validación. Por favor verifica los datos ingresados';
        } else if (error.statusCode >= 500) {
          // Requirement 8.2: Server errors
          errorMessage = error.message || 'Error del servidor. Por favor intenta nuevamente más tarde';
        } else if (error.statusCode === 0) {
          // Requirement 8.1: Network errors
          errorMessage = error.message || 'Error de conexión. Por favor verifica tu conexión a internet';
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.step === 'seller') {
        // Requirement 5.5: Errors from seller creation step
        // User is already authenticated, so they can retry or continue
        if (error.statusCode === 401) {
          errorMessage = error.message || 'Sesión inválida. Por favor inicia sesión nuevamente';
        } else if (error.statusCode === 400) {
          errorMessage = error.message || 'Error al crear seller. Por favor verifica el nombre del seller';
        } else if (error.statusCode >= 500) {
          errorMessage = error.message || 'Error al crear seller. Por favor intenta nuevamente más tarde';
        } else if (error.statusCode === 0) {
          errorMessage = error.message || 'Error de conexión. Por favor verifica tu conexión a internet';
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        // Generic error with message
        errorMessage = error.message;
      }

      // Set general error for display
      setErrors({
        ...errors,
        general: errorMessage,
      });

      // Requirement 8.5: Allow user to retry
      // Form remains accessible for retry
    }
  };

  // Requirement 7.3: Get progress message based on registration step
  const getProgressMessage = () => {
    switch (registrationStep) {
      case 'creating-user':
        return 'Creando tu cuenta...';
      case 'logging-in':
        return 'Iniciando sesión...';
      case 'creating-seller':
        return 'Creando tu seller...';
      case 'complete':
        return 'Redirigiendo al dashboard...';
      default:
        return null;
    }
  };

  const progressMessage = getProgressMessage();

  return (
    <form onSubmit={handleSubmit}>
      {/* Requirement 7.3: Show progress indicators for each registration step */}
      {isSubmitting && progressMessage && (
        <div className="mb-4 rounded-lg bg-blue-100 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-700 border-t-transparent dark:border-blue-400 dark:border-t-transparent" />
            <span>{progressMessage}</span>
          </div>
        </div>
      )}

      {/* General error message */}
      {errors.general && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.general}
        </div>
      )}

      {/* Email Field */}
      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("email")}
        value={formData.email}
        icon={<EmailIcon />}
        isValid={validFields.email}
        isInvalid={touchedFields.email && !!errors.email}
        required
      />
      {/* Requirement 9.2: Display inline error message below field */}
      {touchedFields.email && errors.email && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.email}
        </p>
      )}

      {/* Password Field */}
      <InputGroup
        type="password"
        label="Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("password")}
        value={formData.password}
        icon={<PasswordIcon />}
        isValid={validFields.password}
        isInvalid={touchedFields.password && !!errors.password}
        required
      />
      {touchedFields.password && errors.password && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.password}
        </p>
      )}

      {/* Confirm Password Field */}
      <InputGroup
        type="password"
        label="Confirm Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Confirm your password"
        name="confirmPassword"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("confirmPassword")}
        value={formData.confirmPassword}
        icon={<PasswordIcon />}
        isValid={validFields.confirmPassword}
        isInvalid={touchedFields.confirmPassword && !!errors.confirmPassword}
        required
      />
      {touchedFields.confirmPassword && errors.confirmPassword && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.confirmPassword}
        </p>
      )}

      {/* First Name Field */}
      <InputGroup
        type="text"
        label="First Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your first name"
        name="firstName"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("firstName")}
        value={formData.firstName}
        icon={<UserIcon />}
        isValid={validFields.firstName}
        isInvalid={touchedFields.firstName && !!errors.firstName}
        required
      />
      {touchedFields.firstName && errors.firstName && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.firstName}
        </p>
      )}

      {/* Last Name Field */}
      <InputGroup
        type="text"
        label="Last Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your last name"
        name="lastName"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("lastName")}
        value={formData.lastName}
        icon={<UserIcon />}
        isValid={validFields.lastName}
        isInvalid={touchedFields.lastName && !!errors.lastName}
        required
      />
      {touchedFields.lastName && errors.lastName && (
        <p className="-mt-3 mb-3 text-sm text-red-500 dark:text-red-400">
          {errors.lastName}
        </p>
      )}

      {/* Seller Name Field */}
      <InputGroup
        type="text"
        label="Seller Name"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your seller name"
        name="sellerName"
        handleChange={handleChange}
        handleBlur={() => handleFieldBlur("sellerName")}
        value={formData.sellerName}
        icon={<UserIcon />}
        isValid={validFields.sellerName}
        isInvalid={touchedFields.sellerName && !!errors.sellerName}
        required
      />
      {touchedFields.sellerName && errors.sellerName && (
        <p className="-mt-4 mb-4 text-sm text-red-500 dark:text-red-400">
          {errors.sellerName}
        </p>
      )}

      {/* Submit Button */}
      {/* Requirement 7.2, 9.5: Disable submit button while form is invalid or submitting */}
      <div className="mb-4.5">
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
          {/* Requirement 7.1: Show loading indicator during submission */}
          {isSubmitting && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
          )}
        </button>
      </div>

      {/* Link to Login */}
      <div className="mt-6 text-center">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
