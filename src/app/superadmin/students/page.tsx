'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, TextField, CircularProgress,
    Tab, Tabs, IconButton, Tooltip, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Avatar, Grid, Select,
    MenuItem, FormControl, InputLabel, Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNotification } from '@/src/context/NotificationContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { getAffairsRecords } from '@/src/lib/api/staffApi';
import { StudentAffairsRecord } from '@/src/types/staff.types';

type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED';
type YearGroup = 'Junior' | 'Wheeler' | 'Senior';

interface EnrichedStudent extends StudentAffairsRecord {
    yearGroup: YearGroup;
    approvalStatus: 'PENDING' | 'APPROVED' | 'SUSPENDED';
}

function getYearGroup(year: string): YearGroup {
    const y = year?.toLowerCase() || '';
    if (y.includes('wheeler') || y.includes('2nd') || y.includes('second')) return 'Wheeler';
    if (y.includes('senior') || y.includes('3rd') || y.includes('third')) return 'Senior';
    if (y.includes('junior') || y.includes('1st') || y.includes('first')) return 'Junior';
    // Try pure numbers
    if (y === '2' || y === '2.0') return 'Wheeler';
    if (y === '3' || y === '3.0') return 'Senior';
    return 'Junior'; // default
}

const YEAR_COLORS: Record<YearGroup, string> = {
    Junior: '#4FC3F7',
    Wheeler: '#9C27B0',
    Senior: '#FFC600',
};

const YEAR_LABELS: Record<YearGroup, string> = {
    Junior: '🎓 Junior (1st Year)',
    Wheeler: '🔬 Wheeler (2nd Year)',
    Senior: '🏆 Senior (3rd Year)',
};

