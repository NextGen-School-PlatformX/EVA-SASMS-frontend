'use client';

import { useState } from 'react';
import {
    AppBar, Box, Toolbar, IconButton, Typography,
    Avatar, Menu, MenuItem, Divider, Stack,
    Tooltip, useTheme, Button
} from '@mui/material';
import {
    LayoutDashboard,
    HelpCircle,
    LogOut,
    Sun,
    Moon,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useColorMode } from './ThemeProviderWrapper';
import { alpha } from '@mui/material/styles';

export function ApplicantNav() {
    const theme = useTheme();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                zIndex: theme.zIndex.drawer + 1
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>
                    {/* Logo & Branding */}
                    <Box
                        component={Link}
                        href="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        <Box sx={{
                            width: 35, height: 35, bgcolor: 'primary.main',
                            borderRadius: 1, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontWeight: 900,
                            fontSize: '1rem', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                        }}>
                            SA
                        </Box>
                        <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
                            SASMS <span style={{ color: theme.palette.primary.main }}>Portal</span>
                        </Typography>
                    </Box>

                    {/* Navigation Desktop */}
                    <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            component={Link}
                            href="/admissions/requirements"
                            startIcon={<FileText size={18} />}
                            sx={{
                                px: 2, borderRadius: 2,
                                fontWeight: 700,
                                color: pathname === '/admissions/requirements' ? 'primary.main' : 'text.secondary',
                                bgcolor: pathname === '/admissions/requirements' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                            }}
                        >
                            Requirements
                        </Button>

                        {user && (
                            <>
                                <Button
                                    component={Link}
                                    href="/applicant/dashboard"
                                    startIcon={<LayoutDashboard size={18} />}
                                    sx={{
                                        px: 2, borderRadius: 2,
                                        fontWeight: 700,
                                        color: pathname === '/applicant/dashboard' ? 'primary.main' : 'text.secondary',
                                        bgcolor: pathname === '/applicant/dashboard' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                                    }}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    component={Link}
                                    href="/applicant/support"
                                    startIcon={<HelpCircle size={18} />}
                                    sx={{
                                        px: 2, borderRadius: 2,
                                        fontWeight: 700,
                                        color: pathname === '/applicant/support' ? 'primary.main' : 'text.secondary',
                                        bgcolor: pathname === '/applicant/support' ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                                    }}
                                >
                                    Support
                                </Button>
                            </>
                        )}
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={toggleColorMode} size="small" sx={{ color: 'text.secondary' }}>
                            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </IconButton>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center' }} />

                        {user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="body2" fontWeight={800}>{user?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user?.role === 'SUPER_ADMIN' ? 'System SuperAdmin' :
                                            user?.role === 'APPLICANT' ? 'Applicant' :
                                                user?.role}
                                    </Typography>
                                </Box>
                                <Tooltip title="Account menu">
                                    <IconButton onClick={handleMenuOpen} size="small">
                                        <Avatar sx={{
                                            width: 32, height: 32, bgcolor: 'primary.main',
                                            fontSize: '0.85rem', fontWeight: 800
                                        }}>
                                            {user?.name?.[0] || 'A'}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ) : (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    component={Link}
                                    href="/login"
                                    sx={{ fontWeight: 800, borderRadius: 2 }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    href="/applicant/register"
                                    variant="contained"
                                    sx={{ fontWeight: 800, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}
                                >
                                    Register
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Toolbar>
            </Container>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5,
                        borderRadius: 3,
                        minWidth: 200,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={800}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{user?.email}</Typography>
                </Box>
                <Divider />
                <MenuItem
                    onClick={logout}
                    sx={{
                        py: 1.5, px: 2,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'error.main',
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                    }}
                >
                    <LogOut size={18} style={{ marginRight: 12 }} />
                    Logout Only
                </MenuItem>
            </Menu>
        </AppBar>
    );
}

// Wrap with Container import for AppBar
import Container from '@mui/material/Container';
