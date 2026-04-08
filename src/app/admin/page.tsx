'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { OverviewBarChart, DualLineChart } from '@/src/components/ui/DashboardCharts';
import { QuickActionsPanel } from '@/src/components/ui/QuickActionsPanel';
import { DataTable } from '@/src/components/tables/DataTable';

const MOCK_STATS = {
  totalStudents: 1540,
  pendingApps: 12,
  outstandingFees: 45,
  openComplaints: 7,
  upcomingEvents: 3,
};

const CHART_DATA_APPS = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 30 },
  { name: 'Mar', value: 45 },
  { name: 'Apr', value: 70 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 110 },
];

const CHART_DATA_FEES = [
  { name: 'Jan', collected: 50000, pending: 15000 },
  { name: 'Feb', collected: 55000, pending: 12000 },
  { name: 'Mar', collected: 60000, pending: 10000 },
  { name: 'Apr', collected: 45000, pending: 25000 },
];

const RECENT_ACTIVITY = [
  { id: '1', action: 'Admitted John Doe', user: 'Admin Sarah', time: '10 mins ago' },
  { id: '2', action: 'Resolved WiFi Complaint', user: 'Admin Mike', time: '1 hour ago' },
  { id: '3', action: 'Created Tech Event', user: 'Admin Sarah', time: '2 hours ago' },
  { id: '4', action: 'Invoiced Jane Smith', user: 'Admin Alex', time: '3 hours ago' },
];

export default function AdminDashboardPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of university operational metrics and recent activities"
      />

      {/* KPI Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <InfoCard title="Total Students" value={MOCK_STATS.totalStudents} icon={<SchoolIcon color="primary" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <InfoCard title="Pending Apps" value={MOCK_STATS.pendingApps} icon={<DescriptionIcon color="warning" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <InfoCard title="Unpaid Fees" value={MOCK_STATS.outstandingFees} icon={<AccountBalanceWalletIcon color="error" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <InfoCard title="Open Complaints" value={MOCK_STATS.openComplaints} icon={<SupportAgentIcon color="info" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <InfoCard title="Upcoming Events" value={MOCK_STATS.upcomingEvents} icon={<EventAvailableIcon color="secondary" />} />
        </Grid>
      </Grid>

      {/* Charts & Quick Actions Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ContentSection title="Applications Breakdown">
              <OverviewBarChart data={CHART_DATA_APPS} />
            </ContentSection>
            <ContentSection title="Fees Collection vs Pending">
              <DualLineChart data={CHART_DATA_FEES} />
            </ContentSection>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickActionsPanel />
        </Grid>
      </Grid>

      {/* Table Row */}
      <ContentSection title="Recent Activity">
        <DataTable
          columns={[
            { id: 'action', label: 'Activity' },
            { id: 'user', label: 'Performed By' },
            { id: 'time', label: 'Time' },
          ]}
          rows={RECENT_ACTIVITY}
        />
      </ContentSection>
    </Box>
  );
}






