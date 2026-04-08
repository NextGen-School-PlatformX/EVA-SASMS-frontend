'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getAdmissionsSummary } from '@/src/lib/api/studentPortalApi';

export default function AdmissionsPage() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getAdmissionsSummary();
        setApplication(data); // can be null - handled below
      } catch (err) {
        // Only show error for real failures (not 404 which is now handled by returning null)
        const status = (err as any)?.response?.status;
        if (status !== 404) {
          setError('Failed to load admission details');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const mapStatus = (status: string): any => {
    switch (status) {
      case 'PENDING': return 'under_review';
      case 'ACCEPTED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return 'pending';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!application) return (
    <>
      <PageHeader title="Admission Summary" description="Your application status" />
      <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
        You have not submitted an admission application yet. Please visit the school&apos;s application portal to apply.
      </Alert>
    </>
  );

  return (
    <>
      <PageHeader
        title="Admission Summary"
        description="View your submitted documents and application status (Read-only)"
      />

      <Stack spacing={4}>
        <ContentSection title="Application Overview">
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">APPLICATION ID</Typography>
                <Typography variant="h6" fontWeight={700}>#{application.id.slice(-8).toUpperCase()}</Typography>
              </Box>
              <StatusBadge status={mapStatus(application.status)} label={application.status} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">PROGRAM / DEPARTMENT</Typography>
                <Typography variant="body1" fontWeight={600}>{application.preferredDept?.name || 'Assigned'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">EXAM SCORE</Typography>
                <Typography variant="body1" fontWeight={600}>{application.ministryScore ? `${application.ministryScore}%` : 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">APPLICATION DATE</Typography>
                <Typography variant="body1" fontWeight={600}>{new Date(application.submittedAt).toLocaleDateString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">NATIONAL ID</Typography>
                <Typography variant="body1" fontWeight={600}>{application.nationalId}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </ContentSection>

        {application.feedback && (
          <Alert severity={application.status === 'REJECTED' ? 'error' : 'info'} variant="outlined">
            <strong>Admin Notes:</strong> {application.feedback}
          </Alert>
        )}

        <ContentSection title="Submitted Documents">
          <Grid container spacing={2}>
            {[
              { label: 'Birth Certificate', url: application.birthCertificateUrl },
              { label: 'ID Card', url: application.idCardUrl },
              { label: 'Ministry Result', url: application.ministryResultUrl },
              { label: 'Payment Receipt', url: application.receiptUrl },
            ].map((doc) => (
              <Grid size={{ xs: 12, sm: 6 }} key={doc.label}>
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <InsertDriveFileIcon color="primary" />
                    <Typography variant="body2">{doc.label}</Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    disabled={!doc.url}
                    onClick={() => {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                      const fileUrl = doc.url.startsWith('uploads/') ? `${baseUrl}/${doc.url}` : `${baseUrl}/uploads/${doc.url}`;
                      window.open(fileUrl, '_blank');
                    }}
                  >
                    View / Download
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </ContentSection>
      </Stack>
    </>
  );
}
