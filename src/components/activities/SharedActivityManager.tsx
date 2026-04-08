'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, IconButton,
  Tooltip, CircularProgress, Chip, Card, CardContent,
  CardActions, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Stack, Avatar,
  LinearProgress, Badge, InputAdornment, Paper,
  Collapse, Alert, Tabs, Tab
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNotification } from '@/src/context/NotificationContext';
import { useAuth } from '@/src/context/AuthContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { ContentSection } from '@/src/components/ui/ContentSection';
import { InfoCard } from '@/src/components/ui/InfoCard';
import { getEvents, createEvent } from '@/src/lib/api/staffApi';
import { EventRecord } from '@/src/types/staff.types';

const CATEGORY_ICONS: Record<string, string> = {
  Tech: '💻', Sports: '⚽', Art: '🎨', Cultural: '🌍', Social: '🎉', Career: '💼',
  Music: '🎵', Science: '🔬', Health: '❤️', Default: '📌'
};
const CATEGORY_COLORS: Record<string, string> = {
  Tech: '#3b82f6', Sports: '#10b981', Art: '#f59e0b', Cultural: '#8b5cf6',
  Social: '#ec4899', Career: '#6366f1', Music: '#14b8a6', Science: '#06b6d4', Health: '#ef4444', Default: '#64748b'
};

function getColor(cat: string) { return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default; }
function getIcon(cat: string) { return CATEGORY_ICONS[cat] || CATEGORY_ICONS.Default; }

