'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, Divider, CircularProgress, Alert, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/src/context/NotificationContext';
import { useAuth } from '@/src/context/AuthContext';
import { PageBackground } from '@/src/components/layout/PageBackground';
import { useBranding, getLogoUrl } from '@/src/context/BrandingContext';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import LockIcon from '@mui/icons-material/Lock';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api';
const GOLD = '#FFC600';

export default function ApplicantRegisterPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { showNotification } = useNotification();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [window_, setWindow_] = useState<any>(null);
  const [windowLoading, setWindowLoading] = useState(true);
  const branding = useBranding();

  useEffect(() => {
    fetch(`${API_BASE}/admissions/window`)
      .then(r => r.json()).then(setWindow_)
      .catch(() => setWindow_({ isOpen: true }))
      .finally(() => setWindowLoading(false));
  }, []);

  const now = new Date();
  const registrationBlocked = window_ && (
    !window_.isOpen ||
    (window_.startDate && new Date(window_.startDate) > now) ||
    (window_.endDate && new Date(window_.endDate) < now)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registrationBlocked) return;
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error'); return;
    }
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      showNotification('Account created! Welcome to SASMS.', 'success');
      router.push('/applicant/dashboard');
    } catch (e: any) {
      showNotification(e.message || 'Error creating account.', 'error');
    } finally { setLoading(false); }
  };

  const cardBg = isDark ? 'rgba(8,8,18,0.78)' : 'rgba(255,255,255,0.82)';
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(GOLD, 0.5) },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
    }
  };

  return (
    <PageBackground>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6, position: 'relative' }}>
        {/* Back to home */}
        <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
          <Button variant="text" size="small" onClick={() => router.push('/')} sx={{ color: '#fff', textTransform: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Button>
        </Box>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          style={{ width: '100%', maxWidth: 460 }}>
          <Box sx={{
            background: cardBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${isDark ? alpha(GOLD, 0.15) : alpha('#fff', 0.7)}`,
            borderRadius: 4, p: { xs: 3.5, sm: 5 },
            boxShadow: isDark ? `0 28px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,198,0,0.06)` : `0 28px 72px rgba(0,0,0,0.1)`,
          }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {branding.logoUrl && !registrationBlocked ? (
                <Box sx={{ mb: 2 }}>
                  <img src={getLogoUrl(branding.logoUrl)} alt="SASMS" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                </Box>
              ) : (
                <Box sx={{
                  width: 56, height: 56, borderRadius: 2.5,
                  background: registrationBlocked ? 'rgba(244,67,54,0.15)' : `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                  boxShadow: registrationBlocked ? '0 8px 24px rgba(244,67,54,0.3)' : `0 8px 24px ${GOLD}44`,
                  color: registrationBlocked ? '#f44336' : '#000',
                }}>
                  {registrationBlocked ? <LockIcon sx={{ fontSize: 26 }} /> : <AppRegistrationIcon sx={{ fontSize: 26 }} />}
                </Box>
              )}
              <Typography sx={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                Student Admission
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Create an applicant account to start your journey
              </Typography>
            </Box>

            {windowLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress sx={{ color: GOLD }} /></Box>
            ) : registrationBlocked ? (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Registration is currently closed</Typography>
                {window_?.startDate && new Date(window_.startDate) > now && (
                  <Typography variant="body2">Opens on: {new Date(window_.startDate).toLocaleString()}</Typography>
                )}
                {window_?.endDate && new Date(window_.endDate) < now && (
                  <Typography variant="body2">Closed on: {new Date(window_.endDate).toLocaleString()}</Typography>
                )}
                {!window_?.startDate && !window_?.endDate && (
                  <Typography variant="body2">Please check back later or contact the school.</Typography>
                )}
              </Alert>
            ) : (
              <>
                {window_?.startDate && window_?.endDate && (
                  <Alert severity="info" sx={{ borderRadius: 2, mb: 3, fontSize: 12 }}>
                    Registration period: {new Date(window_.startDate).toLocaleDateString()} — {new Date(window_.endDate).toLocaleDateString()}
                  </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    <TextField fullWidth label="Full Name" required value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} sx={inputSx} />
                    <TextField fullWidth label="Email Address" type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })} sx={inputSx} />
                    <TextField fullWidth label="Password" type="password" required value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })} sx={inputSx} />
                    <TextField fullWidth label="Confirm Password" type="password" required value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} sx={inputSx} />
                    <Button fullWidth variant="contained" size="large" type="submit" disabled={loading}
                      sx={{
                        py: 1.8, borderRadius: 2, fontWeight: 800, fontSize: 15, textTransform: 'none',
                        background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000',
                        boxShadow: `0 8px 24px ${GOLD}44`,
                        '&:hover': { background: `linear-gradient(135deg, #FFD740, #FFC600)` },
                        '&:disabled': { background: alpha(GOLD, 0.3), color: 'rgba(0,0,0,0.35)' }
                      }}>
                      {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : 'Create Account →'}
                    </Button>
                  </Stack>
                </Box>
              </>
            )}

            <Divider sx={{ my: 3, borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.08em' }}>ALREADY REGISTERED?</Typography>
            </Divider>
            <Button fullWidth variant="outlined" onClick={() => router.push('/login')} sx={{
              py: 1.3, borderRadius: 2, fontWeight: 700,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              '&:hover': { borderColor: GOLD, color: GOLD, background: alpha(GOLD, 0.04) }
            }}>
              Sign in as Applicant
            </Button>
          </Box>
        </motion.div>
      </Box>
    </PageBackground>
  );
}
