'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import { useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNotification } from '@/src/context/NotificationContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    ClipboardList, Users, CheckCircle, XCircle,
    Clock, Eye, ChevronRight, Trophy, Star, Plus, Trash2
} from 'lucide-react';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const GOLD = '#FFC600';

const STATUS_PIPELINE = [
    { key: 'PENDING', label: 'Pending Review', color: '#ff9800', icon: <Clock size={16} /> },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: '#2196f3', icon: <Eye size={16} /> },
    { key: 'EXAM_SCHEDULED', label: 'Exam Scheduled', color: '#9c27b0', icon: <ClipboardList size={16} /> },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview', color: '#00bcd4', icon: <Users size={16} /> },
    { key: 'ACCEPTED', label: 'Accepted', color: '#4caf50', icon: <CheckCircle size={16} /> },
    { key: 'REJECTED', label: 'Rejected', color: '#f44336', icon: <XCircle size={16} /> },
];
const PIPELINE_STEPS = ['Application', 'Review', 'Exam', 'Interview', 'Decision'];

function getStepFromStatus(status: string) {
    const map: Record<string, number> = { 'PENDING': 0, 'UNDER_REVIEW': 1, 'EXAM_SCHEDULED': 2, 'INTERVIEW_SCHEDULED': 3, 'ACCEPTED': 4, 'REJECTED': 4 };
    return map[status] ?? 0;
}

function StatusChip({ status }: { status: string }) {
    const s = STATUS_PIPELINE.find(x => x.key === status);
    if (!s) return <Chip label={status} size="small" />;
    return (
        <Chip
            icon={<Box sx={{ color: 'inherit', display: 'flex' }}>{s.icon}</Box>}
            label={s.label} size="small"
            sx={{ bgcolor: alpha(s.color, 0.12), color: s.color, fontWeight: 700, border: `1px solid ${alpha(s.color, 0.3)}`, '& .MuiChip-icon': { color: s.color } }}
        />
    );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function callApi(path: string, method: string, body?: any) {
    const token = localStorage.getItem('sasms_token');
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Request failed');
    }
    return res.json();
}

const DEFAULT_CRITERIA = [
    { name: 'Communication Skills', score: 0, maxScore: 10 },
    { name: 'Technical Knowledge', score: 0, maxScore: 10 },
    { name: 'Problem Solving', score: 0, maxScore: 10 },
    { name: 'Motivation & Attitude', score: 0, maxScore: 10 },
];

const DEFAULT_EXAM_SUBJECTS = [
    { name: 'Mathematics', score: null as number | null, maxScore: 100 },
    { name: 'English Language', score: null as number | null, maxScore: 100 },
    { name: 'Sciences', score: null as number | null, maxScore: 100 },
];

