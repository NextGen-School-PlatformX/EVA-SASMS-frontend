'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, TextField, CircularProgress, Stack, Chip, IconButton, alpha, useTheme, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStaffComplaints, respondToComplaint, resolveComplaint } from '@/src/lib/api/staffApi';
import type { Complaint } from '@/src/types/complaint.types';
import { useAuth } from '@/src/context/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';

const GOLD = '#FFC600';
const MotionBox = motion(Box);

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    open: { color: '#2196f3', label: 'Open' },
    in_progress: { color: GOLD, label: 'In Progress' },
    resolved: { color: '#4caf50', label: 'Resolved' },
    closed: { color: '#4caf50', label: 'Closed' },
  };
  const key = status?.toLowerCase().replace(' ', '_');
  const c = cfg[key] ?? { color: '#9e9e9e', label: status };
  return (
    <Chip label={c.label} size="small" sx={{ bgcolor: alpha(c.color, 0.12), color: c.color, fontWeight: 700, border: `1px solid ${alpha(c.color, 0.3)}`, fontSize: 11 }} />
  );
}

function formatTime(d: string) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function formatDate(d: string) { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }

export default function AdminComplaintsPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const cardBg = isDark ? alpha('#0a0a14', 0.88) : alpha('#fff', 0.88);
  const border = isDark ? alpha(GOLD, 0.14) : alpha(GOLD, 0.2);

  const fetchAll = useCallback(async () => {
    try {
      const data = await getStaffComplaints();
      setComplaints(data);
      if (selected) {
        const fresh = data.find((c: Complaint) => c.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch { }
    finally { setLoading(false); }
  }, [selected?.id]);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchAll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.responses?.length]);

  const handleSend = async () => {
    if (!reply.trim() || !selected || sending) return;
    const text = reply.trim();
    setReply('');
    setSending(true);
    try {
      const updated = await respondToComplaint(selected.id, text, (selected as any).source);
      setComplaints(p => p.map(c => c.id === selected.id ? updated : c));
      setSelected(updated);
    } catch { setReply(text); }
    finally { setSending(false); }
  };

  const handleResolve = async () => {
    if (!selected || resolving) return;
    setResolving(true);
    try {
      const updated = await resolveComplaint(selected.id, (selected as any).source);
      setComplaints(p => p.map(c => c.id === selected.id ? updated : c));
      setSelected(updated);
    } catch { }
    finally { setResolving(false); }
  };

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD },
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <MotionBox initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: isDark ? '#fff' : '#111' }}>
              Support Inbox
            </Typography>
            <Typography fontSize={13} color="text.secondary">Respond to student tickets and complaints</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
              <Chip key={f} label={f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                onClick={() => setFilter(f)} size="small"
                sx={{
                  cursor: 'pointer', fontWeight: 700, fontSize: 11,
                  bgcolor: filter === f ? alpha(GOLD, 0.15) : 'transparent',
                  color: filter === f ? GOLD : 'text.secondary',
                  border: `1px solid ${filter === f ? alpha(GOLD, 0.4) : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                  '&:hover': { bgcolor: alpha(GOLD, 0.08) }
                }}
              />
            ))}
            <IconButton size="small" onClick={fetchAll} sx={{ color: 'text.secondary' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </MotionBox>

      {/* Main layout */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 2, minHeight: 0 }}>

        {/* Ticket list */}
        <MotionBox initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <Box sx={{ borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <Typography fontSize={11} fontWeight={700} sx={{ color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {filtered.length} Ticket{filtered.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: GOLD }} size={24} /></Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                  <SupportAgentIcon sx={{ fontSize: 40, color: alpha(GOLD, 0.3), mb: 1 }} />
                  <Typography fontSize={13} color="text.secondary">No tickets found</Typography>
                </Box>
              ) : (
                filtered.map((t) => {
                  const isSelected = selected?.id === t.id;
                  const lastResp = t.responses?.[t.responses.length - 1];
                  return (
                    <Box key={t.id} onClick={() => setSelected(t)}
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
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                        <Chip label={(t as any).source === 'student' ? 'Student' : 'Applicant'} size="small"
                          sx={{ fontSize: 9, height: 16, bgcolor: (t as any).source === 'student' ? alpha('#9c27b0', 0.1) : alpha('#2196f3', 0.1), color: (t as any).source === 'student' ? '#9c27b0' : '#2196f3', fontWeight: 700, border: 'none' }} />
                      </Box>
                      <Typography fontSize={11} color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                        {lastResp?.message || t.message || '—'}
                      </Typography>
                      <Typography fontSize={10} color="text.disabled">{formatDate(t.createdAt)}</Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </MotionBox>

        {/* Chat panel */}
        <MotionBox initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Box sx={{ borderRadius: 3, bgcolor: cardBg, backdropFilter: 'blur(16px)', border: `1px solid ${border}`, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              {!selected ? (
                <MotionBox key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: alpha(GOLD, 0.1), border: `1px solid ${alpha(GOLD, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SupportAgentIcon sx={{ fontSize: 32, color: alpha(GOLD, 0.7) }} />
                  </Box>
                  <Typography fontWeight={700} fontSize={16} sx={{ color: isDark ? '#fff' : '#111' }}>Select a ticket to respond</Typography>
                  <Typography fontSize={13} color="text.secondary">{complaints.length} total tickets in inbox</Typography>
                </MotionBox>
              ) : (
                <MotionBox key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Header */}
                  <Box sx={{ p: 2.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={800} fontSize={16} noWrap>{selected.subject}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                        <Typography fontSize={11} color="text.disabled">#{selected.id.slice(-8).toUpperCase()}</Typography>
                        <Typography fontSize={11} color="text.disabled">·</Typography>
                        <Typography fontSize={11} color="text.disabled">{formatDate(selected.createdAt)}</Typography>
                        <StatusChip status={selected.status} />
                      </Box>
                    </Box>
                    {selected.status !== 'resolved' && selected.status !== 'closed' && (
                      <Button size="small" variant="outlined" startIcon={<DoneAllIcon />}
                        onClick={handleResolve} disabled={resolving}
                        sx={{ borderRadius: 2, borderColor: alpha('#4caf50', 0.4), color: '#4caf50', fontWeight: 700, fontSize: 12, '&:hover': { borderColor: '#4caf50', bgcolor: alpha('#4caf50', 0.05) }, whiteSpace: 'nowrap' }}>
                        {resolving ? <CircularProgress size={14} /> : 'Mark Resolved'}
                      </Button>
                    )}
                  </Box>

                  {/* Messages */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* All messages (student + admin) */}
                    {selected.responses?.map((r: any) => {
                      const isAdmin = r.isStaff || r.role === 'ADMIN' || r.role === 'SUPER_ADMIN';
                      return (
                        <MotionBox key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5, px: 0.5 }}>
                            <Box sx={{
                              width: 20, height: 20, borderRadius: '50%',
                              bgcolor: isAdmin ? alpha(GOLD, 0.15) : alpha('#9c27b0', 0.15),
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isAdmin
                                ? <SupportAgentIcon sx={{ fontSize: 12, color: GOLD }} />
                                : <PersonIcon sx={{ fontSize: 12, color: '#9c27b0' }} />}
                            </Box>
                            <Typography fontSize={11} fontWeight={700} sx={{ color: isAdmin ? GOLD : '#9c27b0' }}>
                              {isAdmin ? 'You (Admin)' : 'Student'}
                            </Typography>
                            <Typography fontSize={10} color="text.disabled">{formatTime(r.createdAt)}</Typography>
                          </Box>
                          <Box sx={{
                            maxWidth: '78%', px: 2, py: 1.5,
                            borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            bgcolor: isAdmin
                              ? (isDark ? alpha(GOLD, 0.15) : alpha(GOLD, 0.1))
                              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
                            border: `1px solid ${isAdmin ? alpha(GOLD, 0.3) : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')}`,
                          }}>
                            <Typography fontSize={13} sx={{ color: isDark ? '#fff' : '#111', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {r.message || r.content}
                            </Typography>
                          </Box>
                        </MotionBox>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Reply or resolved */}
                  {(selected.status === 'resolved' || selected.status === 'closed') ? (
                    <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                      <Typography fontSize={13} color="text.secondary">This ticket has been resolved.</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
                      <TextField
                        fullWidth multiline maxRows={4} placeholder="Type your response..."
                        value={reply} onChange={e => setReply(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: GOLD } } }}
                      />
                      <IconButton
                        onClick={handleSend} disabled={!reply.trim() || sending}
                        sx={{
                          width: 44, height: 44, flexShrink: 0,
                          background: reply.trim() ? `linear-gradient(135deg, ${GOLD}, #FF9500)` : alpha(GOLD, 0.2),
                          color: reply.trim() ? '#000' : alpha('#000', 0.3),
                          '&:hover': { background: reply.trim() ? `linear-gradient(135deg, #FFD740, ${GOLD})` : undefined },
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
