# Design Document

## Overview

Este diseño implementa validación de sesión global mediante Next.js Middleware y crea dos páginas independientes para visualizar settlements y units sold. El sistema aprovecha la infraestructura de autenticación existente (middleware.ts, auth-context, api-client) y extiende el menú de navegación para incluir dos nuevos items de menú independientes.

La solución se enfoca en:
1. Reforzar la validación de sesión existente en el middleware
2. Crear dos páginas independientes con grids reutilizables
3. Extender el menú de navegación con dos items separados
4. Reutilizar componentes de tabla existentes para mantener consistencia visual

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Request                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Middleware                         │
│  - Validates auth token presence                             │
│  - Redirects to /login if no token                          │
│  - Preserves redirect URL                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Protected Routes                          │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ /settlements/list│        │ /units-sold/list │          │
│  │                  │        │                  │          │
│  │  - Settlements   │        │  - Units Sold    │          │
│  │    Grid          │        │    Grid          │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
└───────────┼───────────────────────────┼─────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Client                              │
│  - Adds Authorization header with JWT token                  │
│  - Handles 401 responses                                     │
│  - Redirects to login on auth failure                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
│  - GET /api/settlements                                      │
│  - GET /api/units_solds                                      │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Navigation Menu (Sidebar)
├── Financial Information
├── Settlements (expandable)
│   ├── List → /settlements/list
│   └── Files → /settlements/csvs
└── Units Sold (expandable)
    └── List → /units-sold/list

Page Structure
├── /settlements/list
│   └── SettlementsListPage
│       └── DataGrid<Settlement>
│           ├── Loading State (Skeleton)
│           ├── Error State
│           └── Data Table
│
└── /units-sold/list
    └── UnitsSoldListPage
        └── DataGrid<UnitSold>
            ├── Loading State (Skeleton)
            ├── Error State
            └── Data Table
```

## Components and Interfaces

### 1. Middleware Enhancement

**File:** `middleware.ts`

El middleware ya existe y tiene la estructura correcta. Solo necesitamos verificar que las nuevas rutas estén incluidas en los patrones protegidos.

**Cambios necesarios:**
- Agregar `/units-sold` al array `protectedRoutePatterns` si no está cubierto por el patrón existente

**Flujo de validación:**
```
Request → Check if public route → Allow
       → Check if static/API → Allow
       → Check auth token → Redirect to /login if missing
       → Allow access if token exists
```

### 2. Navigation Menu Update

**File:** `src/components/Layouts/sidebar/data/index.ts`

**Estructura actual:**
```typescript
{
  title: "Settlements",
  icon: Icons.Calendar,
  items: [
    { title: "List", url: "/settlements" },
    { title: "Files", url: "/settlements/csvs" }
  ]
}
```

**Nueva estructura:**
```typescript
{
  title: "Settlements",
  icon: Icons.Calendar,
  items: [
    { title: "List", url: "/settlements/list" },
    { title: "Files", url: "/settlements/csvs" }
  ]
},
{
  title: "Units Sold",
  icon: Icons.FourCircle, // o un nuevo ícono apropiado
  items: [
    { title: "List", url: "/units-sold/list" }
  ]
}
```

### 3. Data Grid Component (Reutilizable)

**File:** `src/components/Tables/data-grid.tsx` (nuevo)

Este componente genérico manejará la lógica común de carga, error y visualización de datos.

**Interface:**
```typescript
interface DataGridProps<T> {
  // Endpoint de la API a consultar
  endpoint: string;
  
  // Definición de columnas
  columns: ColumnDef<T>[];
  
  // Título de la tabla
  title: string;
  
  // Función opcional para transformar datos
  transformData?: (data: any) => T[];
}

interface ColumnDef<T> {
  // Clave del campo en el objeto de datos
  key: keyof T;
  
  // Título de la columna
  header: string;
  
  // Función opcional para renderizar el valor
  render?: (value: any, row: T) => React.ReactNode;
  
  // Ancho de la columna (opcional)
  width?: string;
}
```

**Estados del componente:**
```typescript
type DataGridState = 
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T[] };
```

**Funcionalidad:**
- Fetch automático de datos al montar
- Manejo de estados de carga con skeleton
- Manejo de errores con botón de reintentar
- Renderizado de tabla usando el componente existente
- Responsive design

### 4. Settlements List Page

**File:** `src/app/settlements/list/page.tsx` (nuevo)

**Estructura:**
```typescript
export default function SettlementsListPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Settlements" />
      
      <DataGrid<Settlement>
        endpoint="/api/settlements"
        title="Settlements"
        columns={settlementColumns}
      />
    </div>
  );
}
```

### 5. Units Sold List Page

**File:** `src/app/units-sold/list/page.tsx` (nuevo)

**Estructura:**
```typescript
export default function UnitsSoldListPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageName="Units Sold" />
      
      <DataGrid<UnitSold>
        endpoint="/api/units_solds"
        title="Units Sold"
        columns={unitsSoldColumns}
      />
    </div>
  );
}
```

## Data Models

### Settlement Type

```typescript
interface Settlement {
  id: string | number;
  settlementId?: string;
  date: string;
  amount: number;
  currency?: string;
  status?: string;
  period?: string;
  // Campos adicionales según la respuesta de la API
  [key: string]: any;
}
```

### UnitSold Type

```typescript
interface UnitSold {
  id: string | number;
  productId?: string;
  productName?: string;
  quantity: number;
  price: number;
  currency?: string;
  date: string;
  orderId?: string;
  // Campos adicionales según la respuesta de la API
  [key: string]: any;
}
```

### API Response Types

```typescript
// Respuesta esperada de GET /api/settlements
interface SettlementsResponse {
  data?: Settlement[];
  settlements?: Settlement[];
  // O directamente un array
  [key: number]: Settlement;
}

