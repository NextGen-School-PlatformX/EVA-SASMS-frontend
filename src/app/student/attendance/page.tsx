'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { DataTable } from '@/src/components/tables/DataTable';
import { getMyAttendance } from '@/src/lib/api/attendanceApi';
import { useRouter } from 'next/navigation';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PRESENT: { color: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 13 }} />, label: 'Present' },
    LATE: { color: GOLD, icon: <AccessTimeIcon sx={{ fontSize: 13 }} />, label: 'Late' },
    ABSENT: { color: '#f44336', icon: <WarningAmberIcon sx={{ fontSize: 13 }} />, label: 'Absent' },
  };
  const cfg = map[s] ?? { color: '#9e9e9e', icon: null, label: status };
  return (
    <Chip
      icon={<Box sx={{ color: 'inherit !important', display: 'flex' }}>{cfg.icon}</Box>}
      label={cfg.label} size="small"
      sx={{
        bgcolor: alpha(cfg.color, 0.12), color: cfg.color, fontWeight: 700,
        border: `1px solid ${alpha(cfg.color, 0.3)}`,
        '& .MuiChip-icon': { color: `${cfg.color} !important` },
      }}
    />
  );
}

const COLUMNS = [
  { id: 'session', label: 'Session', render: (row: any) => row.session?.title ?? '—' },
  { id: 'scannedAt', label: 'Date', render: (row: any) => row.scannedAt ? new Date(row.scannedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
  { id: 'scannedAtTime', label: 'Time', render: (row: any) => row.scannedAt ? new Date(row.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
  { id: 'status', label: 'Status', render: (row: any) => <StatusBadge status={row.status} /> },
  { id: 'distance', label: 'Distance', render: (row: any) => row.distance != null ? `${Math.round(row.distance)}m` : '—' },
];

export default function StudentAttendancePage() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === 'dark';
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const cardBg = isDark ? alpha('#111', 0.8) : alpha('#fff', 0.9);
  const border = isDark ? alpha(GOLD, 0.12) : alpha(GOLD, 0.18);

  const fetchData = async () => {
    try {
      const data = await getMyAttendance();
      setHistory(data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const pct = history?.summary?.percentage ?? 0;
  const pctColor = pct >= 85 ? '#4caf50' : pct >= 70 ? GOLD : '#f44336';

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {/* Header */}
      <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#111', mb: 0.5 }}>
          Attendance & Check-in
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Scan QR codes and track your attendance history</Typography>
      </MotionBox>

      {/* Stats + Scanner row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>

        {/* Attendance Rate Card */}
        <MotionBox initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Box sx={{ p: 3.5, borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2 }}>Attendance Rate</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="38" fill="none" stroke={alpha(pctColor, 0.12)} strokeWidth="8" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke={pctColor} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography fontWeight={900} fontSize={18} sx={{ color: pctColor }}>{pct}%</Typography>
                </Box>
              </Box>
              <Box>
                {[
                  { label: 'Present Days', value: history?.summary?.presentDays ?? 0, color: '#4caf50' },
                  { label: 'Absent Days', value: history?.summary?.absentDays ?? 0, color: '#f44336' },
                  { label: 'Total Sessions', value: history?.records?.length ?? 0, color: '#2196f3' },
                ].map(s => (
                  <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                    <Typography fontSize={13} color="text.secondary">{s.label}:</Typography>
                    <Typography fontSize={13} fontWeight={700} sx={{ color: s.color }}>{loading ? '—' : s.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </MotionBox>

        {/* QR Check-In Card — navigates to /student/scan */}
        <MotionBox initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Box
            onClick={() => router.push('/student/scan')}
            sx={{
              p: 3.5, borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(12px)',
              border: `1px solid ${border}`, height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, minHeight: 200, cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                border: `1px solid ${alpha(GOLD, 0.5)}`,
                transform: 'translateY(-2px)',
                boxShadow: isDark ? `0 12px 40px ${alpha(GOLD, 0.15)}` : `0 12px 40px ${alpha(GOLD, 0.18)}`
              }
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>QR Check-In</Typography>

            {/* QR frame graphic */}
            <Box sx={{ position: 'relative', width: 90, height: 90 }}>
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: 2, border: `2px solid ${alpha(GOLD, 0.3)}`, background: `radial-gradient(circle, ${alpha(GOLD, 0.06)}, transparent)` }} />
              {[
                { top: 0, left: 0, borderTop: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}` },
                { top: 0, right: 0, borderTop: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}` },
                { bottom: 0, left: 0, borderBottom: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}` },
                { bottom: 0, right: 0, borderBottom: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}` },
              ].map((style, i) => (
                <Box key={i} sx={{ position: 'absolute', width: 18, height: 18, borderRadius: '3px', ...style }} />
              ))}
              <QrCodeScannerIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 28, color: alpha(GOLD, 0.7) }} />
            </Box>

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 3.5, py: 1.5, borderRadius: 2.5,
              background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
              fontWeight: 800, fontSize: 14, boxShadow: `0 6px 20px ${GOLD}44`,
            }}>
              <CameraAltIcon sx={{ fontSize: 18 }} />
              Scan QR Code
            </Box>

            <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', maxWidth: 240 }}>
              Tap to open camera and scan the session QR code
            </Typography>
          </Box>
        </MotionBox>
      </Box>

      {/* History Table */}
      <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Box sx={{ p: 3, borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${border}` }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2.5 }}>Attendance History</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress sx={{ color: GOLD }} /></Box>
          ) : (
            <DataTable columns={COLUMNS} rows={history?.records ?? []} emptyMessage="No attendance records found." />
          )}
        </Box>
      </MotionBox>
    </Box>
  );
}
