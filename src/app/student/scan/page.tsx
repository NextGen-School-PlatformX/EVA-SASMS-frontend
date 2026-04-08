'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Box, Typography, CircularProgress, Button, Stack, Chip, IconButton, useTheme, alpha
} from '@mui/material';
import {
    CheckCircle as SuccessIcon, Error as ErrorIcon, QrCodeScanner as ScanIcon,
    AccessTime as TimeIcon, CameraAlt as CameraIcon, Edit as ManualIcon,
    Schedule as ScheduleIcon, Close as CloseIcon, LocationOn, Upload,
    ArrowBack, ContentCopy, CheckCircle
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField } from '@mui/material';
import { scanAttendance } from '@/src/lib/api/studentPortalApi';
import { Html5Qrcode } from 'html5-qrcode';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

// Corner brackets for QR frame
function QRCorners() {
    return (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
                { top: 0, left: 0, borderTop: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`, borderTopLeftRadius: 6 },
                { top: 0, right: 0, borderTop: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderTopRightRadius: 6 },
                { bottom: 0, left: 0, borderBottom: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`, borderBottomLeftRadius: 6 },
                { bottom: 0, right: 0, borderBottom: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderBottomRightRadius: 6 },
            ].map((style, i) => (
                <Box key={i} sx={{ position: 'absolute', width: 24, height: 24, ...style }} />
            ))}
        </Box>
    );
}

