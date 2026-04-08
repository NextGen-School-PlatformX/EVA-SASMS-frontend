'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent,
    Button, Stack, TextField, MenuItem,
    Accordion, AccordionSummary, AccordionDetails,
    Avatar, Chip, Paper, useTheme, CircularProgress
} from '@mui/material';
import {
    HelpCircle,
    MessageSquare,
    Phone,
    Mail,
    ChevronDown,
    Send,
    LifeBuoy,
    FileQuestion,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Bot,
    X,
    Send as SendIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, IconButton, Divider } from '@mui/material';
import { useNotification } from '@/src/context/NotificationContext';
import { getMyTickets, createTicket, respondToTicket, SupportTicket } from '@/src/lib/api/supportApi';
import { useAuth } from '@/src/context/AuthContext';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function SupportPage() {
    const { user } = useAuth();
    const theme = useTheme();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replying, setReplying] = useState(false);

    // Tickets State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        details: ''
    });
    const [replyText, setReplyText] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dialog State
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const faqs = [
        { q: 'How long does the admission review take?', a: 'Typically, applications are reviewed within 3-5 business days. You will receive an email notification once your status changes.' },
        { q: 'Which documents are mandatory?', a: 'You must upload your National ID, Birth Certificate, and the Statement of Success (Ministry results).' },
        { q: 'Can I change my preferred department?', a: 'Yes, as long as your application is under "UNDER_REVIEW" or "PENDING" status. Once accepted, your department is finalized.' },
        { q: 'What is the application fee?', a: 'The non-refundable application fee is 250 EGP, payable via Instapay or at the specified school registrar office.' }
    ];

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const data = await getMyTickets();
            setTickets(data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            showNotification('Failed to load ticket history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'Ticket ID', width: 120, renderCell: (p) => p.value.slice(0, 8).toUpperCase() },
        { field: 'subject', headerName: 'Subject', flex: 1 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'RESOLVED' ? 'success' : params.value === 'IN_PROGRESS' ? 'info' : 'warning'}
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: 'Created Date',
            width: 150,
            valueGetter: (params: any) => new Date(params).toLocaleDateString()
        },
    ];

    const handleRowClick = (params: GridRowParams) => {
        setSelectedTicket(params.row);
        setOpenDialog(true);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.details.trim()) newErrors.details = 'Details are required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const newTicket = await createTicket({
                subject: formData.subject,
                category: formData.category,
                message: formData.details
            });
            setTickets(prev => [newTicket, ...prev]);
            showNotification('Your request has been sent to our admission staff.', 'success');
            setFormData({ subject: '', category: 'general', details: '' });
        } catch (error) {
            console.error('Failed to create ticket:', error);
            showNotification('Failed to submit ticket. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setReplying(true);
        try {
            const updatedTicket = await respondToTicket(selectedTicket.id, replyText);

            // updatedTicket is the full ticket object now thanks to our controller change
            setTickets(prev => prev.map(t => t.id === selectedTicket.id ? (updatedTicket as any) : t));
            setSelectedTicket(updatedTicket);
            setReplyText('');
            showNotification('Reply sent successfully.', 'success');
        } catch (error) {
            console.error('Failed to send reply:', error);
            showNotification('Failed to send message.', 'error');
        } finally {
            setReplying(false);
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <PageHeader
                title="Support Center"
                description="Technical assistance and admission guidance for future leaders."
            />

            <Grid container spacing={4}>
                {/* Support Channels */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {[
                            { title: 'Live Chat', desc: 'Average response: 5 mins', icon: <MessageSquare size={24} />, color: theme.palette.primary.main },
                            { title: 'Email Support', desc: 'admissions@sasms.edu.eg', icon: <Mail size={24} />, color: theme.palette.secondary.main },
                            { title: 'Phone Hotline', desc: '+20 123 456 7890', icon: <Phone size={24} />, color: theme.palette.info.main },
                        ].map((channel, i) => (
                            <MotionCard
                                key={i}
                                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
                            >
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
                                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(channel.color, 0.1), color: channel.color }}>
                                        {channel.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={900}>{channel.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{channel.desc}</Typography>
                                    </Box>
                                </CardContent>
                            </MotionCard>
                        ))}

                        <Paper
                            sx={{
                                p: 4, borderRadius: 2, bgcolor: 'primary.main', color: 'white',
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <LifeBuoy style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, width: 150, height: 150 }} />
                            <Typography variant="h6" fontWeight={800} gutterBottom>Admission Policy</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                                All submissions are final once accepted. If you need to correct a document after acceptance, please visit the registrar office physically.
                            </Typography>
                            <Button variant="contained" color="error" fullWidth sx={{ fontWeight: 900, borderRadius: 2 }}>
                                Read Policy
                            </Button>
                        </Paper>
                    </Stack>
                </Grid>

                {/* Main Content Area */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={4}>

                        {/* Interactive FAQ */}
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FileQuestion color={theme.palette.primary.main} />
                                <Typography variant="h6" fontWeight={900}>Frequently Asked Questions</Typography>
                            </Box>
                            <CardContent sx={{ p: 0 }}>
                                {faqs.map((faq, i) => (
                                    <Accordion key={i} elevation={0} sx={{ borderBottom: i !== faqs.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                        <AccordionSummary expandIcon={<ChevronDown />}>
                                            <Typography fontWeight={700}>{faq.q}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                {faq.a}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Ticket History DataGrid */}
                        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Clock color={theme.palette.primary.main} />
                                    <Typography variant="h6" fontWeight={900}>Support History</Typography>
                                </Box>
                                <Chip label="Powered by DataGrid Pro" size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                            </Box>
                            <Box sx={{ height: 350, width: '100%', pt: 1 }}>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <DataGrid
                                        rows={tickets}
                                        columns={columns}
                                        disableRowSelectionOnClick
                                        autoPageSize
                                        onRowClick={handleRowClick}
                                        sx={{
                                            border: 'none',
                                            cursor: 'pointer',
                                            'touch-action': 'none',
                                            '& .MuiDataGrid-columnHeaders': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                fontWeight: 900
                                            },
                                            '& .MuiDataGrid-cell': {
                                                fontSize: '0.9rem'
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </Card>

                        {/* Inquiry Form */}
                        <Card sx={{ borderRadius: 2, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(20px)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" fontWeight={900} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Send size={24} color={theme.palette.secondary.main} /> Send a Direct Inquiry
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Can't find what you're looking for? Message our admission experts directly.
                                </Typography>
                                <form onSubmit={handleFormSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Subject"
                                                placeholder="e.g. Document correction"
                                                value={formData.subject}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                                error={!!errors.subject}
                                                helperText={errors.subject}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                select
                                                label="Category"
                                                value={formData.category}
                                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            >
                                                <MenuItem value="general">General Inquiry</MenuItem>
                                                <MenuItem value="technical">Technical Issue</MenuItem>
                                                <MenuItem value="admission">Admission Question</MenuItem>
                                                <MenuItem value="payment">Payment Problem</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth multiline rows={4}
                                                label="Details"
                                                placeholder="Explain your situation in detail..."
                                                value={formData.details}
                                                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                                                error={!!errors.details}
                                                helperText={errors.details}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                disabled={submitting}
                                                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                                                sx={{ px: 8, py: 2, borderRadius: 3, fontWeight: 900, float: 'right' }}
                                            >
                                                {submitting ? 'Sending...' : 'Submit Ticket'}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>

                    </Stack>
                </Grid>
            </Grid>

            {/* Ticket Detail Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MessageSquare color={theme.palette.primary.main} />
                        Ticket Details: {selectedTicket?.id}
                    </Box>
                    <IconButton onClick={() => setOpenDialog(false)}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={800} gutterBottom>{selectedTicket?.subject}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label={selectedTicket?.status} size="small" color="primary" sx={{ fontWeight: 800 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>Created on {selectedTicket?.date}</Typography>
                        </Stack>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ maxHeight: 400, overflowY: 'auto', px: 1 }}>
                        <Stack spacing={3}>
                            {selectedTicket?.messages?.map((msg: any, i: number) => {
                                const isMe = msg.role === 'USER';
                                const isAdmin = msg.role === 'ADMIN' || msg.role === 'SUPER_ADMIN';
                                return (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexDirection: isMe ? 'row-reverse' : 'row'
                                    }}
                                >
                                    <Avatar sx={{
                                        bgcolor: isMe ? 'primary.main' : 'secondary.main',
                                        width: 32, height: 32
                                    }}>
                                        {isMe ? <User size={16} /> : <Bot size={16} />}
                                    </Avatar>
                                    <Box sx={{ maxWidth: '80%' }}>
                                        <Paper sx={{
                                            p: 2,
                                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            bgcolor: isMe ? 'primary.main' : 'background.paper',
                                            color: isMe ? 'white' : 'text.primary',
                                            border: !isMe ? '1px solid' : 'none',
                                            borderColor: 'divider'
                                        }}>
                                            <Typography variant="body2">{msg.content}</Typography>
                                        </Paper>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: isMe ? 'right' : 'left', fontWeight: 700, color: 'text.secondary' }}>
                                            {isMe ? 'You' : (isAdmin ? 'Admin Support' : 'Support')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                </Box>
                                );
                            })}
                        </Stack>
                    </Box>

                    {(selectedTicket?.status !== 'RESOLVED' && selectedTicket?.status !== 'CLOSED') ? (
                        <Box sx={{ mt: 4 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type your message..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                    disabled={replying}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleReply}
                                    disabled={replying || !replyText.trim()}
                                >
                                    {replying ? <CircularProgress size={20} /> : <SendIcon size={20} />}
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                disabled
                                fullWidth
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                This ticket has been marked as {selectedTicket?.status}.
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog >
        </MotionBox >
    );
}
