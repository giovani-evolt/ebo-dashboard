/**
 * Type Check File
 * This file verifies that all registration types are properly exported and can be imported.
 * It should not be included in the production build.
 */

// Test importing from consolidated module
import type {
  RegistrationFormData,
  RegistrationFormErrors,
  RegistrationFormState,
  TouchedFields,
  ValidFields,
  RegistrationData,
  RegistrationStep,
  RegisterUserData,
  CreateSellerData,
  Seller,
  User,
  AuthResponse,
} from './registration.types';

// Test importing from source modules
import type {
  RegistrationFormData as FormData1,
  RegistrationFormErrors as FormErrors1,
  TouchedFields as Touched1,
  ValidFields as Valid1,
} from '@/app/lib/definitions';

import type {
  RegistrationData as RegData1,
  RegistrationStep as RegStep1,
} from '@/contexts/auth-context';

import type {
  RegisterUserData as UserData1,
  CreateSellerData as SellerData1,
  Seller as Seller1,
  User as User1,
  AuthResponse as AuthResp1,
} from '@/services/auth.service';

// Type assertions to verify types are correctly defined
const formData: RegistrationFormData = {
  email: 'test@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  firstName: 'John',
  lastName: 'Doe',
  sellerName: 'My Seller',
};

const formErrors: RegistrationFormErrors = {
  email: 'Invalid email',
  password: 'Password too weak',
  general: 'An error occurred',
};

const touchedFields: TouchedFields = {
  email: true,
  password: true,
};

const validFields: ValidFields = {
  email: true,
  password: false,
};

const registrationData: RegistrationData = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'John',
  lastName: 'Doe',
  sellerName: 'My Seller',
};

const registrationStep: RegistrationStep = 'creating-user';

const registerUserData: RegisterUserData = {
  email: 'test@example.com',
  password: 'Password123',
  firstName: 'John',
  lastName: 'Doe',
};

const createSellerData: CreateSellerData = {
  name: 'My Seller',
};

const seller: Seller = {
  id: '123',
  name: 'My Seller',
  userId: '456',
  createdAt: '2024-01-01T00:00:00Z',
};

const user: User = {
  id: '456',
  email: 'test@example.com',
  name: 'John',
  lastName: 'Doe',
  seller: 'seller/id'
};

const authResponse: AuthResponse = {
  token: 'jwt-token',
  refreshToken: 'refresh-token',
};

// Verify all types compile correctly
export type TypeCheckPassed = true;
