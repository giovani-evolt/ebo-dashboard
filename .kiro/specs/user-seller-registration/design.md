# Design Document - User and Seller Registration

## Overview

Este documento describe el diseño técnico para implementar un flujo completo de registro que permite a los usuarios crear una cuenta, autenticarse automáticamente, crear un seller asociado y ser redirigidos al dashboard. El diseño se integra con la arquitectura de autenticación existente y extiende el API client para soportar las nuevas operaciones.

El flujo de registro sigue estos pasos:
1. Usuario completa el formulario con sus datos personales y nombre del seller (Requirements 1.1, 2.1)
2. Sistema valida los datos en el cliente con validación on-blur (Requirements 1.2-1.6, 2.2-2.4, 9.1-9.5)
3. Sistema crea el usuario en API Platform (Requirements 3.1-3.3)
4. Sistema autentica automáticamente al usuario (auto-login) (Requirements 4.1-4.3)
5. Sistema crea el seller asociado usando el token JWT (Requirements 5.1-5.4)
6. Sistema redirige al usuario al dashboard dentro de 1 segundo (Requirements 6.1-6.3)

### Key Design Decisions

1. **Single-Page Form:** All registration fields in one form rather than multi-step wizard
   - **Rationale:** Simpler implementation, faster completion for users, all requirements can be met in single view
   - **Trade-off:** Slightly longer form, but still manageable with 6 fields

2. **Blur Validation:** Field validation triggers on blur rather than on-change
   - **Rationale:** Provides immediate feedback without annoying users while typing (Requirement 9.1)
   - **Trade-off:** Slight delay in feedback, but better UX than real-time validation

3. **Sequential API Calls:** User creation → Login → Seller creation happens sequentially
   - **Rationale:** Ensures proper data associations and token availability (Requirements 3.1, 4.1, 5.1)
   - **Trade-off:** Slightly longer registration time (~2-3 seconds), but necessary for data integrity

4. **Auto-Login with Fallback:** Automatic login after registration, with redirect to manual login on failure
   - **Rationale:** Smooth UX for success case, graceful degradation on failure (Requirement 4.4)
   - **Trade-off:** User may need to login manually if auto-login fails, but account is still created

5. **Seller Creation Error Handling:** Keep user authenticated if seller creation fails
   - **Rationale:** User account is valid, seller can be created later (Requirement 5.5)
   - **Trade-off:** User may need to retry seller creation, but not blocked from using platform

6. **Password Field Clearing:** Clear password fields after any error
   - **Rationale:** Security best practice to not keep passwords in memory (Requirement 8.4)
   - **Trade-off:** User must re-enter password on error, but improves security

7. **Form Data Preservation:** Keep all non-password form data after errors
   - **Rationale:** Reduces user frustration on transient errors (Requirement 8.3)
   - **Trade-off:** Slightly more complex state management, but much better UX

## Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SignUp Page                              │
│                  /app/(auth)/signup                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SignUpForm Component                        │
│              /components/Auth/SignUp                         │
│  - Form validation (client-side)                            │
│  - Loading states                                           │
│  - Error display                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Auth Context                               │
│              /contexts/auth-context.tsx                      │
│  - signup() method                                          │
│  - State management                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Auth Service                               │
│              /services/auth.service.ts                       │
│  - register() - Create user                                 │
│  - login() - Authenticate user                              │
│  - createSeller() - Create seller                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Client                                │
│                /lib/api-client.ts                            │
│  - HTTP requests with JWT                                   │
│  - Error handling                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Platform                               │
│  POST /users - Create user                                  │
│  POST /auth/login - Authenticate                            │
│  POST /sellers - Create seller                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Form Validation → Create User → Auto Login → Create Seller → Redirect
     │              │               │            │             │              │
     │              │               │            │             │              │
     ▼              ▼               ▼            ▼             ▼              ▼
  Form State   Error Display   API Call    Store Token   API Call      Dashboard
                                           Update State