function ActivityCard({ activity, isSuperAdmin, onCancel, onReview, onEdit }: {
  activity: EventRecord; isSuperAdmin: boolean;
  onCancel: (id: string, title: string) => void;
  onReview: (a: EventRecord) => void;
  onEdit: (a: EventRecord) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = getColor(activity.category);
  const icon = getIcon(activity.category);
  const capacity = activity.capacity || 100;
  const attendees = activity.attendeesCount || 0;
  const fillPct = Math.min((attendees / capacity) * 100, 100);
  const eventDate = activity.date ? new Date(activity.date) : null;
  const isUpcoming = eventDate ? eventDate > new Date() : true;
  const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - Date.now()) / 86400000) : null;

  return (
    <Card elevation={0} sx={{
      borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
      border: `1px solid ${isDark ? alpha(color, 0.2) : alpha(color, 0.15)}`,
      bgcolor: isDark ? alpha('#0f0f1a', 0.8) : '#ffffff',
      transition: 'all 0.25s',
      position: 'relative', overflow: 'hidden',
      '&:hover': { borderColor: alpha(color, 0.5), transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(color, 0.15)}` },
      '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})` }
    }}>
      <CardContent sx={{ flexGrow: 1, pt: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}>{activity.title}</Typography>
              <Chip label={activity.category} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 700, fontSize: '0.65rem', height: 18, mt: 0.25 }} />
            </Box>
          </Box>
          {isUpcoming && daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
            <Chip label={daysLeft === 0 ? 'TODAY! 🔥' : `${daysLeft}d left`} size="small" color={daysLeft === 0 ? 'error' : 'warning'} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
          )}
        </Box>

        {/* Description */}
        {activity.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {activity.description}
          </Typography>
        )}

        {/* Meta info */}
        <Stack spacing={0.75}>
          {eventDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarMonthIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          )}
          {activity.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{activity.location}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {attendees} / {capacity} registered
            </Typography>
          </Box>
        </Stack>

        {/* Capacity bar */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Capacity</Typography>
            <Typography variant="caption" sx={{ color, fontWeight: 700 }}>{fillPct.toFixed(0)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={fillPct} sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 } }} />
        </Box>

        {/* Organizer */}
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Avatar sx={{ width: 20, height: 20, bgcolor: alpha(color, 0.2), color, fontSize: '0.6rem', fontWeight: 900 }}>{(activity.organizer || 'A')[0]}</Avatar>
          <Typography variant="caption" color="text.secondary">by <strong>{activity.organizer}</strong></Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button size="small" variant="outlined" startIcon={<AssessmentIcon sx={{ fontSize: 14 }} />} onClick={() => onReview(activity)}
          sx={{ borderRadius: 2, fontSize: '0.72rem', borderColor: alpha(color, 0.4), color, '&:hover': { borderColor: color, bgcolor: alpha(color, 0.06) }, flex: 1 }}>
          {isSuperAdmin ? 'Review' : 'Details'}
        </Button>
        <Tooltip title={isSuperAdmin ? 'Suspend Activity' : 'Cancel Event'}>
          <IconButton size="small" onClick={() => onCancel(activity.id, activity.title)}
            sx={{ borderRadius: 2, color: 'text.secondary', border: '1px solid', borderColor: 'divider', '&:hover': { color: 'error.main', borderColor: 'error.main', bgcolor: alpha('#ef4444', 0.05) } }}>
            <CancelIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(activity)}
            sx={{ borderRadius: 2, color: 'text.secondary', border: '1px solid', borderColor: 'divider', '&:hover': { color, borderColor: color, bgcolor: alpha(color, 0.05) } }}>
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export function SharedActivityManager({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activities, setActivities] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState(0);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', category: 'Tech', organizer: '', date: '', description: '', location: '', capacity: '100' });
  const [categories, setCategories] = useState(['Tech', 'Sports', 'Art', 'Cultural', 'Social', 'Career', 'Music', 'Science', 'Health']);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [creating, setCreating] = useState(false);

  const [detailActivity, setDetailActivity] = useState<EventRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try { const data = await getEvents(); setActivities(data); } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSuspend = (id: string, title: string) => {
    if (window.confirm(`${isSuperAdmin ? 'Suspend' : 'Cancel'} "${title}"? Registrants will be notified.`)) {
      setActivities(prev => prev.filter(a => a.id !== id));
      showNotification(`"${title}" ${isSuperAdmin ? 'suspended' : 'cancelled'}. Notifications sent.`, 'warning');
    }
  };

  const handleEdit = (activity: EventRecord) => {
    showNotification(`Edit mode for "${activity.title}" – coming soon`, 'info');
  };

  const handleReview = (activity: EventRecord) => {
    setDetailActivity(activity);
    setDetailOpen(true);
  };

  const submitCreate = async () => {
    if (!newEvent.title || !newEvent.date) return;
    setCreating(true);
    try {
      const created = await createEvent({
        title: newEvent.title, category: newEvent.category,
        organizer: newEvent.organizer || user?.name || 'Admin',
        date: newEvent.date, location: newEvent.location || 'TBD',
        capacity: parseInt(newEvent.capacity) || 100,
        description: newEvent.description
      });
      setActivities(prev => [created, ...prev]);
      showNotification(`"${newEvent.title}" published successfully! 🎉`, 'success');
      setCreateModalOpen(false);
      setNewEvent({ title: '', category: 'Tech', organizer: '', date: '', description: '', location: '', capacity: '100' });
    } catch {
      showNotification('Failed to create activity.', 'error');
    } finally { setCreating(false); }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      showNotification(`Category "${newCategory.trim()}" added!`, 'success');
      setNewCategory(''); setAddCategoryOpen(false);
    }
  };

  const filteredActivities = activities.filter(a => {
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.organizer || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const upcomingActivities = filteredActivities.filter(a => a.date ? new Date(a.date) > new Date() : true);
  const pastActivities = filteredActivities.filter(a => a.date ? new Date(a.date) <= new Date() : false);

  const totalParticipants = activities.reduce((s, a) => s + (a.attendeesCount || 0), 0);
  const avgFill = activities.length > 0 ? activities.reduce((s, a) => s + Math.min(((a.attendeesCount || 0) / (a.capacity || 100)) * 100, 100), 0) / activities.length : 0;

  const accent = '#6366f1';
  const tabActivities = activeTab === 0 ? filteredActivities : activeTab === 1 ? upcomingActivities : pastActivities;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <PageHeader
        title={isSuperAdmin ? 'Global Activities & Engagement Control' : 'Events & Activities Management'}
        description={isSuperAdmin ? 'Authorize activities, manage global events, and analyze student participation system-wide' : 'Organize university activities, manage capacity, and review participant lists'}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#4f46e5' } }}>
            {isSuperAdmin ? 'Create Global Activity' : 'Create New Event'}
          </Button>
        }
      />

      {/* Stats */}
      <Grid container spacing={3}>
        {[
          { title: 'Total Activities', value: activities.length, icon: <LocalActivityIcon color="primary" />, color: '#6366f1' },
          { title: 'Total Participants', value: totalParticipants.toLocaleString(), icon: <PeopleIcon color="success" />, color: '#10b981' },
          { title: 'Avg. Fill Rate', value: `${avgFill.toFixed(0)}%`, icon: <TrendingUpIcon color="warning" />, color: '#f59e0b' },
          { title: 'Upcoming Events', value: upcomingActivities.length, icon: <EventAvailableIcon color="info" />, color: '#3b82f6' },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: isDark ? alpha('#1e1e3f', 0.7) : '#fff', border: `1px solid ${alpha(card.color, 0.15)}`, transition: 'all 0.2s', '&:hover': { borderColor: alpha(card.color, 0.4), boxShadow: `0 4px 20px ${alpha(card.color, 0.1)}` } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>{card.icon}<Typography variant="caption" color="text.secondary" fontWeight={600}>{card.title}</Typography></Box>
              <Typography variant="h5" fontWeight={900} sx={{ color: card.color, fontFamily: 'monospace' }}>{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField placeholder="Search activities..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)} sx={{ borderRadius: 2 }}>
            <MenuItem value="All">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{getIcon(c)} {c}</MenuItem>)}
          </Select>
        </FormControl>
        {isSuperAdmin && (
          <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => setAddCategoryOpen(true)} sx={{ borderRadius: 2 }}>
            Manage Categories
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${alpha(accent, 0.2)}` }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ '& .Mui-selected': { color: `${accent} !important` }, '& .MuiTabs-indicator': { bgcolor: accent } }}>
          <Tab label={<Badge badgeContent={filteredActivities.length} color="primary" sx={{ pr: 1.5 }}>All</Badge>} />
          <Tab label={<Badge badgeContent={upcomingActivities.length} color="success" sx={{ pr: 1.5 }}>Upcoming</Badge>} />
          <Tab label={<Badge badgeContent={pastActivities.length} color="default" sx={{ pr: 1.5 }}>Past</Badge>} />
        </Tabs>
      </Box>

      {/* Activity Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
      ) : tabActivities.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: `1px dashed ${alpha(accent, 0.2)}` }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🎭</Typography>
          <Typography variant="h6" fontWeight={700}>No activities found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Try adjusting your search or create a new activity</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent }}>Create Activity</Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tabActivities.map(activity => (
            <Grid key={activity.id} size={{ xs: 12, sm: 6, md: 4, lg: isSuperAdmin ? 4 : 3 }}>
              <ActivityCard activity={activity} isSuperAdmin={isSuperAdmin} onCancel={handleSuspend} onReview={handleReview} onEdit={handleEdit} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(accent, 0.1) }}><AddIcon sx={{ color: accent }} /></Box>
            {isSuperAdmin ? 'Publish New Global Activity' : 'Create New Event'}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField fullWidth label="Activity Title *" value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={newEvent.category} onChange={(e) => setNewEvent(p => ({ ...p, category: e.target.value }))} sx={{ borderRadius: 2 }}>
                    {categories.map(c => <MenuItem key={c} value={c}>{getIcon(c)} {c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField fullWidth label="Description" multiline rows={3} value={newEvent.description} onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Date & Time *" type="datetime-local" InputLabelProps={{ shrink: true }} value={newEvent.date} onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Location" value={newEvent.location} onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Main Hall, Room 201" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Organizer" value={newEvent.organizer} onChange={(e) => setNewEvent(p => ({ ...p, organizer: e.target.value }))} placeholder={user?.name || 'Your name'} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Capacity" type="number" value={newEvent.capacity} onChange={(e) => setNewEvent(p => ({ ...p, capacity: e.target.value }))} InputProps={{ inputProps: { min: 1 } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateModalOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={submitCreate} disabled={!newEvent.title || !newEvent.date || creating}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, '&:hover': { bgcolor: '#4f46e5' } }}>
            {creating ? <CircularProgress size={18} color="inherit" /> : isSuperAdmin ? '🚀 Publish Globally' : '✅ Create Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail / Review Modal */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {detailActivity && (() => {
          const color = getColor(detailActivity.category);
          const icon = getIcon(detailActivity.category);
          const capacity = detailActivity.capacity || 100;
          const attendees = detailActivity.attendeesCount || 0;
          const fillPct = Math.min((attendees / capacity) * 100, 100);
          return (
            <>
              <Box sx={{ height: 4, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})` }} />
              <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{icon}</Box>
                  {detailActivity.title}
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Category', value: detailActivity.category, icon: '🏷️' },
                      { label: 'Organizer', value: detailActivity.organizer, icon: '👤' },
                      { label: 'Location', value: detailActivity.location || 'TBD', icon: '📍' },
                      { label: 'Date', value: detailActivity.date ? new Date(detailActivity.date).toLocaleString() : 'TBD', icon: '📅' },
                    ].map(item => (
                      <Grid key={item.label} size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">{item.icon} {item.label}</Typography>
                        <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                  {detailActivity.description && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{detailActivity.description}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Capacity: {attendees}/{capacity}</Typography>
                      <Typography variant="caption" sx={{ color, fontWeight: 700 }}>{fillPct.toFixed(0)}% filled</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={fillPct} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
                  </Box>
                  {isSuperAdmin && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="caption">Supervisory Note: Activity is <strong>Published</strong> and visible to all students. No compliance issues detected.</Typography>
                    </Alert>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDetailOpen(false)} sx={{ borderRadius: 2 }}>Close</Button>
                {isSuperAdmin && (
                  <Button variant="outlined" color="error" onClick={() => { handleSuspend(detailActivity.id, detailActivity.title); setDetailOpen(false); }} sx={{ borderRadius: 2, fontWeight: 700 }}>
                    Suspend Activity
                  </Button>
                )}
                <Button variant="contained" onClick={() => { showNotification('Analytics report generated!', 'success'); setDetailOpen(false); }} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: color, '&:hover': { bgcolor: alpha(color, 0.8) } }}>
                  📊 Analytics
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* Category Management Modal */}
      <Dialog open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Manage Activity Categories</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map(cat => (
                <Chip key={cat} label={`${getIcon(cat)} ${cat}`} onDelete={() => setCategories(prev => prev.filter(c => c !== cat))}
                  sx={{ borderRadius: 2, fontWeight: 600, bgcolor: alpha(getColor(cat), 0.1), color: getColor(cat), border: `1px solid ${alpha(getColor(cat), 0.3)}` }} />
              ))}
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" label="New Category Name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Button variant="contained" onClick={handleAddCategory} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: accent, whiteSpace: 'nowrap' }}>Add</Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddCategoryOpen(false)} sx={{ borderRadius: 2 }}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
