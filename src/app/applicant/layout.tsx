'use client';

import { UnifiedNav } from '@/src/components/layout/UnifiedNav';
import { PageBackground } from '@/src/components/layout/PageBackground';

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageBackground>
      <UnifiedNav role="APPLICANT" />
      <main style={{ padding: '32px 20px 48px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>
    </PageBackground>
  );
}