```

## Components and Interfaces

### 1. SignUp Page Component

**Location:** `src/app/(auth)/signup/page.tsx`

**Purpose:** Página de registro que contiene el formulario de signup

**Implementation:**
```typescript
export default function SignUpPage() {
  return (
    <div className="signup-page">
      <SignUpForm />
      <div className="login-link">
        {/* Requirement 10.1, 10.2: Link to login page */}
        <p>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
```

**Design Rationale:**
- Uses existing auth layout for consistency (Requirement 10.3)
- Provides clear navigation path for existing users (Requirement 10.1, 10.2)
- Maintains simple, focused page structure

### 2. SignUpForm Component

**Location:** `src/components/Auth/SignUp/index.tsx`

**Purpose:** Formulario de registro con validación y manejo de estados

**Props:** None (uses auth context)

**State:**
- `formData`: Datos del formulario (email, password, confirmPassword, firstName, lastName, sellerName) (Requirement 1.1, 2.1)
- `errors`: Errores de validación por campo (Requirement 1.6, 8.1, 8.2)
- `isSubmitting`: Estado de envío del formulario (Requirement 7.1, 7.2)
- `registrationStep`: Paso actual del proceso (idle, creating-user, logging-in, creating-seller, complete) (Requirement 7.3)
- `touchedFields`: Campos que han sido modificados por el usuario (para validación on blur)
- `validFields`: Campos que han pasado validación (para indicadores visuales) (Requirement 9.4)

**Key Methods:**
- `validateField(field, value)`: Valida un campo específico y retorna mensaje de error si aplica (Requirement 9.1)
- `validateForm()`: Valida todo el formulario antes del envío (Requirement 1.6)
- `handleSubmit()`: Maneja el envío del formulario y orquesta el flujo de registro (Requirements 3.1, 7.1)
- `handleFieldBlur(field)`: Valida campo al perder foco y actualiza estado de errores (Requirement 9.1)
- `handleFieldChange(field, value)`: Actualiza formData y limpia errores si el campo se corrige (Requirement 9.3)
- `clearPasswordFields()`: Limpia campos de password por seguridad después de errores (Requirement 8.4)

**Validation Rules:**
- Email: Formato válido de email (Requirement 1.2)
- Password: Mínimo 8 caracteres, al menos una mayúscula, un número (Requirement 1.3)
- Confirm Password: Debe coincidir exactamente con password (Requirement 1.4)
- First Name: No vacío, solo caracteres alfabéticos (Requirement 1.5)
- Last Name: No vacío, solo caracteres alfabéticos (Requirement 1.5)
- Seller Name: Mínimo 3 caracteres, máximo 100 caracteres (Requirements 2.2, 2.3)

**Validation Timing:**
- Validation triggers on field blur (Requirement 9.1)
- Error messages display inline below each field (Requirement 9.2)
- Error messages clear automatically when field is corrected (Requirement 9.3)
- Visual indicators (icon/color) show when field is valid (Requirement 9.4)
- Submit button disabled while any fields are invalid (Requirement 9.5)

### 3. Auth Context Extension

**Location:** `src/contexts/auth-context.tsx`

**New Method:** `signup(registrationData: RegistrationData): Promise<void>`

**Purpose:** Orquesta el flujo completo de registro

**Implementation Flow:**
```typescript
async signup(data: RegistrationData) {
  setIsLoading(true);
  
  try {
    // Step 1: Create user (Requirement 3.1, 3.2)
    await authService.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName
    });
    
    // Step 2: Auto-login (Requirement 4.1, 4.2)
    const { token } = await authService.login({
      email: data.email,
      password: data.password
    });
    
    // Step 3: Store token and update auth state (Requirement 4.3)
    tokenStorage.setToken(token);
    setIsAuthenticated(true);
    
    // Step 4: Fetch user data
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    
    // Step 5: Create seller (Requirement 5.1, 5.2, 5.3)
    await authService.createSeller({
      name: data.sellerName
    });
    
    // Step 6: Redirect to dashboard (Requirement 6.1, 6.2)
    router.push('/dashboard');
  } catch (error) {
    // Handle errors at each step
    if (error.step === 'login') {
      // Auto-login failed (Requirement 4.4)
      router.push('/login?message=account-created');
      return;
    }
    if (error.step === 'seller') {
      // Seller creation failed, keep user authenticated (Requirement 5.5)
      // User can retry or continue to dashboard
    }
    throw error;
  } finally {
    setIsLoading(false);
  }
}
```

**Design Rationale:**
- Sequential flow ensures each step completes before proceeding (Requirements 3.3, 4.1, 5.1)
- Token storage happens immediately after login for security (Requirement 4.2)
- Error handling differentiates between steps for appropriate recovery (Requirements 4.4, 5.5)
- Auto-login failure redirects to login page to avoid blocking user (Requirement 4.4)
- Seller creation failure maintains authentication state (Requirement 5.5)

### 4. Auth Service Extension

**Location:** `src/services/auth.service.ts`

**New Methods:**

#### `register(userData: RegisterUserData): Promise<void>`

**Purpose:** Crea un nuevo usuario en API Platform

**Parameters:**
```typescript
interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

