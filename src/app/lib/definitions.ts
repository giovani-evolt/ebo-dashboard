import { z } from 'zod'
 
export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})
 
export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined

// Registration Form Schema - Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4
export const RegistrationFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El email es requerido' })
    .email({ message: 'Por favor ingresa un email válido' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe tener al menos un número' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Por favor confirma tu contraseña' }),
  firstName: z
    .string()
    .min(1, { message: 'El nombre es requerido' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
      message: 'El nombre solo puede contener caracteres alfabéticos' 
    })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: 'El apellido es requerido' })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
      message: 'El apellido solo puede contener caracteres alfabéticos' 
    })
    .trim(),
  sellerName: z
    .string()
    .min(3, { message: 'El nombre del seller debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre del seller no puede exceder 100 caracteres' })
    .trim(),
  legalName: z
    .string()
    .min(1, { message: 'El nombre legal es requerido' })
    .max(255, { message: 'El nombre legal no puede exceder 255 caracteres' })
    .trim(),
  rfc: z
    .string()
    .min(13, { message: 'El RFC debe tener exactamente 13 caracteres' })
    .max(13, { message: 'El RFC debe tener exactamente 13 caracteres' })
    .regex(/^[A-Z0-9]+$/, { message: 'El RFC solo puede contener letras mayúsculas y números' })
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Individual field schemas for real-time validation - Requirement 9.1
export const EmailFieldSchema = z
  .string()
  .min(1, { message: 'El email es requerido' })
  .email({ message: 'Por favor ingresa un email válido' })
  .trim()

export const PasswordFieldSchema = z
  .string()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  .regex(/[A-Z]/, { message: 'La contraseña debe tener al menos una mayúscula' })
  .regex(/[0-9]/, { message: 'La contraseña debe tener al menos un número' })

export const FirstNameFieldSchema = z
  .string()
  .min(1, { message: 'El nombre es requerido' })
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
    message: 'El nombre solo puede contener caracteres alfabéticos' 
  })
  .trim()

export const LastNameFieldSchema = z
  .string()
  .min(1, { message: 'El apellido es requerido' })
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, { 
    message: 'El apellido solo puede contener caracteres alfabéticos' 
  })
  .trim()

export const SellerNameFieldSchema = z
  .string()
  .min(3, { message: 'El nombre del seller debe tener al menos 3 caracteres' })
  .max(100, { message: 'El nombre del seller no puede exceder 100 caracteres' })
  .trim()

export const LegalNameFieldSchema = z
  .string()
  .min(1, { message: 'El nombre legal es requerido' })
  .max(255, { message: 'El nombre legal no puede exceder 255 caracteres' })
  .trim()

export const SellerLegalNameFieldSchema = z
  .string()
  .min(1, { message: 'El nombre legal del seller es requerido' })
  .max(255, { message: 'El nombre legal no puede exceder 255 caracteres' })
  .trim()

export const RfcFieldSchema = z
  .string()
  .min(13, { message: 'El RFC debe tener exactamente 13 caracteres' })
  .max(13, { message: 'El RFC debe tener exactamente 13 caracteres' })
  .regex(/^[A-Z0-9]+$/, { message: 'El RFC solo puede contener letras mayúsculas y números' })
  .trim()

/**
 * Registration Form Data
 * Contains all fields required for user and seller registration
 * Requirements: 1.1, 2.1
 */
export interface RegistrationFormData {
  /** User's email address - Requirement 1.1 */
  email: string
  /** User's password - Requirement 1.1 */
  password: string
  /** Password confirmation for validation - Requirement 1.1 */
  confirmPassword: string
  /** User's first name - Requirement 1.1 */
  firstName: string
  /** User's last name - Requirement 1.1 */
  lastName: string
  /** Name of the seller to be created - Requirement 2.1 */
  sellerName: string
  /** Legal name of the seller (max 255 characters) */
  legalName: string
  /** RFC (Registro Federal de Contribuyentes) - 13 alphanumeric characters */
  rfc: string
}

/**
 * Registration Form Errors
 * Contains validation error messages for each form field
 * Requirements: 1.6, 8.1, 8.2
 */
export interface RegistrationFormErrors {
  /** Email validation error - Requirement 1.2 */
  email?: string
  /** Password validation error - Requirement 1.3 */
  password?: string
  /** Confirm password validation error - Requirement 1.4 */
  confirmPassword?: string
  /** First name validation error - Requirement 1.5 */
  firstName?: string
  /** Last name validation error - Requirement 1.5 */
  lastName?: string
  /** Seller name validation error - Requirements 2.2, 2.3, 2.4 */
  sellerName?: string
  /** Legal name validation error */
  legalName?: string
  /** RFC validation error */
  rfc?: string
  /** General API or system error - Requirements 8.1, 8.2 */
  general?: string
}

/**
 * Registration Form State
 * Represents the overall state of the registration form including errors and messages
 */
export type RegistrationFormState =
  | {
      errors?: RegistrationFormErrors
      message?: string
    }
  | undefined

/**
 * Touched Fields
 * Tracks which form fields have been interacted with (blurred)
 * Used for determining when to show validation errors
 * Requirement 9.1
 */
export type TouchedFields = {
  [K in keyof RegistrationFormData]?: boolean
}

/**
 * Valid Fields
 * Tracks which form fields have passed validation
 * Used for showing visual indicators of valid fields
 * Requirement 9.4
 */
export type ValidFields = {
  [K in keyof RegistrationFormData]?: boolean
}

// Validation utility functions - Requirements 9.1, 9.2, 9.3, 9.4, 9.5
export function validateRegistrationField(
  field: keyof Omit<RegistrationFormData, 'confirmPassword'>,
  value: string
): string | null {
  try {
    switch (field) {
      case 'email':
        EmailFieldSchema.parse(value)
        break
      case 'password':
        PasswordFieldSchema.parse(value)
        break
      case 'firstName':
        FirstNameFieldSchema.parse(value)
        break
      case 'lastName':
        LastNameFieldSchema.parse(value)
        break
      case 'sellerName':
        SellerNameFieldSchema.parse(value)
        break
      case 'legalName':
        LegalNameFieldSchema.parse(value)
        break
      case 'rfc':
        RfcFieldSchema.parse(value.toUpperCase())
        break
      default:
        return null
    }
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Campo inválido'
    }
    return 'Error de validación'
  }
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return 'Por favor confirma tu contraseña'
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden'
  }
  return null
}

export function validateRegistrationForm(
  data: RegistrationFormData
): RegistrationFormErrors | null {
  try {
    RegistrationFormSchema.parse(data)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: RegistrationFormErrors = {}
      error.issues.forEach((err) => {
        const field = err.path[0] as keyof RegistrationFormErrors
        if (field && !errors[field]) {
          errors[field] = err.message
        }
      })
      return errors
    }
    return { general: 'Error de validación del formulario' }
  }
}

export function isRegistrationFormValid(data: RegistrationFormData): boolean {
  return validateRegistrationForm(data) === null
}