# Implementation Plan

- [x] 1. Verify middleware and API client infrastructure
  - Middleware already validates session and includes `/settlements` and `/units-sold` in protected routes
  - API client already includes Authorization header with Bearer token
  - API client already handles 401 responses by clearing tokens and redirecting to login
  - Redirect URL preservation is already implemented in middleware
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_

- [x] 2. Update navigation menu structure
- [x] 2.1 Update sidebar menu data
  - Modify `src/components/Layouts/sidebar/data/index.ts`
  - Update "Settlements" item to have "List" subitem pointing to `/settlements/list`
  - Update "Units Sold" item to have expandable structure with "List" subitem pointing to `/units-sold/list`
  - Ensure both menu items have appropriate icons (already present)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3. Create reusable DataGrid component
- [x] 3.1 Create TypeScript interfaces for DataGrid
  - Create `src/components/Tables/data-grid.tsx` file
  - Define `DataGridProps<T>` interface with endpoint, columns, title, and optional transformData
  - Define `ColumnDef<T>` interface for column definitions (key, header, render, width)
  - Define `DataGridState` type for component states (loading, error, success)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 3.2 Implement DataGrid component with data fetching
  - Implement useState for managing loading, error, and data states
  - Implement useEffect to fetch data from endpoint on mount
  - Use apiClient.get() to make authenticated requests
  - Handle response and update state accordingly
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [x] 3.3 Implement loading state with skeleton
  - Use Skeleton component from `src/components/ui/skeleton.tsx`
  - Render skeleton rows in table structure while loading
  - Match skeleton layout to final table structure
  - _Requirements: 4.5, 5.5_

- [x] 3.4 Implement error state with retry functionality
  - Display error message based on error statusCode (401, 500, 0 for network)
  - Implement retry button that calls fetch function again
  - Show appropriate error messages for each error type
  - _Requirements: 4.6, 5.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3.5 Implement data table rendering
  - Use Table, TableHeader, TableBody, TableRow, TableHead, TableCell from `src/components/ui/table.tsx`
  - Map columns to TableHead elements
  - Map data rows to TableRow with TableCell elements
  - Apply custom render functions if provided in column definitions
  - Wrap table in responsive container with horizontal scroll
  - Style consistently with existing tables (e.g., settlements-table.tsx)
  - _Requirements: 4.3, 4.4, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4_

- [x] 4. Create Settlements list page
- [x] 4.1 Define Settlement TypeScript interface
  - Create `src/types/settlement.types.ts` file
  - Define Settlement interface based on API response structure
  - Include fields: id, settlementId, date, amount, currency, status, period
  - Add index signature for additional fields: [key: string]: any
  - Export interface for use in components
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.2 Create settlements list page component
  - Create `src/app/settlements/list/page.tsx` file
  - Import DataGrid component and Settlement type
  - Import Breadcrumb component from `src/components/Breadcrumbs/Breadcrumb.tsx`
  - Define column definitions array with appropriate columns and render functions
  - Render Breadcrumb with "Settlements" title
  - Render DataGrid with `/api/settlements` endpoint and column definitions
  - Use "use client" directive for client-side rendering
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Create Units Sold list page
- [x] 5.1 Define UnitSold TypeScript interface
  - Create `src/types/unit-sold.types.ts` file
  - Define UnitSold interface based on API response structure
  - Include fields: id, productId, productName, quantity, price, currency, date, orderId
  - Add index signature for additional fields: [key: string]: any
  - Export interface for use in components
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.2 Create units sold list page component
  - Create `src/app/units-sold/list/page.tsx` file
  - Import DataGrid component and UnitSold type
  - Import Breadcrumb component from `src/components/Breadcrumbs/Breadcrumb.tsx`
  - Define column definitions array with appropriate columns and render functions
  - Render Breadcrumb with "Units Sold" title
  - Render DataGrid with `/api/units_solds` endpoint and column definitions
  - Use "use client" directive for client-side rendering
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4_
