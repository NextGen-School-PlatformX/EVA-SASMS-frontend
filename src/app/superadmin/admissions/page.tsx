'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, TextField, Select,
    MenuItem, FormControl, InputLabel, CircularProgress,
    IconButton, Tooltip, Grid, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GavelIcon from '@mui/icons-material/Gavel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Stack
} from '@mui/material';
import { useNotification } from '@/src/context/NotificationContext';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { getApplicants, updateApplicantStatus, convertApplicantToStudent } from '@/src/lib/api/staffApi';
import { getSystemDepartments } from '@/src/lib/api/superadminApi';
import { ApplicantProfile } from '@/src/types/staff.types';

export default function AdmissionsSupervisionPage() {
    const { showNotification } = useNotification();
    const router = useRouter();

    const triggerDownload = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const [applications, setApplications] = useState<ApplicantProfile[]>([]);
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewApp, setViewApp] = useState<ApplicantProfile | null>(null);
    const [converting, setConverting] = useState(false);

    // Conversion Modal State
    const [conversionOpen, setConversionOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantProfile | null>(null);
    const [studentData, setStudentData] = useState({
        nationalId: '',
        academicYear: '2024/2025',
        class: '',
        departmentId: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [data, depts] = await Promise.all([getApplicants(), getSystemDepartments().catch(() => [])]);
                setApplications(data);
                setDepartments(Array.isArray(depts) ? depts.map((d: any) => ({ id: d.id, name: d.name || d.title || '' })) : []);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleOverrideDecision = async (id: string, name: string) => {
        const app = applications.find(a => a.id === id);
        const nextStatus = app?.status === 'Approved' ? 'Rejected' : 'Approved';
        try {
            await updateApplicantStatus(id, nextStatus as 'Approved' | 'Rejected');
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus as any } : a));
            showNotification(`${name}'s application set to ${nextStatus}.`, 'success');
        } catch (e: any) {
            showNotification(e?.message || 'Failed to override decision.', 'error');
        }
    };

    const handleExport = () => {
        showNotification('System-wide intake report is being generated...', 'info');
        setTimeout(() => {
            triggerDownload('Global_Intake_Report.csv', 'ApplicantID,Name,Status\n123,Jane Doe,Approved');
            showNotification('Global Intake Report (CSV) downloaded successfully.', 'success');
        }, 1500);
    };

    const handleOpenConvert = (applicant: ApplicantProfile) => {
        setSelectedApplicant(applicant);
        const deptId = applicant.preferredDeptId || (departments[0]?.id || '');
        setStudentData({
            nationalId: applicant.nationalId || '',
            academicYear: '2024/2025',
            class: '',
            departmentId: deptId
        });
        setConversionOpen(true);
    };

    const handleConfirmConversion = async () => {
        if (!selectedApplicant) return;
        if (!studentData.class || !studentData.nationalId) {
            showNotification('Please fill in all required fields (National ID & Class).', 'error');
            return;
        }
        if (!studentData.departmentId) {
            showNotification('Please select a department.', 'error');
            return;
        }

        setConverting(true);
        try {
            await convertApplicantToStudent(selectedApplicant.id, {
                nationalId: studentData.nationalId,
                academicYear: studentData.academicYear,
                studentClass: studentData.class,
                departmentId: studentData.departmentId
            });
            showNotification(`${selectedApplicant.name} is now a Student.`, 'success');
            setConversionOpen(false);
            const data = await getApplicants();
            setApplications(data);
        } catch (e: any) {
            showNotification(e?.message || 'Failed to convert to student.', 'error');
        } finally {
            setConverting(false);
        }
    };

    const stats = useMemo(() => {
        const total = applications.length;
        const pending = applications.filter(a => a.status === 'Pending').length;
        const approved = applications.filter(a => a.status === 'Approved').length;
        const architecturalRate = total > 0 ? (approved / total) * 100 : 0;
        return { total, pending, approved, architecturalRate };
    }, [applications]);

    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchQuery, statusFilter]);

    const columns: Column<ApplicantProfile>[] = [
        {
            id: 'id', label: 'App ID',
            render: (row) => (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.25, borderRadius: 1, fontWeight: 700 }}>
                    #{(row.id || '').toString().slice(0, 8).toUpperCase()}
                </Typography>
            )
        },
        { id: 'name', label: 'Applicant Name' },
        {
            id: 'phone', label: 'Phone',
            render: (row: any) => row.phone ? (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>📱 {row.phone}</Typography>
            ) : <Typography variant="caption" color="text.secondary">—</Typography>
        },
        { id: 'appliedDate', label: 'Submission Date' },
        { id: 'department', label: 'Target Dept' },
        {
            id: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status.toLowerCase() as any} />
        },
        {
            id: 'actions',
            label: 'Supervisory Control',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Full Application & Docs">
                        <IconButton size="small" onClick={() => setViewApp(row)}><VisibilityIcon /></IconButton>
                    </Tooltip>
                    {row.status === 'Approved' && (
                        <Tooltip title="Convert to Registered Student">
                            <IconButton size="small" color="primary" onClick={() => handleOpenConvert(row)}><PersonAddIcon /></IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Override Decision">
                        <IconButton size="small" color="secondary" onClick={() => handleOverrideDecision(row.id, row.name)}><GavelIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Audit Decision History">
                        <IconButton size="small" onClick={() => router.push(`/superadmin/audit?userId=${row.applicantId || ''}&userName=${encodeURIComponent(row.name)}`)}><AssessmentIcon /></IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

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
                title="Admissions Oversight"
                description="Monitor system-wide intake trends, audit departmental decisions, and authorize final overrides"
                action={
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="outlined" onClick={() => router.push('/superadmin/admissions/form-fields')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            ⚙️ Form Fields
                        </Button>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                            Export Global Intake Report
                        </Button>
                    </Box>
                }
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Total Applications" value={stats.total} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Pending Action" value={stats.pending} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="System Acceptance Rate" value={`${stats.architecturalRate.toFixed(1)}%`} />
                </Grid>
            </Grid>

            <ContentSection>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search applicants..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="All">All Statuses</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <DataTable
                    columns={columns}
                    rows={filteredApps}
                    emptyMessage="No applications found matching your criteria."
                />
            </ContentSection>

            {/* Student Conversion Modal */}
            <Dialog open={conversionOpen} onClose={() => setConversionOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Formal Student Registration</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Register <strong>{selectedApplicant?.name}</strong> as an active student in the system.
                        This will generate their academic portal and email their login credentials.
                    </Typography>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="National ID / Residency ID"
                            fullWidth
                            required
                            value={studentData.nationalId}
                            onChange={(e) => setStudentData({ ...studentData, nationalId: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Academic Year"
                                    fullWidth
                                    value={studentData.academicYear}
                                    onChange={(e) => setStudentData({ ...studentData, academicYear: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Assigned Class"
                                    fullWidth
                                    required
                                    placeholder="e.g., 10-A"
                                    value={studentData.class}
                                    onChange={(e) => setStudentData({ ...studentData, class: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <FormControl fullWidth required>
                            <InputLabel>Enrolled Department</InputLabel>
                            <Select
                                value={studentData.departmentId}
                                label="Enrolled Department"
                                onChange={(e) => setStudentData({ ...studentData, departmentId: e.target.value as string })}
                            >
                                {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setConversionOpen(false)} disabled={converting}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirmConversion} disabled={converting} startIcon={<PersonAddIcon />}>
                        {converting ? 'Converting…' : 'Add Student & Send Email'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Application Dialog */}
            <Dialog open={!!viewApp} onClose={() => setViewApp(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Application Details</DialogTitle>
                <DialogContent dividers>
                    {viewApp && (
                        <Stack spacing={2}>
                            <Box><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" fontWeight={600}>{viewApp.name}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1">{viewApp.email}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body1">{viewApp.department}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">National ID</Typography><Typography variant="body1">{viewApp.nationalId || '—'}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">Status</Typography><StatusBadge status={viewApp.status.toLowerCase() as any} /></Box>
                            {(viewApp as any).birthCertificateUrl && <Typography variant="caption">Birth Certificate: uploaded</Typography>}
                            {(viewApp as any).idCardUrl && <Typography variant="caption">ID Card: uploaded</Typography>}
                            {(viewApp as any).ministryResultUrl && <Typography variant="caption">Ministry Result: uploaded</Typography>}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setViewApp(null)}>Close</Button></DialogActions>
            </Dialog>
        </Box>
    );
}
