'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, useTheme, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import PaymentsIcon from '@mui/icons-material/Payments';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BadgeIcon from '@mui/icons-material/Badge';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getMyAttendance } from '@/src/lib/api/attendanceApi';
import { getStudentNotifications, getStudentActivities, getStudentFees } from '@/src/lib/api/studentPortalApi';

const GOLD = '#FFC600';

const SERVICES = [
  { label: 'Admissions', desc: 'Application status & documents', href: '/student/admissions', icon: <SchoolIcon />, color: '#4FC3F7' },
  { label: 'Digital Profile', desc: 'Student data & schedule', href: '/student/profile', icon: <BadgeIcon />, color: '#81C784' },
  { label: 'Financial Wallet', desc: 'Fees, payments & history', href: '/student/fees', icon: <PaymentsIcon />, color: GOLD },
  { label: 'Attendance', desc: 'Daily records & QR scan', href: '/student/attendance', icon: <FactCheckIcon />, color: '#CE93D8' },
  { label: 'Support Center', desc: 'Complaints & suggestions', href: '/student/complaints', icon: <SupportAgentIcon />, color: '#F48FB1' },
  { label: 'Activities', desc: 'Sports, cultural & more', href: '/student/activities', icon: <LocalActivityIcon />, color: '#80CBC4' },
  { label: 'Notifications', desc: 'Deadlines & decisions', href: '/student/notifications', icon: <NotificationsActiveIcon />, color: '#FFAB91' },
];

const MotionDiv = motion.div;

