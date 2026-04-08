'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Paper, CircularProgress,
  FormControl, InputLabel, MenuItem, Select,
  TextField, Typography, Stack, Divider, Avatar, FormHelperText,
  useTheme
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth, type UserRole } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import { PageBackground } from '@/src/components/layout/PageBackground';
import { useBranding, getLogoUrl } from '@/src/context/BrandingContext';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'ADMIN', label: 'School Admin' },
  { value: 'SUPER_ADMIN', label: 'System SuperAdmin' },
  { value: 'APPLICANT', label: 'New Applicant' },
];

const ROLE_REDIRECT: Record<UserRole, string> = {
  STUDENT: '/student',
  ADMIN: '/admin',
  SUPER_ADMIN: '/superadmin',
  APPLICANT: '/applicant/dashboard',
};

export default function LoginPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { showNotification } = useNotification();
  const { login, isAuthenticated, role: authRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const branding = useBranding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, selectedRole);
      showNotification(`Authenticated as ${selectedRole}. Redirecting...`, 'success');
      router.push(ROLE_REDIRECT[selectedRole]);
    } catch {
      setError('Invalid credentials for the selected role.');
      showNotification('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
    <Box suppressHydrationWarning sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      position: 'relative',
    }}>

      {/* Back to home */}
      <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
        <Button variant="text" size="small" onClick={() => router.push('/')} sx={{ color: '#fff', textTransform: 'none', fontWeight: 600 }}>
          ← Back to Home
        </Button>
      </Box>

      {/* Login Card */}
      <Paper elevation={0} sx={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        p: 5, borderRadius: 3,
        textAlign: 'center',
        // Glass effect so background shows through
        backgroundColor: isDark ? 'rgba(10,10,20,0.75)' : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(255,198,0,0.18)' : '1px solid rgba(255,255,255,0.7)',
        boxShadow: isDark
          ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,198,0,0.08)'
          : '0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5)',
      }}>
        {branding.logoUrl ? (
          <Box sx={{ mb: 2 }}>
            <img src={getLogoUrl(branding.logoUrl)} alt="SASMS" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          </Box>
        ) : (
          <Avatar sx={{
            bgcolor: 'primary.main',
            width: 56, height: 56,
            mx: 'auto', mb: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }}>
            <LockOutlinedIcon />
          </Avatar>
        )}

        <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: isDark ? '#fff' : '#111', letterSpacing: '-0.02em' }}>
          SASMS Login
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Enter your credentials below to access your portal
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Email Address"
            type="email"
            variant="filled"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required fullWidth autoFocus disabled={loading}
            error={Boolean(error)}
          />

          <TextField
            label="Password"
            type="password"
            variant="filled"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required fullWidth disabled={loading}
            error={Boolean(error)}
          />

          <FormControl fullWidth variant="filled" disabled={loading}>
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} label="Role" onChange={(e) => setSelectedRole(e.target.value as UserRole)} sx={{ textAlign: 'left' }}>
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <FormHelperText error sx={{ textAlign: 'center', fontWeight: 600 }}>{error}</FormHelperText>
          )}

          <Button
            type="submit" variant="contained" size="large" fullWidth disabled={loading}
            sx={{ mt: 1, py: 1.8, borderRadius: 2, textTransform: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: theme.shadows[4] }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Authorize Access'}
          </Button>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="text.secondary">NEW STUDENT?</Typography>
          </Divider>

          <Button variant="outlined" fullWidth onClick={() => router.push('/applicant/register')} sx={{ py: 1.2, borderRadius: 3, fontWeight: 700 }}>
            Apply for Admission
          </Button>
        </Box>
      </Paper>
    </Box>
    </PageBackground>
  );
}