**API Call:**
- Endpoint: `POST /users` (Requirement 3.1)
- Body: `{ email, password, firstName, lastName }` (Requirement 3.2)
- Headers: `Content-Type: application/ld+json`

**Error Handling:**
- 409 Conflict: Email ya existe → "Este email ya está registrado" (Requirement 3.4)
- 400 Bad Request: Validación fallida → Mostrar errores específicos (Requirement 3.5)
- 500 Server Error: Error del servidor → "Error del servidor. Por favor intenta nuevamente más tarde" (Requirement 8.2)
- Network Error: Sin conexión → "Error de conexión. Por favor verifica tu conexión a internet" (Requirement 8.1)

**Design Rationale:**
- Uses API Platform's JSON-LD format for consistency
- Specific error messages help users understand and resolve issues (Requirement 8.1, 8.2)
- Duplicate email detection prevents confusion (Requirement 3.4)

#### `createSeller(sellerData: CreateSellerData): Promise<Seller>`

**Purpose:** Crea un seller asociado al usuario autenticado

**Parameters:**
```typescript
interface CreateSellerData {
  name: string;
}
```

**API Call:**
- Endpoint: `POST /sellers` (Requirement 5.1)
- Body: `{ name }` (Requirement 5.3)
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/ld+json` (Requirement 5.2)

**Response:**
```typescript
interface Seller {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}
```

**Error Handling:**
- 401 Unauthorized: Token inválido → Limpiar tokens y redirigir a login
- 400 Bad Request: Validación fallida → Mostrar error específico
- 500 Server Error: Error del servidor → "Error al crear seller. Por favor intenta nuevamente más tarde"
- On any error: Mantener usuario autenticado (Requirement 5.5)

**Design Rationale:**
- JWT token in Authorization header ensures seller is associated with authenticated user (Requirement 5.2)
- Seller creation happens after authentication to ensure proper association (Requirement 5.1)
- Errors don't log user out, allowing retry without re-authentication (Requirement 5.5)

## Data Models

### Registration Form Data

```typescript
interface RegistrationFormData {
  email: string;                // Requirement 1.1
  password: string;             // Requirement 1.1
  confirmPassword: string;      // Requirement 1.1
  firstName: string;            // Requirement 1.1
  lastName: string;             // Requirement 1.1
  sellerName: string;           // Requirement 2.1
}
```

**Design Note:** `confirmPassword` is used only for client-side validation (Requirement 1.4) and is not sent to the API.

### Registration Data (for API)

```typescript
interface RegistrationData {
  email: string;                // Requirement 3.2
  password: string;             // Requirement 3.2
  firstName: string;            // Requirement 3.2
  lastName: string;             // Requirement 3.2
  sellerName: string;           // Requirement 5.3
}
```

**Design Note:** This interface excludes `confirmPassword` as it's only needed for client-side validation.

### User Model (existing)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt?: string;
}
```

### Seller Model

```typescript
interface Seller {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}
```

### Form Validation Errors

```typescript
interface FormErrors {
  email?: string;              // Requirement 1.2, 1.6
  password?: string;           // Requirement 1.3, 1.6
  confirmPassword?: string;    // Requirement 1.4, 1.6
  firstName?: string;          // Requirement 1.5, 1.6
  lastName?: string;           // Requirement 1.5, 1.6
  sellerName?: string;         // Requirements 2.2, 2.3, 2.4
  general?: string;            // For API errors (Requirements 3.4, 3.5, 8.1, 8.2)
}
```

**Design Note:** Each field can have an optional error message. The `general` field is used for API-level errors that don't map to specific fields.

## Error Handling

### Client-Side Validation Errors

**Display:** Inline debajo de cada campo (Requirement 9.2)

