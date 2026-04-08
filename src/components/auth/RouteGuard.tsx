'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth, type UserRole } from '@/src/context/AuthContext';

const ROLE_PATHS: Record<string, string> = {
  ADMIN: '/admin',
  SUPER_ADMIN: '/superadmin',
  APPLICANT: '/applicant/dashboard',
  STUDENT: '/student',
};

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  /** Additional roles that may access this route (e.g. SUPER_ADMIN for admin pages) */
  alsoAllow?: UserRole[];
}

export function RouteGuard({ children, requiredRole, alsoAllow }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, role } = useAuth();

  const hasAccess = role === requiredRole || (alsoAllow && role && alsoAllow.includes(role));

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !role) {
      router.replace('/login');
      return;
    }

    if (!hasAccess) {
      const correctPath = ROLE_PATHS[role];
      router.replace(correctPath);
    }
  }, [loading, isAuthenticated, role, requiredRole, alsoAllow, hasAccess, router, pathname]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !role || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