export default function StudentScanPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const sessionIdParam = searchParams.get('sessionId');

    const [status, setStatus] = useState<'idle' | 'locating' | 'scanning' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [errorReason, setErrorReason] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionIdParam);
    const [showManual, setShowManual] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanLine, setScanLine] = useState(0);

    const qrReaderRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const animRef = useRef<number | undefined>(undefined);

    const cardBg = isDark ? alpha('#0a0a14', 0.88) : alpha('#fff', 0.88);
    const borderC = isDark ? alpha(GOLD, 0.15) : alpha(GOLD, 0.22);

    // Animate scan line
    useEffect(() => {
        if (!cameraActive) return;
        let dir = 1, pos = 0;
        const animate = () => {
            pos += dir * 1.2;
            if (pos >= 100) dir = -1;
            if (pos <= 0) dir = 1;
            setScanLine(pos);
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [cameraActive]);

    useEffect(() => {
        if (sessionIdParam) {
            setActiveSessionId(sessionIdParam);
            handleVerification(sessionIdParam);
        }
        return () => { if (qrReaderRef.current?.isScanning) { qrReaderRef.current.stop(); } };
    }, [sessionIdParam]);

    const startCamera = async () => {
        setError(null);
        setErrorReason(null);
        try {
            const qr = new Html5Qrcode('qr-reader');
            qrReaderRef.current = qr;
            setCameraActive(true);
            await qr.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decodedText) => {
                    let sid = decodedText;
                    if (decodedText.includes('sessionId=')) {
                        try { const u = new URL(decodedText); sid = u.searchParams.get('sessionId') || decodedText; } catch { }
                    }
                    qr.stop().then(() => setCameraActive(false));
                    setActiveSessionId(sid);
                    handleVerification(sid);
                },
                () => { }
            );
        } catch {
            setCameraActive(false);
            setErrorReason('CAMERA_DENIED');
            setError('Camera access is required. Please enable camera permissions in your browser settings.');
        }
    };

    const stopCamera = async () => {
        if (qrReaderRef.current?.isScanning) await qrReaderRef.current.stop();
        setCameraActive(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        try {
            const qr = new Html5Qrcode('qr-reader-hidden');
            const decoded = await qr.scanFile(file, true);
            let sid = decoded;
            if (decoded.includes('sessionId=')) {
                try { const u = new URL(decoded); sid = u.searchParams.get('sessionId') || decoded; } catch { }
            }
            setActiveSessionId(sid);
            handleVerification(sid);
        } catch {
            setError('No valid QR code found in the image. Please try again or use manual entry.');
        }
    };

    const handleVerification = async (sid: string) => {
        if (!sid) return;
        try {
            setStatus('locating');
            setError(null);
            setErrorReason(null);
            if (!navigator.geolocation) throw new Error('Geolocation is not supported by your browser');
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
            });
            setStatus('scanning');
            const res = await scanAttendance({
                sessionId: sid,
                studentLatitude: position.coords.latitude,
                studentLongitude: position.coords.longitude
            });
            if (res.success === false) {
                setStatus('error'); setErrorReason(res.reason); setError(res.message); return;
            }
            setResult(res);
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            if (err.code === 1) { setErrorReason('LOCATION_DENIED'); setError('Location access is required to verify your attendance. Please enable location in browser settings.'); }
            else if (err.code === 3) { setErrorReason('LOCATION_TIMEOUT'); setError('Location request timed out. Please check your GPS signal.'); }
            else if (err.response?.data?.reason) { setErrorReason(err.response.data.reason); setError(err.response.data.message); }
            else { setError(err.response?.data?.message || err.message || 'An unexpected error occurred.'); }
        }
    };

    return (
        <Box sx={{ maxWidth: 520, mx: 'auto', px: 2, py: 2 }}>
            {/* Back button */}
            <MotionBox initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.push('/student/attendance')}
                    size="small"
                    sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', fontWeight: 600, '&:hover': { color: GOLD } }}
                >
                    Back to Attendance
                </Button>
            </MotionBox>

            {/* Active session badge */}
            <AnimatePresence>
                {activeSessionId && status !== 'success' && (
                    <MotionBox
                        key="session-badge"
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        sx={{ mb: 2 }}
                    >
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.2, borderRadius: 2,
                            bgcolor: isDark ? alpha(GOLD, 0.08) : alpha(GOLD, 0.06),
                            border: `1px solid ${alpha(GOLD, 0.25)}`
                        }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: GOLD, flexShrink: 0, boxShadow: `0 0 6px ${GOLD}` }} />
                            <Typography fontSize={12} fontWeight={700} sx={{ color: GOLD, flex: 1 }}>ACTIVE SESSION</Typography>
                            <Typography fontSize={11} color="text.secondary" sx={{ fontFamily: 'monospace', flex: 2 }}>
                                {activeSessionId.length > 20 ? `${activeSessionId.slice(0, 8)}…${activeSessionId.slice(-6)}` : activeSessionId}
                            </Typography>
                            <IconButton size="small" onClick={() => { setActiveSessionId(null); setStatus('idle'); }}
                                sx={{ color: 'text.secondary', '&:hover': { color: '#f44336' } }}>
                                <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Main card */}
            <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                <Box sx={{
                    borderRadius: 4, overflow: 'hidden',
                    bgcolor: cardBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${borderC}`,
                    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 24px 60px rgba(0,0,0,0.1)',
                }}>
                    {/* Top accent */}
                    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${GOLD}, #FF9500, #FF6B00, ${GOLD})` }} />

                    <Box sx={{ p: 4 }}>
                        <AnimatePresence mode="wait">

                            {/* ── IDLE STATE ── */}
                            {status === 'idle' && (
                                <MotionBox key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <Typography fontWeight={900} fontSize={24} sx={{ color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                                            QR Check-In
                                        </Typography>
                                        <Typography fontSize={13} color="text.secondary">
                                            Scan your session QR code to mark attendance
                                        </Typography>
                                    </Box>

                                    {!cameraActive ? (
                                        <Box>
                                            {/* QR frame icon */}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                                <Box sx={{
                                                    position: 'relative', width: 140, height: 140,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    borderRadius: 3,
                                                    bgcolor: isDark ? alpha(GOLD, 0.04) : alpha(GOLD, 0.03),
                                                }}>
                                                    <QRCorners />
                                                    <ScanIcon sx={{ fontSize: 56, color: alpha(GOLD, 0.7) }} />
                                                </Box>
                                            </Box>

                                            {/* Error alert */}
                                            {error && (
                                                <Box sx={{
                                                    mb: 3, p: 2, borderRadius: 2,
                                                    bgcolor: alpha('#f44336', 0.08), border: `1px solid ${alpha('#f44336', 0.25)}`
                                                }}>
                                                    <Typography fontSize={13} color="error.main" fontWeight={600}>{error}</Typography>
                                                </Box>
                                            )}

                                            <Stack spacing={1.5}>
                                                <Button fullWidth variant="contained" startIcon={<CameraIcon />}
                                                    onClick={startCamera}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                                                        color: '#000', fontWeight: 800, borderRadius: 2.5, py: 1.6, fontSize: 15,
                                                        boxShadow: `0 8px 24px ${GOLD}44`,
                                                        '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                                                    }}>
                                                    Open Camera
                                                </Button>
                                                <Button fullWidth variant="outlined" startIcon={<Upload />}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    sx={{
                                                        borderRadius: 2.5, py: 1.4, fontWeight: 700,
                                                        borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15),
                                                        color: 'text.primary',
                                                        '&:hover': { borderColor: GOLD, color: GOLD }
                                                    }}>
                                                    Upload QR Image
                                                </Button>
                                                <Button fullWidth size="small"
                                                    onClick={() => setShowManual(v => !v)}
                                                    sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 500, '&:hover': { color: GOLD } }}>
                                                    {showManual ? 'Hide manual entry' : 'Enter session code manually'}
                                                </Button>
                                            </Stack>

                                            {/* Manual entry */}
                                            <AnimatePresence>
                                                {showManual && (
                                                    <MotionBox
                                                        key="manual"
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        sx={{ mt: 2.5, pt: 2.5, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
                                                        <TextField fullWidth label="Session ID" size="small" value={manualCode}
                                                            onChange={(e) => setManualCode(e.target.value)}
                                                            sx={{
                                                                mb: 1.5,
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2,
                                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD }
                                                                }
                                                            }} />
                                                        <Button fullWidth variant="contained" disabled={!manualCode.trim()}
                                                            onClick={() => { setActiveSessionId(manualCode.trim()); handleVerification(manualCode.trim()); }}
                                                            sx={{
                                                                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                                                                fontWeight: 800, borderRadius: 2,
                                                                '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                                                            }}>
                                                            Submit Code
                                                        </Button>
                                                    </MotionBox>
                                                )}
                                            </AnimatePresence>
                                        </Box>
                                    ) : (
                                        /* Camera active */
                                        <Box>
                                            <Box sx={{ position: 'relative', width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: '#000', mb: 2 }}>
                                                <div id="qr-reader" style={{ width: '100%' }} />
                                                {/* Animated scan line */}
                                                <Box sx={{
                                                    position: 'absolute', left: '10%', right: '10%', height: 2,
                                                    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                                                    top: `${scanLine}%`,
                                                    transition: 'top 0.05s linear',
                                                    boxShadow: `0 0 12px ${GOLD}88`,
                                                }} />
                                                <IconButton size="small" onClick={stopCamera} sx={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
                                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }
                                                }}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Typography fontSize={12} color="text.secondary" textAlign="center">
                                                Align the QR code within the frame
                                            </Typography>
                                        </Box>
                                    )}
                                </MotionBox>
                            )}

                            {/* ── LOCATING / SCANNING ── */}
                            {(status === 'locating' || status === 'scanning') && (
                                <MotionBox key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    sx={{ textAlign: 'center', py: 5 }}>
                                    {/* Animated rings */}
                                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 3 }}>
                                        {[0, 1, 2].map(i => (
                                            <Box key={i} sx={{
                                                position: 'absolute', borderRadius: '50%',
                                                border: `2px solid ${alpha(GOLD, 0.2 - i * 0.05)}`,
                                                inset: i * -12,
                                                animation: `pulse${i} ${1.5 + i * 0.4}s ease-in-out infinite`,
                                            }} />
                                        ))}
                                        <CircularProgress size={100} thickness={2}
                                            sx={{ color: GOLD, position: 'absolute', top: 0, left: 0 }} />
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <LocationOn sx={{ color: GOLD, fontSize: 28 }} />
                                        </Box>
                                    </Box>
                                    <Typography fontWeight={800} fontSize={20} sx={{ color: isDark ? '#fff' : '#111', mb: 1 }}>
                                        {status === 'locating' ? 'Getting Location…' : 'Verifying…'}
                                    </Typography>
                                    <Typography fontSize={13} color="text.secondary">
                                        {status === 'locating' ? 'Checking your GPS coordinates' : 'Communicating with the server'}
                                    </Typography>
                                    <style>{`
                                        @keyframes pulse0 { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.1);opacity:0.6} }
                                        @keyframes pulse1 { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.08);opacity:0.5} }
                                        @keyframes pulse2 { 0%,100%{transform:scale(1);opacity:0.1} 50%{transform:scale(1.06);opacity:0.4} }
                                    `}</style>
                                </MotionBox>
                            )}

                            {/* ── SUCCESS ── */}
                            {status === 'success' && (
                                <MotionBox key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    sx={{ textAlign: 'center', py: 2 }}>
                                    {/* Success ring */}
                                    <Box sx={{ position: 'relative', width: 100, height: 100, mx: 'auto', mb: 3 }}>
                                        <Box sx={{
                                            position: 'absolute', inset: -10, borderRadius: '50%',
                                            background: `radial-gradient(circle, ${alpha('#4caf50', 0.15)}, transparent 70%)`
                                        }} />
                                        <Box sx={{
                                            width: 100, height: 100, borderRadius: '50%',
                                            bgcolor: alpha('#4caf50', 0.12), border: `2px solid ${alpha('#4caf50', 0.4)}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <SuccessIcon sx={{ fontSize: 50, color: '#4caf50' }} />
                                        </Box>
                                    </Box>

                                    <Typography fontWeight={900} fontSize={26} sx={{ color: '#4caf50', mb: 0.5 }}>
                                        Attendance Marked!
                                    </Typography>
                                    <Typography fontSize={14} color="text.secondary" sx={{ mb: 3 }}>
                                        Your presence has been recorded successfully
                                    </Typography>

                                    {/* Result card */}
                                    <Box sx={{
                                        p: 2.5, borderRadius: 3, mb: 4, textAlign: 'left',
                                        background: isDark
                                            ? `linear-gradient(135deg, ${alpha('#4caf50', 0.12)}, ${alpha('#2e7d32', 0.06)})`
                                            : `linear-gradient(135deg, ${alpha('#4caf50', 0.07)}, ${alpha('#e8f5e9', 0.5)})`,
                                        border: `1px solid ${alpha('#4caf50', 0.3)}`,
                                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2
                                    }}>
                                        <Box>
                                            <Typography fontSize={10} fontWeight={700} sx={{ color: '#4caf50', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>Status</Typography>
                                            <Chip
                                                label={result?.status || 'PRESENT'}
                                                size="small"
                                                sx={{
                                                    bgcolor: result?.status === 'LATE' ? alpha(GOLD, 0.15) : alpha('#4caf50', 0.15),
                                                    color: result?.status === 'LATE' ? GOLD : '#4caf50',
                                                    fontWeight: 800, border: `1px solid ${result?.status === 'LATE' ? alpha(GOLD, 0.3) : alpha('#4caf50', 0.3)}`
                                                }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography fontSize={10} fontWeight={700} sx={{ color: '#4caf50', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>Time</Typography>
                                            <Typography fontSize={14} fontWeight={700} sx={{ color: isDark ? '#fff' : '#111' }}>
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                        {result?.distance != null && (
                                            <Box sx={{ gridColumn: '1 / -1' }}>
                                                <Typography fontSize={10} fontWeight={700} sx={{ color: '#4caf50', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>Distance from Origin</Typography>
                                                <Typography fontSize={14} fontWeight={700} sx={{ color: isDark ? '#fff' : '#111' }}>
                                                    {result.distance.toFixed(1)} meters
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Stack spacing={1.5}>
                                        <Button fullWidth variant="contained" size="large"
                                            onClick={() => router.push('/student/attendance')}
                                            sx={{
                                                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                                                color: '#000', fontWeight: 800, borderRadius: 2.5, py: 1.5,
                                                '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                                            }}>
                                            View My Attendance
                                        </Button>
                                        <Button fullWidth variant="outlined" onClick={() => router.push('/student')}
                                            sx={{ borderRadius: 2.5, py: 1.3, fontWeight: 700, borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15), '&:hover': { borderColor: GOLD, color: GOLD } }}>
                                            Go to Dashboard
                                        </Button>
                                    </Stack>
                                </MotionBox>
                            )}

                            {/* ── ERROR ── */}
                            {status === 'error' && (
                                <MotionBox key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    sx={{ textAlign: 'center', py: 2 }}>
                                    <Box sx={{
                                        width: 100, height: 100, borderRadius: '50%', mx: 'auto', mb: 3,
                                        bgcolor: errorReason === 'NOT_STARTED' ? alpha(GOLD, 0.12) : alpha('#f44336', 0.1),
                                        border: `2px solid ${alpha(errorReason === 'NOT_STARTED' ? GOLD : '#f44336', 0.35)}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {errorReason === 'NOT_STARTED'
                                            ? <ScheduleIcon sx={{ fontSize: 50, color: GOLD }} />
                                            : errorReason === 'ENDED'
                                                ? <TimeIcon sx={{ fontSize: 50, color: '#f44336' }} />
                                                : <ErrorIcon sx={{ fontSize: 50, color: '#f44336' }} />}
                                    </Box>

                                    <Typography fontWeight={900} fontSize={22} sx={{ color: errorReason === 'NOT_STARTED' ? GOLD : '#f44336', mb: 1 }}>
                                        {errorReason === 'NOT_STARTED' ? 'Session Not Started' : errorReason === 'ENDED' ? 'Session Ended' : 'Check-In Failed'}
                                    </Typography>

                                    <Box sx={{
                                        p: 2, borderRadius: 2, mb: 3, textAlign: 'left',
                                        bgcolor: alpha(errorReason === 'NOT_STARTED' ? GOLD : '#f44336', 0.07),
                                        border: `1px solid ${alpha(errorReason === 'NOT_STARTED' ? GOLD : '#f44336', 0.25)}`
                                    }}>
                                        <Typography fontSize={13} sx={{ color: errorReason === 'NOT_STARTED' ? (isDark ? '#FFD740' : '#b8860b') : 'error.main' }}>
                                            {error}
                                        </Typography>
                                    </Box>

                                    <Stack spacing={1.5}>
                                        <Button fullWidth variant="contained"
                                            onClick={() => { if (activeSessionId) handleVerification(activeSessionId); else setStatus('idle'); }}
                                            sx={{
                                                background: `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                                                color: '#000', fontWeight: 800, borderRadius: 2.5, py: 1.5,
                                                '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
                                            }}>
                                            Try Again
                                        </Button>
                                        <Button fullWidth variant="outlined"
                                            onClick={() => { setStatus('idle'); setCameraActive(false); setActiveSessionId(null); setError(null); }}
                                            sx={{ borderRadius: 2.5, py: 1.3, fontWeight: 700, borderColor: isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15), '&:hover': { borderColor: GOLD, color: GOLD } }}>
                                            Scan Different QR
                                        </Button>
                                    </Stack>
                                </MotionBox>
                            )}

                        </AnimatePresence>
                    </Box>
                </Box>
            </MotionBox>

            {/* Help text */}
            <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Typography fontSize={12} color="text.secondary" textAlign="center" sx={{ mt: 3, px: 4 }}>
                    Having trouble? Contact your instructor with the Session ID shown above.
                </Typography>
            </MotionBox>

            {/* Hidden elements */}
            <div id="qr-reader-hidden" style={{ display: 'none' }} />
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        </Box>
    );
}