// Respuesta esperada de GET /api/units_solds
interface UnitsSoldsResponse {
  data?: UnitSold[];
  unitsSolds?: UnitSold[];
  units_solds?: UnitSold[];
  // O directamente un array
  [key: number]: UnitSold;
}
```

## Error Handling

### Error Types

```typescript
interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

### Error Handling Strategy

**1. Middleware Level:**
- No token → Redirect to `/login?redirect={currentPath}`
- Invalid token → Redirect to `/login`

**2. API Client Level:**
- 401 Unauthorized → Clear tokens + Redirect to `/login`
- Network error → Return error object with statusCode 0
- 500 Server error → Return error object with statusCode 500

**3. Component Level:**
- Loading state → Show skeleton
- Error state → Show error message + retry button
- Empty data → Show "No data available" message

### Error Messages

```typescript
const ERROR_MESSAGES = {
  401: 'Sesión expirada. Por favor inicia sesión nuevamente.',
  403: 'No tienes permisos para acceder a esta información.',
  404: 'No se encontraron datos.',
  500: 'Error del servidor. Por favor intenta nuevamente más tarde.',
  0: 'Error de conexión. Por favor verifica tu conexión a internet.',
  default: 'Ocurrió un error al cargar los datos.',
};
```

## Testing Strategy

### Unit Tests

**DataGrid Component:**
- ✓ Renders loading state initially
- ✓ Fetches data from correct endpoint
- ✓ Displays data in table format
- ✓ Shows error message on fetch failure
- ✓ Retry button refetches data
- ✓ Handles empty data gracefully

**API Client:**
- ✓ Includes Authorization header with token
- ✓ Redirects to login on 401
- ✓ Handles network errors
- ✓ Parses response correctly

### Integration Tests

**Settlements List Page:**
- ✓ Renders breadcrumb correctly
- ✓ Loads settlements from API
- ✓ Displays settlements in grid
- ✓ Handles API errors

**Units Sold List Page:**
- ✓ Renders breadcrumb correctly
- ✓ Loads units sold from API
- ✓ Displays units sold in grid
- ✓ Handles API errors

### E2E Tests

**Authentication Flow:**
- ✓ Unauthenticated user redirected to login
- ✓ After login, user redirected to original destination
- ✓ Authenticated user can access settlements list
- ✓ Authenticated user can access units sold list

**Navigation:**
- ✓ Settlements menu item expands/collapses
- ✓ Units Sold menu item expands/collapses
- ✓ Clicking "Settlements > List" navigates correctly
- ✓ Clicking "Units Sold > List" navigates correctly
- ✓ Active state highlights current page

## Implementation Notes

### Existing Components to Reuse

1. **Table Component:** `src/components/ui/table.tsx`
   - Ya existe un componente de tabla base
   - Reutilizar para mantener consistencia visual

2. **Skeleton Component:** `src/components/ui/skeleton.tsx`
   - Usar para estados de carga

3. **Breadcrumb Component:** `src/components/Breadcrumbs/Breadcrumb.tsx`
   - Usar en ambas páginas para navegación

4. **API Client:** `src/lib/api-client.ts`
   - Ya maneja autenticación automática
   - Ya maneja errores 401

### Route Structure

```
src/app/
├── settlements/
│   ├── list/
│   │   └── page.tsx (nueva página)
│   └── csvs/
│       └── ... (existente)
└── units-sold/
    └── list/
        └── page.tsx (nueva página)
```

### Styling Approach

- Usar clases de Tailwind existentes en el proyecto
- Mantener consistencia con otras páginas del dashboard
- Responsive design: mobile-first approach
- Dark mode support usando clases `dark:` de Tailwind

### Performance Considerations

1. **Data Fetching:**
   - Client-side fetching con React hooks
   - No server-side rendering para estas páginas (datos dinámicos)
   - Considerar paginación si los datasets son grandes

2. **Component Optimization:**
   - Memoizar columnas de tabla
   - Usar React.memo para DataGrid si es necesario
   - Lazy loading de páginas con Next.js dynamic imports

3. **Error Recovery:**
   - Implementar retry con exponential backoff
   - Límite de 3 intentos automáticos
   - Botón manual de retry siempre disponible

## Security Considerations

1. **Token Validation:**
   - Middleware valida presencia de token
   - API Client incluye token en cada request
   - Backend valida token en cada endpoint

2. **XSS Prevention:**
   - Sanitizar datos antes de renderizar
   - Usar React's built-in XSS protection
   - No usar dangerouslySetInnerHTML

3. **CSRF Protection:**
   - Next.js maneja CSRF automáticamente
   - Tokens en cookies con httpOnly flag

4. **Data Exposure:**
   - No exponer datos sensibles en URLs
   - No loggear tokens en consola
   - Limpiar tokens al hacer logout

## Accessibility

1. **Keyboard Navigation:**
   - Todas las acciones accesibles por teclado
   - Focus visible en elementos interactivos
   - Tab order lógico

2. **Screen Readers:**
   - ARIA labels en botones y links
   - Semantic HTML (table, thead, tbody)
   - Anunciar cambios de estado (loading, error)

3. **Visual:**
   - Contraste adecuado en textos
   - Tamaños de fuente legibles
   - Indicadores visuales de estado

## Migration Path

Como el proyecto ya tiene una ruta `/settlements` existente, necesitamos:

1. Verificar si `/settlements` actual debe moverse a `/settlements/list`
2. O si `/settlements/list` es una nueva página adicional
3. Actualizar el menú para reflejar la estructura correcta

**Decisión de diseño:** Crear `/settlements/list` como nueva ruta y mantener `/settlements` existente si es necesario, o redirigir `/settlements` → `/settlements/list`.
