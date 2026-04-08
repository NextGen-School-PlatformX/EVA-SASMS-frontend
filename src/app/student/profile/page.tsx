'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { getStudentProfile, updateStudentProfile, uploadStudentAvatar } from '@/src/lib/api/studentPortalApi';

export default function StudentProfilePage() {
  const theme = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  const fetchProfile = async () => {
    try {
      const data = await getStudentProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    try {
      await updateStudentProfile(formData);
      await fetchProfile();
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      await uploadStudentAvatar(file);
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const isProfileComplete = profile.name && profile.email && profile.phoneNumber && profile.address && profile.nationalId;

  const profileData = [
    { label: 'Full Name', value: profile.name },
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phoneNumber || 'Not Set' },
    { label: 'Address', value: profile.address || 'Not Set' },
    { label: 'National ID', value: profile.nationalId || 'Not Set' },
    { label: 'Program', value: profile.department?.name || 'Not Assigned' },
    { label: 'Exam Score', value: profile.application?.ministryScore ? `${profile.application.ministryScore}%` : 'N/A' },
  ];

  return (
    <>
      <PageHeader
        title="Digital Profile (ID)"
        description="Your student data, department & academic information"
      />

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <ContentSection title="Personal Information">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
          <Box component="label" sx={{ position: 'relative', cursor: uploadingAvatar ? 'wait' : 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploadingAvatar}
              onChange={handleAvatarChange}
            />
            <Avatar
              src={profile.avatarUrl ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}/${profile.avatarUrl}` : undefined}
              sx={{ width: 80, height: 80, fontSize: '2rem' }}
            >
              {profile.name?.charAt(0)}
            </Avatar>
            {uploadingAvatar && (
              <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: -1.5, ml: -1.5 }} />
            )}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>{profile.name}</Typography>
            <Typography variant="body2" color="text.secondary">{profile.role}</Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setEditDialogOpen(true)}
            >
              {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
          }}
        >
          {profileData.map(({ label, value }) => (
            <Box key={label}>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </ContentSection>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{isProfileComplete ? 'Edit Profile' : 'Complete Profile'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