// ─── File Viewer ────────────────────────────────────────────────────────────
function FileViewer({ url, label, open, onClose }: { url: string; label: string; open: boolean; onClose: () => void }) {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
    const isPdf = /\.pdf$/i.test(url);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { bgcolor: '#111', border: `1px solid ${alpha(GOLD, 0.2)}`, borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', borderBottom: `1px solid ${alpha(GOLD, 0.15)}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InsertDriveFileIcon sx={{ color: GOLD }} />
                    <Typography fontWeight={700}>{label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<DownloadIcon />} href={url} download target="_blank"
                        sx={{ color: GOLD, borderColor: alpha(GOLD, 0.4) }} variant="outlined">Download</Button>
                    <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a0a0a' }}>
                {isImage ? (
                    <Box component="img" src={url} alt={label} sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', p: 2 }} />
                ) : isPdf ? (
                    <Box component="iframe" src={url} sx={{ width: '100%', height: '70vh', border: 'none' }} title={label} />
                ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <InsertDriveFileIcon sx={{ fontSize: 64, color: alpha(GOLD, 0.4), mb: 2 }} />
                        <Typography color="rgba(255,255,255,0.6)" sx={{ mb: 2 }}>Preview not available.</Typography>
                        <Button variant="contained" href={url} download target="_blank"
                            sx={{ bgcolor: GOLD, color: '#000', fontWeight: 700 }} startIcon={<DownloadIcon />}>Download File</Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ─── Export ──────────────────────────────────────────────────────────────────
function exportToCSV(data: any[], filename: string, columns: { key: string; label: string }[]) {
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => {
        const val = c.key.split('.').reduce((obj: any, key) => obj?.[key], row);
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

export default function AdminAdmissionsPage() {
    const theme = useTheme();
    const { showNotification } = useNotification();
    const isDark = theme.palette.mode === 'dark';

    const [applicants, setApplicants] = useState<any[]>([]);
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [notes, setNotes] = useState('');
    const [minScore, setMinScore] = useState<number>(0);
    const [updatingScore, setUpdatingScore] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [mainTab, setMainTab] = useState(0);

    const [examForm, setExamForm] = useState({ examDate: '', examLocation: '', examNotes: '' });
    const [examSubjects, setExamSubjects] = useState(DEFAULT_EXAM_SUBJECTS.map(s => ({ ...s })));
    const [savingExamScore, setSavingExamScore] = useState(false);

    const [interviewForm, setInterviewForm] = useState({ interviewDate: '', interviewLocation: '', interviewNotes: '' });
    const [criteria, setCriteria] = useState(DEFAULT_CRITERIA.map(c => ({ ...c })));
    const [interviewNote, setInterviewNote] = useState('');
    const [savingInterview, setSavingInterview] = useState(false);

    const [admWindow, setAdmWindow] = useState({ isOpen: false, startDate: '', endDate: '' });
    const [savingWindow, setSavingWindow] = useState(false);

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [lbLoading, setLbLoading] = useState(false);
    const [exportCount, setExportCount] = useState(50);

    const [fileViewer, setFileViewer] = useState({ open: false, url: '', label: '' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lbSelectedIds, setLbSelectedIds] = useState<string[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    const statusGroups = STATUS_PIPELINE.map(s => ({
        ...s, count: applicants.filter(a => (a.status || 'PENDING').toUpperCase() === s.key).length
    }));

    useEffect(() => { fetchData(); fetchWindow(); fetchThreshold(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const apps = await callApi('/admissions', 'GET');
            setApplicants(apps);
            const cfs = await callApi('/system/form-fields', 'GET');
            setCustomFields(Array.isArray(cfs) ? cfs : []);
        } catch (e) {
            showNotification('Failed to load applicants', 'error');
        } finally {
            setLoading(false);
        }
    };
    const fetchWindow = () => {
        callApi('/admissions/window', 'GET').then(data => setAdmWindow({ isOpen: data.isOpen || false, startDate: data.startDate ? data.startDate.slice(0, 16) : '', endDate: data.endDate ? data.endDate.slice(0, 16) : '' })).catch(() => { });
    };
    const fetchThreshold = () => callApi('/admissions/threshold', 'GET').then(res => setMinScore(res.minScore ?? 0)).catch(() => { });
    const fetchLeaderboard = () => {
        setLbLoading(true);
        callApi('/admissions/leaderboard', 'GET').then(setLeaderboard).catch(() => showNotification('Failed to load leaderboard', 'error')).finally(() => setLbLoading(false));
    };

    useEffect(() => { if (mainTab === 1) fetchLeaderboard(); }, [mainTab]);

    useEffect(() => {
        if (selectedApp) {
            const s = (() => { try { return selectedApp.examSubjects ? JSON.parse(selectedApp.examSubjects) : null; } catch { return null; } })();
            setExamSubjects(s || DEFAULT_EXAM_SUBJECTS.map(x => ({ ...x })));
            const c = (() => { try { return selectedApp.interviewCriteria ? JSON.parse(selectedApp.interviewCriteria) : null; } catch { return null; } })();
            setCriteria(c || DEFAULT_CRITERIA.map(x => ({ ...x })));
            setInterviewNote(selectedApp.interviewNote || '');
        }
    }, [selectedApp?.id]);

    const handleStatusChange = async (status: string) => {
        if (!selectedApp) return;
        setActionLoading(true);
        const prev = applicants;
        const prevSel = selectedApp;
        setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, status } : a));
        setSelectedApp((p: any) => ({ ...p, status }));
        try {
            const updated = await callApi(`/admissions/${selectedApp.id}/review`, 'PATCH', { status, feedback: notes || undefined });
            setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
            setSelectedApp((p: any) => ({ ...p, ...updated }));
            showNotification(`Status updated → ${status}`, 'success');
            setNotes('');
        } catch (err: any) {
            setApplicants(prev);
            setSelectedApp(prevSel);
            showNotification(err.message || 'Failed', 'error');
        } finally { setActionLoading(false); }
    };

    const handleScheduleExam = async () => {
        if (!selectedApp || !examForm.examDate || !examForm.examLocation) { showNotification('Fill exam date & location', 'warning'); return; }
        setActionLoading(true);
        try {
            const updated = await callApi(`/admissions/${selectedApp.id}/schedule-exam`, 'POST', examForm);
            setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
            setSelectedApp((p: any) => ({ ...p, ...updated }));
            showNotification('Exam scheduled! Student notified.', 'success');
            setExamForm({ examDate: '', examLocation: '', examNotes: '' });
        } catch (err: any) { showNotification(err.message || 'Failed', 'error'); }
        finally { setActionLoading(false); }
    };

    const handleScheduleInterview = async () => {
        if (!selectedApp || !interviewForm.interviewDate || !interviewForm.interviewLocation) { showNotification('Fill interview date & location', 'warning'); return; }
        setActionLoading(true);
        try {
            const updated = await callApi(`/admissions/${selectedApp.id}/schedule-interview`, 'POST', interviewForm);
            setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
            setSelectedApp((p: any) => ({ ...p, ...updated }));
            showNotification('Interview scheduled!', 'success');
            setInterviewForm({ interviewDate: '', interviewLocation: '', interviewNotes: '' });
        } catch (err: any) { showNotification(err.message || 'Failed', 'error'); }
        finally { setActionLoading(false); }
    };

    const handleSaveExamScore = async () => {
        if (!selectedApp) return;
        setSavingExamScore(true);
        const filled = examSubjects.filter(s => s.score !== null);
        const total = filled.reduce((s, x) => s + (x.score ?? 0), 0);
        const max = filled.reduce((s, x) => s + x.maxScore, 0);
        const pct = max > 0 ? (total / max) * 100 : 0;
        try {
            const updated = await callApi(`/admissions/${selectedApp.id}/exam-score`, 'PATCH', {
                examScore: filled.length > 0 ? Math.round(pct * 10) / 10 : null,
                examNote: examSubjects.map(s => `${s.name}: ${s.score ?? '-'}/${s.maxScore}`).join(' | '),
                examSubjects,
            });
            setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
            setSelectedApp((p: any) => ({ ...p, ...updated }));
            showNotification('Exam scores saved!', 'success');
        } catch (err: any) { showNotification(err.message || 'Failed', 'error'); }
        finally { setSavingExamScore(false); }
    };

    const handleSaveInterviewScore = async () => {
        if (!selectedApp) return;
        setSavingInterview(true);
        const total = criteria.reduce((s, c) => s + (c.score || 0), 0);
        const max = criteria.reduce((s, c) => s + (c.maxScore || 10), 0);
        const pct = max > 0 ? (total / max) * 100 : 0;
        try {
            const updated = await callApi(`/admissions/${selectedApp.id}/interview-score`, 'PATCH', { interviewScore: Math.round(pct * 10) / 10, interviewNote: interviewNote || null, interviewCriteria: criteria });
            setApplicants(p => p.map(a => a.id === selectedApp.id ? { ...a, ...updated } : a));
            setSelectedApp((p: any) => ({ ...p, ...updated }));
            showNotification('Interview scores saved!', 'success');
        } catch (err: any) { showNotification(err.message || 'Failed', 'error'); }
        finally { setSavingInterview(false); }
    };

    const handleLeaderboardApprove = async (app: any) => {
        try {
            const updated = await callApi(`/admissions/${app.id}/review`, 'PATCH', { status: 'ACCEPTED' });
            setLeaderboard(p => p.map(a => a.id === app.id ? { ...a, ...updated } : a));
            setApplicants(p => p.map(a => a.id === app.id ? { ...a, ...updated } : a));
            showNotification(`✅ ${app.name} accepted!`, 'success');
        } catch (err: any) { showNotification(err.message || 'Failed', 'error'); }
    };

    const handleBulkLeaderboardApprove = async () => {
        const eligible = lbSelectedIds.filter(id => {
            const app = leaderboard.find(a => a.id === id);
            return app && app.status !== 'ACCEPTED' && app.interviewScore != null;
        });
        if (eligible.length === 0) {
            showNotification('Select unapproved applicants with interview scores.', 'warning');
            return;
        }
        setBulkLoading(true);
        let updatedCount = 0;
        for (const id of eligible) {
            try {
                const updated = await callApi(`/admissions/${id}/review`, 'PATCH', { status: 'ACCEPTED' });
                setLeaderboard(p => p.map(a => a.id === id ? { ...a, ...updated } : a));
                setApplicants(p => p.map(a => a.id === id ? { ...a, ...updated } : a));
                updatedCount++;
            } catch (err: any) { }
        }
        showNotification(`✅ Accepted ${updatedCount} applicant(s).`, 'success');
        setLbSelectedIds([]);
        setBulkLoading(false);
    };

    const handleBulkRejectRemaining = async () => {
        if (!confirm('Are you sure you want to reject all unaccepted applicants? This action cannot be easily undone.')) return;
        
        const eligible = leaderboard.filter(a => a.status !== 'ACCEPTED' && a.status !== 'REJECTED').map(a => a.id);
        if (eligible.length === 0) {
            showNotification('No remaining applicants to reject.', 'info');
            return;
        }
        setBulkLoading(true);
        let updatedCount = 0;
        for (const id of eligible) {
            try {
                const updated = await callApi(`/admissions/${id}/review`, 'PATCH', { status: 'REJECTED' });
                setLeaderboard(p => p.map(a => a.id === id ? { ...a, ...updated } : a));
                setApplicants(p => p.map(a => a.id === id ? { ...a, ...updated } : a));
                updatedCount++;
            } catch (err: any) { }
        }
        showNotification(`❌ Rejected ${updatedCount} remaining applicant(s).`, 'success');
        setBulkLoading(false);
    };

    const handleBulkScheduleExam = async () => {
        const eligible = selectedIds.filter(id => {
            const app = applicants.find(a => a.id === id);
            return app && (app.status || '').toUpperCase() === 'UNDER_REVIEW';
        });
        if (!examForm.examDate || !examForm.examLocation || eligible.length === 0) {
            showNotification(eligible.length === 0 ? 'Select applicants in Under Review' : 'Fill exam date & location', 'warning');
            return;
        }
        setBulkLoading(true);
        try {
            const res = await callApi('/admissions/bulk-schedule-exam', 'POST', {
                applicationIds: eligible,
                examDate: examForm.examDate,
                examLocation: examForm.examLocation,
                examNotes: examForm.examNotes || undefined,
            });
            showNotification(`✅ Scheduled exam for ${res.updated} applicant(s)${res.failed ? ` (${res.failed} failed)` : ''}`, 'success');
            setSelectedIds([]);
            setExamForm({ examDate: '', examLocation: '', examNotes: '' });
            fetchData();
        } catch (err: any) { showNotification(err?.message || 'Failed', 'error'); }
        finally { setBulkLoading(false); }
    };

    const handleBulkMarkUnderReview = async () => {
        const eligible = selectedIds.filter(id => {
            const app = applicants.find(a => a.id === id);
            return app && (app.status || '').toUpperCase() === 'PENDING';
        });
        if (eligible.length === 0) {
            showNotification('Select applicants in Pending Review', 'warning');
            return;
        }
        setBulkLoading(true);
        try {
            const res = await callApi('/admissions/bulk-under-review', 'PATCH', { applicationIds: eligible });
            showNotification(`✅ Moved ${res.updated} applicant(s) to Under Review${res.failed ? ` (${res.failed} failed)` : ''}`, 'success');
            setSelectedIds([]);
            fetchData();
        } catch (err: any) { showNotification(err?.message || 'Failed', 'error'); }
        finally { setBulkLoading(false); }
    };

    const handleBulkScheduleInterview = async () => {
        const eligible = selectedIds.filter(id => {
            const app = applicants.find(a => a.id === id);
            return app && (app.status || '').toUpperCase() === 'EXAM_SCHEDULED' && app.examScore != null;
        });
        if (!interviewForm.interviewDate || !interviewForm.interviewLocation || eligible.length === 0) {
            showNotification(eligible.length === 0 ? 'Select applicants with graded Exams' : 'Fill interview date & location', 'warning');
            return;
        }
        setBulkLoading(true);
        try {
            const res = await callApi('/admissions/bulk-schedule-interview', 'POST', {
                applicationIds: eligible,
                interviewDate: interviewForm.interviewDate,
                interviewLocation: interviewForm.interviewLocation,
                interviewNotes: interviewForm.interviewNotes || undefined,
            });
            showNotification(`✅ Scheduled interview for ${res.updated} applicant(s)${res.failed ? ` (${res.failed} failed)` : ''}`, 'success');
            setSelectedIds([]);
            setInterviewForm({ interviewDate: '', interviewLocation: '', interviewNotes: '' });
            fetchData();
        } catch (err: any) { showNotification(err?.message || 'Failed', 'error'); }
        finally { setBulkLoading(false); }
    };

    const handleSaveAdmissionWindow = async () => {
        setSavingWindow(true);
        try {
            await callApi('/admissions/window', 'PUT', {
                isOpen: admWindow.isOpen,
                startDate: admWindow.startDate,
                endDate: admWindow.endDate,
            });
            showNotification('✅ Admission window saved!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Failed to save window settings', 'error');
        } finally {
            setSavingWindow(false);
        }
    };

    const handleUpdateMinScore = async () => {
        setUpdatingScore(true);
        try {
            await callApi('/admissions/threshold', 'PUT', { minScore });
            showNotification('✅ Minimum score updated!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Failed to update threshold', 'error');
        } finally {
            setUpdatingScore(false);
        }
    };

    const openFile = (url: string, label: string) => {
        const fullUrl = `${API_BASE}/admissions/documents/${url.split('/').pop()?.split('\\').pop()}`;
        setFileViewer({ open: true, url: fullUrl, label });
    };

    const tabStatuses = ['ALL', 'PENDING', 'UNDER_REVIEW', 'EXAM_SCHEDULED', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'];
    const filteredApplicants = activeTab === 0 ? applicants : applicants.filter(a => (a.status || 'PENDING').toUpperCase() === tabStatuses[activeTab]);

    const appExportCols = [
        { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Mobile' },
        { key: 'nationalId', label: 'National ID' }, { key: 'department', label: 'Department' },
        { key: 'ministryScore', label: 'Ministry Score %' }, { key: 'examScore', label: 'Exam Score %' },
        { key: 'interviewScore', label: 'Interview Score %' }, { key: 'status', label: 'Status' },
    ];
    const lbExportCols = [
        { key: 'rank', label: 'Rank' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Mobile' },
        { key: 'department', label: 'Department' }, { key: 'ministryScore', label: 'Ministry %' },
        { key: 'examScore', label: 'Exam %' }, { key: 'interviewScore', label: 'Interview %' },
        { key: 'totalScore', label: 'Average %' }, { key: 'status', label: 'Status' },
    ];

    const goldBtn = { bgcolor: GOLD, color: '#000', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#e6b200' } };
    const cardSx = {
        borderRadius: 3, border: `1px solid ${alpha(GOLD, 0.15)}`,
        bgcolor: isDark ? alpha('#111', 0.85) : alpha('#fff', 0.9),
        backdropFilter: 'blur(12px)',
        transition: 'all 0.25s',
        '&:hover': { borderColor: alpha(GOLD, 0.45), boxShadow: `0 8px 32px ${alpha(GOLD, 0.1)}`, transform: 'translateY(-2px)' }
    };

    const goldTabsSx = {
        '& .MuiTab-root': { fontWeight: 700, letterSpacing: '0.03em' },
        '& .Mui-selected': { color: `${GOLD} !important` },
        '& .MuiTabs-indicator': { bgcolor: GOLD, height: 3, borderRadius: '3px 3px 0 0' },
    };

    const columns: Column<any>[] = [
        {
            id: 'id', label: 'App ID',
            render: (row) => (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha(GOLD, 0.1), px: 1, py: 0.25, borderRadius: 1, color: GOLD, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    #{(row.id || '').toString().slice(0, 8).toUpperCase()}
                </Typography>
            )
        },
        {
            id: 'name', label: 'Applicant',
            render: (row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 38, height: 38, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontSize: 14, fontWeight: 900 }}>{row.name?.[0] || '?'}</Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'phone', label: 'Phone',
            render: (row) => row.phone ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>📱 {row.phone}</Typography>
                </Box>
            ) : <Typography variant="caption" color="text.secondary">—</Typography>
        },
        { id: 'department', label: 'Program', render: (row) => row.department || row.preferredDept?.name || 'N/A' },
        { id: 'ministryScore', label: 'Ministry', render: (row) => {
            const score = row.ministryScore;
            const isBelow = score != null && score < minScore && minScore > 0;
            return score != null ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={`${score}%`} size="small" color={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'} sx={{ fontWeight: 700 }} />
                    {isBelow && <Tooltip title={`Below minimum (${minScore}%)`}><Chip label="⚠️" size="small" color="error" sx={{ fontWeight: 700 }} /></Tooltip>}
                </Box>
            ) : <Typography variant="caption" color="text.secondary">N/A</Typography>;
        } },
        { id: 'examScore', label: 'Exam', render: (row) => row.examScore != null ? <Chip label={`${row.examScore}%`} size="small" color="info" sx={{ fontWeight: 700 }} /> : <Typography variant="caption" color="text.secondary">—</Typography> },
        { id: 'interviewScore', label: 'Interview', render: (row) => row.interviewScore != null ? <Chip label={`${row.interviewScore}%`} size="small" color="secondary" sx={{ fontWeight: 700 }} /> : <Typography variant="caption" color="text.secondary">—</Typography> },
        { id: 'avgScore', label: 'Avg', render: (row) => {
            const scores = [row.ministryScore, row.examScore, row.interviewScore].filter((x: any) => x != null);
            const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : null;
            const isBelow = avg != null && avg < minScore && minScore > 0;
            return avg != null ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={`${avg.toFixed(1)}%`} size="small" color={avg >= 80 ? 'success' : avg >= 60 ? 'warning' : 'error'} sx={{ fontWeight: 700 }} />
                    {isBelow && <Tooltip title={`Below minimum (${minScore}%)`}><Chip label="⚠️" size="small" color="error" sx={{ fontWeight: 700 }} /></Tooltip>}
                </Box>
            ) : <Typography variant="caption" color="text.secondary">—</Typography>;
        } },
        { id: 'status', label: 'Status', render: (row) => <StatusChip status={(row.status || 'PENDING').toUpperCase()} /> },
        {
            id: 'actions', label: '',
            render: (row) => (
                <Button size="small" variant="outlined" endIcon={<ChevronRight size={14} />}
                    onClick={() => { setSelectedApp(row); setNotes(row.notes || ''); }}
                    sx={{ borderRadius: 2, fontWeight: 600, borderColor: alpha(GOLD, 0.4), color: GOLD, '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.08) } }}>
                    Manage
                </Button>
            )
        }
    ];

    const lbColumns: Column<any>[] = [
        { id: 'rank', label: '#', render: (row) => row.rank <= 3 ? <EmojiEventsIcon sx={{ color: row.rank === 1 ? '#FFD700' : row.rank === 2 ? '#C0C0C0' : '#CD7F32', fontSize: 22 }} /> : <Typography fontWeight={800} color="text.secondary" sx={{ fontFamily: 'monospace' }}>#{row.rank}</Typography> },
        { id: 'name', label: 'Applicant', render: (row) => <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 34, height: 34, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontSize: 13, fontWeight: 900 }}>{row.name?.[0]}</Avatar><Box><Typography variant="body2" fontWeight={700}>{row.name}</Typography><Typography variant="caption" color="text.secondary">{row.department}</Typography></Box></Box> },
        { id: 'phone', label: '📱 Mobile', render: (row) => row.phone ? <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.phone}</Typography> : <Typography variant="caption" color="text.secondary">—</Typography> },
        { id: 'ministryScore', label: 'Ministry %', render: (row) => row.ministryScore != null ? `${row.ministryScore}%` : '—' },
        { id: 'examScore', label: 'Exam %', render: (row) => row.examScore != null ? `${row.examScore}%` : '—' },
        { id: 'interviewScore', label: 'Interview %', render: (row) => row.interviewScore != null ? `${row.interviewScore}%` : '—' },
        { id: 'totalScore', label: 'Average', render: (row) => {
            const isBelow = (row.totalScore ?? 0) < minScore && minScore > 0;
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={`${row.totalScore?.toFixed(1)}%`} size="small" color={row.totalScore >= 80 ? 'success' : row.totalScore >= 60 ? 'warning' : 'error'} sx={{ fontWeight: 800 }} />
                    {isBelow && <Tooltip title={`Below minimum (${minScore}%)`}><Chip label="⚠️ Below threshold" size="small" color="error" sx={{ fontWeight: 700 }} /></Tooltip>}
                </Box>
            );
        } },
        { id: 'status', label: 'Status', render: (row) => <StatusChip status={(row.status || 'PENDING').toUpperCase()} /> },
        {
            id: 'actions', label: 'Quick Action', render: (row) => (
                row.status !== 'ACCEPTED' ? (
                    <Button size="small" variant="contained" startIcon={<CheckCircleIcon />}
                        disabled={row.interviewScore == null}
                        onClick={() => handleLeaderboardApprove(row)}
                        sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#388e3c' }, '&:disabled': { opacity: 0.5 } }}>
                        Approve
                    </Button>
                ) : <Chip label="✅ Accepted" size="small" sx={{ bgcolor: alpha('#4caf50', 0.12), color: '#4caf50', fontWeight: 700 }} />
            )
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <PageHeader
                title="Admission Management"
                description="Complete multi-stage pipeline: Review → Exam → Interview → Decision"
                action={
                    <Button variant="outlined" startIcon={<DownloadIcon />}
                        onClick={() => exportToCSV(filteredApplicants, 'applications', appExportCols)}
                        sx={{ borderColor: alpha(GOLD, 0.5), color: GOLD, '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.08) } }}>
                        Export CSV
                    </Button>
                }
            />

            {/* Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 2 }}>
                {statusGroups.map((s, i) => (
                    <MotionPaper key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        sx={{ ...cardSx, p: 2, cursor: 'pointer', textAlign: 'center' }}
                        onClick={() => { setMainTab(0); setActiveTab(STATUS_PIPELINE.findIndex(x => x.key === s.key) + 1); }}>
                        <Typography variant="h3" fontWeight={900} sx={{ color: s.color, fontFamily: 'monospace' }}>{s.count}</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                    </MotionPaper>
                ))}
            </Box>

            {/* Main Tabs */}
            <Box sx={{ borderBottom: `1px solid ${alpha(GOLD, 0.2)}` }}>
                <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={goldTabsSx}>
                    <Tab icon={<ClipboardList size={16} />} iconPosition="start" label="Applications" />
                    <Tab icon={<Trophy size={16} />} iconPosition="start" label="Leaderboard" />
                    <Tab icon={<SettingsIcon fontSize="small" />} iconPosition="start" label="Settings" />
                </Tabs>
            </Box>

            {/* APPLICATIONS */}
            {mainTab === 0 && (
                <ContentSection title="Applications Database">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={goldTabsSx} variant="scrollable" scrollButtons="auto">
                            <Tab label={<Badge badgeContent={applicants.length} color="primary" sx={{ pr: 1.5 }}>All</Badge>} />
                            {STATUS_PIPELINE.map(s => <Tab key={s.key} label={<Badge badgeContent={statusGroups.find(x => x.key === s.key)?.count || 0} color="default" sx={{ pr: 1.5 }}>{s.label}</Badge>} />)}
                        </Tabs>
                        <Button size="small" startIcon={<DownloadIcon />}
                            onClick={() => exportToCSV(filteredApplicants, `applications_${tabStatuses[activeTab].toLowerCase()}`, appExportCols)}
                            sx={{ color: GOLD, borderColor: alpha(GOLD, 0.4), '&:hover': { borderColor: GOLD } }} variant="outlined">Export</Button>
                    </Box>
                    {selectedIds.length > 0 && (() => {
                        const selectedApps = selectedIds.map(id => applicants.find(a => a.id === id)).filter(Boolean);
                        const pendingCount = selectedApps.filter((a: any) => (a.status || '').toUpperCase() === 'PENDING').length;
                        const underReviewCount = selectedApps.filter((a: any) => (a.status || '').toUpperCase() === 'UNDER_REVIEW').length;
                        const examScheduledGradedCount = selectedApps.filter((a: any) => (a.status || '').toUpperCase() === 'EXAM_SCHEDULED' && a.examScore != null).length;
                        return (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: alpha(GOLD, 0.4), bgcolor: alpha(GOLD, 0.04) }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>📋 Bulk actions for {selectedIds.length} selected</Typography>
                            <Stack spacing={2}>
                                {pendingCount > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Move to Under Review (Pending Review → Under Review) • {pendingCount} eligible</Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" flexWrap="wrap">
                                        <Button variant="contained" disabled={bulkLoading} onClick={handleBulkMarkUnderReview}
                                            startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <Eye size={16} />}
                                            sx={{ ...goldBtn, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}>
                                            Bulk Mark Under Review
                                        </Button>
                                    </Stack>
                                </Box>
                                )}
                                {underReviewCount > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Schedule Exam (for Under Review) • {underReviewCount} eligible</Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" flexWrap="wrap">
                                        <TextField label="Exam Date & Time" type="datetime-local" size="small" value={examForm.examDate} onChange={e => setExamForm(p => ({ ...p, examDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 220 }} />
                                        <TextField label="Exam Location" size="small" value={examForm.examLocation} onChange={e => setExamForm(p => ({ ...p, examLocation: e.target.value }))} sx={{ minWidth: 200 }} />
                                        <TextField label="Notes" size="small" value={examForm.examNotes} onChange={e => setExamForm(p => ({ ...p, examNotes: e.target.value }))} placeholder="Optional" sx={{ minWidth: 150 }} />
                                        <Button variant="contained" disabled={bulkLoading} onClick={handleBulkScheduleExam} startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <ClipboardList size={16} />} sx={{ ...goldBtn }}>Bulk Schedule Exam</Button>
                                    </Stack>
                                </Box>
                                )}
                                {examScheduledGradedCount > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Schedule Interview (for Graded Exams) • {examScheduledGradedCount} eligible</Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" flexWrap="wrap">
                                        <TextField label="Interview Date & Time" type="datetime-local" size="small" value={interviewForm.interviewDate} onChange={e => setInterviewForm(p => ({ ...p, interviewDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 220 }} />
                                        <TextField label="Interview Location" size="small" value={interviewForm.interviewLocation} onChange={e => setInterviewForm(p => ({ ...p, interviewLocation: e.target.value }))} sx={{ minWidth: 200 }} />
                                        <TextField label="Notes" size="small" value={interviewForm.interviewNotes} onChange={e => setInterviewForm(p => ({ ...p, interviewNotes: e.target.value }))} placeholder="Optional" sx={{ minWidth: 150 }} />
                                        <Button variant="contained" disabled={bulkLoading} onClick={handleBulkScheduleInterview} startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <Users size={16} />} sx={{ ...goldBtn, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' } }}>Bulk Schedule Interview</Button>
                                    </Stack>
                                </Box>
                                )}
                                <Button size="small" variant="text" onClick={() => setSelectedIds([])} sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}>Clear selection</Button>
                            </Stack>
                        </Paper>
                        );
                    })()}
                    {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: GOLD }} /></Box>
                        : <DataTable columns={columns} rows={filteredApplicants} emptyMessage="No applications found." selectable selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(r) => r.id} />}
                </ContentSection>
            )}

            {/* LEADERBOARD */}
            {mainTab === 1 && (
                <ContentSection title="🏆 Applicant Rankings">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Sorted by average score. Approve top candidates directly from here.</Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <Button variant="outlined" color="error" startIcon={<XCircle size={16} />}
                                onClick={handleBulkRejectRemaining} disabled={bulkLoading}
                                sx={{ fontWeight: 700, borderRadius: 2 }}>
                                Reject Remaining
                            </Button>
                            <TextField select size="small" label="Export top" value={exportCount}
                                onChange={e => setExportCount(Number(e.target.value))} sx={{ width: 130 }}>
                                {[10, 25, 50, 100].map(n => <MenuItem key={n} value={n}>Top {n}</MenuItem>)}
                                <MenuItem value={99999}>All</MenuItem>
                            </TextField>
                            <Button variant="outlined" startIcon={<DownloadIcon />}
                                onClick={() => exportToCSV(leaderboard.slice(0, exportCount), 'leaderboard', lbExportCols)}
                                sx={{ borderColor: alpha(GOLD, 0.4), color: GOLD, '&:hover': { borderColor: GOLD } }}>Export</Button>
                        </Box>
                    </Box>
                    {lbSelectedIds.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: alpha(GOLD, 0.4), bgcolor: alpha(GOLD, 0.04) }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                📋 Bulk actions for {lbSelectedIds.length} selected
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" flexWrap="wrap">
                                <Button variant="contained" disabled={bulkLoading} onClick={handleBulkLeaderboardApprove}
                                    startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                                    sx={{ bgcolor: '#4caf50', color: '#fff', '&:hover': { bgcolor: '#388e3c' }, fontWeight: 700 }}>
                                    Approve Selected
                                </Button>
                                <Button size="small" variant="text" onClick={() => setLbSelectedIds([])} sx={{ color: 'text.secondary' }}>Clear selection</Button>
                            </Stack>
                        </Paper>
                    )}
                    {lbLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: GOLD }} /></Box>
                        : <DataTable columns={lbColumns} rows={leaderboard} emptyMessage="No data yet." selectable selectedIds={lbSelectedIds} onSelectionChange={setLbSelectedIds} getRowId={(r) => r.id} />}
                </ContentSection>
            )}

            {/* SETTINGS */}
            {mainTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <ContentSection title="📅 Admission Registration Window">
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography fontWeight={700} fontSize={14}>Status:</Typography>
                                <Button variant={admWindow.isOpen ? 'contained' : 'outlined'} color={admWindow.isOpen ? 'success' : 'error'} size="small"
                                    onClick={() => setAdmWindow(p => ({ ...p, isOpen: !p.isOpen }))} sx={{ borderRadius: 2, fontWeight: 700 }}>
                                    {admWindow.isOpen ? '✅ OPEN' : '🔒 CLOSED'}
                                </Button>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField label="Registration Opens" type="datetime-local" value={admWindow.startDate} onChange={e => setAdmWindow(p => ({ ...p, startDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                                <TextField label="Registration Closes" type="datetime-local" value={admWindow.endDate} onChange={e => setAdmWindow(p => ({ ...p, endDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                            </Box>
                            <Button variant="contained" onClick={handleSaveAdmissionWindow} disabled={savingWindow}
                                startIcon={savingWindow ? <CircularProgress size={14} color="inherit" /> : <CalendarMonthIcon />}
                                sx={{ width: 'fit-content', ...goldBtn }}>Save Window Settings</Button>
                        </Stack>
                    </ContentSection>
                    <ContentSection title="⚙️ Admission Threshold">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField label="Minimum Score (%)" type="number" size="small" value={minScore}
                                onChange={e => setMinScore(Number(e.target.value))} sx={{ width: 260 }}
                                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                            <Button variant="contained" onClick={handleUpdateMinScore} disabled={updatingScore} sx={goldBtn}>
                                {updatingScore ? <CircularProgress size={14} color="inherit" /> : 'Update'}
                            </Button>
                        </Box>
                    </ContentSection>
                </Box>
            )}

            {/* DETAIL DRAWER */}
            <Drawer anchor="right" open={Boolean(selectedApp)} onClose={() => setSelectedApp(null)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 580 }, p: 0, overflow: 'hidden', bgcolor: isDark ? '#0d0d0d' : '#f9f7f2', borderLeft: `1px solid ${alpha(GOLD, 0.2)}` } }}>
                {selectedApp && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header */}
                        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a0a 100%)', color: 'white', borderBottom: `2px solid ${GOLD}`, position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: alpha(GOLD, 0.06) } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar sx={{ width: 56, height: 56, background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontSize: 24, fontWeight: 900, boxShadow: `0 4px 20px ${alpha(GOLD, 0.4)}` }}>{selectedApp.name?.[0]}</Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>{selectedApp.name}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>{selectedApp.email}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.5 }}>{selectedApp.department || selectedApp.preferredDept?.name || 'No department'}</Typography>
                                        {selectedApp.phone && (
                                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                📱 {selectedApp.phone}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <IconButton onClick={() => setSelectedApp(null)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: GOLD } }}><CloseIcon /></IconButton>
                            </Box>
                            <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                                <Stepper activeStep={getStepFromStatus((selectedApp.status || 'PENDING').toUpperCase())} alternativeLabel
                                    sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }, '& .MuiStepLabel-label.Mui-active': { color: GOLD }, '& .MuiStepLabel-label.Mui-completed': { color: 'rgba(255,255,255,0.6)' } }}>
                                    {PIPELINE_STEPS.map(label => <Step key={label}><StepLabel StepIconProps={{ sx: { color: 'rgba(255,255,255,0.2)', '&.Mui-active': { color: GOLD }, '&.Mui-completed': { color: '#4caf50' } } }}>{label}</StepLabel></Step>)}
                                </Stepper>
                            </Box>
                        </Box>

                        {/* Body */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                            <Stack spacing={3}>
                                {/* Scores */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                                    {[{ label: 'Ministry', value: selectedApp.ministryScore != null ? `${selectedApp.ministryScore}%` : '—', color: '#2196f3' }, { label: 'Exam', value: selectedApp.examScore != null ? `${selectedApp.examScore}%` : '—', color: '#9c27b0' }, { label: 'Interview', value: selectedApp.interviewScore != null ? `${selectedApp.interviewScore}%` : '—', color: '#00bcd4' }].map(s => (
                                        <Paper key={s.label} variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: alpha(s.color, 0.3), bgcolor: alpha(s.color, 0.04), borderRadius: 2 }}>
                                            <Typography variant="h5" fontWeight={900} sx={{ color: s.color, fontFamily: 'monospace' }}>{s.value}</Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</Typography>
                                        </Paper>
                                    ))}
                                </Box>

                                {/* Documents */}
                                <Box>
                                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>📎 Documents</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                                        {(() => {
                                            const baseDocs = [
                                                { label: 'Birth Certificate', url: selectedApp.birthCertificateUrl }, 
                                                { label: 'National ID / Passport', url: selectedApp.idCardUrl }, 
                                                { label: 'Ministry Result', url: selectedApp.ministryResultUrl }, 
                                                { label: 'Payment Receipt', url: selectedApp.receiptUrl }
                                            ];
                                            let parsedOtherDocs: any[] = [];
                                            try {
                                                parsedOtherDocs = selectedApp.otherDocsUrls ? JSON.parse(selectedApp.otherDocsUrls) : [];
                                            } catch (e) {}

                                            const extraFileFields = customFields.filter(f => f.type === 'file');
                                            const extraDocs = extraFileFields.map((f, idx) => ({
                                                label: f.label,
                                                url: parsedOtherDocs[idx] || null
                                            }));

                                            const allDocs = [...baseDocs, ...extraDocs];

                                            return allDocs.map(doc => (
                                                <Button key={doc.label} variant="outlined" size="small"
                                                    sx={{ justifyContent: 'flex-start', borderRadius: 2, textTransform: 'none', borderColor: doc.url ? alpha(GOLD, 0.35) : 'divider', color: doc.url ? GOLD : 'text.disabled', '&:hover': doc.url ? { borderColor: GOLD, bgcolor: alpha(GOLD, 0.06) } : {}, fontSize: 12 }}
                                                    startIcon={<InsertDriveFileIcon sx={{ fontSize: 16 }} />}
                                                    endIcon={doc.url ? <VisibilityIcon sx={{ fontSize: 14 }} /> : undefined}
                                                    disabled={!doc.url} onClick={() => doc.url && openFile(doc.url, doc.label)}>
                                                    {doc.label} {!doc.url && '(N/A)'}
                                                </Button>
                                            ));
                                        })()}
                                    </Box>
                                </Box>

                                {/* Extra Details (Custom Fields) */}
                                {customFields.length > 0 && selectedApp.customFieldsData && (() => {
                                    try {
                                        const parsed = JSON.parse(selectedApp.customFieldsData);
                                        const visibleFields = customFields.filter(f => f.visibleToAdmin && f.type !== 'file');
                                        if (visibleFields.length === 0 || Object.keys(parsed).length === 0) return null;
                                        
                                        return (
                                            <Box>
                                                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>📝 Extra Details</Typography>
                                                <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: alpha(GOLD, 0.02), borderColor: alpha(GOLD, 0.15) }}>
                                                    <Stack spacing={1.5}>
                                                        {visibleFields.map((f: any) => (
                                                            <Box key={f.id}>
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>{f.label}</Typography>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {parsed[f.id] ? parsed[f.id] : <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Not provided</span>}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Paper>
                                            </Box>
                                        );
                                    } catch (e) { return null; }
                                })()}

                                <Divider sx={{ borderColor: alpha(GOLD, 0.1) }} />

                                {/* Stage 1 */}
                                {['PENDING'].includes((selectedApp.status || 'PENDING').toUpperCase()) && (
                                    <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Stage 1: Initial Review</Typography>
                                        <TextField fullWidth multiline rows={2} placeholder="Notes (optional)..." value={notes} onChange={e => setNotes(e.target.value)} sx={{ mt: 1, mb: 2 }} size="small" />
                                        <Stack direction="row" spacing={1.5}>
                                            <Button fullWidth variant="outlined" color="info" disabled={actionLoading} onClick={() => handleStatusChange('UNDER_REVIEW')} startIcon={actionLoading ? <CircularProgress size={14} /> : <Eye size={16} />}>Mark Under Review</Button>
                                            <Button fullWidth variant="outlined" color="error" disabled={actionLoading} onClick={() => handleStatusChange('REJECTED')} startIcon={<XCircle size={16} />}>Reject</Button>
                                        </Stack>
                                    </MotionBox>
                                )}

                                {/* Stage 2 */}
                                {['UNDER_REVIEW'].includes((selectedApp.status || '').toUpperCase()) && (
                                    <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Stage 2: Schedule Entrance Exam</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: alpha('#9c27b0', 0.03), border: `1px solid ${alpha('#9c27b0', 0.2)}` }}>
                                            <Stack spacing={2}>
                                                <TextField fullWidth label="Exam Date & Time" type="datetime-local" value={examForm.examDate} onChange={e => setExamForm(p => ({ ...p, examDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                                                <TextField fullWidth label="Exam Location" value={examForm.examLocation} onChange={e => setExamForm(p => ({ ...p, examLocation: e.target.value }))} size="small" />
                                                <TextField fullWidth label="Notes (optional)" value={examForm.examNotes} onChange={e => setExamForm(p => ({ ...p, examNotes: e.target.value }))} size="small" multiline rows={2} />
                                                <Stack direction="row" spacing={1.5}>
                                                    <Button fullWidth variant="contained" disabled={actionLoading} onClick={handleScheduleExam} sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' }, borderRadius: 2, fontWeight: 700 }} startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <ClipboardList size={16} />}>Schedule & Notify</Button>
                                                    <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleStatusChange('REJECTED')} startIcon={<XCircle size={16} />}>Reject</Button>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    </MotionBox>
                                )}

                                {/* Exam score entry */}
                                {selectedApp.examDate && (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>📋 Exam Info</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: alpha('#9c27b0', 0.03), border: `1px solid ${alpha('#9c27b0', 0.2)}` }}>
                                            <Typography variant="body2"><strong>📅</strong> {new Date(selectedApp.examDate).toLocaleString()}</Typography>
                                            <Typography variant="body2"><strong>📍</strong> {selectedApp.examLocation}</Typography>
                                        </Paper>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: alpha('#9c27b0', 0.04), border: `1px solid ${alpha('#9c27b0', 0.25)}` }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#9c27b0' }}>📚 Exam Subjects & Scores</Typography>
                                                <Button size="small" variant="text" startIcon={<Plus size={14} />} sx={{ color: '#9c27b0' }}
                                                    onClick={() => setExamSubjects(p => [...p, { name: 'New Subject', score: null, maxScore: 100 }])}>Add Subject</Button>
                                            </Box>
                                            <Stack spacing={1.5}>
                                                {examSubjects.map((subject, i) => (
                                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <TextField size="small" value={subject.name} onChange={e => setExamSubjects(p => p.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} sx={{ flex: 2 }} placeholder="Subject" />
                                                        <TextField size="small" type="number" label="Score" value={subject.score ?? ''} onChange={e => setExamSubjects(p => p.map((x, xi) => xi === i ? { ...x, score: e.target.value === '' ? null : Number(e.target.value) } : x))} sx={{ width: 90 }} inputProps={{ min: 0, max: subject.maxScore }} />
                                                        <TextField size="small" type="number" label="Max" value={subject.maxScore} onChange={e => setExamSubjects(p => p.map((x, xi) => xi === i ? { ...x, maxScore: Number(e.target.value) } : x))} sx={{ width: 80 }} inputProps={{ min: 1 }} />
                                                        <IconButton size="small" onClick={() => setExamSubjects(p => p.filter((_, xi) => xi !== i))} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}><Trash2 size={14} /></IconButton>
                                                    </Box>
                                                ))}
                                            </Stack>
                                            {examSubjects.some(s => s.score !== null) && (() => {
                                                const filled = examSubjects.filter(s => s.score !== null);
                                                const total = filled.reduce((s, x) => s + (x.score ?? 0), 0);
                                                const max = filled.reduce((s, x) => s + x.maxScore, 0);
                                                return (
                                                    <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#9c27b0', 0.08), display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" fontWeight={600}>Total:</Typography>
                                                        <Typography variant="body2" fontWeight={800} sx={{ color: '#9c27b0', fontFamily: 'monospace' }}>
                                                            {total}/{max} ({max > 0 ? ((total / max) * 100).toFixed(1) : '0'}%)
                                                        </Typography>
                                                    </Box>
                                                );
                                            })()}
                                            <Button fullWidth variant="contained" onClick={handleSaveExamScore} disabled={savingExamScore}
                                                sx={{ mt: 2, bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' }, borderRadius: 2, fontWeight: 700 }}
                                                startIcon={savingExamScore ? <CircularProgress size={14} color="inherit" /> : <Star size={16} />}>
                                                Save Exam Scores
                                            </Button>
                                        </Paper>
                                    </Box>
                                )}

                                {/* Stage 3 */}
                                {['EXAM_SCHEDULED'].includes((selectedApp.status || '').toUpperCase()) && (
                                    <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Stage 3: Schedule Interview</Typography>
                                        {selectedApp.examScore == null ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: alpha('#ff9800', 0.06), border: `1px solid #ff9800` }}>
                                                <Typography variant="body2" color="warning.main" fontWeight={700}>⚠️ Exam scores must be submitted before scheduling the interview.</Typography>
                                            </Paper>
                                        ) : (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.03), border: `1px solid ${alpha('#00bcd4', 0.2)}` }}>
                                                <Stack spacing={2}>
                                                    <TextField fullWidth label="Interview Date & Time" type="datetime-local" value={interviewForm.interviewDate} onChange={e => setInterviewForm(p => ({ ...p, interviewDate: e.target.value }))} size="small" InputLabelProps={{ shrink: true }} />
                                                    <TextField fullWidth label="Interview Location" value={interviewForm.interviewLocation} onChange={e => setInterviewForm(p => ({ ...p, interviewLocation: e.target.value }))} size="small" />
                                                    <TextField fullWidth label="Notes (optional)" value={interviewForm.interviewNotes} onChange={e => setInterviewForm(p => ({ ...p, interviewNotes: e.target.value }))} size="small" multiline rows={2} />
                                                    <Stack direction="row" spacing={1.5}>
                                                        <Button fullWidth variant="contained" disabled={actionLoading} onClick={handleScheduleInterview} sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' }, borderRadius: 2, fontWeight: 700 }} startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <Users size={16} />}>Schedule & Notify</Button>
                                                        <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => handleStatusChange('REJECTED')} startIcon={<XCircle size={16} />}>Reject</Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                        )}
                                    </MotionBox>
                                )}

                                {/* Interview score entry */}
                                {selectedApp.interviewDate && (
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>🎤 Interview Info</Typography>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.03), border: `1px solid ${alpha('#00bcd4', 0.2)}` }}>
                                            <Typography variant="body2"><strong>📅</strong> {new Date(selectedApp.interviewDate).toLocaleString()}</Typography>
                                            <Typography variant="body2"><strong>📍</strong> {selectedApp.interviewLocation}</Typography>
                                        </Paper>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#00bcd4', 0.04), border: `1px solid ${alpha('#00bcd4', 0.25)}` }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#00bcd4' }}>🎯 Interview Criteria</Typography>
                                                <Button size="small" variant="text" startIcon={<Plus size={14} />} sx={{ color: '#00bcd4' }}
                                                    onClick={() => setCriteria(p => [...p, { name: 'New Criterion', score: 0, maxScore: 10 }])}>Add</Button>
                                            </Box>
                                            <Stack spacing={2}>
                                                {criteria.map((c, i) => (
                                                    <Box key={i}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <TextField size="small" value={c.name} onChange={e => setCriteria(p => p.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))} sx={{ flex: 1 }} />
                                                            <TextField size="small" type="number" label="Score" value={c.score} onChange={e => setCriteria(p => p.map((x, xi) => xi === i ? { ...x, score: Number(e.target.value) } : x))} sx={{ width: 80 }} inputProps={{ min: 0, max: c.maxScore }} />
                                                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>/ {c.maxScore}</Typography>
                                                            <IconButton size="small" onClick={() => setCriteria(p => p.filter((_, xi) => xi !== i))} sx={{ '&:hover': { color: 'error.main' } }}><Trash2 size={14} /></IconButton>
                                                        </Box>
                                                        <Box sx={{ px: 1 }}><Slider size="small" value={c.score} min={0} max={c.maxScore} onChange={(_, v) => setCriteria(p => p.map((x, xi) => xi === i ? { ...x, score: v as number } : x))} sx={{ color: '#00bcd4' }} /></Box>
                                                    </Box>
                                                ))}
                                            </Stack>
                                            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#00bcd4', 0.08), display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" fontWeight={600}>Total:</Typography>
                                                <Typography variant="body2" fontWeight={800} sx={{ color: '#00bcd4', fontFamily: 'monospace' }}>
                                                    {criteria.reduce((s, c) => s + (c.score || 0), 0)}/{criteria.reduce((s, c) => s + c.maxScore, 0)}
                                                    {' '}({criteria.reduce((s, c) => s + c.maxScore, 0) > 0 ? ((criteria.reduce((s, c) => s + c.score, 0) / criteria.reduce((s, c) => s + c.maxScore, 0)) * 100).toFixed(1) : '0'}%)
                                                </Typography>
                                            </Box>
                                            <TextField fullWidth label="Interview Notes" size="small" multiline rows={2} value={interviewNote} onChange={e => setInterviewNote(e.target.value)} placeholder="Observations..." sx={{ mt: 2 }} />
                                            <Button fullWidth variant="contained" onClick={handleSaveInterviewScore} disabled={savingInterview}
                                                sx={{ mt: 2, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#0097a7' }, borderRadius: 2, fontWeight: 700 }}
                                                startIcon={savingInterview ? <CircularProgress size={14} color="inherit" /> : <Star size={16} />}>
                                                Save Interview Scores
                                            </Button>
                                        </Paper>
                                    </Box>
                                )}

                                {/* Stage 4 */}
                                {['INTERVIEW_SCHEDULED'].includes((selectedApp.status || '').toUpperCase()) && (
                                    <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Stage 4: Final Decision</Typography>
                                        <TextField fullWidth multiline rows={2} placeholder="Final decision notes..." value={notes} onChange={e => setNotes(e.target.value)} sx={{ mt: 1, mb: 2 }} size="small" />
                                        <Stack direction="row" spacing={1.5}>
                                            <Button fullWidth variant="contained" color="error" disabled={actionLoading} onClick={() => handleStatusChange('REJECTED')} startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <XCircle size={16} />} sx={{ borderRadius: 2, fontWeight: 700 }}>Reject</Button>
                                            <Button fullWidth variant="contained" color="success" disabled={actionLoading} onClick={() => handleStatusChange('ACCEPTED')} startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircle size={16} />} sx={{ borderRadius: 2, fontWeight: 700 }}>Accept & Admit</Button>
                                        </Stack>
                                    </MotionBox>
                                )}

                                {/* Final state */}
                                {['ACCEPTED', 'REJECTED'].includes((selectedApp.status || '').toUpperCase()) && (
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: (selectedApp.status || '').toUpperCase() === 'ACCEPTED' ? alpha('#4caf50', 0.06) : alpha('#f44336', 0.06), borderColor: (selectedApp.status || '').toUpperCase() === 'ACCEPTED' ? '#4caf50' : '#f44336', borderWidth: 2 }}>
                                        <Typography variant="body1" fontWeight={800} color={(selectedApp.status || '').toUpperCase() === 'ACCEPTED' ? 'success.main' : 'error.main'}>
                                            {(selectedApp.status || '').toUpperCase() === 'ACCEPTED' ? '✅ Application Accepted' : '❌ Application Rejected'}
                                        </Typography>
                                        {selectedApp.feedback && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{selectedApp.feedback}</Typography>}
                                    </Paper>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <FileViewer open={fileViewer.open} url={fileViewer.url} label={fileViewer.label} onClose={() => setFileViewer(p => ({ ...p, open: false }))} />
        </Box>
    );
}