**Error Messages:**
- Email inválido: "Por favor ingresa un email válido" (Requirement 1.2)
- Password débil: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número" (Requirement 1.3)
- Passwords no coinciden: "Las contraseñas no coinciden" (Requirement 1.4)
- Nombre vacío: "El nombre es requerido" (Requirement 1.5)
- Nombre con caracteres inválidos: "El nombre solo puede contener caracteres alfabéticos" (Requirement 1.5)
- Apellido vacío: "El apellido es requerido" (Requirement 1.5)
- Apellido con caracteres inválidos: "El apellido solo puede contener caracteres alfabéticos" (Requirement 1.5)
- Seller name vacío: "El nombre del seller es requerido" (Requirement 2.4)
- Seller name corto: "El nombre del seller debe tener al menos 3 caracteres" (Requirement 2.2)
- Seller name largo: "El nombre del seller no puede exceder 100 caracteres" (Requirement 2.3)

**Validation Behavior:**
- Validation triggers on field blur (Requirement 9.1)
- Errors clear when field is corrected (Requirement 9.3)
- Visual indicators show valid fields (Requirement 9.4)
- Submit button disabled while errors exist (Requirement 9.5)

### API Errors

**User Creation Errors:**
- 409 Conflict: "Este email ya está registrado"
- 400 Bad Request: Mostrar errores específicos del servidor
- 500 Server Error: "Error del servidor. Por favor intenta nuevamente más tarde"
- Network Error: "Error de conexión. Por favor verifica tu conexión a internet"

**Auto-Login Errors:**
- Si falla: Redirigir a `/login` con mensaje "Cuenta creada exitosamente. Por favor inicia sesión"

**Seller Creation Errors:**
- 401 Unauthorized: Limpiar tokens y redirigir a login
- 400 Bad Request: "Error al crear seller: {mensaje específico}"
- 500 Server Error: "Error al crear seller. Por favor intenta nuevamente más tarde"
- Si falla: Mantener usuario autenticado, mostrar error, permitir reintentar

### Error Recovery

**Strategy:**
1. Mantener datos del formulario después de errores (excepto passwords) (Requirement 8.3)
2. Limpiar campos de password por seguridad (Requirement 8.4)
3. Permitir al usuario reintentar sin perder datos (Requirement 8.5)
4. Mostrar mensajes claros y accionables (Requirements 8.1, 8.2)
5. Si auto-login falla, redirigir a login (usuario ya creado) (Requirement 4.4)
6. Si seller creation falla, mantener sesión activa (Requirement 5.5)

**Design Rationale:**
- Preserving form data reduces user frustration on transient errors
- Clearing passwords follows security best practices
- Different recovery paths for different failure points ensure user isn't blocked
- Auto-login failure doesn't prevent account usage, just requires manual login

## Testing Strategy

### Unit Tests

**SignUpForm Component:**
- Validación de campos individuales (Requirements 1.2-1.5, 2.2-2.3)
- Validación de formulario completo (Requirement 1.6)
- Validación on blur (Requirement 9.1)
- Limpieza de errores al corregir campos (Requirement 9.3)
- Manejo de estados de carga (Requirements 7.1-7.4)
- Display de errores inline (Requirement 9.2)
- Indicadores visuales de campos válidos (Requirement 9.4)
- Limpieza de passwords en errores (Requirement 8.4)
- Preservación de datos del formulario excepto passwords (Requirement 8.3)

**Auth Service:**
- `register()` con datos válidos (Requirements 3.1-3.3)
- `register()` con email duplicado (Requirement 3.4)
- `register()` con datos inválidos (Requirement 3.5)
- `createSeller()` con token válido (Requirements 5.1-5.4)
- `createSeller()` con token inválido
- Manejo de errores de red (Requirement 8.1)
- Manejo de errores de servidor (Requirement 8.2)

**Auth Context:**
- `signup()` flujo completo exitoso (Requirements 3.1, 4.1, 5.1, 6.1)
- `signup()` con fallo en creación de usuario (Requirements 3.4, 3.5)
- `signup()` con fallo en auto-login (Requirement 4.4)
- `signup()` con fallo en creación de seller (Requirement 5.5)
- Almacenamiento de token después de login (Requirement 4.2)
- Actualización de estado de autenticación (Requirement 4.3)

### Integration Tests

