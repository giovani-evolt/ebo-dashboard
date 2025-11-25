# Registration Types Documentation

This document provides an overview of all TypeScript interfaces and types used in the user and seller registration feature.

## Overview

The registration feature uses a comprehensive type system to ensure type safety throughout the registration flow. Types are organized across multiple modules based on their purpose:

- **Form Types** (`src/app/lib/definitions.ts`): Types related to form data and validation
- **Flow Types** (`src/contexts/auth-context.tsx`): Types for orchestrating the registration flow
- **API Types** (`src/services/auth.service.ts`): Types for API requests and responses
- **Consolidated Exports** (`src/types/registration.types.ts`): Re-exports all types for convenient importing

## Form Types

### RegistrationFormData

Contains all fields required for the registration form.

```typescript
interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  sellerName: string;
}
```

**Requirements:** 1.1, 2.1

**Usage:** Used by the SignUpForm component to manage form state.

### RegistrationFormErrors

Contains validation error messages for each form field.

```typescript
interface RegistrationFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  sellerName?: string;
  general?: string;
}
```

**Requirements:** 1.6, 8.1, 8.2

**Usage:** Used to display validation errors to users.

### TouchedFields

Tracks which form fields have been interacted with (blurred).

```typescript
type TouchedFields = {
  [K in keyof RegistrationFormData]?: boolean;
}
```

**Requirements:** 9.1

**Usage:** Determines when to show validation errors (only after field is touched).

### ValidFields

Tracks which form fields have passed validation.

```typescript
type ValidFields = {
  [K in keyof RegistrationFormData]?: boolean;
}
```

**Requirements:** 9.4

**Usage:** Shows visual indicators for valid fields.

## Flow Types

### RegistrationData

Data passed to the signup() method to initiate registration.

```typescript
interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  sellerName: string;
}
```

**Requirements:** 3.2, 5.3

**Usage:** Used by AuthContext.signup() to orchestrate the registration flow.

**Note:** This is similar to RegistrationFormData but excludes `confirmPassword` since it's only needed for client-side validation.

### RegistrationStep

Tracks the current step in the multi-stage registration process.

```typescript
type RegistrationStep = 
  | 'idle'
  | 'creating-user'
  | 'logging-in'
  | 'creating-seller'
  | 'complete';
```

**Requirements:** 7.3

**Usage:** Used to display progress indicators during registration.

**Steps:**
- `idle`: No registration in progress
- `creating-user`: Creating user account (Requirement 3.1)
- `logging-in`: Auto-login in progress (Requirement 4.1)
- `creating-seller`: Creating seller (Requirement 5.1)
- `complete`: Registration complete, ready to redirect (Requirement 6.1)

## API Types

### RegisterUserData

Data sent to the API to create a new user account.

```typescript
interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

**Requirements:** 3.1, 3.2

**API Endpoint:** `POST /users`

**Usage:** Used by authService.register() to create user accounts.

### CreateSellerData

Data sent to the API to create a seller.

```typescript
interface CreateSellerData {
  name: string;
}
```

**Requirements:** 5.3

**API Endpoint:** `POST /sellers`

**Usage:** Used by authService.createSeller() to create sellers.

### Seller

Represents a seller entity returned from the API.

```typescript
interface Seller {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}
```

**Requirements:** 5.4

**Usage:** Returned by authService.createSeller() and stored in AuthContext.

### User

Represents an authenticated user.

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
}
```

**Usage:** Returned by authService.getCurrentUser() and stored in AuthContext.

### AuthResponse

Response from authentication endpoints containing tokens.

```typescript
interface AuthResponse {
  token: string;
  refreshToken?: string;
}
```

**Usage:** Returned by authService.login() during auto-login.

## Validation Types

### Field Schemas

Individual Zod schemas for real-time field validation:

- `EmailFieldSchema`: Validates email format (Requirement 1.2)
- `PasswordFieldSchema`: Validates password strength (Requirement 1.3)
- `FirstNameFieldSchema`: Validates first name (Requirement 1.5)
- `LastNameFieldSchema`: Validates last name (Requirement 1.5)
- `SellerNameFieldSchema`: Validates seller name (Requirements 2.2, 2.3)

### Validation Functions

- `validateRegistrationField()`: Validates a single field (Requirement 9.1)
- `validateConfirmPassword()`: Validates password confirmation (Requirement 1.4)
- `validateRegistrationForm()`: Validates entire form (Requirement 1.6)
- `isRegistrationFormValid()`: Checks if form is valid (Requirement 9.5)

## Import Examples

### Import from source modules

```typescript
// Form types
import type { 
  RegistrationFormData, 
  RegistrationFormErrors 
} from '@/app/lib/definitions';

// Flow types
import type { 
  RegistrationData, 
  RegistrationStep 
} from '@/contexts/auth-context';

// API types
import type { 
  RegisterUserData, 
  CreateSellerData, 
  Seller 
} from '@/services/auth.service';
```

### Import from consolidated module

```typescript
// All registration types in one import
import type {
  RegistrationFormData,
  RegistrationFormErrors,
  RegistrationData,
  RegistrationStep,
  RegisterUserData,
  CreateSellerData,
  Seller,
  User,
} from '@/types/registration.types';
```

## Type Relationships

```
RegistrationFormData (UI Layer)
    ↓ (exclude confirmPassword)
RegistrationData (Context Layer)
    ↓ (split into user and seller data)
RegisterUserData + CreateSellerData (Service Layer)
    ↓ (API calls)
User + Seller (API Response)
```

## Type Safety Benefits

1. **Compile-time validation**: TypeScript catches type errors before runtime
2. **IntelliSense support**: Better autocomplete and documentation in IDEs
3. **Refactoring safety**: Changes to types are caught throughout the codebase
4. **Self-documenting code**: Types serve as inline documentation
5. **Reduced bugs**: Type mismatches are caught early in development

## Related Files

- `src/app/lib/definitions.ts`: Form types and validation schemas
- `src/contexts/auth-context.tsx`: Flow orchestration types
- `src/services/auth.service.ts`: API service types
- `src/types/registration.types.ts`: Consolidated type exports
- `src/components/Auth/SignUp/index.tsx`: Form component using these types
