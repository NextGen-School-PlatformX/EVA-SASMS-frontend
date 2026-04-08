'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, Avatar, Menu, MenuItem, Divider, Drawer, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SchoolIcon from '@mui/icons-material/School';
import PaymentsIcon from '@mui/icons-material/Payments';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { useColorMode } from './ThemeProviderWrapper';
import { useBranding, getLogoUrl } from '@/src/context/BrandingContext';
import { apiClient } from '@/src/lib/api/client';

const GOLD = '#FFC600';

type NavRole = 'ADMIN' | 'SUPER_ADMIN' | 'STUDENT' | 'APPLICANT';

const NAV_CONFIG: Record<NavRole, { label: string; href: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
    { label: 'Admissions', href: '/admin/admissions', icon: <AppRegistrationIcon sx={{ fontSize: 16 }} /> },
    { label: 'Students', href: '/admin/affairs', icon: <GroupsIcon sx={{ fontSize: 16 }} /> },
    { label: 'Finances', href: '/admin/finances', icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} /> },
    { label: 'Events', href: '/admin/events', icon: <EventIcon sx={{ fontSize: 16 }} /> },
    { label: 'Attendance', href: '/admin/attendance', icon: <FactCheckIcon sx={{ fontSize: 16 }} /> },
    { label: 'Analytics', href: '/admin/emp-attendance', icon: <FactCheckIcon sx={{ fontSize: 16 }} /> },
    { label: 'Complaints', href: '/admin/complaints', icon: <ReportProblemIcon sx={{ fontSize: 16 }} /> },
  ],
  SUPER_ADMIN: [
    { label: 'Overview', href: '/superadmin', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
    { label: 'Users', href: '/superadmin/users', icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
    { label: 'Students', href: '/superadmin/students', icon: <GroupsIcon sx={{ fontSize: 16 }} /> },
    { label: 'Departments', href: '/superadmin/departments', icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
    { label: 'Admissions', href: '/superadmin/admissions', icon: <AppRegistrationIcon sx={{ fontSize: 16 }} /> },
    { label: 'Finances', href: '/superadmin/finances', icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} /> },
    { label: 'Teacher of Month', href: '/superadmin/teacher-of-month', icon: <BadgeIcon sx={{ fontSize: 16 }} /> },
    { label: 'Complaints', href: '/superadmin/complaints', icon: <ReportProblemIcon sx={{ fontSize: 16 }} /> },
    { label: 'Attendance', href: '/superadmin/attendance', icon: <FactCheckIcon sx={{ fontSize: 16 }} /> },
    { label: 'Reports', href: '/superadmin/reports', icon: <AssessmentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Audit', href: '/superadmin/audit', icon: <HistoryIcon sx={{ fontSize: 16 }} /> },
    { label: 'Settings', href: '/superadmin/settings', icon: <SettingsIcon sx={{ fontSize: 16 }} /> },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
    { label: 'Admissions', href: '/student/admissions', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
    { label: 'Financial', href: '/student/fees', icon: <PaymentsIcon sx={{ fontSize: 16 }} /> },
    { label: 'Attendance', href: '/student/attendance', icon: <FactCheckIcon sx={{ fontSize: 16 }} /> },
    { label: 'Support', href: '/student/complaints', icon: <SupportAgentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Activities', href: '/student/activities', icon: <LocalActivityIcon sx={{ fontSize: 16 }} /> },
    { label: 'Alerts', href: '/student/notifications', icon: <NotificationsIcon sx={{ fontSize: 16 }} /> },
  ],
  APPLICANT: [
    { label: 'Dashboard', href: '/applicant/dashboard', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
    { label: 'Support', href: '/applicant/support', icon: <SupportAgentIcon sx={{ fontSize: 16 }} /> },
  ],
};

const ROLE_LABELS: Record<NavRole, string> = {
  ADMIN: 'Admin Portal',
  SUPER_ADMIN: 'SuperAdmin',
  STUDENT: 'Student Portal',
  APPLICANT: 'Applicant Portal',
};

const PROFILE_LINKS: Record<NavRole, string> = {
  ADMIN: '/admin/profile',
  SUPER_ADMIN: '/superadmin/profile',
  STUDENT: '/student/profile',
  APPLICANT: '/applicant/dashboard',
};

interface UnifiedNavProps {
  role: NavRole;
}

export function UnifiedNav({ role }: UnifiedNavProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const branding = useBranding();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isDark = mode === 'dark';

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient<{ avatarUrl?: string }>('/auth/me')
      .then((me) => me.avatarUrl && setAvatarUrl(me.avatarUrl))
      .catch(() => {});
  }, [isAuthenticated]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const links = NAV_CONFIG[role] ?? [];
  const roleLabel = ROLE_LABELS[role];
  const profileHref = PROFILE_LINKS[role];

  const navBg = isDark ? 'rgba(6,6,14,0.88)' : 'rgba(255,255,255,0.88)';
  const border = isDark ? `1px solid rgba(255,198,0,0.1)` : `1px solid rgba(0,0,0,0.07)`;
  const shadow = isDark
    ? `0 1px 0 rgba(255,198,0,0.08), 0 4px 24px rgba(0,0,0,0.4)`
    : `0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)`;

  const isActive = (href: string) =>
    pathname === href || (href !== `/${role.toLowerCase().replace('_', '')}` && href !== '/admin' && href !== '/superadmin' && pathname.startsWith(href))
    || (href === '/admin' && pathname === '/admin')
    || (href === '/superadmin' && pathname === '/superadmin')
    || (href === '/student' && pathname === '/student');

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1200, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: navBg,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderBottom: border,
        boxShadow: shadow,
      }}>
        {/* LEFT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <IconButton onClick={() => setDrawerOpen(true)} size="small"
            sx={{ display: { md: 'none' }, color: 'text.secondary' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Link href={links[0]?.href ?? '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32,
              background: branding.logoUrl ? 'transparent' : `linear-gradient(135deg, ${branding.primaryColor || GOLD}, #FF9500)`,
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: '#000', flexShrink: 0,
              boxShadow: branding.logoUrl ? 'none' : `0 4px 14px ${GOLD}44`,
              overflow: 'hidden',
            }}>
              {branding.logoUrl ? (
                <img src={getLogoUrl(branding.logoUrl)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                'S'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.06em', color: isDark ? '#fff' : '#000' }}>SASMS</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>{roleLabel}</span>
            </div>
          </Link>
          <div style={{ width: 1, height: 24, background: isDark ? 'rgba(255,198,0,0.15)' : 'rgba(0,0,0,0.09)', margin: '0 4px', flexShrink: 0 }} />
        </div>

        {/* CENTER - links desktop */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, overflowX: 'auto', overflowY: 'hidden', padding: '0 4px', flexWrap: 'wrap' }}
          className="unified-nav-links">
          {links.map(link => {
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                  background: active ? alpha(GOLD, 0.1) : 'transparent',
                  border: `1px solid ${active ? alpha(GOLD, 0.28) : 'transparent'}`,
                  color: active ? GOLD : isDark ? 'rgba(255,255,255,0.52)' : 'rgba(0,0,0,0.48)',
                  fontWeight: active ? 700 : 500, fontSize: 12.5,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.16s ease',
                }}>
                  <span style={{ color: 'inherit', display: 'flex' }}>{link.icon}</span>
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Tooltip title="Toggle theme">
            <IconButton size="small" onClick={toggleColorMode}
              sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,198,0,0.12)' : 'rgba(0,0,0,0.09)' }} />

          {isAuthenticated && user ? (
            <>
              <div onClick={e => setAnchorEl(e.currentTarget)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 20, padding: '5px 12px 5px 5px',
                background: isDark ? alpha(GOLD, 0.08) : alpha(GOLD, 0.07),
                border: `1px solid ${alpha(GOLD, 0.22)}`,
                cursor: 'pointer', transition: 'all 0.16s',
              }}>
                <Avatar
                  src={avatarUrl ? getLogoUrl(avatarUrl) : undefined}
                  sx={{
                    width: 26, height: 26,
                    background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                    color: '#000', fontSize: 11, fontWeight: 900,
                  }}
                >
                  {!avatarUrl && (user.name ? user.name.charAt(0).toUpperCase() : role[0])}
                </Avatar>
                <span style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: isDark ? '#fff' : '#111',
                  maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.name?.split(' ')[0] ?? role}
                </span>
              </div>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1, border: `1px solid ${alpha(GOLD, 0.18)}`,
                    boxShadow: `0 10px 36px rgba(0,0,0,0.2)`,
                    borderRadius: 2.5, minWidth: 210,
                    bgcolor: isDark ? '#0e0e18' : '#fff',
                  }
                }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${alpha(GOLD, 0.1)}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', marginTop: 2 }}>{user.email}</div>
                  <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{roleLabel}</div>
                </div>
                <MenuItem component={Link} href={profileHref} onClick={() => setAnchorEl(null)}
                  sx={{ fontSize: 13, py: 1.25, mx: 0.5, borderRadius: 1.5, '&:hover': { bgcolor: alpha(GOLD, 0.07), color: GOLD } }}>
                  View Profile
                </MenuItem>
                <Divider sx={{ borderColor: alpha(GOLD, 0.1), my: 0.5 }} />
                <MenuItem onClick={() => { setAnchorEl(null); logout(); }}
                  sx={{ fontSize: 13, py: 1.25, mx: 0.5, borderRadius: 1.5, color: '#f44336', '&:hover': { bgcolor: 'rgba(244,67,54,0.06)' } }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                color: '#000', border: 'none', borderRadius: 8,
                padding: '7px 16px', fontWeight: 800, fontSize: 12.5, cursor: 'pointer',
              }}>Sign In</button>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 275, bgcolor: isDark ? '#08080f' : '#fff', borderRight: `1px solid ${alpha(GOLD, 0.14)}` } }}>
        <div style={{ padding: '18px 14px', borderBottom: `1px solid ${alpha(GOLD, 0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: branding.logoUrl ? 'transparent' : `linear-gradient(135deg, ${GOLD}, #FF9500)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: '#000', overflow: 'hidden' }}>
              {branding.logoUrl ? <img src={getLogoUrl(branding.logoUrl)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : 'S'}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: isDark ? '#fff' : '#000' }}>SASMS</div>
              <div style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>{roleLabel}</div>
            </div>
          </div>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div style={{ padding: '8px 8px' }}>
          {links.map(link => {
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={() => setDrawerOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 10, marginBottom: 2,
                  background: active ? alpha(GOLD, 0.1) : 'transparent',
                  border: `1px solid ${active ? alpha(GOLD, 0.24) : 'transparent'}`,
                  color: active ? GOLD : (isDark ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.62)'),
                  fontWeight: active ? 700 : 500, fontSize: 13.5,
                  transition: 'all 0.14s',
                }}>
                  <span style={{ color: 'inherit', display: 'flex' }}>{link.icon}</span>
                  {link.label}
                  {active && <div style={{ marginLeft: 'auto', width: 4, height: 18, background: GOLD, borderRadius: 4 }} />}
                </div>
              </Link>
            );
          })}
        </div>
        {isAuthenticated && user && (
          <div style={{ margin: '8px', padding: '12px 14px', borderRadius: 10, background: alpha(GOLD, 0.06), border: `1px solid ${alpha(GOLD, 0.14)}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,198,0,0.7)', marginTop: 2 }}>{roleLabel}</div>
            <button onClick={logout} style={{ marginTop: 10, width: '100%', background: 'rgba(244,67,54,0.12)', border: '1px solid rgba(244,67,54,0.25)', color: '#f44336', borderRadius: 7, padding: '8px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        )}
      </Drawer>

      <style>{`
        @media (max-width: 899px) { .unified-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}
