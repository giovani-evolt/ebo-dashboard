# Implementation Plan

- [x] 1. Extend Auth Service with registration methods
  - Add `register()` method to create new users via API Platform
  - Add `createSeller()` method to create seller with JWT token
  - Implement error handling and transformation for registration endpoints
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2. Extend Auth Context with signup orchestration
  - Add `signup()` method to AuthContext that orchestrates the full registration flow
  - Implement sequential flow: create user → auto-login → create seller → redirect
  - Add state management for registration process steps
  - Handle errors at each step with appropriate user feedback
  - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 6.1, 6.2_

- [x] 3. Create form validation schemas and utilities
  - Extend Zod schemas in `src/app/lib/definitions.ts` for registration form
  - Add validation for firstName, lastName, confirmPassword, and sellerName fields
  - Create validation utility functions for real-time field validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4. Implement SignUpForm component
- [x] 4.1 Create form component structure with all required fields
  - Create `src/components/Auth/SignUp/index.tsx` with form fields for email, password, confirmPassword, firstName, lastName, sellerName
  - Implement controlled form inputs with state management
  - Add form layout and styling consistent with existing auth forms
  - _Requirements: 1.1, 2.1, 10.1, 10.2_

- [x] 4.2 Implement client-side validation and error display
  - Add field-level validation on blur events
  - Implement real-time validation feedback with error messages
  - Add visual indicators for valid/invalid fields
  - Display inline error messages below each field
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4.3 Implement form submission and loading states
  - Connect form to AuthContext signup method
  - Add loading state management during registration process
  - Disable submit button while form is invalid or submitting
  - Show progress indicators for each registration step
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.5_

- [x] 4.4 Implement error handling and recovery
  - Handle API errors from user creation, login, and seller creation
  - Display appropriate error messages for different error types
  - Maintain form data after errors (except passwords)
  - Clear password fields after errors for security
  - Allow user to retry after errors
  - _Requirements: 3.4, 3.5, 4.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Create signup page
  - Create `src/app/(auth)/signup/page.tsx` using existing auth layout
  - Integrate SignUpForm component
  - Add navigation link to login page
  - Ensure proper routing and layout consistency
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 6. Update login page with signup link
  - Add "Don't have an account? Sign up" link to login page
  - Ensure bidirectional navigation between login and signup
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 7. Implement redirect to dashboard after successful registration
  - Add router navigation to `/dashboard` after seller creation
  - Ensure user state is properly set before redirect
  - Verify dashboard displays user and seller information
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 8. Add TypeScript interfaces and types
  - Create interfaces for RegistrationFormData, RegistrationData, Seller
  - Add types for form errors and validation states
  - Export types from appropriate modules
  - _Requirements: All requirements (type safety)_

- [ ]* 9. Set up testing infrastructure
  - Install testing dependencies (Vitest, React Testing Library, MSW for API mocking)
  - Create test configuration files (vitest.config.ts)
  - Set up test utilities and helpers
  - Configure test scripts in package.json
  - _Requirements: All requirements (testing foundation)_

- [ ]* 10. Write integration tests for registration flow
- [ ]* 10.1 Test successful registration flow
  - Test complete registration flow: form submission → user creation → auto-login → seller creation → redirect
  - Verify all form fields are properly submitted
  - Verify progress indicators display correctly during each step
  - Verify redirect to dashboard occurs after successful registration
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.3_

- [ ]* 10.2 Test form validation scenarios
  - Test client-side validation for all fields (email, password, names, seller name)
  - Test validation triggers on blur events
  - Test error messages display correctly
  - Test visual indicators for valid/invalid fields
  - Test submit button disabled state with invalid form
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 10.3 Test error handling scenarios
  - Test duplicate email error (409 response)
  - Test network error handling
  - Test server error handling (500 response)
  - Test auto-login failure with redirect to login page
  - Test seller creation failure with user remaining authenticated
  - Test password fields cleared after errors
  - Test form data preserved (except passwords) after errors
  - _Requirements: 3.4, 3.5, 4.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5_
