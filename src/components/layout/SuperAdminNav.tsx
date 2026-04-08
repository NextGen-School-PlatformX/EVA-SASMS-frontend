'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import {
    useTheme, IconButton, Button, Avatar, Menu, MenuItem,
    Divider, Drawer, List, ListItem, ListItemButton,
    ListItemText, ListItemIcon, Badge
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { alpha } from '@mui/material/styles';
import { useAuth } from '@/src/context/AuthContext';
import { useColorMode } from './ThemeProviderWrapper';

const GOLD = '#FFC600';

const ADMIN_LINKS = [
    { label: 'Overview', href: '/superadmin', icon: <DashboardIcon /> },
    { label: 'Users', href: '/superadmin/users', icon: <PeopleIcon /> },
    { label: 'Students', href: '/superadmin/students', icon: <SchoolIcon /> },
    { label: 'Departments', href: '/superadmin/departments', icon: <BusinessIcon /> },
    { label: 'Admissions', href: '/superadmin/admissions', icon: <AppRegistrationIcon /> },
    { label: 'Finances', href: '/superadmin/finances', icon: <AccountBalanceWalletIcon /> },
    { label: 'Complaints', href: '/superadmin/complaints', icon: <SupportAgentIcon /> },
    { label: 'Activities', href: '/superadmin/activities', icon: <LocalActivityIcon /> },
    { label: 'Attendance', href: '/admin/emp-attendance', icon: <FactCheckIcon /> },
    { label: 'Reports', href: '/superadmin/reports', icon: <AssessmentIcon /> },
    { label: 'Audit Logs', href: '/superadmin/audit', icon: <HistoryIcon /> },
    { label: 'Settings', href: '/superadmin/settings', icon: <SettingsIcon /> },
];

