interface MainLayoutProps {
  children: React.ReactNode;
}

// No 'use client' and no wrapper div — avoids SSR/client hydration mismatch
export function MainLayout({ children }: MainLayoutProps) {
  return <>{children}</>;
}