**Complete Registration Flow:**
1. Usuario completa formulario con datos válidos (Requirements 1.1-1.6, 2.1-2.4)
2. Sistema crea usuario exitosamente (Requirements 3.1-3.3)
3. Sistema autentica usuario automáticamente (Requirements 4.1-4.3)
4. Sistema crea seller exitosamente (Requirements 5.1-5.4)
5. Usuario es redirigido a dashboard dentro de 1 segundo (Requirements 6.1, 6.2)
6. Dashboard muestra información del usuario y seller (Requirement 6.3)

**Error Scenarios:**
1. Email duplicado → Mostrar error apropiado (Requirement 3.4)
2. Fallo de red → Mostrar error de conexión (Requirement 8.1)
3. Auto-login falla → Redirigir a login (Requirement 4.4)
4. Seller creation falla → Mantener sesión, mostrar error (Requirement 5.5)

### E2E Tests

**Happy Path:**
1. Navegar a `/signup`
2. Completar todos los campos con datos válidos (Requirements 1.1, 2.1)
3. Enviar formulario (Requirement 3.1)
4. Verificar indicadores de progreso durante registro (Requirement 7.3)
5. Verificar redirección a `/dashboard` (Requirement 6.1)
6. Verificar que usuario está autenticado (Requirement 4.3)
7. Verificar que seller fue creado (Requirement 5.4)
8. Verificar que dashboard muestra información correcta (Requirement 6.3)

**Validation:**
1. Intentar enviar formulario vacío → Ver errores (Requirement 1.6)
2. Ingresar email inválido → Ver error de email on blur (Requirements 1.2, 9.1)
3. Ingresar password débil → Ver error de password (Requirement 1.3)
4. Passwords no coinciden → Ver error (Requirement 1.4)
5. Nombres con caracteres inválidos → Ver error (Requirement 1.5)
6. Seller name muy corto → Ver error (Requirement 2.2)
7. Verificar botón deshabilitado con errores (Requirement 9.5)
8. Corregir errores → Ver errores desaparecer (Requirement 9.3)
9. Enviar con datos válidos → Registro exitoso

**Navigation:**
1. Verificar link a login visible (Requirement 10.1)
2. Click en link de login → Navegar a `/login` (Requirement 10.3)
3. Desde login, verificar link a signup para navegación bidireccional

## UI/UX Considerations

### Loading States

**Registration Steps Display:**
```
Creando tu cuenta...
✓ Usuario creado
Iniciando sesión...
✓ Sesión iniciada
Creando tu seller...
✓ Seller creado
Redirigiendo al dashboard...
```

**Requirements Addressed:**
- Show loading indicator when form is submitted (Requirement 7.1)
- Disable submit button during registration (Requirement 7.2)
- Display progress messages for each stage (Requirement 7.3)
- Hide loading indicator before redirect (Requirement 7.4)

**Design Rationale:**
- Step-by-step progress keeps user informed during multi-stage process
- Visual checkmarks provide positive feedback
- Prevents user confusion during the ~2-3 second registration flow

### Form Layout

**Structure:**
- Título: "Crear cuenta"
- Campo: Email (Requirement 1.1)
- Campo: Password (Requirement 1.1)
- Campo: Confirmar Password (Requirement 1.1)
- Campo: Nombre (Requirement 1.1)
- Campo: Apellido (Requirement 1.1)
- Campo: Nombre del Seller (Requirement 2.1)
- Botón: "Crear cuenta" (deshabilitado si hay errores o está enviando) (Requirement 9.5, 7.2)
- Link: "¿Ya tienes una cuenta? Inicia sesión" (Requirement 10.1, 10.2)

**Design Rationale:**
- Logical field order: credentials first, then personal info, then business info
- All required fields in single form for simplicity (no multi-step)
- Clear visual hierarchy guides user through form completion

### Accessibility

- Labels asociados a inputs
- Mensajes de error con aria-live
- Botón deshabilitado con aria-disabled
- Focus management durante validación
- Keyboard navigation completo

## Security Considerations

1. **Password Handling:**
   - Nunca almacenar passwords en estado después de envío
   - Limpiar campos de password en errores
   - Validar fortaleza de password en cliente y servidor

2. **Token Management:**
   - Almacenar JWT en storage seguro
   - Incluir token en header Authorization para crear seller
   - Limpiar tokens si cualquier operación retorna 401

