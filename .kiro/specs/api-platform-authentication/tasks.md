# Implementation Plan

- [x] 1. Set up core authentication infrastructure
  - Create token storage utility with localStorage implementation
  - Create API client with automatic bearer token injection and 401 handling
  - Add environment variables for API Platform configuration
  - _Requirements: 1.1, 2.1, 2.4, 4.1, 4.2_

- [x] 2. Implement authentication service
  - [x] 2.1 Create auth service with login method
    - Write login function that calls API Platform /auth/login endpoint
    - Handle successful authentication response and token storage
    - Transform and return user data from API response
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.2 Implement logout functionality
    - Write logout method that clears tokens from storage
    - Handle cleanup of authentication state
    - _Requirements: 3.1, 3.3_
  
  - [x] 2.3 Add token refresh logic
    - Implement token refresh method for expired tokens
    - Handle refresh token storage and retrieval
    - _Requirements: 2.2_

- [x] 3. Create authentication context and provider
  - [x] 3.1 Build Auth Context with state management
    - Create React context with user, isAuthenticated, and isLoading state
    - Implement login, logout, and refreshAuth methods
    - Add initial auth state hydration on app load
    - _Requirements: 2.1, 2.2, 5.1, 5.2_
  
  - [x] 3.2 Wrap application with Auth Provider
    - Add AuthProvider to root layout
    - Ensure context is available throughout the app
    - _Requirements: 2.1_

- [x] 4. Update login form and page
  - [x] 4.1 Modify SigninWithPassword component
    - Remove Kinde integration code
    - Connect form to Auth Context login method
    - Add Zod validation for email and password fields
    - Implement error state display for validation and API errors
    - Add loading state during authentication
    - _Requirements: 1.1, 1.4, 1.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.2 Update login page
    - Remove Kinde LoginLink and RegisterLink components
    - Replace with custom SigninWithPassword form
    - Update page layout and styling
    - _Requirements: 1.1_

- [x] 5. Implement route protection
  - [x] 5.1 Create ProtectedRoute component
    - Build wrapper component that checks authentication state
    - Redirect to login page if not authenticated
    - Show loading state while checking auth
    - _Requirements: 4.3_
  
  - [x] 5.2 Add Next.js middleware for server-side protection
    - Create middleware.ts to validate token presence
    - Define protected and public route patterns
    - Redirect unauthenticated requests to login
    - _Requirements: 4.3_
  
  - [x] 5.3 Protect dashboard and other authenticated routes
    - Wrap dashboard layout with ProtectedRoute
    - Apply protection to other authenticated pages
    - _Requirements: 4.3_

- [x] 6. Handle API request authentication
  - [x] 6.1 Update existing API calls to use new API client
    - Replace fetch calls with API client methods
    - Ensure bearer token is automatically included
    - _Requirements: 4.1, 4.2_
  
  - [x] 6.2 Implement automatic logout on 401 responses
    - Add response interceptor to detect 401 status
    - Clear auth state and redirect to login
    - _Requirements: 4.4_

- [x] 7. Clean up Kinde integration
  - [x] 7.1 Remove Kinde dependencies and files
    - Uninstall @kinde-oss/kinde-auth-nextjs package
    - Delete Kinde auth route handler at src/app/api/auth/[kindeAuth]/route.js
    - Remove unused Kinde provider files
    - _Requirements: N/A (cleanup task)_
  
  - [x] 7.2 Update imports and references
    - Remove Kinde imports from components
    - Update any remaining Kinde-specific code
    - _Requirements: N/A (cleanup task)_

- [x] 8. Add logout UI component
  - Create logout button component
  - Connect to Auth Context logout method
  - Add to dashboard header or user menu
  - _Requirements: 3.1, 3.2_

- [ ]* 9. Write integration tests for authentication flow
  - Test complete login flow from form submission to dashboard
  - Test logout flow and session cleanup
  - Test protected route access scenarios
  - Test token refresh on expiration
  - _Requirements: All requirements_
