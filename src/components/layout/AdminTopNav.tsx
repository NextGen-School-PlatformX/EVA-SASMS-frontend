'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Typography from '@mui/material/Typography';
import { useTheme, IconButton, Button, Avatar, Menu, MenuItem, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { alpha } from '@mui/material/styles';
import { useAuth } from '@/src/context/AuthContext';
import { useColorMode } from './ThemeProviderWrapper';

const GOLD = '#FFC600';
const DARK = '#0A0A0A';

const ADMIN_LINKS = [
    { label: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
    { label: 'Admissions', href: '/admin/admissions', icon: <AppRegistrationIcon /> },
    { label: 'Students', href: '/admin/affairs', icon: <GroupsIcon /> },
    { label: 'Finances', href: '/admin/finances', icon: <AccountBalanceWalletIcon /> },
    { label: 'Events', href: '/admin/events', icon: <EventIcon /> },
    { label: 'Attendance', href: '/admin/attendance', icon: <FactCheckIcon /> },
    { label: 'Emp. Attendance', href: '/admin/emp-attendance', icon: <FactCheckIcon /> },
    { label: 'Complaints', href: '/admin/complaints', icon: <ReportProblemIcon /> },
];

export function AdminTopNav() {
    const theme = useTheme();
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const isDark = mode === 'dark';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleToggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) return;
        setDrawerOpen(open);
    };

    const DrawerList = (
        <Box sx={{ width: 270 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            {/* Drawer Header */}
            <Box sx={{
                p: 3, background: `linear-gradient(135deg, ${DARK}, #1a1a0a)`,
                borderBottom: `2px solid ${GOLD}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 16, color: '#000'
                    }}>S</Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.01em' }}>SASMS</Typography>
                        <Typography variant="caption" sx={{ color: alpha(GOLD, 0.7), fontWeight: 600 }}>Admin Portal</Typography>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ bgcolor: isDark ? '#0d0d0d' : '#fafafa', minHeight: '100%' }}>
                <List sx={{ pt: 1 }}>
                    {ADMIN_LINKS.map((link) => {
                        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                        return (
                            <ListItem key={link.href} disablePadding sx={{ px: 1, py: 0.25 }}>
                                <ListItemButton
                                    component={Link} href={link.href} selected={isActive}
                                    sx={{
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            bgcolor: alpha(GOLD, 0.12),
                                            '&:hover': { bgcolor: alpha(GOLD, 0.18) }
                                        },
                                        '&:hover': { bgcolor: alpha(GOLD, 0.06) }
                                    }}>
                                    <ListItemIcon sx={{ color: isActive ? GOLD : 'text.secondary', minWidth: 38 }}>
                                        {link.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={link.label}
                                        primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, color: isActive ? GOLD : 'text.primary', fontSize: 14 }} />
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
            position: 'sticky', top: 0, zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pb: 0, pt: 0, gap: 2, px: { xs: 2, md: 3 },
            height: 64,
            backdropFilter: 'blur(24px)',
            backgroundColor: isDark ? alpha('#0A0A0A', 0.92) : alpha('#fff', 0.92),
            borderBottom: `1px solid ${alpha(GOLD, 0.2)}`,
            boxShadow: isDark
                ? `0 1px 0 ${alpha(GOLD, 0.1)}, 0 4px 20px rgba(0,0,0,0.4)`
                : `0 1px 0 ${alpha(GOLD, 0.15)}, 0 4px 20px rgba(0,0,0,0.05)`,
        }}>
            {/* Left: Logo + Mobile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '0 0 auto' }}>
                <IconButton color="inherit" onClick={toggleDrawer(true)} sx={{ display: { md: 'none' } }}>
                    <MenuIcon />
                </IconButton>
                {/* Logo mark */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'default' }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: 1.5,
                        background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 14, color: '#000',
                        flexShrink: 0,
                    }}>S</Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.08em', color: isDark ? '#fff' : '#000', display: 'block', lineHeight: 1 }}>
                            SASMS
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 9, color: alpha(GOLD, 0.8), fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1, textTransform: 'uppercase' }}>
                            Admin Portal
                        </Typography>
                    </Box>
                </Box>

                {/* Divider */}
                <Box sx={{ width: 1, height: 28, bgcolor: alpha(GOLD, 0.2), display: { xs: 'none', md: 'block' }, mx: 0.5 }} />
            </Box>

            {/* Center: Nav Links */}
            <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {ADMIN_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                    return (
                        <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                px: 1.5, py: 0.75,
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                bgcolor: isActive ? alpha(GOLD, 0.1) : 'transparent',
                                border: `1px solid ${isActive ? alpha(GOLD, 0.3) : 'transparent'}`,
                                '&:hover': {
                                    bgcolor: alpha(GOLD, 0.07),
                                    border: `1px solid ${alpha(GOLD, 0.2)}`,
                                }
                            }}>
                                <Box sx={{ color: isActive ? GOLD : 'text.secondary', display: 'flex', fontSize: 16, '& svg': { fontSize: 16 } }}>
                                    {link.icon}
                                </Box>
                                <Typography variant="body2" sx={{
                                    color: isActive ? GOLD : 'text.secondary',
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: 13,
                                    whiteSpace: 'nowrap',
                                    letterSpacing: isActive ? '0.01em' : 0,
                                }}>
                                    {link.label}
                                </Typography>
                            </Box>
                        </Link>
                    );
                })}
            </Box>

            {/* Right: Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: '0 0 auto' }}>
                <IconButton size="small" onClick={handleToggleLanguage} sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary', '&:hover': { color: GOLD } }}>
                    <LanguageIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={toggleColorMode} sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
                    {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                </IconButton>
                <IconButton size="small" sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.secondary', '&:hover': { color: GOLD } }}>
                    <NotificationsIcon fontSize="small" />
                </IconButton>

                {/* Divider */}
                <Box sx={{ width: 1, height: 24, bgcolor: alpha(GOLD, 0.2), mx: 0.5 }} />

                {isAuthenticated && user ? (
                    <>
                        <Box
                            onClick={handleProfileMenuOpen}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1,
                                borderRadius: 2.5, px: 1.5, py: 0.75,
                                bgcolor: alpha(GOLD, 0.1),
                                border: `1px solid ${alpha(GOLD, 0.25)}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(GOLD, 0.15), borderColor: alpha(GOLD, 0.5) }
                            }}>
                            <Avatar sx={{
                                width: 28, height: 28,
                                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                                color: '#000', fontSize: 12, fontWeight: 900
                            }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#fff' : '#000', display: { xs: 'none', sm: 'block' }, fontSize: 13 }}>
                                {user.name ?? 'Administrator'}
                            </Typography>
                        </Box>
                        <Menu
                            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    mt: 1, border: `1px solid ${alpha(GOLD, 0.2)}`,
                                    boxShadow: `0 8px 40px rgba(0,0,0,0.2)`,
                                    minWidth: 200,
                                    bgcolor: isDark ? '#111' : '#fff',
                                    borderRadius: 2,
                                    '& .MuiMenuItem-root': { fontSize: 14, fontWeight: 500, py: 1.25, borderRadius: 1.5, mx: 0.5, '&:hover': { bgcolor: alpha(GOLD, 0.08), color: GOLD } }
                                }
                            }}>
                            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(GOLD, 0.1)}` }}>
                                <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                            </Box>
                            <MenuItem component={Link} href="/admin/profile" onClick={handleProfileMenuClose}>View Profile</MenuItem>
                            <Divider sx={{ borderColor: alpha(GOLD, 0.1), my: 0.5 }} />
                            <MenuItem onClick={() => { handleProfileMenuClose(); logout(); }} sx={{ color: '#f44336 !important' }}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" size="small"
                            sx={{ bgcolor: GOLD, color: '#000', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#e6b200' } }}>
                            Login
                        </Button>
                    </Link>
                )}
            </Box>

            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </Box>
    );
}
