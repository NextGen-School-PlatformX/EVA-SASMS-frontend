'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { useNotification } from '@/src/context/NotificationContext';
import { resetPassword } from '@/src/lib/api/superadminApi';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showNotification } = useNotification();

    const token = searchParams?.get('token');

    useEffect(() => {
        if (!token) {
            showNotification('Invalid or missing reset token.', 'error');
            router.push('/login');
        }
    }, [token, router, showNotification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return showNotification('Passwords do not match.', 'error');
        }
        if (newPassword.length < 6) {
            return showNotification('Password must be at least 6 characters.', 'error');
        }
        if (!token) return;

        try {
            setLoading(true);
            await resetPassword(token, newPassword);
            showNotification('Password successfully reset! You can now log in.', 'success');
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            showNotification(error.message || 'Failed to reset password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
            <Card sx={{ maxWidth: 450, width: '100%', borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', mb: 2 }}>
                            <VpnKeyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold">Reset Password</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                            Please enter your new password below.
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            variant="outlined"
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm Password"
                            variant="outlined"
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || !newPassword || !confirmPassword}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
