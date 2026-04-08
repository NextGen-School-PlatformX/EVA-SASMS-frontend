'use client';

import { useState, useEffect } from 'react';
import {
  Grid, Box, Typography, Button, Paper, Divider,
  CircularProgress, useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getSystemKPIs, getSystemDepartments } from '@/src/lib/api/superadminApi';
import { SystemKPIs, SystemDepartment } from '@/src/types/superadmin.types';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const theme = useTheme();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<SystemKPIs | null>(null);
  const [departments, setDepartments] = useState<SystemDepartment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiData, deptData] = await Promise.all([
          getSystemKPIs(),
          getSystemDepartments()
        ]);
        setKpis(kpiData);
        setDepartments(deptData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Super Admin Oversight"
        description="Complete system control and cross-department analytics"
      />

      {/* Global KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Total Students"
            value={kpis?.totalStudents || 0}
            icon={<PeopleIcon color="primary" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="New Applications"
            value={kpis?.newApplications || 0}
            icon={<AppRegistrationIcon color="success" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Outstanding Fees"
            value={`$${kpis?.outstandingFeesTotal.toLocaleString()}`}
            icon={<AccountBalanceWalletIcon color="warning" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoCard
            title="Open Complaints"
            value={kpis?.openComplaintsCount || 0}
            icon={<SupportAgentIcon color="error" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Visual Analytics */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ContentSection title="System-Wide Analytics">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">
                  Students by Department
                </Typography>
                <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={departments}
                        dataKey="studentCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {departments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary">
                  Attendance Rates (%)
                </Typography>
                <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                  <ResponsiveContainer>
                    <BarChart data={departments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="attendanceRate" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </ContentSection>
        </Grid>

        {/* Quick Action Panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ContentSection title="Governance Control">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                onClick={() => router.push('/superadmin/users')}
              >
                Add New Admin/Staff
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BusinessIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                onClick={() => router.push('/superadmin/departments')}
              >
                Create New Department
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CampaignIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                onClick={() => showNotification('System-wide broadcast sent successfully!', 'success')}
              >
                Broadcast Announcement
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<SettingsIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                onClick={() => router.push('/superadmin/settings')}
              >
                Open System Settings
              </Button>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                  SYSTEM HEALTH
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Database Connection</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>Stable</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Email Service</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>Operational</Typography>
                </Box>
              </Box>
            </Box>
          </ContentSection>
        </Grid>
      </Grid>
    </Box>
  );
}