export default function StudentDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState({ attendance: 0, dueFees: 0, alerts: 0, activities: 0 });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [att, notifs, acts, fees, prof] = await Promise.all([
          getMyAttendance().catch(() => null),
          getStudentNotifications().catch(() => []),
          getStudentActivities().catch(() => []),
          getStudentFees().catch(() => []),
          fetch('http://127.0.0.1:5001/api/student/profile', {
            headers: { Authorization: `Bearer ${localStorage.getItem('sasms_token') || ''}` }
          }).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (prof) setProfile(prof);
        const unpaid = (fees as any[]).filter((f: any) => f.status === 'UNPAID' || f.status === 'REJECTED');
        setStats({
          attendance: att?.summary?.percentage ?? 0,
          dueFees: unpaid.reduce((a: number, c: any) => a + (c.fee?.amount ?? 0), 0),
          alerts: (notifs as any[]).filter((n: any) => !n.read).length,
          activities: (acts as any[]).filter((a: any) => a.isJoined).length,
        });
      } catch { }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const cardBg = isDark ? alpha('#111', 0.75) : alpha('#fff', 0.85);
  const borderColor = isDark ? alpha(GOLD, 0.1) : alpha(GOLD, 0.15);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: GOLD }} />
    </Box>
  );

  const statItems = [
    { label: 'Attendance Rate', value: `${stats.attendance}%`, color: stats.attendance >= 75 ? '#4caf50' : '#f44336', icon: '📊' },
    { label: 'Due Fees', value: stats.dueFees > 0 ? `EGP ${stats.dueFees.toLocaleString()}` : 'Clear ✓', color: stats.dueFees > 0 ? '#f44336' : '#4caf50', icon: '💰' },
    { label: 'Unread Alerts', value: stats.alerts, color: stats.alerts > 0 ? GOLD : '#4caf50', icon: '🔔' },
    { label: 'My Activities', value: stats.activities, color: '#2196f3', icon: '🏃' },
  ];

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Welcome */}
      <MotionDiv initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: isDark ? '#fff' : '#111' }}>
              Welcome back, {user?.name?.split(' ')[0] ?? 'Student'} 👋
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 500 }}>
            Here's your academic overview for today.
          </Typography>
        </Box>
      </MotionDiv>

      {/* Stats Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {statItems.map((s, i) => (
          <MotionDiv key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.07 }}>
            <Box sx={{
              p: 2.5, borderRadius: 3,
              bgcolor: cardBg, backdropFilter: 'blur(12px)',
              border: `1px solid ${alpha(s.color, 0.2)}`,
              boxShadow: `0 4px 20px ${alpha(s.color, 0.08)}`,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 28px ${alpha(s.color, 0.15)}` },
            }}>
              <Typography sx={{ fontSize: 22, mb: 0.5 }}>{s.icon}</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ color: s.color, letterSpacing: '-0.02em' }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600, mt: 0.5 }}>{s.label}</Typography>
            </Box>
          </MotionDiv>
        ))}
      </Box>

      {/* Services Grid */}
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2 }}>
        Quick Access
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {SERVICES.map((s, i) => (
          <MotionDiv key={s.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}>
            <Box onClick={() => router.push(s.href)} sx={{
              p: 3, borderRadius: 3, cursor: 'pointer',
              bgcolor: cardBg, backdropFilter: 'blur(12px)',
              border: `1px solid ${borderColor}`,
              transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                borderColor: s.color,
                transform: 'translateY(-3px)',
                boxShadow: `0 10px 32px ${alpha(s.color, 0.15)}`,
                bgcolor: isDark ? alpha(s.color, 0.06) : alpha(s.color, 0.04),
              },
            }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: 2,
                bgcolor: alpha(s.color, 0.12),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color, mb: 2,
                border: `1px solid ${alpha(s.color, 0.2)}`,
                '& svg': { fontSize: 22 },
              }}>{s.icon}</Box>
              <Typography fontWeight={700} fontSize={14} sx={{ color: isDark ? '#fff' : '#111', mb: 0.5 }}>
                {s.label}
              </Typography>
              <Typography fontSize={12} color="text.secondary" lineHeight={1.4}>{s.desc}</Typography>
            </Box>
          </MotionDiv>
        ))}
      </Box>

      {/* Year Onboarding Section — dynamic based on student's actual year */}
      <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
        <Box sx={{ mt: 5 }}>
          {(() => {
            const rawYear = profile?.academicYear?.name || profile?.admissionYear || (user as any)?.admissionYear || '';
            const yearLow = rawYear.toLowerCase();
            let yearLabel = 'Junior';
            let yearColor = '#4FC3F7';
            let yearEmoji = '🎓';
            let welcomeMsg = 'Welcome to Your First Year! 🌟';
            let welcomeDesc = 'As a Junior student, here are your key first steps to complete your enrollment and get settled in.';
            if (yearLow.includes('wheeler') || yearLow.includes('second') || yearLow.includes('2nd')) {
              yearLabel = 'Wheeler'; yearColor = '#9C27B0'; yearEmoji = '🔬';
              welcomeMsg = 'Welcome to Your Second Year! 🔬';
              welcomeDesc = 'As a Wheeler student, focus on deepening your specialization and preparing for advanced courses.';
            } else if (yearLow.includes('senior') || yearLow.includes('third') || yearLow.includes('3rd')) {
              yearLabel = 'Senior'; yearColor = '#FFC600'; yearEmoji = '🏆';
              welcomeMsg = 'Welcome to Your Final Year! 🏆';
              welcomeDesc = 'As a Senior student, this is your year to shine — focus on graduation requirements and your future career.';
            }
            return (
              <>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: yearColor, letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2 }}>
                  {yearEmoji} {yearLabel} Year — Getting Started
                </Typography>
                <Box sx={{
                  p: 3, borderRadius: 3,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha(yearColor, 0.08)}, ${alpha('#9C27B0', 0.06)})`
                    : `linear-gradient(135deg, ${alpha(yearColor, 0.06)}, ${alpha('#9C27B0', 0.04)})`,
                  border: `1px solid ${alpha(yearColor, 0.25)}`,
                }}>
                  <Typography fontWeight={800} fontSize={16} sx={{ color: isDark ? '#fff' : '#111', mb: 1.5 }}>
                    {welcomeMsg}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {welcomeDesc}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                    {[
                      { step: '01', title: 'Complete Your Profile', desc: 'Upload your photo and verify personal details in Digital Profile', icon: '👤', color: '#4FC3F7', href: '/student/profile' },
                      { step: '02', title: 'Review Financial Fees', desc: 'Check your tuition fees and available payment methods', icon: '💳', color: GOLD, href: '/student/fees' },
                      { step: '03', title: 'Check Admission Status', desc: 'View your official enrollment documents and department', icon: '🎓', color: '#81C784', href: '/student/admissions' },
                      { step: '04', title: 'Setup Attendance QR', desc: 'Learn how to scan the QR code for daily attendance', icon: '📱', color: '#CE93D8', href: '/student/scan' },
                      { step: '05', title: 'Join Activities', desc: 'Browse clubs, sports, and cultural activities to join', icon: '🏃', color: '#80CBC4', href: '/student/activities' },
                      { step: '06', title: 'Know Your Rights', desc: 'Read the student code of conduct and support resources', icon: '📋', color: '#F48FB1', href: '/student/complaints' },
                    ].map((item) => (
                      <Box
                        key={item.step}
                        onClick={() => router.push(item.href)}
                        sx={{
                          p: 2.5, borderRadius: 2.5, cursor: 'pointer',
                          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.7),
                          border: `1px solid ${alpha(item.color, 0.2)}`,
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: item.color, transform: 'translateY(-2px)', boxShadow: `0 6px 20px ${alpha(item.color, 0.12)}` },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Typography sx={{ fontSize: 22 }}>{item.icon}</Typography>
                          <Typography variant="caption" sx={{ color: item.color, fontWeight: 800, letterSpacing: '0.06em' }}>STEP {item.step}</Typography>
                        </Box>
                        <Typography fontWeight={700} fontSize={13} sx={{ color: isDark ? '#fff' : '#111', mb: 0.5 }}>{item.title}</Typography>
                        <Typography fontSize={11} color="text.secondary" lineHeight={1.5}>{item.desc}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            );
          })()}
        </Box>
      </MotionDiv>
    </Box>
  );
}
