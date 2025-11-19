# Implementation Plan

- [x] 1. Create utility function for financial data extraction
  - Create `src/lib/financial-data-utils.ts` with function to extract last month values from FinancialData
  - Implement validation helper to check if FinancialData structure is valid
  - Add TypeScript types for the utility function return values
  - _Requirements: 1.1, 2.2_

- [x] 2. Update FinancialInformation component to receive data as prop
  - Remove `useEffect` and `useState` hooks for internal data fetching
  - Update component props to require `data: FinancialData` as a required prop
  - Remove internal loading state logic (spinner)
  - Keep all existing chart rendering and visualization logic unchanged
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Update OverviewCardsGroup component to use shared financial data
  - Add "use client" directive to convert from Server Component to Client Component
  - Add prop to receive `financialData: FinancialData`
  - Import and use utility function to extract last month values
  - Remove the `getOverviewData()` async call
  - Map extracted financial data to the card data structure (gross → views, taxes → profit, frsh → products, disc → users)
  - Set growthRate to 0 for all cards initially (can be enhanced later)
  - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Update Dashboard Page to fetch and distribute data
  - Import `getFinancialInformationData` from charts services
  - Call `getFinancialInformationData()` at the top level of the async component
  - Add try-catch block for error handling
  - Pass fetched data to OverviewCardsGroup component as `financialData` prop
  - Pass fetched data to FinancialInformation component as `data` prop
  - _Requirements: 1.1, 1.2, 1.4, 4.1, 4.2, 4.3_

- [x] 5. Add error handling and validation
  - Create validation function in utility file to check FinancialData structure
  - Add error boundary or error UI component for Dashboard Page
  - Handle empty data arrays gracefully in utility function
  - Add console error logging for debugging
  - _Requirements: 1.4, 5.1, 5.2, 5.5_

- [x] 6. Clean up unused code
  - Remove `getOverviewData()` function from `src/app/dashboard/fetch.ts`
  - Remove unused imports from updated components
  - Remove unused import statements in charts.services.ts
  - _Requirements: 1.1_

- [x] 7. Update Suspense boundaries and loading states
  - Update or remove Suspense boundary for OverviewCardsGroup if needed
  - Ensure OverviewCardsSkeleton is shown during server-side data fetch
  - Verify FinancialInformation shows appropriate loading state
  - _Requirements: 1.3, 5.3, 5.4_
