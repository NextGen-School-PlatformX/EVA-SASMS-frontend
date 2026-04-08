'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Avatar, CircularProgress } from '@mui/material';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { useAuth } from '@/src/context/AuthContext';
import { useNotification } from '@/src/context/NotificationContext';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { updateProfile, uploadAvatar } from '@/src/lib/api/superadminApi';
import { apiClient } from '@/src/lib/api/client';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api').replace('/api', '');

export default function SuperAdminProfilePage() {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        const u = user as any;
        if (u?.avatarUrl) setAvatarUrl(u.avatarUrl);
        if (u?.phoneNumber) setPhoneNumber(u.phoneNumber || '');
        // Fetch full profile (avatar, phone) from API
        apiClient<{ avatarUrl?: string; phoneNumber?: string; name?: string }>('/auth/me')
            .then((me) => {
                if (me.avatarUrl) setAvatarUrl(me.avatarUrl);
                if (me.phoneNumber) setPhoneNumber(me.phoneNumber || '');
                if (me.name) setName(me.name);
            })
            .catch(() => {});
    }, [user]);

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            return showNotification('New passwords do not match.', 'error');
        }
        try {
            setLoading(true);
            await updateProfile({
                name: name !== user?.name ? name : undefined,
                phoneNumber: phoneNumber || undefined,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined
            });
            showNotification('Profile updated successfully.', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            showNotification(error.message || 'Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        setUploadingAvatar(true);
        try {
            const res = await uploadAvatar(file);
            setAvatarUrl(res.avatarUrl);
            showNotification('Avatar updated successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err: any) {
            showNotification(err.message || 'Failed to upload avatar.', 'error');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    return (
        <Box>
            <PageHeader
                title="SuperAdmin Profile"
                description="Manage your platform-wide administrative credentials and personal details"
            />

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
                        <CardContent>
                            <Box component="label" sx={{ position: 'relative', display: 'inline-block', cursor: uploadingAvatar ? 'wait' : 'pointer' }}>
                                <input type="file" accept="image/*" hidden disabled={uploadingAvatar} onChange={handleAvatarChange} />
                                <Avatar
                                    src={avatarUrl ? `${API_BASE}/${avatarUrl}` : undefined}
                                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'secondary.main', fontSize: '2.5rem' }}
                                >
                                    {user?.name?.charAt(0) || 'S'}
                                </Avatar>
                                {uploadingAvatar && <CircularProgress size={24} sx={{ position: 'absolute', bottom: 12, left: '50%', ml: -1.5 }} />}
                                <Button component="span" size="small" startIcon={<PhotoCameraIcon />} sx={{ display: 'block', mx: 'auto' }}>Change Photo</Button>
                            </Box>
                            <Typography variant="h5" fontWeight="bold">{user?.name || 'System SuperAdmin'}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email || 'admin@sasms.edu.eg'}</Typography>
                            <Typography variant="caption" sx={{ px: 2, py: 0.5, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 1, fontWeight: 'bold' }}>
                                SUPER_ADMIN
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>General Information</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    defaultValue={user?.email || 'admin@sasms.edu.eg'}
                                    variant="outlined"
                                    disabled
                                    helperText="Email address cannot be changed."
                                />
                                <TextField
                                    fullWidth
                                    label="Contact Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    variant="outlined"
                                />
                            </Box>

                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 5, mb: 3 }}>Security</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" startIcon={!loading ? <SaveIcon /> : undefined} onClick={handleSave} disabled={loading}>
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
