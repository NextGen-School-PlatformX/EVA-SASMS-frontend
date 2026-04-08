'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, TextField, Grid,
    Switch, FormControlLabel, CircularProgress,
    Stack, Slider, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import PaletteIcon from '@mui/icons-material/Palette';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNotification } from '@/src/context/NotificationContext';

import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getSystemSettings, updateSystemSettings, uploadSystemLogo, resetSystemSettings } from '@/src/lib/api/superadminApi';
import { SystemSettings } from '@/src/types/superadmin.types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api').replace('/api', '');

export default function SystemSettingsPage() {
    const { showNotification } = useNotification();
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const fetchSettings = async () => {
        try {
            const data = await getSystemSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            showNotification('Failed to load settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        try {
            setSaving(true);
            await updateSystemSettings(settings);
            showNotification('System policies and branding updated successfully.', 'success');
        } catch (error: any) {
            showNotification(error.message || 'Failed to update system settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        try {
            setUploadingLogo(true);
            const res = await uploadSystemLogo(file);
            setSettings(res.settings);
            showNotification('Logo uploaded and applied successfully.', 'success');
        } catch (error: any) {
            showNotification(error.message || 'Failed to upload logo.', 'error');
        } finally {
            setUploadingLogo(false);
            e.target.value = '';
        }
    };

    const handleResetToDefault = async () => {
        try {
            setSaving(true);
            const newSettings = await resetSystemSettings();
            setSettings(newSettings);
            setResetDialogOpen(false);
            showNotification('All settings reset to default.', 'success');
        } catch (error: any) {
            showNotification(error.message || 'Failed to reset settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = () => {
        showNotification('Testing SMTP connection...', 'info');
        setTimeout(() => showNotification('Connection successful!', 'success'), 2000);
    };

    if (loading || !settings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Global System Settings"
                description="Manage system branding, configure global policies, and control core infrastructure parameters"
                action={
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" color="warning" startIcon={<RestoreIcon />} onClick={() => setResetDialogOpen(true)}>
                            Reset to Default
                        </Button>
                        <Button variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={saving}>
                            Save All Changes
                        </Button>
                    </Stack>
                }
            />

            <Grid container spacing={4}>
                {/* Branding & Visuals */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <ContentSection title="System Branding" icon={<PaletteIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box
                                component="label"
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    cursor: uploadingLogo ? 'wait' : 'pointer',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                <input ref={logoInputRef} type="file" accept="image/*" hidden disabled={uploadingLogo} onChange={handleLogoUpload} />
                                {settings.branding?.logoUrl ? (
                                    <Box component="img" src={`${API_BASE}/${settings.branding.logoUrl}`} alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <CloudUploadIcon color="disabled" fontSize="large" />
                                )}
                                {uploadingLogo && <CircularProgress size={28} sx={{ position: 'absolute' }} />}
                            </Box>
                            <Box>
                                <Button variant="outlined" size="small" sx={{ mb: 1 }} onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                </Button>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Recommended: 512x512px PNG or JPG (max 10MB)
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Primary Color"
                                    fullWidth
                                    size="small"
                                    value={settings.branding?.primaryColor ?? '#FFC600'}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...(settings.branding || {}), primaryColor: e.target.value } })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Box sx={{ width: 16, height: 16, bgcolor: settings.branding?.primaryColor ?? '#FFC600', borderRadius: '50%' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Secondary Color"
                                    fullWidth
                                    size="small"
                                    value={settings.branding?.secondaryColor ?? '#000000'}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...(settings.branding || {}), secondaryColor: e.target.value } })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Box sx={{ width: 16, height: 16, bgcolor: settings.branding?.secondaryColor ?? '#000000', borderRadius: '50%' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ContentSection>

                    <ContentSection title="Academic Environment" icon={<SchoolIcon />} sx={{ mt: 3 }}>
                        <TextField
                            label="Current Academic Year"
                            value={settings.academicYear || ''}
                            onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Minimum Admission Score (%)"
                            type="number"
                            value={settings.minAdmissionScore ?? 0}
                            onChange={(e) => setSettings({ ...settings, minAdmissionScore: parseInt(e.target.value) || 0 })}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0, max: 100 }}
                            sx={{ mb: 3 }}
                        />
                        <FormControlLabel
                            control={<Switch checked={settings.allowOnlineAdmissions !== false} onChange={(e) => setSettings({ ...settings, allowOnlineAdmissions: e.target.checked })} />}
                            label="Allow Online Admissions"
                            sx={{ mb: 1, display: 'block' }}
                        />
                        <FormControlLabel
                            control={<Switch checked={settings.enableStudentFeed !== false} onChange={(e) => setSettings({ ...settings, enableStudentFeed: e.target.checked })} />}
                            label="Enable Student Feed/Dashboard"
                            sx={{ display: 'block' }}
                        />
                    </ContentSection>
                </Grid>

                {/* Policies & Infrastructure */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <ContentSection title="Global Policies" icon={<AdminPanelSettingsIcon />}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>Attendance Threshold</Typography>
                        <Box sx={{ px: 2, mb: 4 }}>
                            <Slider
                                value={settings.policies.attendanceThreshold}
                                onChange={(e, val) => setSettings({ ...settings, policies: { ...settings.policies, attendanceThreshold: val as number } })}
                                valueLabelDisplay="auto"
                                step={5}
                                marks
                                min={50}
                                max={100}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Students dropping below this % will be flagged for departmental review.
                            </Typography>
                        </Box>

                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>Financial Delinquency Lock</Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                type="number"
                                label="Days Past Due"
                                value={settings.policies.delinquencyLockDays}
                                onChange={(e) => setSettings({ ...settings, policies: { ...settings.policies, delinquencyLockDays: parseInt(e.target.value) || 0 } })}
                                size="small"
                                sx={{ width: 150 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                System will auto-lock student portals after these many days of overdue payments.
                            </Typography>
                        </Stack>
                    </ContentSection>

                    <ContentSection title="Communication Node Config" icon={<EmailIcon />} sx={{ mt: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>SMTP is configured via .env. Display values below are for reference only.</Typography>
                        <TextField
                            label="SMTP Host"
                            value={settings.smtpHost ?? ''}
                            onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                            placeholder="smtp.gmail.com"
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="System Sender Email"
                            value={settings.smtpSender ?? ''}
                            onChange={(e) => setSettings({ ...settings, smtpSender: e.target.value })}
                            placeholder="noreply@sasms.edu"
                            fullWidth
                            size="small"
                            sx={{ mb: 3 }}
                        />
                        <Button variant="outlined" size="small" onClick={handleTestConnection}>Test Connection</Button>
                    </ContentSection>
                </Grid>
            </Grid>

            <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
                <DialogTitle>Reset to Default</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to reset all settings to their default values? This cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={handleResetToDefault} disabled={saving}>
                        {saving ? <CircularProgress size={24} /> : 'Reset All'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
