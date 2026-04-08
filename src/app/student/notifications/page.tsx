'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CampaignIcon from '@mui/icons-material/Campaign';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useTheme } from '@mui/material';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getStudentNotifications } from '@/src/lib/api/studentPortalApi';

const ICONS: Record<string, React.ReactElement> = {
  SYSTEM: <CampaignIcon color="primary" />,
  FEE: <PaymentsIcon color="warning" />,
  ATTENDANCE: <AssignmentTurnedInIcon color="success" />,
  ACTIVITY: <CampaignIcon color="secondary" />,
  GENERAL: <NotificationsIcon color="action" />,
  info: <NotificationsIcon color="info" />,
  warning: <PaymentsIcon color="warning" />,
  success: <AssignmentTurnedInIcon color="success" />,
};

export default function NotificationsPage() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getStudentNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <>
      <PageHeader
        title="Student Notification Center"
        description="Stay updated with the latest alerts, fee deadlines, and academic announcements"
      />

      <ContentSection title="Recent Alerts">
        <Stack spacing={2}>
          {notifications.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                You're all caught up! No new notifications.
              </Typography>
            </Paper>
          ) : (
            notifications.map((n) => (
              <Paper
                key={n.id}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  transition: '0.2s',
                  '&:hover': { bgcolor: 'action.hover', borderColor: theme.palette.primary.main },
                  borderLeft: n.read ? undefined : `6px solid ${theme.palette.primary.main}`
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: theme.shadows[1]
                  }}
                >
                  {ICONS[n.type as keyof typeof ICONS] || ICONS.GENERAL}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {n.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {n.type && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Type: {n.type}
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </ContentSection>
    </>
  );
}

