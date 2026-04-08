'use client';

// This page has been repurposed from "Employee Attendance" to "Attendance Analytics"
// since SASMS only tracks STUDENT attendance via QR sessions.
// It provides an overview & cross-session analytics to complement /admin/attendance.

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Button, CircularProgress, Stack, Chip, Grid, alpha, useTheme, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { DataTable, type Column } from '@/src/components/tables/DataTable';
import { getAttendanceSessions, getAttendanceReport } from '@/src/lib/api/staffApi';
import {
    BarChart as AnalyticsIcon, QrCode as QrIcon, ArrowBack,
    CheckCircle, Cancel, AccessTime, People, Refresh, OpenInNew
} from '@mui/icons-material';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

function MiniRing({ pct, color }: { pct: number; color: string }) {
    const r = 20;
    return (
        <Box sx={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
            <svg viewBox="0 0 48 48" style={{ width: 48, height: 48, transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r={r} fill="none" stroke={alpha(color, 0.15)} strokeWidth="4" />
                <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * r}`}
                    strokeDashoffset={`${2 * Math.PI * r * (1 - pct / 100)}`}
                    strokeLinecap="round" />
            </svg>
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography fontSize={10} fontWeight={900} sx={{ color }}>{pct}%</Typography>
            </Box>
        </Box>
    );
}

export default function AttendanceAnalyticsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isSuperAdmin = pathname?.startsWith('/superadmin');
    const baseHref = isSuperAdmin ? '/superadmin/attendance-sessions' : '/admin/attendance';
    const isDark = theme.palette.mode === 'dark';
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionStats, setSessionStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [loadingStats, setLoadingStats] = useState(false);

    const cardBg = isDark ? alpha('#111', 0.75) : alpha('#fff', 0.85);
    const border = isDark ? alpha(GOLD, 0.13) : alpha(GOLD, 0.2);

    const loadAll = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceSessions();
            setSessions(data);
            // Load stats for each session
            setLoadingStats(true);
            const stats: Record<string, any> = {};
            await Promise.all(
                data.map(async (s: any) => {
                    try {
                        const report = await getAttendanceReport(s.id);
                        const records = report.records || [];
                        const present = records.filter((r: any) => r.status === 'PRESENT').length;
                        const late = records.filter((r: any) => r.status === 'LATE').length;
                        const absent = records.filter((r: any) => r.status === 'ABSENT').length;
                        const total = present + late + absent;
                        stats[s.id] = { present, late, absent, total, rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0 };
                    } catch { stats[s.id] = { present: 0, late: 0, absent: 0, total: 0, rate: 0 }; }
                })
            );
            setSessionStats(stats);
        } catch { }
        finally { setLoading(false); setLoadingStats(false); }
    };

    useEffect(() => { loadAll(); }, []);

    // Aggregate totals
    const allStats = Object.values(sessionStats);
    const totalSessions = sessions.length;
    const totalScans = allStats.reduce((s, x) => s + x.total, 0);
    const totalPresent = allStats.reduce((s, x) => s + x.present, 0);
    const totalLate = allStats.reduce((s, x) => s + x.late, 0);
    const totalAbsent = allStats.reduce((s, x) => s + x.absent, 0);
    const overallRate = totalScans > 0 ? Math.round(((totalPresent + totalLate) / totalScans) * 100) : 0;

    const columns: Column<any>[] = [
        {
            id: 'title', label: 'Session',
            render: (row: any) => (
                <Box>
                    <Typography fontWeight={700} fontSize={14}>{row.title}</Typography>
                    <Typography fontSize={11} color="text.secondary">
                        {new Date(row.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'rate', label: 'Attendance Rate',
            render: (row: any) => {
                const s = sessionStats[row.id];
                if (!s) return <CircularProgress size={16} sx={{ color: GOLD }} />;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MiniRing pct={s.rate} color={s.rate >= 80 ? '#4caf50' : s.rate >= 60 ? GOLD : '#f44336'} />
                        <Box>
                            <Typography fontSize={13} fontWeight={700}>{s.rate}%</Typography>
                            <Typography fontSize={11} color="text.secondary">{s.total} students</Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            id: 'breakdown', label: 'Breakdown',
            render: (row: any) => {
                const s = sessionStats[row.id];
                if (!s) return null;
                return (
                    <Stack direction="row" spacing={0.8}>
                        <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label={s.present} size="small"
                            sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 700, border: `1px solid ${alpha('#4caf50', 0.25)}` }} />
                        <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={s.late} size="small"
                            sx={{ bgcolor: alpha(GOLD, 0.1), color: GOLD, fontWeight: 700, border: `1px solid ${alpha(GOLD, 0.25)}` }} />
                        <Chip icon={<Cancel sx={{ fontSize: 12 }} />} label={s.absent} size="small"
                            sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336', fontWeight: 700, border: `1px solid ${alpha('#f44336', 0.25)}` }} />
                    </Stack>
                );
            }
        },
        {
            id: 'action', label: '',
            render: (row: any) => (
                <Tooltip title="Manage in Attendance">
                    <IconButton size="small" onClick={() => router.push(baseHref)}
                        sx={{ color: 'text.secondary', '&:hover': { color: GOLD } }}>
                        <OpenInNew fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Box sx={{ maxWidth: 1200 }}>
            {/* Header */}
            <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                            Attendance Analytics
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                            Cross-session overview of student attendance across all QR sessions
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push(baseHref)}
                            sx={{ borderRadius: 2, borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15), color: 'text.secondary', '&:hover': { borderColor: GOLD, color: GOLD } }}>
                            Manage Sessions
                        </Button>
                        <Button variant="contained" startIcon={<QrIcon />} onClick={() => router.push(baseHref)}
                            sx={{
                                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                                fontWeight: 800, borderRadius: 2, '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                            }}>
                            New Session
                        </Button>
                    </Stack>
                </Box>
            </MotionBox>

            {/* Summary cards */}
            <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { label: 'Total Sessions', value: totalSessions, color: '#2196f3', icon: <AnalyticsIcon /> },
                        { label: 'Total Check-ins', value: totalScans, color: GOLD, icon: <People /> },
                        { label: 'Present', value: totalPresent, color: '#4caf50', icon: <CheckCircle /> },
                        { label: 'Late', value: totalLate, color: '#ff9800', icon: <AccessTime /> },
                        { label: 'Absent', value: totalAbsent, color: '#f44336', icon: <Cancel /> },
                    ].map(s => (
                        <Grid size={{ xs: 6, sm: 4, md: 'auto' }} sx={{ flex: 1, minWidth: 140 }} key={s.label}>
                            <Box sx={{
                                p: 2.5, borderRadius: 3, textAlign: 'center',
                                bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`,
                            }}>
                                <Box sx={{ color: s.color, display: 'flex', justifyContent: 'center', mb: 1 }}>
                                    {s.icon}
                                </Box>
                                <Typography fontWeight={900} fontSize={28} sx={{ color: s.color, lineHeight: 1 }}>
                                    {loading ? '—' : s.value}
                                </Typography>
                                <Typography fontSize={12} color="text.secondary" mt={0.5}>{s.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                    <Grid size={{ xs: 12, sm: 12, md: 'auto' }} sx={{ minWidth: 140 }}>
                        <Box sx={{
                            p: 2.5, borderRadius: 3, textAlign: 'center',
                            background: isDark
                                ? `linear-gradient(135deg, ${alpha(GOLD, 0.12)}, ${alpha('#FF9500', 0.06)})`
                                : `linear-gradient(135deg, ${alpha(GOLD, 0.1)}, ${alpha('#FF9500', 0.04)})`,
                            border: `1px solid ${alpha(GOLD, 0.3)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: '100%'
                        }}>
                            <Box sx={{ position: 'relative', width: 64, height: 64 }}>
                                <svg viewBox="0 0 64 64" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
                                    <circle cx="32" cy="32" r="26" fill="none" stroke={alpha(GOLD, 0.15)} strokeWidth="6" />
                                    <circle cx="32" cy="32" r="26" fill="none" stroke={GOLD} strokeWidth="6"
                                        strokeDasharray={`${2 * Math.PI * 26}`}
                                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallRate / 100)}`}
                                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
                                </svg>
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography fontWeight={900} fontSize={13} sx={{ color: GOLD }}>{overallRate}%</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography fontWeight={800} fontSize={15} sx={{ color: isDark ? '#fff' : '#111' }}>Overall Rate</Typography>
                                <Typography fontSize={12} color="text.secondary">Across all sessions</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </MotionBox>

            {/* Per-session table */}
            <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                <Box sx={{ p: 3, borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Per-Session Breakdown
                            </Typography>
                            <Typography fontSize={13} color="text.secondary" mt={0.3}>Attendance stats for each created session</Typography>
                        </Box>
                        <Tooltip title="Refresh">
                            <IconButton onClick={loadAll} size="small" sx={{ color: 'text.secondary' }}>
                                <Refresh fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: GOLD }} /></Box>
                    ) : (
                        <DataTable columns={columns} rows={sessions} emptyMessage="No sessions yet. Create sessions from the Attendance Management page." />
                    )}
                </Box>
            </MotionBox>
        </Box>
    );
}
