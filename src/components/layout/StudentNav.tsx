'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, IconButton, Avatar, Menu, MenuItem, Divider, Drawer, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PaymentsIcon from '@mui/icons-material/Payments';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { alpha } from '@mui/material/styles';
import { useAuth } from '@/src/context/AuthContext';
import { useColorMode } from './ThemeProviderWrapper';

const GOLD = '#FFC600';

const LINKS = [
  { label: 'Dashboard', href: '/student', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
  { label: 'Admissions', href: '/student/admissions', icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
  { label: 'Financial', href: '/student/fees', icon: <PaymentsIcon sx={{ fontSize: 16 }} /> },
  { label: 'Attendance', href: '/student/attendance', icon: <FactCheckIcon sx={{ fontSize: 16 }} /> },
  { label: 'Support', href: '/student/complaints', icon: <SupportAgentIcon sx={{ fontSize: 16 }} /> },
  { label: 'Activities', href: '/student/activities', icon: <LocalActivityIcon sx={{ fontSize: 16 }} /> },
  { label: 'Alerts', href: '/student/notifications', icon: <NotificationsIcon sx={{ fontSize: 16 }} /> },
];

export function StudentNav() {
  const theme = useTheme();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navBg = isDark ? 'rgba(8,8,16,0.92)' : 'rgba(255,255,255,0.92)';
  const navBorder = isDark ? `1px solid rgba(255,198,0,0.1)` : `1px solid rgba(0,0,0,0.06)`;

  return (
    <>
      {/* NAV BAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1200,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: navBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: navBorder,
        boxShadow: isDark ? `0 1px 0 rgba(255,198,0,0.08), 0 4px 20px rgba(0,0,0,0.35)` : `0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`,
      }}>
        {/* LEFT: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <IconButton onClick={() => setDrawerOpen(true)} size="small" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>
            <MenuIcon fontSize="small" />
          </IconButton>
          <Link href="/student" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 30, height: 30, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 13, color: '#000', flexShrink: 0,
              boxShadow: `0 4px 12px ${GOLD}44`,
            }}>S</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.08em', color: isDark ? '#fff' : '#000' }}>SASMS</span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: GOLD, textTransform: 'uppercase' }}>Student Portal</span>
            </div>
          </Link>
          <div style={{ width: 1, height: 24, background: isDark ? 'rgba(255,198,0,0.15)' : 'rgba(0,0,0,0.08)', margin: '0 4px' }} />
        </div>

        {/* CENTER: Links (desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center', overflow: 'hidden' }}
          className="student-nav-links">
          {LINKS.map(link => {
            const isActive = pathname === link.href || (link.href !== '/student' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 8, cursor: 'pointer',
                  background: isActive ? `rgba(255,198,0,0.1)` : 'transparent',
                  border: `1px solid ${isActive ? `rgba(255,198,0,0.3)` : 'transparent'}`,
                  transition: 'all 0.18s',
                  color: isActive ? GOLD : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'),
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 12.5,
                  letterSpacing: isActive ? '0.01em' : 0,
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ color: 'inherit', display: 'flex' }}>{link.icon}</span>
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton size="small" onClick={toggleColorMode} sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,198,0,0.15)' : 'rgba(0,0,0,0.08)' }} />
          {isAuthenticated && user ? (
            <>
              <div onClick={e => setAnchorEl(e.currentTarget)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 20, padding: '5px 12px 5px 5px',
                background: isDark ? 'rgba(255,198,0,0.08)' : 'rgba(255,198,0,0.07)',
                border: `1px solid rgba(255,198,0,0.2)`,
                cursor: 'pointer', transition: 'all 0.18s',
              }}>
                <Avatar sx={{ width: 26, height: 26, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontSize: 11, fontWeight: 900 }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </Avatar>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isDark ? '#fff' : '#111', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0] ?? 'Student'}
                </span>
              </div>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ elevation: 0, sx: { mt: 1, border: `1px solid ${alpha(GOLD, 0.2)}`, boxShadow: `0 8px 32px rgba(0,0,0,0.18)`, borderRadius: 2, minWidth: 200, bgcolor: isDark ? '#111' : '#fff' } }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${alpha(GOLD, 0.1)}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#111' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)' }}>{user.email}</div>
                </div>
                <MenuItem component={Link} href="/student/profile" onClick={() => setAnchorEl(null)} sx={{ fontSize: 13, py: 1.2 }}>View Profile</MenuItem>
                <Divider sx={{ borderColor: alpha(GOLD, 0.1) }} />
                <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ fontSize: 13, py: 1.2, color: '#f44336' }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>Sign In</button>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 270, bgcolor: isDark ? '#0a0a10' : '#fff', borderRight: `1px solid ${alpha(GOLD, 0.15)}` } }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${alpha(GOLD, 0.12)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#000' }}>S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: isDark ? '#fff' : '#000' }}>SASMS</div>
              <div style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>Student Portal</div>
            </div>
          </div>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}><CloseIcon fontSize="small" /></IconButton>
        </div>
        <div style={{ padding: '8px 8px' }}>
          {LINKS.map(link => {
            const isActive = pathname === link.href || (link.href !== '/student' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }} onClick={() => setDrawerOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 2,
                  background: isActive ? alpha(GOLD, 0.1) : 'transparent',
                  border: `1px solid ${isActive ? alpha(GOLD, 0.25) : 'transparent'}`,
                  color: isActive ? GOLD : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'),
                  fontWeight: isActive ? 700 : 500, fontSize: 13.5, transition: 'all 0.15s',
                }}>
                  <span style={{ color: 'inherit', display: 'flex' }}>{link.icon}</span>
                  {link.label}
                  {isActive && <div style={{ marginLeft: 'auto', width: 4, height: 18, background: GOLD, borderRadius: 4 }} />}
                </div>
              </Link>
            );
          })}
        </div>
      </Drawer>

      <style>{`
        @media (max-width: 899px) { .student-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}
