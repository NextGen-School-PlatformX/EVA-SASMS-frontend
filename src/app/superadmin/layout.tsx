'use client';

import { RouteGuard } from '@/src/components/auth/RouteGuard';
import { UnifiedNav } from '@/src/components/layout/UnifiedNav';
import { PageBackground } from '@/src/components/layout/PageBackground';
import { NotificationProvider } from '@/src/context/NotificationContext';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="SUPER_ADMIN">
      <NotificationProvider>
        <PageBackground>
          <UnifiedNav role="SUPER_ADMIN" />
          <main style={{ padding: '24px 20px 48px', maxWidth: 1600, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {children}
          </main>
        </PageBackground>
      </NotificationProvider>
    </RouteGuard>
  );
}
