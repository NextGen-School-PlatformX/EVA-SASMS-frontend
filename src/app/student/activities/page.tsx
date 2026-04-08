'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { alpha, useTheme } from '@mui/material/styles';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { getStudentActivities, joinActivity, leaveActivity } from '@/src/lib/api/studentPortalApi';

const CATEGORY_COLORS: Record<string, string> = {
  Tech: '#3b82f6', Sports: '#10b981', Art: '#f59e0b', Cultural: '#8b5cf6',
  Social: '#ec4899', Career: '#6366f1', Music: '#14b8a6', Science: '#06b6d4', Health: '#ef4444', Default: '#64748b'
};
const CATEGORY_ICONS: Record<string, string> = {
  Tech: '💻', Sports: '⚽', Art: '🎨', Cultural: '🌍', Social: '🎉', Career: '💼',
  Music: '🎵', Science: '🔬', Health: '❤️', Default: '📌'
};

export default function ActivitiesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [detailActivity, setDetailActivity] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getStudentActivities();
      setActivities(data);
    } catch {
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: string, isJoined: boolean) => {
    setProcessingId(id);
    try {
      if (isJoined) await leaveActivity(id); else await joinActivity(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally { setProcessingId(null); }
  };

  const myActivities = activities.filter(a => a.isJoined);
  const categories = ['All', ...Array.from(new Set(activities.map((a: any) => a.category).filter(Boolean)))];
  const filteredActivities = activities.filter(a => {
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress size={44} />
      <Typography variant="body2" color="text.secondary">Loading activities...</Typography>
    </Box>
  );

  const accent = '#6366f1';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Hero */}
      <Box sx={{
        background: isDark ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0d1a0d 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #ec4899 100%)',
        borderRadius: 3, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: alpha('#fff', 0.05) },
        '&::after': { content: '""', position: 'absolute', bottom: -60, left: '20%', width: 160, height: 160, borderRadius: '50%', background: alpha('#fff', 0.04) },
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="overline" sx={{ color: '#c7d2fe', fontWeight: 700, letterSpacing: '0.15em' }}>STUDENT HUB</Typography>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 0.5, letterSpacing: '-0.03em' }}>Activities & Events</Typography>
          <Typography sx={{ color: alpha('#fff', 0.75), fontSize: '0.9rem', mb: 3 }}>Explore, join, and track your campus activities</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[
              { label: `${activities.length} Activities`, icon: '🎭' },
              { label: `${myActivities.length} Joined`, icon: '✅' },
              { label: `${activities.reduce((s, a) => s + (a._count?.participants || 0), 0)} Students Active`, icon: '👥' },
            ].map((stat, i) => (
              <Box key={i} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: alpha('#fff', 0.12), backdropFilter: 'blur(8px)' }}>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>{stat.icon} {stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* My Activities */}
      {myActivities.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>⭐ My Activities ({myActivities.length})</Typography>
          <Grid container spacing={2}>
            {myActivities.map(act => {
              const color = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.Default;
              return (
                <Grid key={act.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: isDark ? alpha('#1e1e3f', 0.7) : '#fff', border: `2px solid ${alpha(color, 0.3)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {CATEGORY_ICONS[act.category] || '📌'}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={800} noWrap>{act.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{act.date ? new Date(act.date).toLocaleDateString() : 'TBD'}</Typography>
                    </Box>
                    <Chip label="Joined" size="small" icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important' }} />} sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search activities..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            {categories.map(c => <MenuItem key={c} value={c}>{c === 'All' ? '🌐 All Categories' : `${CATEGORY_ICONS[c] || '📌'} ${c}`}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Activity Cards */}
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        {categoryFilter === 'All' ? 'All Activities' : `${categoryFilter} Activities`}
        <Chip label={filteredActivities.length} size="small" sx={{ ml: 1, fontWeight: 700, bgcolor: alpha(accent, 0.1), color: accent }} />
      </Typography>

      {filteredActivities.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: `1px dashed ${alpha(accent, 0.2)}` }}>
          <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎭</Typography>
          <Typography variant="h6" fontWeight={700}>No activities found</Typography>
          <Typography variant="body2" color="text.secondary">Try adjusting your search or check back later</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredActivities.map((activity) => {
            const isJoined = activity.isJoined;
            const color = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.Default;
            const icon = CATEGORY_ICONS[activity.category] || '📌';
            const capacity = activity.capacity || 100;
            const participants = activity._count?.participants || 0;
            const fillPct = Math.min((participants / capacity) * 100, 100);
            const isFull = fillPct >= 100;
            const eventDate = activity.date ? new Date(activity.date) : null;
            const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - Date.now()) / 86400000) : null;

            return (
              <Grid key={activity.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper elevation={0} sx={{
                  borderRadius: 3, bgcolor: isDark ? alpha('#0f0f1a', 0.8) : '#fff',
                  border: `1px solid ${isJoined ? alpha(color, 0.4) : (isDark ? alpha('#fff', 0.07) : alpha('#000', 0.07))}`,
                  overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'all 0.25s',
                  '&:hover': { borderColor: alpha(color, 0.5), transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(color, 0.12)}` },
                  position: 'relative',
                  '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})` }
                }}>
                  <Box sx={{ p: 2.5, pt: 3, flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{icon}</Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{activity.title}</Typography>
                          <Chip label={activity.category} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: '0.62rem', height: 17, mt: 0.25 }} />
                        </Box>
                      </Box>
                      {isJoined && <Chip label="✓ Joined" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 800, fontSize: '0.65rem', height: 22 }} />}
                    </Box>

                    {/* Description */}
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.78rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {activity.description}
                      </Typography>
                    )}

                    {/* Meta */}
                    <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                      {eventDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <CalendarMonthIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && <Chip component="span" label={daysLeft === 0 ? 'Today!' : `${daysLeft}d`} size="small" color={daysLeft === 0 ? 'error' : 'warning'} sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 800 }} />}
                          </Typography>
                        </Box>
                      )}
                      {activity.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>{activity.location}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <PeopleIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{participants} / {capacity}</Typography>
                      </Box>
                    </Stack>

                    {/* Capacity bar */}
                    <Box>
                      <LinearProgress variant="determinate" value={fillPct} sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: isFull ? '#ef4444' : color, borderRadius: 2 } }} />
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', gap: 1 }}>
                    <Button
                      size="small" variant="outlined"
                      startIcon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
                      onClick={() => { setDetailActivity(activity); setDetailOpen(true); }}
                      sx={{ borderRadius: 2, fontSize: '0.72rem', borderColor: alpha(color, 0.3), color, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.06) } }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant={isJoined ? 'outlined' : 'contained'}
                      color={isJoined ? 'error' : 'primary'}
                      disabled={processingId === activity.id || (!isJoined && isFull)}
                      onClick={() => handleAction(activity.id, isJoined)}
                      sx={{
                        flex: 1, borderRadius: 2, fontWeight: 700,
                        ...((!isJoined && !isFull) ? { background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`, border: 'none', color: '#fff', '&:hover': { background: `linear-gradient(135deg, ${alpha(color, 0.9)}, ${alpha(color, 0.6)})` } } : {}),
                      }}
                    >
                      {processingId === activity.id ? <CircularProgress size={16} color="inherit" /> : isFull && !isJoined ? 'Full 🔒' : isJoined ? 'Leave' : 'Join Now'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Detail Modal */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detailActivity && (() => {
          const color = CATEGORY_COLORS[detailActivity.category] || CATEGORY_COLORS.Default;
          const icon = CATEGORY_ICONS[detailActivity.category] || '📌';
          const isJoined = detailActivity.isJoined;
          const capacity = detailActivity.capacity || 100;
          const participants = detailActivity._count?.participants || 0;
          const fillPct = Math.min((participants / capacity) * 100, 100);
          return (
            <>
              <Box sx={{ height: 4, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})` }} />
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>{detailActivity.title}</Typography>
                    <Chip label={detailActivity.category} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2}>
                  {detailActivity.description && <Typography variant="body2" color="text.secondary">{detailActivity.description}</Typography>}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {[
                      { label: 'Date', value: detailActivity.date ? new Date(detailActivity.date).toLocaleString() : 'TBD', icon: '📅' },
                      { label: 'Location', value: detailActivity.location || 'TBD', icon: '📍' },
                      { label: 'Organizer', value: detailActivity.organizer || 'N/A', icon: '👤' },
                      { label: 'Participants', value: `${participants} / ${capacity}`, icon: '👥' },
                    ].map(item => (
                      <Box key={item.label}>
                        <Typography variant="caption" color="text.secondary">{item.icon} {item.label}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Capacity</Typography>
                      <Typography variant="caption" sx={{ color, fontWeight: 700 }}>{fillPct.toFixed(0)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={fillPct} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }} />
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDetailOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
                <Button
                  variant={isJoined ? 'outlined' : 'contained'}
                  color={isJoined ? 'error' : 'primary'}
                  disabled={processingId === detailActivity.id || (!isJoined && fillPct >= 100)}
                  onClick={() => { handleAction(detailActivity.id, isJoined); setDetailOpen(false); }}
                  sx={{ borderRadius: 2, fontWeight: 700, ...((!isJoined && fillPct < 100) ? { bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.85) } } : {}) }}
                >
                  {isJoined ? 'Leave Activity' : 'Join Now'}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
