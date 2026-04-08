'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { useAuth } from '@/src/context/AuthContext';
import { updateProfile, uploadAvatar } from '@/src/lib/api/superadminApi';
import { apiClient } from '@/src/lib/api/client';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api').replace('/api', '');

export default function AdminProfilePage() {
    const theme = useTheme();
    const { user } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient<{ avatarUrl?: string; phoneNumber?: string; name?: string }>('/auth/me')
            .then((me) => {
                if (me.avatarUrl) setAvatarUrl(me.avatarUrl);
                if (me.phoneNumber) setPhoneNumber(me.phoneNumber || '');
                if (me.name) setName(me.name);
            })
            .catch(() => {});
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            await updateProfile({
                name: name || undefined,
                phoneNumber: phoneNumber || undefined,
            });
            setTimeout(() => window.location.reload(), 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        setUploadingAvatar(true);
        setError(null);
        try {
            const res = await uploadAvatar(file);
            setAvatarUrl(res.avatarUrl);
            setTimeout(() => window.location.reload(), 1000);
        } catch (err: any) {
            setError((err as Error).message || 'Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <PageHeader
                title="Admin Profile"
                description="Manage your Admin identity and dashboard preferences"
            />

            {error && (
                <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
            )}

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                        }}
                    >
                        <Box component="label" sx={{ position: 'relative', cursor: uploadingAvatar ? 'wait' : 'pointer' }}>
                            <input type="file" accept="image/*" hidden disabled={uploadingAvatar} onChange={handleAvatarChange} />
                            <Avatar
                                src={avatarUrl ? `${API_BASE}/${avatarUrl}` : undefined}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mb: 3,
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: '3rem'
                                }}
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </Avatar>
                            {uploadingAvatar && <CircularProgress size={24} sx={{ position: 'absolute', bottom: 24, left: '50%', ml: -1.5 }} />}
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {user?.name || 'Administrator'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            System Administrator
                        </Typography>
                        <Typography variant="caption" sx={{
                            mt: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600
                        }}>
                            {user?.role || 'ADMIN'} Access
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <ContentSection title="Personal Information">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Email Address"
                                        defaultValue={user?.email || 'admin@sasms.edu'}
                                        fullWidth
                                        disabled
                                        helperText="Email cannot be changed"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" size="large" onClick={handleSave} disabled={loading}>
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </ContentSection>
                </Grid>
            </Grid>
        </Box>
    );
}
