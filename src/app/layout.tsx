import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/contexts/auth-context';

/**
 * Root Layout
 * Wraps the entire application with global providers
 */
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