3. **Input Sanitization:**
   - Validar y sanitizar todos los inputs en cliente
   - Confiar en validación del servidor como fuente de verdad
   - Prevenir XSS en mensajes de error

4. **Error Messages:**
   - No revelar información sensible en errores
   - Mensajes genéricos para errores de servidor
   - No indicar si un email existe o no (excepto en registro)

## API Endpoints

### Create User

**Endpoint:** `POST /users`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "@context": "/contexts/User",
  "@id": "/users/123",
  "@type": "User",
  "id": "123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- 409 Conflict: Email already exists
- 400 Bad Request: Validation errors
- 500 Internal Server Error

### Login (existing)

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here"
}
```

### Create Seller

**Endpoint:** `POST /sellers`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/ld+json
```

**Request:**
```json
{
  "name": "My Seller Business"
}
```

**Response (201 Created):**
```json
{
  "@context": "/contexts/Seller",
  "@id": "/sellers/456",
  "@type": "Seller",
  "id": "456",
  "name": "My Seller Business",
  "userId": "123",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- 401 Unauthorized: Invalid or missing token
- 400 Bad Request: Validation errors
- 500 Internal Server Error

## Implementation Notes

1. **Reuse Existing Components:**
   - Use existing input components from `src/components/FormElements`
   - Follow existing form styling patterns
   - Reuse error display patterns from SigninWithPassword

2. **Auth Context Integration:**
   - Add `signup` method to existing AuthContext
   - Maintain consistency with existing `login` method
   - Use same error handling patterns

3. **Service Layer:**
   - Extend AuthService with `register` and `createSeller` methods
   - Use existing apiClient for HTTP requests
   - Follow existing error transformation patterns

4. **Routing:**
   - Create signup page in `src/app/(auth)/signup` (Requirement 10.1)
   - Use existing auth layout (Requirement 10.3)
   - Redirect to `/dashboard` after successful registration (Requirement 6.1)
   - Update login page to include link to signup for bidirectional navigation (Requirement 10.2)

5. **Environment Variables:**
   - Use existing `NEXT_PUBLIC_API_BASE_URL`
   - No new environment variables needed

6. **Navigation Links:**
   - Signup page: "¿Ya tienes una cuenta? Inicia sesión" → `/login` (Requirement 10.1, 10.2)
   - Login page: "¿No tienes una cuenta? Regístrate" → `/signup` (bidirectional navigation)
   - Both links should maintain application state (Requirement 10.3)

## Dependencies

**Existing Dependencies (no new installations needed):**
- React (form state management)
- Next.js (routing, server actions)
- Zod (validation schemas)
- Existing auth infrastructure

## Performance Considerations

1. **Form Validation:**
   - Validate on blur to provide immediate feedback (Requirement 9.1)
   - Debounce validation for better UX
   - Only validate changed fields to minimize computation

2. **API Calls:**
   - Sequential calls (user → login → seller) are necessary for proper flow (Requirements 3.1, 4.1, 5.1)
   - Show progress indicators for each step (Requirement 7.3)
   - Implement proper timeout handling
   - Total flow should complete within 2-3 seconds under normal conditions

3. **Redirect Timing:**
   - Redirect to dashboard within 1 second after seller creation (Requirement 6.2)
   - Ensure all state updates complete before redirect
   - Use router.push() for client-side navigation

4. **Error Recovery:**
   - Cache form data to prevent re-entry (Requirement 8.3)
   - Allow retry without full page reload (Requirement 8.5)
   - Clear sensitive data (passwords) appropriately (Requirement 8.4)

**Design Rationale:**
- Blur validation balances immediate feedback with avoiding annoying users while typing
- Sequential API calls ensure data consistency and proper associations
- 1-second redirect timing provides smooth UX without feeling rushed
- Form data preservation reduces friction on transient errors

## Future Enhancements

1. **Email Verification:**
   - Send verification email after registration
   - Require email confirmation before full access

2. **Social Registration:**
   - Add Google/GitHub signup options
   - Link social accounts to user

3. **Multi-step Form:**
   - Split into multiple steps for better UX
   - Save progress between steps

4. **Seller Customization:**
   - Add more seller fields during registration
   - Allow seller logo upload

5. **Password Strength Indicator:**
   - Visual indicator of password strength
   - Real-time feedback as user types
