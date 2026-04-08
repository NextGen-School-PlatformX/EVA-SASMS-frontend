'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent,
    Button, Stack, Divider, Paper,
    TextField, MenuItem, FormControl, InputLabel,
    Select, CircularProgress, Chip,
    IconButton, useTheme, Avatar, Stepper,
    Step, StepLabel, StepContent, Alert
} from '@mui/material';
import {
    LayoutDashboard, CloudUpload, CheckCircle, Clock, FileText,
    CreditCard, GraduationCap, Info, Trash2, ShieldCheck,
    AlertCircle, ChevronRight, Search, Calendar, MapPin,
    ClipboardList, Users, Sparkles, ArrowRight, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { useNotification } from '@/src/context/NotificationContext';
import { submitStudentApplication, getStudentApplication, claimStudentRole } from '@/src/lib/api/studentApi';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getSystemDepartments } from '@/src/lib/api/superadminApi';
import { SystemDepartment } from '@/src/types/superadmin.types';
import { alpha } from '@mui/material/styles';

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const PIPELINE = [
    { key: 'PENDING', label: 'Submitted', desc: 'Your application is being processed', icon: <Clock size={20} />, color: '#ff9800' },
    { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Admin is reviewing your documents', icon: <FileText size={20} />, color: '#2196f3' },
    { key: 'EXAM_SCHEDULED', label: 'Exam Scheduled', desc: 'Entrance exam has been scheduled', icon: <ClipboardList size={20} />, color: '#9c27b0' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview', desc: 'Personal interview scheduled', icon: <Users size={20} />, color: '#00bcd4' },
    { key: 'ACCEPTED', label: 'Accepted!', desc: 'Congratulations! You are admitted', icon: <CheckCircle size={20} />, color: '#4caf50' },
];

function getPipelineStep(status: string): number {
    const idx = PIPELINE.findIndex(p => p.key === status?.toUpperCase());
    return idx >= 0 ? idx : 0;
}

export default function ApplicantDashboard() {
    const theme = useTheme();
    const { showNotification } = useNotification();
    const { logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [departments, setDepartments] = useState<SystemDepartment[]>([]);
    const [application, setApplication] = useState<any>(null);

    const [formData, setFormData] = useState({
        preferredDeptId: '',
        selectionReason: '',
        ministryScore: '',
        phoneNumber: '',
    });

    // Load custom fields from SuperAdmin configuration
    const [customFields, setCustomFields] = useState<Array<{ id: string; label: string; type: string; required: boolean; placeholder?: string; options?: string[] }>>([]);
    const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: string }>({});

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        birthCertificate: null,
        idCard: null,
        ministryResult: null,
        receipt: null,
    });

    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
        birthCertificate: null,
        idCard: null,
        ministryResult: null,
        receipt: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [depts, app] = await Promise.all([
                    getSystemDepartments(),
                    getStudentApplication().catch(() => null)
                ]);
                setDepartments(depts);
                if (app) {
                    setApplication(app);
                    setFormData({
                        preferredDeptId: app.preferredDeptId || '',
                        selectionReason: app.selectionReason || '',
                        ministryScore: app.ministryScore || '',
                        phoneNumber: app.phoneNumber || app.applicant?.phoneNumber || '',
                    });
                    if (app.customFieldsData) {
                        try {
                            setCustomFieldValues(JSON.parse(app.customFieldsData));
                        } catch (e) {
                            console.error('Failed to parse custom variables');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Load custom fields configured by SuperAdmin from backend (same source as SuperAdmin builder)
        import('@/src/lib/api/client')
            .then(({ apiClient }) => apiClient<any[]>('/system/form-fields'))
            .then((data) => { if (Array.isArray(data)) setCustomFields(data); })
            .catch(() => {});
    }, []);

    const getDocUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const filename = path.split('/').pop()?.split('\\').pop();
        return `${apiBase}/admissions/documents/${filename}`;
    };

    // Base mandatory docs
    const baseDocItems = [
        { key: 'birthCertificate', name: 'Birth Certificate', icon: <FileText size={20} />, url: getDocUrl(application?.birthCertificateUrl), required: true },
        { key: 'idCard', name: 'National ID / Passport', icon: <ShieldCheck size={20} />, url: getDocUrl(application?.idCardUrl) },
        { key: 'ministryResult', name: 'Statement of Success', icon: <GraduationCap size={20} />, url: getDocUrl(application?.ministryResultUrl) },
        { key: 'receipt', name: 'Payment Receipt (250 EGP)', icon: <CreditCard size={20} />, url: getDocUrl(application?.receiptUrl) },
    ];
    // Extra docs defined by SuperAdmin as file-type custom fields
    const parsedOtherDocs = (() => {
        try {
            return application?.otherDocsUrls ? JSON.parse(application.otherDocsUrls) : [];
        } catch { return []; }
    })();

    const extraDocItems = customFields
        .filter((f) => f.type === 'file')
        .map((f, idx) => {
            // Find the matching URL from parsedOtherDocs if it exists
            // The backend saves them sequentially, so we try to map by index of file type fields
            const savedUrl = parsedOtherDocs[idx] || null;
            return {
                key: `cf_${f.id}`,
                name: f.label,
                icon: <CloudUpload size={20} />,
                url: getDocUrl(savedUrl),
                required: f.required,
            };
        });
    const docItems = [...baseDocItems, ...extraDocItems];

    const handleFileChange = (documentType: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { showNotification('File size exceeds 5MB limit.', 'error'); return; }
            setFiles(prev => ({ ...prev, [documentType]: file }));
            setPreviews(prev => ({ ...prev, [documentType]: URL.createObjectURL(file) }));
            showNotification(`${file.name} selected.`, 'info');
        }
    };

    const removeFile = (documentType: string) => {
        setFiles(prev => ({ ...prev, [documentType]: null }));
        setPreviews(prev => ({ ...prev, [documentType]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.phoneNumber) {
            showNotification('Phone number is required.', 'warning');
            return;
        }

        if (!formData.preferredDeptId || !formData.selectionReason) {
            showNotification('Please select a department and provide a reason.', 'warning');
            return;
        }

        const missingCustomText = customFields.find((f: any) => f.required && f.type !== 'file' && !customFieldValues[f.id]);
        if (missingCustomText) {
            showNotification(`Field "${missingCustomText.label}" is required.`, 'warning');
            return;
        }

        const missingRequired = docItems.find(d => d.required && !files[d.key] && !d.url);
        if (missingRequired) { 
            showNotification(`Document "${missingRequired.name}" is required.`, 'warning'); 
            return; 
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('preferredDeptId', formData.preferredDeptId);
            data.append('selectionReason', formData.selectionReason);
            data.append('ministryScore', formData.ministryScore);
            data.append('phoneNumber', formData.phoneNumber);
            data.append('customFieldsData', JSON.stringify(customFieldValues));
            if (files.birthCertificate) data.append('birthCertificate', files.birthCertificate);
            if (files.idCard) data.append('idCard', files.idCard);
            if (files.ministryResult) data.append('ministryResult', files.ministryResult);
            if (files.receipt) data.append('receipt', files.receipt);
            // Append dynamic documentation uploads configured by SuperAdmin
            Object.entries(files).forEach(([key, file]) => {
                if (key.startsWith('cf_') && file) {
                    data.append('otherDocs', file);
                }
            });

            const result = await submitStudentApplication(data);
            setApplication(result);
            showNotification('Application submitted successfully!', 'success');
        } catch (error) {
            showNotification('Failed to submit application.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClaimStudentRole = async () => {
        setClaiming(true);
        try {
            await claimStudentRole();
            showNotification('🎓 Congratulations! Logging you out to complete registration...', 'success');
            setTimeout(() => { logout(); router.push('/login'); }, 3000);
        } catch (error) {
            showNotification('Failed to transition to student role.', 'error');
        } finally {
            setClaiming(false);
        }
    };

    const isLocked = ['ACCEPTED', 'REJECTED', 'EXAM_SCHEDULED', 'INTERVIEW_SCHEDULED'].includes((application?.status || '').toUpperCase());
    const isRejected = (application?.status || '').toUpperCase() === 'REJECTED';
    const isAccepted = (application?.status || '').toUpperCase() === 'ACCEPTED';
    const currentStep = application ? getPipelineStep((application.status || 'PENDING').toUpperCase()) : -1;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
                <CircularProgress thickness={5} size={60} />
                <Typography color="text.secondary">Loading your application...</Typography>
            </Box>
        );
    }

    return (
        <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <PageHeader
                title="Application Dashboard"
                description={application ? `Application ID: ${application.id?.slice(0, 8).toUpperCase()}` : 'Submit your application to get started'}
            />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4}>

                            {/* ── Status Banner ── */}
                            <AnimatePresence>
                                {application?.status && (
                                    <MotionCard
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        sx={{
                                            borderRadius: 4, boxShadow: 'none',
                                            bgcolor: isAccepted ? alpha('#4caf50', 0.08) : isRejected ? alpha('#f44336', 0.08) : alpha('#2196f3', 0.08),
                                            border: '1px solid',
                                            borderColor: isAccepted ? '#4caf50' : isRejected ? '#f44336' : '#2196f3',
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                                <Box sx={{
                                                    p: 1.5, borderRadius: 3, flexShrink: 0,
                                                    bgcolor: isAccepted ? '#4caf50' : isRejected ? '#f44336' : '#2196f3',
                                                    color: 'white'
                                                }}>
                                                    {isAccepted ? <CheckCircle size={28} /> : isRejected ? <AlertCircle size={28} /> : <Clock size={28} />}
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h6" fontWeight={800}>
                                                        {isAccepted ? '🎉 Congratulations! Application Accepted' :
                                                            isRejected ? '❌ Application Not Approved' :
                                                                `Status: ${(application.status || '').replace('_', ' ')}`}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {isAccepted ? 'Your application has been fully accepted. You can now register as a student!' :
                                                            isRejected ? (application.feedback || 'Your application was not approved at this time.') :
                                                                (application.status || '').toUpperCase() === 'EXAM_SCHEDULED' ? '📋 Your entrance exam has been scheduled. Check the details below.' :
                                                                    (application.status || '').toUpperCase() === 'INTERVIEW_SCHEDULED' ? '🎉 You passed the exam! Your interview has been scheduled.' :
                                                                        'Your application is being reviewed by our admissions team.'}
                                                    </Typography>
                                                    {isAccepted && (
                                                        <Button variant="contained" color="success" onClick={handleClaimStudentRole}
                                                            disabled={claiming} sx={{ mt: 2, borderRadius: 2, fontWeight: 800 }}
                                                            startIcon={claiming ? <CircularProgress size={18} color="inherit" /> : <GraduationCap size={18} />}>
                                                            {claiming ? 'Processing...' : 'Complete Enrollment as Student'}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </MotionCard>
                                )}
                            </AnimatePresence>

                            {/* ── Exam Info Card ── */}
                            {application?.examDate && (
                                <MotionCard
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha('#9c27b0', 0.3)}`, bgcolor: alpha('#9c27b0', 0.04) }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#9c27b0', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <ClipboardList size={22} /> Entrance Exam Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, bgcolor: alpha('#9c27b0', 0.1), borderRadius: 2 }}>
                                                        <Calendar size={18} color="#9c27b0" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {new Date(application.examDate).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, bgcolor: alpha('#9c27b0', 0.1), borderRadius: 2 }}>
                                                        <MapPin size={18} color="#9c27b0" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                                        <Typography variant="body2" fontWeight={700}>{application.examLocation}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            {application.examNotes && (
                                                <Grid size={{ xs: 12 }}>
                                                    <Alert severity="info" sx={{ borderRadius: 2 }}>{application.examNotes}</Alert>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </MotionCard>
                            )}

                            {/* ── Interview Info Card ── */}
                            {application?.interviewDate && (
                                <MotionCard
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha('#00bcd4', 0.3)}`, bgcolor: alpha('#00bcd4', 0.04) }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#00bcd4', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Users size={22} /> Personal Interview Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, bgcolor: alpha('#00bcd4', 0.1), borderRadius: 2 }}>
                                                        <Calendar size={18} color="#00bcd4" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {new Date(application.interviewDate).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ p: 1, bgcolor: alpha('#00bcd4', 0.1), borderRadius: 2 }}>
                                                        <MapPin size={18} color="#00bcd4" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                                        <Typography variant="body2" fontWeight={700}>{application.interviewLocation}</Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            {application.interviewNotes && (
                                                <Grid size={{ xs: 12 }}>
                                                    <Alert severity="success" sx={{ borderRadius: 2 }}>{application.interviewNotes}</Alert>
                                                </Grid>
                                            )}
                                        </Grid>
                                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                            🎽 Dress professionally and bring original copies of all your documents.
                                        </Alert>
                                    </CardContent>
                                </MotionCard>
                            )}

                            {/* ── Department Selection ── */}
                            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.04)})`, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <GraduationCap size={24} color={theme.palette.primary.main} /> Academic Preference
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth disabled={isLocked}>
                                                <InputLabel>Preferred Department</InputLabel>
                                                <Select value={formData.preferredDeptId} label="Preferred Department"
                                                    onChange={(e) => setFormData(prev => ({ ...prev, preferredDeptId: e.target.value }))}>
                                                    {departments.map((dept) => (
                                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth type="number" disabled={isLocked}
                                                label="Ministry Exam Score (%)" placeholder="Enter your total percentage score"
                                                value={formData.ministryScore}
                                                onChange={(e) => setFormData(prev => ({ ...prev, ministryScore: e.target.value }))} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField fullWidth multiline rows={4} disabled={isLocked}
                                                label="Why did you choose this program?"
                                                placeholder="Describe your background and motivation..."
                                                value={formData.selectionReason}
                                                onChange={(e) => setFormData(prev => ({ ...prev, selectionReason: e.target.value }))} />
                                        </Grid>
                                        {/* ── Phone Number (default required field) ── */}
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                disabled={isLocked}
                                                label="Phone Number"
                                                placeholder="e.g. 01012345678"
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>📱</span> }}
                                            />
                                        </Grid>
                                        {/* ── Custom Fields from SuperAdmin (excluding file uploads, which appear in Document Center) ── */}
                                        {customFields.filter((field) => field.type !== 'file').map((field) => (
                                            <Grid key={field.id} size={{ xs: 12 }}>
                                                {field.type === 'select' && field.options ? (
                                                    <FormControl fullWidth disabled={isLocked}>
                                                        <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
                                                        <Select
                                                            label={`${field.label}${field.required ? ' *' : ''}`}
                                                            value={customFieldValues[field.id] || ''}
                                                            onChange={(e) => setCustomFieldValues(p => ({ ...p, [field.id]: e.target.value }))}
                                                        >
                                                            {field.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <TextField
                                                        fullWidth
                                                        disabled={isLocked}
                                                        label={`${field.label}${field.required ? ' *' : ''}`}
                                                        placeholder={field.placeholder || (field.type === 'file' ? 'Describe or paste a link to the file...' : '')}
                                                        type={
                                                            field.type === 'number'
                                                                ? 'number'
                                                                : field.type === 'date'
                                                                ? 'date'
                                                                : field.type === 'phone'
                                                                ? 'tel'
                                                                : field.type === 'email'
                                                                ? 'email'
                                                                : field.type === 'link'
                                                                ? 'url'
                                                                : 'text'
                                                        }
                                                        multiline={field.type === 'textarea'}
                                                        rows={field.type === 'textarea' ? 3 : 1}
                                                        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                                        value={customFieldValues[field.id] || ''}
                                                        onChange={(e) => setCustomFieldValues(p => ({ ...p, [field.id]: e.target.value }))}
                                                    />
                                                )}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* ── Document Center ── */}
                            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.04)})`, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CloudUpload size={24} color={theme.palette.primary.main} /> Document Center
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        {docItems.map((doc, i) => (
                                            <MotionBox key={doc.key}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}>
                                                <Paper variant="outlined" sx={{
                                                    p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between', transition: '0.25s',
                                                    border: '1px solid',
                                                    borderColor: (files[doc.key] || doc.url) ? alpha('#4caf50', 0.5) : 'divider',
                                                    bgcolor: (files[doc.key] || doc.url) ? alpha('#4caf50', 0.03) : 'transparent',
                                                    '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }
                                                }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{
                                                            width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            bgcolor: (files[doc.key] || doc.url) ? '#4caf50' : alpha(theme.palette.primary.main, 0.1),
                                                            color: (files[doc.key] || doc.url) ? 'white' : theme.palette.primary.main
                                                        }}>
                                                            {(files[doc.key] || doc.url) ? <CheckCircle size={22} /> : doc.icon}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={700}>{doc.name}</Typography>
                                                            <Typography variant="caption" fontWeight={600}
                                                                color={(files[doc.key] || doc.url) ? 'success.main' : 'error.main'}>
                                                                {(files[doc.key] || doc.url) ? '✓ Uploaded' : 'Required'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1}>
                                                        {doc.url && (
                                                            <Button size="small" startIcon={<Search size={14} />}
                                                                href={doc.url} target="_blank" rel="noopener noreferrer"
                                                                sx={{ fontWeight: 600, minWidth: 0 }}>View</Button>
                                                        )}
                                                        {!isLocked && (
                                                            files[doc.key] ? (
                                                                <IconButton onClick={() => removeFile(doc.key)} color="error" size="small">
                                                                    <Trash2 size={18} />
                                                                </IconButton>
                                                            ) : (
                                                                <Button component="label" variant="contained" size="small" disableElevation
                                                                    startIcon={<CloudUpload size={14} />}
                                                                    sx={{ borderRadius: 2, fontWeight: 700, fontSize: 12 }}>
                                                                    {doc.url ? 'Replace' : 'Upload'}
                                                                    <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange(doc.key)} />
                                                                </Button>
                                                            )
                                                        )}
                                                    </Stack>
                                                </Paper>
                                            </MotionBox>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {!isLocked && !isRejected && (
                                <MotionBox whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} sx={{ pb: 6 }}>
                                    <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}
                                        sx={{
                                            borderRadius: 4, py: 2.5, fontWeight: 900, fontSize: '1.1rem',
                                            boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.35)}`,
                                            textTransform: 'uppercase', letterSpacing: 1
                                        }}>
                                        {submitting ? <CircularProgress size={26} color="inherit" /> : (application ? 'Update Application' : 'Submit Application')}
                                    </Button>
                                </MotionBox>
                            )}
                        </Stack>
                    </form>
                </Grid>

                {/* ── Sidebar ── */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Admission Pipeline */}
                        <Card sx={{
                            borderRadius: 4, overflow: 'hidden',
                            background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, #1a237e 100%)`,
                            color: 'white', boxShadow: '0 20px 50px rgba(25,118,210,0.3)'
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={900} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Sparkles size={20} /> Admission Pipeline
                                </Typography>
                                <Stepper orientation="vertical" activeStep={currentStep} sx={{ mt: 2 }}>
                                    {PIPELINE.map((step, i) => (
                                        <Step key={step.key} completed={i < currentStep}>
                                            <StepLabel
                                                StepIconProps={{
                                                    sx: {
                                                        color: i < currentStep ? step.color : 'rgba(255,255,255,0.25)',
                                                        '&.Mui-active': { color: step.color },
                                                        '&.Mui-completed': { color: '#4caf50' },
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiStepLabel-label': {
                                                        color: i === currentStep ? 'white' : 'rgba(255,255,255,0.5)',
                                                        fontWeight: i === currentStep ? 800 : 500,
                                                        fontSize: '0.875rem'
                                                    }
                                                }}>
                                                {step.label}
                                            </StepLabel>
                                            <StepContent>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                    {step.desc}
                                                </Typography>
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </CardContent>
                        </Card>

                        {/* Important Reminders */}
                        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Bell size={18} color={theme.palette.warning.main} /> Reminders
                                </Typography>
                                <Stack spacing={1.5}>
                                    {[
                                        'Upload all required documents to start review',
                                        'Check your email for exam/interview notifications',
                                        'Bring original documents to the exam and interview',
                                        'Dress professionally for the interview'
                                    ].map((tip, i) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8, flexShrink: 0 }} />
                                            <Typography variant="body2" color="text.secondary">{tip}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                                    <Info size={20} />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={800}>Need Help?</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Having issues with document uploads or questions about the process?
                            </Typography>
                            <Button fullWidth variant="outlined" component={Link} href="/applicant/support"
                                endIcon={<ChevronRight size={16} />} sx={{ borderRadius: 3, fontWeight: 700 }}>
                                Contact Support
                            </Button>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </MotionBox>
    );
}