export function SuperAdminNav() {
    const theme = useTheme();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const isDark = mode === 'dark';
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const { getNotifications } = await import('@/src/lib/api/superadminApi');
                const data = await getNotifications();
                setNotifications(data);
            } catch (e) { }
        };
        fetchNotifs();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotifClick = async (notif: any) => {
        try {
            const { markNotificationRead } = await import('@/src/lib/api/superadminApi');
            await markNotificationRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        } catch (e) { }
        setNotifAnchorEl(null);
        if (notif.link) router.push(notif.link);
    };

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const DrawerList = (
        <Box sx={{ width: 270 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0A0A0A, #1a1a0a)', borderBottom: `2px solid ${GOLD}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#000' }}>SA</Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.01em' }}>SASMS</Typography>
                        <Typography variant="caption" sx={{ color: alpha(GOLD, 0.7), fontWeight: 600 }}>Super Admin</Typography>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ bgcolor: isDark ? '#0d0d0d' : '#fafafa', minHeight: '100%' }}>
                <List sx={{ pt: 1 }}>
                    {ADMIN_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/superadmin' && pathname.startsWith(link.href));
                        return (
                            <ListItem key={link.href} disablePadding sx={{ px: 1, py: 0.2 }}>
                                <ListItemButton component={Link} href={link.href} selected={isActive}
                                    sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: alpha(GOLD, 0.12), '&:hover': { bgcolor: alpha(GOLD, 0.18) } }, '&:hover': { bgcolor: alpha(GOLD, 0.06) } }}>
                                    <ListItemIcon sx={{ color: isActive ? GOLD : 'text.secondary', minWidth: 38 }}>{link.icon}</ListItemIcon>
                                    <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, color: isActive ? GOLD : 'text.primary', fontSize: 14 }} />
                                    {isActive && <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: GOLD, ml: 1 }} />}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box sx={{
            width: '100%', position: 'sticky', top: 0, zIndex: 1100,
            backdropFilter: 'blur(24px)',
            backgroundColor: isDark ? alpha('#0A0A0A', 0.92) : alpha('#fff', 0.92),
            borderBottom: `1px solid ${alpha(GOLD, 0.2)}`,
            boxShadow: isDark ? `0 1px 0 ${alpha(GOLD, 0.1)}, 0 4px 20px rgba(0,0,0,0.4)` : `0 1px 0 ${alpha(GOLD, 0.15)}, 0 4px 20px rgba(0,0,0,0.05)`,
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 2, md: 3 }, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                {/* Left */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '0 0 auto' }}>
                    <IconButton color="inherit" onClick={toggleDrawer(true)} sx={{ display: { md: 'none' } }}><MenuIcon /></IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#000', flexShrink: 0 }}>SA</Box>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.08em', color: isDark ? '#fff' : '#000', display: 'block', lineHeight: 1 }}>SASMS</Typography>
                            <Typography variant="caption" sx={{ fontSize: 9, color: alpha(GOLD, 0.8), fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1, textTransform: 'uppercase' }}>Super Admin</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ width: 1, height: 28, bgcolor: alpha(GOLD, 0.2), display: { xs: 'none', md: 'block' }, mx: 0.5 }} />
                </Box>

                {/* Center Nav */}
                <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 0.25, flexWrap: 'wrap', overflow: 'hidden' }}>
                    {ADMIN_LINKS.slice(0, 8).map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/superadmin' && pathname.startsWith(link.href));
                        return (
                            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.75, borderRadius: 2, cursor: 'pointer', transition: 'all 0.2s',
                                    bgcolor: isActive ? alpha(GOLD, 0.1) : 'transparent',
                                    border: `1px solid ${isActive ? alpha(GOLD, 0.3) : 'transparent'}`,
                                    '&:hover': { bgcolor: alpha(GOLD, 0.07), border: `1px solid ${alpha(GOLD, 0.2)}` }
                                }}>
                                    <Box sx={{ color: isActive ? GOLD : 'text.secondary', display: 'flex', '& svg': { fontSize: 15 } }}>{link.icon}</Box>
                                    <Typography variant="body2" sx={{ color: isActive ? GOLD : 'text.secondary', fontWeight: isActive ? 700 : 500, fontSize: 12.5, whiteSpace: 'nowrap' }}>{link.label}</Typography>
                                </Box>
                            </Link>
                        );
                    })}
                </Box>

                {/* Right */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: '0 0 auto' }}>
                    <IconButton size="small" onClick={toggleColorMode} sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
                        {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={(e) => setNotifAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
                        <Badge badgeContent={unreadCount} color="error"><NotificationsIcon fontSize="small" /></Badge>
                    </IconButton>

                    <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={() => setNotifAnchorEl(null)}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        PaperProps={{ sx: { bgcolor: isDark ? '#111' : '#fff', border: `1px solid ${alpha(GOLD, 0.2)}`, borderRadius: 2, minWidth: 280 } }}>
                        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(GOLD, 0.1)}` }}>
                            <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
                        </Box>
                        {notifications.slice(0, 5).map(n => (
                            <MenuItem key={n.id} onClick={() => handleNotifClick(n)} sx={{ opacity: n.read ? 0.6 : 1, '&:hover': { bgcolor: alpha(GOLD, 0.06) } }}>
                                <Box><Typography variant="body2">{n.text}</Typography><Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography></Box>
                            </MenuItem>
                        ))}
                        <Divider sx={{ borderColor: alpha(GOLD, 0.1) }} />
                        <MenuItem onClick={() => { setNotifAnchorEl(null); router.push('/superadmin/notifications'); }} sx={{ justifyContent: 'center', '&:hover': { bgcolor: alpha(GOLD, 0.06) } }}>
                            <Typography variant="caption" sx={{ color: GOLD, fontWeight: 700 }}>View All</Typography>
                        </MenuItem>
                    </Menu>

                    <Box sx={{ width: 1, height: 24, bgcolor: alpha(GOLD, 0.2), mx: 0.5 }} />

                    <Box onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2.5, px: 1.5, py: 0.75, bgcolor: alpha(GOLD, 0.1), border: `1px solid ${alpha(GOLD, 0.25)}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: alpha(GOLD, 0.15), borderColor: alpha(GOLD, 0.5) } }}>
                        <Avatar sx={{ width: 28, height: 28, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontSize: 11, fontWeight: 900 }}>SA</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#fff' : '#000', display: { xs: 'none', sm: 'block' }, fontSize: 13 }}>{user?.name || 'Super Admin'}</Typography>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{ sx: { bgcolor: isDark ? '#111' : '#fff', border: `1px solid ${alpha(GOLD, 0.2)}`, borderRadius: 2, minWidth: 200, '& .MuiMenuItem-root': { fontSize: 14, fontWeight: 500, py: 1.25, borderRadius: 1.5, mx: 0.5, '&:hover': { bgcolor: alpha(GOLD, 0.08), color: GOLD } } } }}>
                        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(GOLD, 0.1)}` }}>
                            <Typography variant="body2" fontWeight={700}>{user?.name || 'Super Admin'}</Typography>
                            <Typography variant="caption" color="text.secondary">Super Administrator</Typography>
                        </Box>
                        <MenuItem component={Link} href="/superadmin/profile" onClick={() => setAnchorEl(null)}>System Profile</MenuItem>
                        <Divider sx={{ borderColor: alpha(GOLD, 0.1), my: 0.5 }} />
                        <MenuItem onClick={() => { setAnchorEl(null); logout(); }} sx={{ color: '#f44336 !important' }}>Sign Out</MenuItem>
                    </Menu>
                </Box>
            </Box>

            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>{DrawerList}</Drawer>
        </Box>
    );
}
