'use client';

import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Grid, Dialog, DialogContent,
    DialogActions, TextField, CircularProgress, Stack, IconButton, Tooltip,
    Chip, alpha, useTheme, LinearProgress
} from '@mui/material';
import {
    Add as AddIcon, QrCode as QrIcon, Assessment as ReportIcon,
    Refresh as RefreshIcon, MyLocation as GpsIcon, Download as DownloadIcon,
    ContentCopy as CopyIcon, CheckCircle as CheckIcon, Cancel as CancelIcon,
    AccessTime as LateIcon, Close as CloseIcon, QrCodeScanner,
    PersonSearch, CalendarToday, Schedule, LocationOn, People
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import {
    getAttendanceSessions, createAttendanceSession, getAttendanceReport,
    getAttendanceQR, autoMarkAbsent
} from '@/src/lib/api/staffApi';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

function exportAttendanceCSV(records: any[], sessionTitle: string) {
    const headers = 'Student Name,Student ID,Status,Scanned At,Distance (m)';
    const rows = records.map((r: any) =>
        `"${r.student?.name || ''}","${r.student?.id || ''}","${r.status || ''}","${r.scannedAt ? new Date(r.scannedAt).toLocaleString() : '-'}","${r.distance ? r.distance.toFixed(1) : '-'}"`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${sessionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.2,
            px: 1.8, py: 0.8, borderRadius: 2,
            bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.2)}`
        }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography fontSize={13} fontWeight={700} sx={{ color }}>{value}</Typography>
            <Typography fontSize={11} color="text.secondary">{label}</Typography>
        </Box>
    );
}

export default function AdminAttendancePage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [newSession, setNewSession] = useState({
        title: '', latitude: '', longitude: '', radius: '100',
        startTime: '', endTime: '', lateAfter: ''
    });

    const cardBg = isDark ? alpha('#111', 0.75) : alpha('#fff', 0.85);
    const border = isDark ? alpha(GOLD, 0.13) : alpha(GOLD, 0.2);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await getAttendanceSessions();
            setSessions(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreateSession = async () => {
        try {
            await createAttendanceSession(newSession);
            setCreateModalOpen(false);
            loadSessions();
            setNewSession({ title: '', latitude: '', longitude: '', radius: '100', startTime: '', endTime: '', lateAfter: '' });
        } catch (err) { console.error(err); }
    };

    const handleViewReport = async (session: any) => {
        setSelectedSession(session);
        setReport(null);
        setReportLoading(true);
        setReportModalOpen(true);
        try {
            const data = await getAttendanceReport(session.id);
            setReport(data);
        } catch (err) { console.error(err); }
        finally { setReportLoading(false); }
    };

    const handleViewQR = async (session: any) => {
        setSelectedSession(session);
        setQrDataUrl(null);
        setQrModalOpen(true);
        try {
            const data = await getAttendanceQR(session.id);
            setQrDataUrl(data.qrDataUrl);
        } catch (err) { console.error(err); }
    };

    const handleAutoAbsent = async (sessionId: string) => {
        try {
            await autoMarkAbsent(sessionId);
            const data = await getAttendanceReport(sessionId);
            setReport(data);
        } catch (err) { console.error(err); }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setNewSession(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toString(),
                    longitude: pos.coords.longitude.toString()
                }));
            });
        }
    };

    const handleCopyQRLink = () => {
        if (selectedSession?.id) {
            navigator.clipboard.writeText(`${window.location.origin}/student/scan?sessionId=${selectedSession.id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

    const sessionColumns: Column<any>[] = [
        {
            id: 'title', label: 'Session',
            render: (row: any) => (
                <Box>
                    <Typography fontWeight={700} fontSize={14}>{row.title}</Typography>
                    <Typography fontSize={11} color="text.secondary">
                        {new Date(row.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'time', label: 'Time Window',
            render: (row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography fontSize={13} color="text.secondary">
                        {new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
                        {new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'stats', label: 'Scans',
            render: (row: any) => (
                <Chip
                    icon={<People sx={{ fontSize: 14 }} />}
                    label={`${row._count?.records || 0} students`}
                    size="small"
                    sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, border: `1px solid ${alpha(GOLD, 0.25)}`, fontWeight: 700 }}
                />
            )
        },
        {
            id: 'actions', label: 'Actions',
            render: (row: any) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View QR Code">
                        <IconButton onClick={() => handleViewQR(row)} size="small"
                            sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, '&:hover': { bgcolor: alpha(GOLD, 0.2) } }}>
                            <QrIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Attendance Report">
                        <IconButton onClick={() => handleViewReport(row)} size="small"
                            sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', '&:hover': { bgcolor: alpha('#2196f3', 0.2) } }}>
                            <ReportIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    const reportColumns: Column<any>[] = [
        {
            id: 'student', label: 'Student',
            render: (row: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(GOLD, 0.15),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: GOLD, flexShrink: 0
                    }}>
                        {(row.student?.name || '?').charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                        <Typography fontSize={13} fontWeight={700}>{row.student?.name || '—'}</Typography>
                        <Typography fontSize={11} color="text.secondary">{row.student?.email || ''}</Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'status', label: 'Status',
            render: (row: any) => {
                const cfg: Record<string, { color: string; icon: React.ReactNode }> = {
                    PRESENT: { color: '#4caf50', icon: <CheckIcon sx={{ fontSize: 13 }} /> },
                    LATE: { color: GOLD, icon: <LateIcon sx={{ fontSize: 13 }} /> },
                    ABSENT: { color: '#f44336', icon: <CancelIcon sx={{ fontSize: 13 }} /> },
                };
                const c = cfg[row.status] ?? { color: '#9e9e9e', icon: null };
                return (
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.7,
                        px: 1.5, py: 0.5, borderRadius: 2,
                        bgcolor: alpha(c.color, 0.12), border: `1px solid ${alpha(c.color, 0.25)}`
                    }}>
                        <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
                        <Typography fontSize={12} fontWeight={700} sx={{ color: c.color }}>{row.status}</Typography>
                    </Box>
                );
            }
        },
        { id: 'scannedAt', label: 'Scanned At', render: (row: any) => row.scannedAt ? new Date(row.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
        { id: 'distance', label: 'Distance', render: (row: any) => row.distance ? `${row.distance.toFixed(1)}m` : '—' }
    ];

    const present = report?.records?.filter((r: any) => r.status === 'PRESENT').length ?? 0;
    const late = report?.records?.filter((r: any) => r.status === 'LATE').length ?? 0;
    const absent = report?.records?.filter((r: any) => r.status === 'ABSENT').length ?? 0;
    const total = present + late + absent;
    const attendRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return (
        <Box sx={{ maxWidth: 1200 }}>
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                            Attendance Management
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                            Create sessions, generate QR codes, and track student attendance in real-time
                        </Typography>
                    </Box>
                    <Button
                        variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}
                        sx={{
                            background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                            fontWeight: 800, borderRadius: 2, px: 3, py: 1.3,
                            boxShadow: `0 6px 20px ${GOLD}44`,
                            '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                        }}
                    >
                        New Session
                    </Button>
                </Box>
            </MotionBox>

            {/* Sessions Table */}
            <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Box sx={{ p: 3, borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Sessions
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" mt={0.3}>All created attendance sessions</Typography>
                        </Box>
                        <IconButton onClick={loadSessions} size="small" sx={{ color: 'text.secondary' }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: GOLD }} /></Box>
                    ) : (
                        <DataTable columns={sessionColumns} rows={sessions} emptyMessage="No sessions yet. Click 'New Session' to get started." />
                    )}
                </Box>
            </MotionBox>

            {/* ─── CREATE SESSION MODAL ─── */}
            <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3, bgcolor: isDark ? '#0f0f18' : '#fff',
                        border: `1px solid ${isDark ? alpha(GOLD, 0.18) : alpha(GOLD, 0.2)}`,
                        boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.7)' : '0 32px 80px rgba(0,0,0,0.15)',
                    }
                }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${GOLD}, #FF9500, ${GOLD})` }} />
                <Box sx={{ px: 3.5, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
                    }}>
                        <QrCodeScanner sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={800} fontSize={18}>Create Attendance Session</Typography>
                        <Typography fontSize={12} color="text.secondary">Students scan the generated QR to check in</Typography>
                    </Box>
                </Box>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField label="Session Title" fullWidth value={newSession.title}
                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                            placeholder="e.g. Monday Lecture — CS101" sx={inputSx} />
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                <LocationOn sx={{ fontSize: 16, color: GOLD }} /> Location & Radius
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 5 }}><TextField label="Latitude" fullWidth size="small" value={newSession.latitude} onChange={(e) => setNewSession({ ...newSession, latitude: e.target.value })} sx={inputSx} /></Grid>
                                <Grid size={{ xs: 5 }}><TextField label="Longitude" fullWidth size="small" value={newSession.longitude} onChange={(e) => setNewSession({ ...newSession, longitude: e.target.value })} sx={inputSx} /></Grid>
                                <Grid size={{ xs: 2 }}>
                                    <Tooltip title="Use My Location">
                                        <Button variant="outlined" onClick={getCurrentLocation} sx={{ height: 40, minWidth: 0, px: 1.5, borderRadius: 2, borderColor: alpha(GOLD, 0.4), color: GOLD, '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.06) } }}>
                                            <GpsIcon fontSize="small" />
                                        </Button>
                                    </Tooltip>
                                </Grid>
                                <Grid size={{ xs: 12 }}><TextField label="Allowed Radius (meters)" fullWidth size="small" type="number" value={newSession.radius} onChange={(e) => setNewSession({ ...newSession, radius: e.target.value })} sx={inputSx} /></Grid>
                            </Grid>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                <Schedule sx={{ fontSize: 16, color: GOLD }} /> Time Window
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}><TextField label="Start Time" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} value={newSession.startTime} onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })} sx={inputSx} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField label="End Time" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} value={newSession.endTime} onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })} sx={inputSx} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField label="Mark as Late After (optional)" fullWidth type="datetime-local" InputLabelProps={{ shrink: true }} value={newSession.lateAfter} onChange={(e) => setNewSession({ ...newSession, lateAfter: e.target.value })} sx={inputSx} /></Grid>
                            </Grid>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3.5, pb: 3, gap: 1 }}>
                    <Button onClick={() => setCreateModalOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateSession}
                        disabled={!newSession.title || !newSession.startTime || !newSession.endTime}
                        sx={{
                            background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                            fontWeight: 800, borderRadius: 2, px: 3,
                            '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                        }}>
                        Create Session
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── PREMIUM QR MODAL ─── */}
            <Dialog open={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="xs" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4, overflow: 'hidden',
                        bgcolor: isDark ? '#08080f' : '#fafafa',
                        border: `1px solid ${alpha(GOLD, 0.35)}`,
                        boxShadow: isDark ? `0 40px 100px rgba(0,0,0,0.8), 0 0 60px ${GOLD}1a` : `0 40px 100px rgba(0,0,0,0.2)`,
                    }
                }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${GOLD}, #FF9500, #FF6B00, ${GOLD})` }} />
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    {/* Close btn */}
                    <IconButton onClick={() => setQrModalOpen(false)} size="small"
                        sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>

                    {/* Icon + title */}
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 52, height: 52, borderRadius: 2.5, mb: 2,
                        background: `linear-gradient(135deg, ${alpha(GOLD, 0.2)}, ${alpha('#FF9500', 0.12)})`,
                        border: `1px solid ${alpha(GOLD, 0.35)}`,
                    }}>
                        <QrCodeScanner sx={{ fontSize: 26, color: GOLD }} />
                    </Box>
                    <Typography fontWeight={900} fontSize={20} sx={{ color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                        Session QR Code
                    </Typography>
                    <Typography fontSize={13} color="text.secondary" sx={{ mb: 3 }}>
                        {selectedSession?.title}
                    </Typography>

                    {/* QR frame */}
                    <Box sx={{
                        display: 'inline-block', p: 2.5, borderRadius: 3, mb: 3,
                        background: '#ffffff',
                        border: `3px solid ${alpha(GOLD, 0.5)}`,
                        boxShadow: `0 8px 40px ${alpha(GOLD, 0.3)}, 0 0 0 8px ${alpha(GOLD, 0.05)}`,
                    }}>
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="Session QR" style={{ width: 220, height: 220, display: 'block', borderRadius: 8 }} />
                        ) : (
                            <Box sx={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress sx={{ color: GOLD }} />
                            </Box>
                        )}
                    </Box>

                    {/* Session info chips */}
                    {selectedSession && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                            <Chip icon={<CalendarToday sx={{ fontSize: 12 }} />}
                                label={new Date(selectedSession.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                size="small" sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, fontWeight: 700, border: `1px solid ${alpha(GOLD, 0.25)}` }} />
                            <Chip icon={<Schedule sx={{ fontSize: 12 }} />}
                                label={`${new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(selectedSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                size="small" sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', fontWeight: 700, border: `1px solid ${alpha('#2196f3', 0.25)}` }} />
                        </Box>
                    )}

                    <Typography fontSize={12} color="text.secondary" sx={{ mb: 3 }}>
                        Display this QR on screen — students scan it via their attendance portal to check in instantly
                    </Typography>

                    <Stack spacing={1.5}>
                        {qrDataUrl && (
                            <Button fullWidth variant="contained"
                                onClick={() => { const a = document.createElement('a'); a.href = qrDataUrl; a.download = `qr_${selectedSession?.title?.replace(/\s+/g, '_') || 'session'}.png`; a.click(); }}
                                startIcon={<DownloadIcon />}
                                sx={{
                                    background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                                    fontWeight: 800, borderRadius: 2, py: 1.3,
                                    '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                                }}>
                                Download QR Image
                            </Button>
                        )}
                        <Button fullWidth variant="outlined"
                            startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                            onClick={handleCopyQRLink}
                            sx={{
                                borderRadius: 2, py: 1.2, fontWeight: 700,
                                borderColor: copied ? '#4caf50' : alpha(GOLD, 0.4),
                                color: copied ? '#4caf50' : GOLD,
                                '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.05) }
                            }}>
                            {copied ? '✓ Link Copied!' : 'Copy Student Scan Link'}
                        </Button>
                    </Stack>
                </Box>
            </Dialog>

            {/* ─── PREMIUM ANALYSIS MODAL ─── */}
            <Dialog open={reportModalOpen} onClose={() => setReportModalOpen(false)} maxWidth="md" fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4, overflow: 'hidden',
                        bgcolor: isDark ? '#08080f' : '#fafafa',
                        border: `1px solid ${alpha('#2196f3', 0.25)}`,
                        boxShadow: isDark ? '0 40px 100px rgba(0,0,0,0.8)' : '0 40px 100px rgba(0,0,0,0.2)',
                    }
                }}>
                <Box sx={{ height: 4, background: 'linear-gradient(90deg, #2196f3, #9c27b0, #2196f3)' }} />
                <Box sx={{ px: 4, pt: 3.5, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: 2.5,
                            bgcolor: alpha('#2196f3', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${alpha('#2196f3', 0.25)}`
                        }}>
                            <ReportIcon sx={{ color: '#2196f3', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={900} fontSize={20} sx={{ color: isDark ? '#fff' : '#111' }}>
                                Attendance Analysis
                            </Typography>
                            <Typography fontSize={13} color="text.secondary">{selectedSession?.title}</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setReportModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <DialogContent sx={{ px: 4, pb: 4 }}>
                    {reportLoading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <CircularProgress sx={{ color: '#2196f3' }} />
                            <Typography color="text.secondary" fontSize={13}>Loading attendance data…</Typography>
                        </Box>
                    ) : report ? (
                        <Box>
                            {/* Stats cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {[
                                    { label: 'Present', value: present, color: '#4caf50', icon: <CheckIcon />, pct: total > 0 ? (present / total) * 100 : 0 },
                                    { label: 'Late', value: late, color: GOLD, icon: <LateIcon />, pct: total > 0 ? (late / total) * 100 : 0 },
                                    { label: 'Absent', value: absent, color: '#f44336', icon: <CancelIcon />, pct: total > 0 ? (absent / total) * 100 : 0 },
                                ].map(s => (
                                    <Grid size={{ xs: 4 }} key={s.label}>
                                        <Box sx={{
                                            p: 2.5, borderRadius: 3, textAlign: 'center',
                                            bgcolor: isDark ? alpha(s.color, 0.07) : alpha(s.color, 0.05),
                                            border: `1px solid ${alpha(s.color, 0.2)}`,
                                        }}>
                                            <Box sx={{ color: s.color, display: 'flex', justifyContent: 'center', mb: 1 }}>
                                                {React.cloneElement(s.icon as React.ReactElement<any>, { sx: { fontSize: 24 } })}
                                            </Box>
                                            <Typography fontWeight={900} fontSize={32} sx={{ color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                                            <Typography fontSize={12} color="text.secondary" mt={0.5}>{s.label}</Typography>
                                            <LinearProgress variant="determinate" value={s.pct}
                                                sx={{
                                                    mt: 1.5, height: 4, borderRadius: 2,
                                                    bgcolor: alpha(s.color, 0.12),
                                                    '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 2 }
                                                }} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Attendance rate banner */}
                            <Box sx={{
                                p: 2.5, borderRadius: 3, mb: 3,
                                background: isDark
                                    ? `linear-gradient(135deg, ${alpha('#2196f3', 0.12)}, ${alpha('#9c27b0', 0.08)})`
                                    : `linear-gradient(135deg, ${alpha('#2196f3', 0.07)}, ${alpha('#9c27b0', 0.04)})`,
                                border: `1px solid ${alpha('#2196f3', 0.2)}`,
                                display: 'flex', alignItems: 'center', gap: 3
                            }}>
                                <Box sx={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                                    <svg viewBox="0 0 72 72" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
                                        <circle cx="36" cy="36" r="28" fill="none" stroke={alpha('#2196f3', 0.12)} strokeWidth="6" />
                                        <circle cx="36" cy="36" r="28" fill="none" stroke="#2196f3" strokeWidth="6"
                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - attendRate / 100)}`}
                                            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                    </svg>
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography fontWeight={900} fontSize={14} sx={{ color: '#2196f3' }}>{attendRate}%</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography fontWeight={800} fontSize={15} sx={{ color: isDark ? '#fff' : '#111' }}>
                                        Overall Attendance Rate
                                    </Typography>
                                    <Typography fontSize={12} color="text.secondary">
                                        {present + late} of {total} students attended ({present} on time, {late} late)
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <StatPill label="Total" value={total} color="#9e9e9e" />
                                    <StatPill label="Present" value={present} color="#4caf50" />
                                    <StatPill label="Late" value={late} color={GOLD} />
                                    <StatPill label="Absent" value={absent} color="#f44336" />
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button variant="outlined" size="small" startIcon={<PersonSearch />}
                                        onClick={() => handleAutoAbsent(selectedSession.id)}
                                        sx={{ borderRadius: 2, borderColor: alpha('#f44336', 0.4), color: '#f44336', fontSize: 12, '&:hover': { borderColor: '#f44336', bgcolor: alpha('#f44336', 0.05) } }}>
                                        Mark Unscanned Absent
                                    </Button>
                                    <Button variant="outlined" size="small" startIcon={<DownloadIcon />}
                                        onClick={() => exportAttendanceCSV(report.records || [], selectedSession?.title || 'session')}
                                        sx={{ borderRadius: 2, borderColor: alpha(GOLD, 0.4), color: GOLD, fontSize: 12, '&:hover': { borderColor: GOLD, bgcolor: alpha(GOLD, 0.05) } }}>
                                        Export CSV
                                    </Button>
                                    <Tooltip title="Refresh">
                                        <IconButton size="small" onClick={() => handleViewReport(selectedSession)} sx={{ color: 'text.secondary' }}>
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>

                            {/* Records table */}
                            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
                                <DataTable columns={reportColumns} rows={report.records || []} emptyMessage="No records yet." />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography color="text.secondary">Failed to load report. Please try again.</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
