'use client';

import {
    Box, Container, Typography, Grid,
    Card, CardContent, Button, Stack,
    Stepper, Step, StepLabel, Divider,
    Paper, List, ListItem, ListItemIcon, ListItemText,
    useTheme
} from '@mui/material';
import {
    AppRegistration, Payment, FactCheck,
    AssignmentInd, Star, School, Business,
    Groups, SmartToy, Public
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ADMISSION_STEPS = [
    { label: 'Ministry Registration', description: 'Register on the Ministry of Education portal and select EVA School as 1st choice.', icon: <AppRegistration /> },
    { label: 'Entrance Fee', description: 'Pay the 250 EGP assessment fee via Instapay application.', icon: <Payment /> },
    { label: 'Electronic Assessment', description: 'Take the standardized electronic entrance exam.', icon: <FactCheck /> },
    { label: 'Personal Interview', description: 'Attend the final on-campus personal interview.', icon: <AssignmentInd /> }
];

const FEATURES = [
    { title: 'Smart & Green', desc: 'Sustainable campus with advanced digital infrastructure.', icon: <SmartToy /> },
    { title: 'International Standards', desc: 'Curriculum aligned with global technical standards.', icon: <Public /> },
    { title: 'Industry Partners', desc: 'Strong collaboration with Eva Pharma & Eva Cosmetics.', icon: <Business /> },
    { title: 'Competitive Edge', desc: 'Hands-on training and guaranteed placement for top graduates.', icon: <Star /> }
];

export default function AdmissionRequirementsPage() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <Box sx={{ bgcolor: 'background.default', pb: 10 }}>
            {/* Hero Section */}
            <Box sx={{
                bgcolor: 'primary.main',
                color: 'white',
                py: { xs: 8, md: 12 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffc600 0%, #000000 100%)'
            }}>
                <Container maxWidth="lg">
                    <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' } }}>
                        SASMS Admission
                    </Typography>
                    <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, maxWidth: 800, mx: 'auto' }}>
                        Your journey towards professional excellence begins here. Join the elite group of technical leaders at EVA International School of Applied Technology.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        href="https://dualedu.moe.gov.eg/loginWithMsSucess"
                        target="_blank"
                        sx={{ px: 6, py: 2, borderRadius: 4, fontWeight: 700, fontSize: '1.2rem' }}
                    >
                        Register on Ministry Portal
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -6 }}>
                {/* Steps Section */}
                <Paper sx={{ p: 4, borderRadius: 6, boxShadow: theme.shadows[10], mb: 8 }}>
                    <Typography variant="h4" fontWeight={800} align="center" gutterBottom>
                        Admission Workflow
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
                        Follow these critical steps to secure your spot for the upcoming academic year.
                    </Typography>

                    <Grid container spacing={4}>
                        {ADMISSION_STEPS.map((step, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Stack alignItems="center" textAlign="center" spacing={2}>
                                    <Box sx={{
                                        width: 80, height: 80, borderRadius: '24px',
                                        bgcolor: 'primary.light', color: 'primary.main',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem', transition: '0.3s',
                                        '&:hover': { transform: 'translateY(-10px)', bgcolor: 'primary.main', color: 'white' }
                                    }}>
                                        {step.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>{index + 1}. {step.label}</Typography>
                                    <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Requirements Grid */}
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Card sx={{ borderRadius: 6, height: '100%', p: 2 }}>
                            <CardContent>
                                <Typography variant="h5" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <FactCheck color="primary" /> Admission Conditions
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <List sx={{ '& .MuiListItemIcon-root': { minWidth: 40 } }}>
                                    {[
                                        'Official Egyptian Nationality is required.',
                                        'Applicant must hold a valid Middle School Certificate (Preparatory).',
                                        'Applicant age must not exceed 18 years on October 1st, 2025.',
                                        'Minimum total score of 220 in basic education certificate.',
                                        'English language score must be at least 48 marks.',
                                        'Must pass Medical, Psychological, and Personality fitness assessments.'
                                    ].map((text, i) => (
                                        <ListItem key={i} sx={{ px: 0 }}>
                                            <ListItemIcon><Star color="warning" fontSize="small" /></ListItemIcon>
                                            <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 500 }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack spacing={4}>
                            <Card sx={{ borderRadius: 2, bgcolor: 'primary.main', color: 'secondary.contrastText', p: 1 }}>
                                <CardContent>
                                    <Typography variant="h5" fontWeight={800} gutterBottom>
                                        Payment Notice
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        The 250 EGP assessment fee must be paid exclusively through the **Instapay** application. Keep the digital receipt for upload in the applicant portal.
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Already have your results?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    If you have completed the Ministry registration and have your documents ready, proceed to our portal.
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={() => router.push('/login')}
                                    sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}
                                >
                                    Login to Portal
                                </Button>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Features Section */}
                <Box sx={{ mt: 10 }}>
                    <Typography variant="h4" fontWeight={800} align="center" gutterBottom>
                        Why Choose EVA School?
                    </Typography>
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        {FEATURES.map((feature, i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                                <Card elevation={0} sx={{ bgcolor: 'transparent', textAlign: 'center' }}>
                                    <CardContent>
                                        <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                                        <Typography variant="h6" fontWeight={700} gutterBottom>{feature.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}
