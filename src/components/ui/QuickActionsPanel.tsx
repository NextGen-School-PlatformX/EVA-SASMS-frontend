'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import AddTaskIcon from '@mui/icons-material/AddTask';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import Link from 'next/link';

const QUICK_ACTIONS = [
    { label: 'Review Applications', icon: <AddTaskIcon />, href: '/admin/admissions', color: 'primary' },
    { label: 'Create Invoice', icon: <ReceiptIcon />, href: '/admin/finances', color: 'success' },
    { label: 'Add Student', icon: <PersonAddIcon />, href: '/admin/affairs', color: 'info' },
    { label: 'Create Event', icon: <EventAvailableIcon />, href: '/admin/events', color: 'secondary' },
] as const;

export function QuickActionsPanel() {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {QUICK_ACTIONS.map((action, idx) => (
                    <Button
                        key={idx}
                        component={Link}
                        href={action.href}
                        variant="outlined"
                        startIcon={action.icon}
                        color={action.color}
                        sx={{
                            justifyContent: 'flex-start',
                            py: 1.5,
                            px: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            backgroundColor: alpha(theme.palette[action.color].main, 0.05),
                            border: `1px dashed ${alpha(theme.palette[action.color].main, 0.5)}`,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette[action.color].main, 0.1),
                                border: `1px solid ${theme.palette[action.color].main}`,
                            }
                        }}
                    >
                        {action.label}
                    </Button>
                ))}
            </Box>
        </Paper>
    );
}
