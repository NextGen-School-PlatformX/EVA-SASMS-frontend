'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, List, ListItem, ListItemText, ListItemIcon,
    Chip, IconButton, CircularProgress, Button, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/src/lib/api/superadminApi';
import { useNotification } from '@/src/context/NotificationContext';

const ICON_MAP: Record<string, React.ReactNode> = {
    success: <CheckCircleIcon color="success" />,
    warning: <WarningIcon color="warning" />,
    error: <ErrorIcon color="error" />,
    info: <InfoIcon color="info" />,
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showNotification } = useNotification();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleClick = async (notif: any) => {
        if (!notif.read) {
            try {
                await markNotificationRead(notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
            } catch (e) { }
        }
        if (notif.link) router.push(notif.link);
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            showNotification('All notifications marked as read', 'success');
        } catch (e) {
            showNotification('Failed to mark all as read', 'error');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box>
            <PageHeader
                title="Notifications"
                description={`${unreadCount} unread notifications`}
                action={
                    <Button
                        variant="outlined"
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                    >
                        Mark All Read
                    </Button>
                }
            />

            <ContentSection>
                {notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">No notifications yet.</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {notifications.map((n, i) => (
                            <Box key={n.id}>
                                <ListItem
                                    onClick={() => handleClick(n)}
                                    sx={{
                                        cursor: 'pointer',
                                        opacity: n.read ? 0.6 : 1,
                                        bgcolor: n.read ? 'transparent' : 'action.hover',
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: 'action.selected' },
                                    }}
                                >
                                    <ListItemIcon>
                                        {ICON_MAP[n.type] || <InfoIcon color="info" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={n.text}
                                        secondary={new Date(n.createdAt).toLocaleString()}
                                        primaryTypographyProps={{ fontWeight: n.read ? 400 : 600 }}
                                    />
                                    {!n.read && (
                                        <Chip label="New" size="small" color="primary" variant="outlined" />
                                    )}
                                </ListItem>
                                {i < notifications.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}
            </ContentSection>
        </Box>
    );
}
