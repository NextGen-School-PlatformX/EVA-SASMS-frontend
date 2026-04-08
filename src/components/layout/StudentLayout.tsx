'use client';

import { RouteGuard } from '@/src/components/auth/RouteGuard';
import { UnifiedNav } from './UnifiedNav';
import { PageBackground } from './PageBackground';

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="STUDENT">
      <PageBackground>
        <UnifiedNav role="STUDENT" />
        <main style={{ padding: '24px 20px 48px', maxWidth: 1440, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </PageBackground>
    </RouteGuard>
  );
}
