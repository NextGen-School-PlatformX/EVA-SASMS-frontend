'use client';

import {
    Box, Typography, Button, Grid, Card,
    CardContent, CardActions, Divider, List,
    ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useNotification } from '@/src/context/NotificationContext';

import { PageHeader } from '@/src/components/ui/PageHeader';

export default function ReportingCenterPage() {
    const { showNotification } = useNotification();

    const handleDownload = async (type: 'student' | 'finance', format: 'csv' | 'pdf') => {
        try {
            showNotification(`Generating ${format.toUpperCase()} report...`, 'info');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
            const path = type === 'student' ? 'students' : 'finance';
            const url = `${baseUrl}/reports/${path}/${format}`;
            const token = localStorage.getItem('sasms_token');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            showNotification('Report downloaded successfully!', 'success');
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const reports = [
        {
            id: 'student',
            title: 'Student Census',
            description: 'System-wide active student roster with department breakdown',
            icon: <PeopleIcon color="primary" />,
            formats: ['PDF', 'CSV']
        },
        {
            id: 'finance',
            title: 'Financial Liquidity',
            description: 'Monthly collection report vs. outstanding arrears',
            icon: <AccountBalanceWalletIcon color="success" />,
            formats: ['PDF', 'CSV']
        }
    ];

    return (
        <Box>
            <PageHeader
                title="Universal Reporting Center"
                description="Centralized data extraction for compliance, auditing, and strategic planning"
            />

            <Grid container spacing={4}>
                {/* Available Reports */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        {reports.map((report) => (
                            <Grid size={{ xs: 12, md: 6 }} key={report.title}>
                                <Card variant="outlined" sx={{ height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '50%', display: 'flex' }}>
                                                {report.icon}
                                            </Box>
                                            <Typography variant="h6" fontWeight={700}>{report.title}</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {report.description}
                                        </Typography>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 1 }}>
                                            AVAILABLE FORMATS (CLICK TO DOWNLOAD)
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {report.formats.map(f => (
                                                <Button
                                                    key={f}
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={f === 'PDF' ? <PictureAsPdfIcon /> : <TableChartIcon />}
                                                    onClick={() => handleDownload(report.id as any, f.toLowerCase() as any)}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    {f}
                                                </Button>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>


                {/* Export Schedule & Logs */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box sx={{ p: 3, bgcolor: 'primary.main', borderRadius: 3, color: 'white', mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Scheduled Exports</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                            Configure automated PDF reports to be sent to your email weekly.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                            onClick={() => showNotification('Automated report scheduling modal initialized.', 'info')}
                        >
                            Manage Schedules
                        </Button>
                    </Box>

                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Recent Exports</Typography>
                            <List disablePadding>
                                {[
                                    { name: 'Student_Census_Q1.pdf', date: 'Yesterday' },
                                    { name: 'Finances_Feb_2024.xlsx', date: '2 days ago' },
                                    { name: 'Complaint_Trends.csv', date: 'Feb 15' }
                                ].map((item, idx) => (
                                    <ListItem key={idx} sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => {
                                        showNotification(`${item.name} is an archived record. Only live reports are downloadable currently.`, 'warning');
                                    }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <FileDownloadIcon fontSize="small" color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.name}
                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                            secondary={item.date}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
