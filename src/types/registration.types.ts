/**
 * Registration Types
 * Centralized type definitions for the user and seller registration feature
 * 
 * This module re-exports all types related to registration from their source modules
 * to provide a single import point for registration-related types.
 */

// Form data types
export type {
  RegistrationFormData,
  RegistrationFormErrors,
  RegistrationFormState,
  TouchedFields,
  ValidFields,
} from '@/app/lib/definitions';

// Registration flow types
export type {
  RegistrationData,
  RegistrationStep,
} from '@/contexts/auth-context';

// API data types
export type {
  RegisterUserData,
  CreateSellerData,
  Seller,
  User,
  AuthResponse,
} from '@/services/auth.service';
