'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, CircularProgress, Stack, Chip, IconButton, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentComplaints, createStudentComplaint, addComplaintMessage } from '@/src/lib/api/studentPortalApi';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    OPEN: { color: '#2196f3', label: 'Open' },
    IN_PROGRESS: { color: GOLD, label: 'In Progress' },
    CLOSED: { color: '#4caf50', label: 'Resolved' },
  };
  const c = cfg[status] ?? { color: '#9e9e9e', label: status };
  return (
    <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.12), color: c.color, fontWeight: 700, border: `1px solid ${alpha(c.color, 0.3)}`, fontSize: 11 }} />
  );
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function StudentComplaintsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const cardBg = isDark ? alpha('#0a0a14', 0.88) : alpha('#fff', 0.88);
  const border = isDark ? alpha(GOLD, 0.14) : alpha(GOLD, 0.2);

  const fetchAll = useCallback(async () => {
    try {
      const data = await getStudentComplaints();
      setTickets(data);
      // Update selected ticket if open
      if (selected) {
        const fresh = data.find((t: any) => t.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch { }
    finally { setLoading(false); }
  }, [selected?.id]);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, []);

  // Re-attach polling with updated selected
  useEffect(() => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages?.length]);

  const handleSend = async () => {
    if (!reply.trim() || !selected || sending) return;
    const text = reply.trim();
    setReply('');
    setSending(true);
    try {
      await addComplaintMessage(selected.id, text);
      await fetchAll();
    } catch { setReply(text); }
    finally { setSending(false); }
  };

  const handleCreate = async () => {
    if (!newSubject.trim() || !newMessage.trim() || creating) return;
    setCreating(true);
    try {
      const ticket = await createStudentComplaint({ subject: newSubject.trim(), message: newMessage.trim() });
      setNewSubject(''); setNewMessage('');
      setShowNew(false);
      await fetchAll();
      setSelected(ticket);
    } catch { }
    finally { setCreating(false); }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <MotionBox initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#111' }}>
              Support & Messages
            </Typography>
            <Typography fontSize={13} color="text.secondary">Open tickets and communicate with administration</Typography>
          </Box>
          <Box
            onClick={() => { setShowNew(true); setSelected(null); }}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.2, borderRadius: 2.5, cursor: 'pointer',
              background: `linear-gradient(135deg, ${GOLD}, #FF9500)`, color: '#000', fontWeight: 800, fontSize: 14,
              boxShadow: `0 6px 20px ${GOLD}44`,
              '&:hover': { background: `linear-gradient(135deg, #FFD740, ${GOLD})` }
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            New Ticket
          </Box>
        </Box>
      </MotionBox>

      {/* Main layout */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: selected ? '0 1fr' : '1fr 0', md: '300px 1fr' }, gap: 2, minHeight: 0 }}>

        {/* Ticket list */}
        <MotionBox initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <Box sx={{ borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <Typography fontSize={11} fontWeight={700} sx={{ color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Your Tickets ({tickets.length})
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: GOLD }} size={24} /></Box>
              ) : tickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                  <SupportAgentIcon sx={{ fontSize: 40, color: alpha(GOLD, 0.3), mb: 1 }} />
                  <Typography fontSize={13} color="text.secondary">No tickets yet</Typography>
                  <Typography fontSize={12} color="text.disabled">Click "New Ticket" to get help</Typography>
                </Box>
              ) : (
                tickets.map(t => {
                  const lastMsg = t.messages?.[t.messages.length - 1];
                  const isSelected = selected?.id === t.id;
                  const hasAdminReply = t.messages?.some((m: any) => m.role !== 'STUDENT');
                  return (
                    <Box key={t.id} onClick={() => { setSelected(t); setShowNew(false); }}
                      sx={{
                        p: 2, borderRadius: 2, cursor: 'pointer', mb: 0.5,
                        bgcolor: isSelected ? (isDark ? alpha(GOLD, 0.1) : alpha(GOLD, 0.07)) : 'transparent',
                        border: `1px solid ${isSelected ? alpha(GOLD, 0.35) : 'transparent'}`,
                        '&:hover': { bgcolor: isDark ? alpha(GOLD, 0.07) : alpha(GOLD, 0.04) },
                        transition: 'all 0.15s'
                      }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography fontSize={13} fontWeight={700} sx={{ flex: 1, pr: 1 }} noWrap>{t.subject}</Typography>
                        <StatusChip status={t.status} />
                      </Box>
                      <Typography fontSize={11} color="text.secondary" noWrap>
                        {lastMsg?.content || 'No messages'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                        <Typography fontSize={10} color="text.disabled">{formatDate(t.createdAt)}</Typography>
                        {hasAdminReply && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4caf50' }} />}
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </MotionBox>

        {/* Chat panel / New ticket form */}
        <MotionBox initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Box sx={{ borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">

              {/* No selection */}
              {!selected && !showNew && (
                <MotionBox key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, p: 4 }}>
                  <Box sx={{
                    width: 72, height: 72, borderRadius: '50%',
                    bgcolor: alpha(GOLD, 0.1), border: `1px solid ${alpha(GOLD, 0.25)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <SupportAgentIcon sx={{ fontSize: 32, color: alpha(GOLD, 0.7) }} />
                  </Box>
                  <Typography fontWeight={700} fontSize={16} sx={{ color: isDark ? '#fff' : '#111' }}>Select a ticket to view</Typography>
                  <Typography fontSize={13} color="text.secondary">Or create a new ticket to get support from the administration</Typography>
                </MotionBox>
              )}

              {/* New ticket form */}
              {showNew && (
                <MotionBox key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="small" onClick={() => setShowNew(false)} sx={{ color: 'text.secondary' }}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box>
                      <Typography fontWeight={800} fontSize={16}>New Support Ticket</Typography>
                      <Typography fontSize={12} color="text.secondary">Describe your issue and we'll respond shortly</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField fullWidth label="Subject" placeholder="e.g. Missing grade, Fee issue, Registration problem"
                      value={newSubject} onChange={e => setNewSubject(e.target.value)} sx={inputSx} />
                    <TextField fullWidth label="Describe your issue" multiline rows={6}
                      placeholder="Provide as much detail as possible..."
                      value={newMessage} onChange={e => setNewMessage(e.target.value)} sx={inputSx} />
                    <Box
                      onClick={handleCreate}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                        p: 1.8, borderRadius: 2.5, cursor: creating || !newSubject.trim() || !newMessage.trim() ? 'not-allowed' : 'pointer',
                        background: creating || !newSubject.trim() || !newMessage.trim()
                          ? alpha(GOLD, 0.3) : `linear-gradient(135deg, ${GOLD}, #FF9500)`,
                        color: '#000', fontWeight: 800, fontSize: 15,
                        boxShadow: creating ? 'none' : `0 6px 20px ${GOLD}44`,
                      }}
                    >
                      {creating ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <><SendIcon sx={{ fontSize: 18 }} /> Submit Ticket</>}
                    </Box>
                  </Box>
                </MotionBox>
              )}

              {/* Chat view */}
              {selected && !showNew && (
                <MotionBox key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Chat header */}
                  <Box sx={{ p: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: 'text.secondary', display: { md: 'none' } }}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={800} fontSize={16} noWrap>{selected.subject}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                        <Typography fontSize={11} color="text.disabled">#{selected.id.slice(-8).toUpperCase()}</Typography>
                        <StatusChip status={selected.status} />
                      </Box>
                    </Box>
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selected.messages?.map((m: any) => {
                      const isStudent = m.role === 'STUDENT';
                      return (
                        <MotionBox key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: isStudent ? 'flex-end' : 'flex-start' }}>
                          {/* Sender label */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5, px: 0.5 }}>
                            <Box sx={{
                              width: 20, height: 20, borderRadius: '50%',
                              bgcolor: isStudent ? alpha(GOLD, 0.15) : alpha('#2196f3', 0.15),
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isStudent
                                ? <PersonIcon sx={{ fontSize: 12, color: GOLD }} />
                                : <SupportAgentIcon sx={{ fontSize: 12, color: '#2196f3' }} />}
                            </Box>
                            <Typography fontSize={11} fontWeight={700} sx={{ color: isStudent ? GOLD : '#2196f3' }}>
                              {isStudent ? 'You' : 'Administration'}
                            </Typography>
                            <Typography fontSize={10} color="text.disabled">{formatTime(m.createdAt)}</Typography>
                          </Box>
                          {/* Bubble */}
                          <Box sx={{
                            maxWidth: '78%', px: 2, py: 1.5, borderRadius: isStudent ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            bgcolor: isStudent
                              ? (isDark ? alpha(GOLD, 0.15) : alpha(GOLD, 0.1))
                              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
                            border: `1px solid ${isStudent ? alpha(GOLD, 0.3) : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                          }}>
                            <Typography fontSize={13} sx={{ lineHeight: 1.6, color: isDark ? '#fff' : '#111', whiteSpace: 'pre-wrap' }}>
                              {m.content}
                            </Typography>
                          </Box>
                        </MotionBox>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Reply input or closed notice */}
                  {selected.status === 'CLOSED' ? (
                    <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                      <Typography fontSize={13} color="text.secondary">This ticket has been resolved and closed.</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                      <TextField
                        fullWidth multiline maxRows={4} placeholder="Type your message..."
                        value={reply} onChange={e => setReply(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        size="small" sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: 2.5 } }}
                      />
                      <IconButton
                        onClick={handleSend} disabled={!reply.trim() || sending}
                        sx={{
                          width: 44, height: 44, flexShrink: 0,
                          background: reply.trim() ? `linear-gradient(135deg, ${GOLD}, #FF9500)` : alpha(GOLD, 0.2),
                          color: reply.trim() ? '#000' : alpha('#000', 0.3),
                          '&:hover': { background: reply.trim() ? `linear-gradient(135deg, #FFD740, ${GOLD})` : undefined },
                          '&:disabled': { background: alpha(GOLD, 0.15) }
                        }}
                      >
                        {sending ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Box>
                  )}
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
}