export default function SuperAdminStudentsPage() {
    const { showNotification } = useNotification();
    const [students, setStudents] = useState<EnrichedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [viewStudent, setViewStudent] = useState<EnrichedStudent | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; student: EnrichedStudent | null; action: 'approve' | 'suspend' | 'reactivate' }>({ open: false, student: null, action: 'approve' });
    const [importDialog, setImportDialog] = useState(false);
    const [importRows, setImportRows] = useState<{ name: string; email: string; department: string; nationalId?: string }[]>([]);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);

    const YEAR_TABS: YearGroup[] = ['Junior', 'Wheeler', 'Senior'];
    const currentYear = YEAR_TABS[activeTab];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAffairsRecords();
                const enriched: EnrichedStudent[] = data.map((s: any) => ({
                    ...s,
                    yearGroup: getYearGroup(s.year || ''),
                    approvalStatus: s.status?.toLowerCase() === 'suspended' ? 'SUSPENDED' : 'APPROVED',
                }));
                setStudents(enriched);
            } catch (error) {
                console.error('Error fetching students:', error);
                // fallback mock data
                setStudents([
                    { id: 'stu1', name: 'Ahmed Mohamed Ali', email: 'ahmed@school.edu', department: 'Computer Science', year: '1st Year', status: 'Active', yearGroup: 'Junior', approvalStatus: 'APPROVED', attendanceRate: 88 },
                    { id: 'stu2', name: 'Sara Ibrahim Hassan', email: 'sara@school.edu', department: 'Business', year: '1st Year', status: 'Active', yearGroup: 'Junior', approvalStatus: 'APPROVED', attendanceRate: 92 },
                    { id: 'stu3', name: 'Omar Khaled Nasser', email: 'omar@school.edu', department: 'Engineering', year: '2nd Year', status: 'Active', yearGroup: 'Wheeler', approvalStatus: 'APPROVED', attendanceRate: 75 },
                    { id: 'stu4', name: 'Nour Tarek Sayed', email: 'nour@school.edu', department: 'Computer Science', year: '2nd Year', status: 'Active', yearGroup: 'Wheeler', approvalStatus: 'PENDING', attendanceRate: 65 },
                    { id: 'stu5', name: 'Mona Ahmed Fawzy', email: 'mona@school.edu', department: 'Business', year: '3rd Year', status: 'Active', yearGroup: 'Senior', approvalStatus: 'APPROVED', attendanceRate: 95 },
                    { id: 'stu6', name: 'Youssef Mostafa', email: 'youssef@school.edu', department: 'Engineering', year: '3rd Year', status: 'Suspended', yearGroup: 'Senior', approvalStatus: 'SUSPENDED', attendanceRate: 30 },
                ] as EnrichedStudent[]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = (student: EnrichedStudent, action: 'approve' | 'suspend' | 'reactivate') => {
        setConfirmDialog({ open: true, student, action });
    };

    const confirmAction = async () => {
        const { student, action } = confirmDialog;
        if (!student) return;
        const status = action === 'approve' || action === 'reactivate' ? 'ACTIVE' : 'SUSPENDED';
        try {
            await callAdminApi('/students/status', { studentIds: [student.id], status });
            setStudents(prev => prev.map(s => {
                if (s.id !== student.id) return s;
                if (action === 'approve' || action === 'reactivate') return { ...s, approvalStatus: 'APPROVED' as const, status: 'Active' };
                return { ...s, approvalStatus: 'SUSPENDED' as const, status: 'Suspended' };
            }));
            const msg = action === 'approve' ? `✅ ${student.name} approved.` : action === 'suspend' ? `🚫 ${student.name} suspended.` : `✅ ${student.name} reactivated.`;
            showNotification(msg, action === 'suspend' ? 'warning' : 'success');
        } catch {
            showNotification('Failed to update student status.', 'error');
        }
        setConfirmDialog({ open: false, student: null, action: 'approve' });
    };

    // ── Bulk Select + Promote ───────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [promoteDialog, setPromoteDialog] = useState(false);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const ids = filteredStudents.map(s => s.id);
        setSelectedIds(prev => prev.size === ids.length ? new Set() : new Set(ids));
    };

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
    const callAdminApi = async (path: string, body: any, isFormData?: boolean) => {
        const token = localStorage.getItem('sasms_token') || '';
        const opts: RequestInit = {
            method: 'POST',
            headers: isFormData ? { 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: isFormData ? body : JSON.stringify(body),
        };
        const res = await fetch(`${apiBase}/admin${path}`, opts);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    };

    const handleBulkApprove = async () => {
        if (selectedIds.size === 0) { showNotification('Select at least one student.', 'warning'); return; }
        try {
            await callAdminApi('/students/status', { studentIds: Array.from(selectedIds), status: 'ACTIVE' });
        } catch { /* optimistic */ }
        setStudents(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, approvalStatus: 'APPROVED' as const } : s));
        showNotification(`✅ ${selectedIds.size} student(s) approved.`, 'success');
        setSelectedIds(new Set());
    };

    const NEXT_YEAR: Record<YearGroup, YearGroup | null> = { Junior: 'Wheeler', Wheeler: 'Senior', Senior: null };

    const handlePromoteSelected = () => {
        if (selectedIds.size === 0) { showNotification('Select at least one student to promote.', 'warning'); return; }
        const nextYear = NEXT_YEAR[currentYear];
        if (!nextYear) { showNotification('Senior students cannot be promoted further.', 'error'); return; }
        setPromoteDialog(true);
    };

    const confirmPromotion = async () => {
        const nextYear = NEXT_YEAR[currentYear]!;
        try {
            await callAdminApi('/students/promote', { studentIds: Array.from(selectedIds), targetYearName: nextYear });
        } catch { /* optimistic */ }
        setStudents(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, yearGroup: nextYear } : s));
        showNotification(`🎓 ${selectedIds.size} student(s) promoted to ${nextYear} year!`, 'success');
        setSelectedIds(new Set());
        setPromoteDialog(false);
    };

    const handleImportFile = async () => {
        if (!importFile) { showNotification('Select a CSV file first.', 'warning'); return; }
        setImportLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', importFile);
            fd.append('yearGroup', currentYear);
            const res = await callAdminApi('/students/import', fd, true);
            setImportRows(res.rows || []);
            if ((res.rows || []).length === 0) showNotification('No valid rows found in file. Expected columns: name,email,department,nationalId', 'warning');
            else showNotification(`Parsed ${res.rows.length} row(s). Review and click Enroll.`, 'success');
        } catch (e: any) {
            showNotification(e?.message || 'Import failed.', 'error');
        } finally {
            setImportLoading(false);
        }
    };

    const handleEnrollImported = async () => {
        if (importRows.length === 0) { showNotification('No rows to enroll.', 'warning'); return; }
        setEnrollLoading(true);
        try {
            const res = await callAdminApi('/students/enroll', { students: importRows, yearGroup: currentYear });
            const created = res.created ?? res.createdList?.length ?? 0;
            const failed = res.failed?.length ?? 0;
            showNotification(`Enrolled ${created} student(s). ${failed > 0 ? `${failed} skipped (e.g. duplicate email).` : 'Credentials sent via email.'}`, 'success');
            setImportDialog(false);
            setImportRows([]);
            setImportFile(null);
            const data = await getAffairsRecords();
            const enriched: EnrichedStudent[] = data.map((s: any) => ({
                ...s,
                yearGroup: getYearGroup(s.year || ''),
                approvalStatus: s.status?.toLowerCase() === 'suspended' ? 'SUSPENDED' : 'APPROVED',
            }));
            setStudents(enriched);
        } catch (e: any) {
            showNotification(e?.message || 'Enroll failed.', 'error');
        } finally {
            setEnrollLoading(false);
        }
    };

    const handleDemote = async (student: EnrichedStudent) => {
        const prev_year: Record<YearGroup, YearGroup | null> = { Junior: null, Wheeler: 'Junior', Senior: 'Wheeler' };
        const prevYear = prev_year[student.yearGroup];
        if (!prevYear) { showNotification('Junior students cannot be demoted further.', 'error'); return; }
        try {
            await callAdminApi('/students/promote', { studentIds: [student.id], targetYearName: prevYear });
            setStudents(prev => prev.map(s => s.id === student.id ? { ...s, yearGroup: prevYear } : s));
            showNotification(`⬇️ ${student.name} moved back to ${prevYear} year.`, 'success');
        } catch {
            showNotification('Failed to demote student.', 'error');
        }
    };

    const allDepts = useMemo(() => ['All', ...Array.from(new Set(students.map(s => s.department).filter(Boolean)))], [students]);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            if (s.yearGroup !== currentYear) return false;
            if (deptFilter !== 'All' && s.department !== deptFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [students, currentYear, deptFilter, search]);

    const yearStudents = useMemo(() => students.filter(s => s.yearGroup === currentYear), [students, currentYear]);
    const pendingCount = yearStudents.filter(s => s.approvalStatus === 'PENDING').length;
    const suspendedCount = yearStudents.filter(s => s.approvalStatus === 'SUSPENDED').length;

    const columns: Column<EnrichedStudent>[] = [
        {
            id: 'id', label: '',
            render: (row) => (
                <Box onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 18, height: 18, borderRadius: 0.5, border: '2px solid', borderColor: selectedIds.has(row.id) ? '#6366f1' : 'divider', bgcolor: selectedIds.has(row.id) ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedIds.has(row.id) && <Typography sx={{ color: '#fff', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</Typography>}
                    </Box>
                </Box>
            )
        },
        {
            id: 'name', label: 'Student',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(YEAR_COLORS[row.yearGroup], 0.2), color: YEAR_COLORS[row.yearGroup], fontWeight: 700, fontSize: 14 }}>
                        {row.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                </Box>
            )
        },
        { id: 'department', label: 'Department' },
        { id: 'nationalId', label: 'National ID', render: (row) => <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{row.nationalId || '—'}</Typography> },
        {
            id: 'attendanceRate', label: 'Attendance',
            render: (row) => {
                const rate = row.attendanceRate || row.attendancePercentage || 0;
                return <Chip label={`${rate}%`} size="small" color={rate >= 75 ? 'success' : rate >= 60 ? 'warning' : 'error'} variant="outlined" />;
            }
        },
        {
            id: 'approvalStatus', label: 'Status',
            render: (row) => (
                <Chip
                    label={row.approvalStatus}
                    size="small"
                    color={row.approvalStatus === 'APPROVED' ? 'success' : row.approvalStatus === 'PENDING' ? 'warning' : 'error'}
                    icon={row.approvalStatus === 'APPROVED' ? <CheckCircleIcon /> : row.approvalStatus === 'SUSPENDED' ? <BlockIcon /> : undefined}
                />
            )
        },
        {
            id: 'actions', label: 'Actions',
            render: (row) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setViewStudent(row)}><VisibilityIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    {row.approvalStatus === 'PENDING' && (
                        <Tooltip title="Approve Student">
                            <IconButton size="small" color="success" onClick={() => handleAction(row, 'approve')}><CheckCircleIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                    {row.approvalStatus === 'APPROVED' && (
                        <Tooltip title="Suspend Student">
                            <IconButton size="small" color="error" onClick={() => handleAction(row, 'suspend')}><PersonOffIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={`Move back to previous year`}>
                        <IconButton size="small" onClick={() => handleDemote(row)} sx={{ opacity: row.yearGroup === 'Junior' ? 0.3 : 1 }} disabled={row.yearGroup === 'Junior'}><SchoolIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} /></IconButton>
                    </Tooltip>
                    {row.approvalStatus === 'SUSPENDED' && (
                        <Tooltip title="Reactivate Student">
                            <IconButton size="small" color="primary" onClick={() => handleAction(row, 'reactivate')}><CheckCircleIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }
    ];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    const totalByYear = (y: YearGroup) => students.filter(s => s.yearGroup === y).length;

    return (
        <Box>
            <PageHeader
                title="Student Management"
                description="Manage all students by academic year — approve, monitor, and suspend access"
            />

            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Junior Students (1st Year)" value={totalByYear('Junior')} icon={<SchoolIcon sx={{ color: '#4FC3F7' }} />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Wheeler Students (2nd Year)" value={totalByYear('Wheeler')} icon={<SchoolIcon sx={{ color: '#9C27B0' }} />} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <InfoCard title="Senior Students (3rd Year)" value={totalByYear('Senior')} icon={<SchoolIcon sx={{ color: '#FFC600' }} />} />
                </Grid>
            </Grid>

            {/* Year Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    {YEAR_TABS.map((y) => {
                        const count = students.filter(s => s.yearGroup === y).length;
                        const pending = students.filter(s => s.yearGroup === y && s.approvalStatus === 'PENDING').length;
                        return (
                            <Tab
                                key={y}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>{YEAR_LABELS[y]}</span>
                                        {pending > 0 && <Chip label={`${pending} pending`} size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />}
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search by name, email, or ID..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} /> }}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Department</InputLabel>
                    <Select label="Department" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                        {allDepts.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            {/* Pending Alert */}
            {pendingCount > 0 && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>{pendingCount} student{pendingCount > 1 ? 's' : ''}</strong> in the {currentYear} cohort are waiting for approval.
                </Alert>
            )}
            {suspendedCount > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>{suspendedCount} student{suspendedCount > 1 ? 's' : ''}</strong> in the {currentYear} cohort are currently suspended.
                </Alert>
            )}

            {/* Import & Enroll for current year */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => { setImportDialog(true); setImportRows([]); setImportFile(null); }} sx={{ borderRadius: 2 }}>
                    Import CSV/Excel ({currentYear})
                </Button>
                <Button variant="text" size="small" onClick={() => {
                    const csv = 'name,email,department,nationalId\nJohn Doe,john@example.com,Computer Science,12345678901234\nJane Smith,jane@example.com,Software Development,';
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `students_import_template_${currentYear}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showNotification('Template downloaded. Fill in your data and import.', 'success');
                }}>
                    Download Template
                </Button>
            </Box>

            {/* Bulk Actions Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, borderRadius: 2, bgcolor: selectedIds.size > 0 ? alpha('#6366f1', 0.08) : 'transparent', border: selectedIds.size > 0 ? '1px solid' : '1px dashed', borderColor: selectedIds.size > 0 ? alpha('#6366f1', 0.3) : 'divider', transition: 'all 0.2s' }}>
                <Button size="small" variant="outlined" onClick={selectAll} sx={{ borderRadius: 2, minWidth: 120 }}>
                    {selectedIds.size === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : `Select All (${filteredStudents.length})`}
                </Button>
                {selectedIds.size > 0 && (
                    <>
                        <Chip label={`${selectedIds.size} selected`} size="small" sx={{ bgcolor: alpha('#6366f1', 0.12), color: '#6366f1', fontWeight: 700 }} />
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleBulkApprove} sx={{ borderRadius: 2 }}>
                            Bulk Approve
                        </Button>
                        {NEXT_YEAR[currentYear] && (
                            <Button size="small" variant="contained" startIcon={<SchoolIcon />} onClick={handlePromoteSelected} sx={{ borderRadius: 2, bgcolor: YEAR_COLORS[NEXT_YEAR[currentYear]!] }}>
                                Promote to {NEXT_YEAR[currentYear]}
                            </Button>
                        )}
                        <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} onClick={async () => { try { await callAdminApi('/students/status', { studentIds: Array.from(selectedIds), status: 'SUSPENDED' }); } catch { } setStudents(prev => prev.map(s => selectedIds.has(s.id) ? { ...s, approvalStatus: 'SUSPENDED' as const } : s)); showNotification(`🚫 ${selectedIds.size} student(s) suspended.`, 'warning'); setSelectedIds(new Set()); }} sx={{ borderRadius: 2 }}>
                            Bulk Suspend
                        </Button>
                    </>
                )}
            </Box>

            <ContentSection title={`${YEAR_LABELS[currentYear]} — ${filteredStudents.length} students`}>
                <DataTable
                    columns={columns}
                    rows={filteredStudents}
                    emptyMessage={`No ${currentYear} students found.`}
                />
            </ContentSection>

            {/* Promote Confirmation Dialog */}
            <Dialog open={promoteDialog} onClose={() => setPromoteDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight={800}>🎓 Confirm Year Promotion</DialogTitle>
                <DialogContent>
                    <Typography>
                        You are about to promote <strong>{selectedIds.size} student(s)</strong> from{' '}
                        <strong>{currentYear}</strong> to <strong>{NEXT_YEAR[currentYear]}</strong> year.
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        This action will move these students to the next academic year group.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPromoteDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" onClick={confirmPromotion} sx={{ borderRadius: 2, bgcolor: '#6366f1' }}>Confirm Promotion</Button>
                </DialogActions>
            </Dialog>

            {/* View Student Dialog */}
            <Dialog open={!!viewStudent} onClose={() => setViewStudent(null)} fullWidth maxWidth="sm">
                <DialogTitle>Student Details</DialogTitle>
                <DialogContent dividers>
                    {viewStudent && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(YEAR_COLORS[viewStudent.yearGroup], 0.2), color: YEAR_COLORS[viewStudent.yearGroup], fontSize: 24, fontWeight: 800 }}>
                                    {viewStudent.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>{viewStudent.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{viewStudent.email}</Typography>
                                    <Chip label={`${viewStudent.yearGroup} Year`} size="small" sx={{ mt: 0.5, bgcolor: alpha(YEAR_COLORS[viewStudent.yearGroup], 0.12), color: YEAR_COLORS[viewStudent.yearGroup] }} />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Student ID', value: viewStudent.id },
                                    { label: 'National ID', value: viewStudent.nationalId || '—' },
                                    { label: 'Department', value: viewStudent.department },
                                    { label: 'Academic Year', value: viewStudent.year },
                                    { label: 'Phone', value: viewStudent.studentPhone || viewStudent.phoneNumber || '—' },
                                    { label: 'Attendance Rate', value: `${viewStudent.attendanceRate || viewStudent.attendancePercentage || 0}%` },
                                    { label: 'Status', value: viewStudent.approvalStatus },
                                    { label: 'System Status', value: viewStudent.status },
                                ].map(({ label, value }) => (
                                    <Grid key={label} size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                                        <Typography variant="body2" fontWeight={600}>{value}</Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {viewStudent?.approvalStatus === 'APPROVED' && (
                        <Button color="error" onClick={() => { setViewStudent(null); handleAction(viewStudent, 'suspend'); }}>Suspend Student</Button>
                    )}
                    {viewStudent?.approvalStatus === 'SUSPENDED' && (
                        <Button color="primary" onClick={() => { setViewStudent(null); handleAction(viewStudent, 'reactivate'); }}>Reactivate</Button>
                    )}
                    {viewStudent?.approvalStatus === 'PENDING' && (
                        <Button color="success" variant="contained" onClick={() => { setViewStudent(null); handleAction(viewStudent, 'approve'); }}>Approve Student</Button>
                    )}
                    <Button onClick={() => setViewStudent(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Import & Enroll Dialog */}
            <Dialog open={importDialog} onClose={() => !importLoading && !enrollLoading && setImportDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Import Students ({currentYear})</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Use the template below, or upload CSV/Excel with columns: <strong>name, email, department, nationalId</strong> (optional).
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
                            Choose File
                            <input type="file" accept=".csv,.txt,.xlsx,.xls" hidden onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                        </Button>
                        {importFile && <Typography variant="body2">{importFile.name}</Typography>}
                        <Button variant="contained" onClick={handleImportFile} disabled={!importFile || importLoading} startIcon={<UploadFileIcon />} sx={{ borderRadius: 2 }}>
                            {importLoading ? 'Parsing…' : 'Parse'}
                        </Button>
                    </Box>
                    {importRows.length > 0 && (
                        <>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview ({importRows.length} rows)</Typography>
                            <DataTable
                                columns={[
                                    { id: 'name', label: 'Name' },
                                    { id: 'email', label: 'Email' },
                                    { id: 'department', label: 'Department' },
                                    { id: 'nationalId', label: 'National ID', render: (r) => r.nationalId || '—' }
                                ]}
                                rows={importRows}
                                emptyMessage="No rows"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setImportDialog(false)} disabled={enrollLoading}>Cancel</Button>
                    <Button variant="contained" color="success" startIcon={<PersonAddIcon />} onClick={handleEnrollImported}
                        disabled={importRows.length === 0 || enrollLoading}>
                        {enrollLoading ? 'Enrolling…' : `Enroll & Send Credentials (${importRows.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Action Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(p => ({ ...p, open: false }))} maxWidth="xs">
                <DialogTitle>
                    {confirmDialog.action === 'suspend' ? '⚠️ Suspend Student' : confirmDialog.action === 'approve' ? '✅ Approve Student' : '🔄 Reactivate Student'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.action === 'suspend'
                            ? `Are you sure you want to suspend ${confirmDialog.student?.name}? They will lose access to all system features.`
                            : confirmDialog.action === 'approve'
                            ? `Approve ${confirmDialog.student?.name} as a fully enrolled student?`
                            : `Reactivate ${confirmDialog.student?.name} and restore their system access?`}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialog(p => ({ ...p, open: false }))}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={confirmDialog.action === 'suspend' ? 'error' : 'success'}
                        onClick={confirmAction}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
