'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useBranding, getLogoUrl } from '@/src/context/BrandingContext';

const GOLD = '#FFC600';
const DARK = '#0A0A0A';

type ChatMessage = {
  id: number;
  from: 'user' | 'bot';
  text: string;
};

function SasmsChatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: 'bot',
      text:
        "Hi, أنا المساعد الذكي بتاع SASMS. You can chat with me in Arabic or English about admissions, departments, or how to apply.",
    },
  ]);

  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: 'user', text },
    ]);
    setInput('');

    const lower = text.toLowerCase();

    let answerEn = '';
    let answerAr = '';

    if (
      lower.includes('admission') ||
      lower.includes('apply') ||
      lower.includes('application') ||
      lower.includes('تقديم') ||
      lower.includes('التحاق') ||
      lower.includes('القبول')
    ) {
      answerEn =
        'To apply, register on the Ministry portal, choose EVA School as your first choice, pay the 250 EGP assessment fee, then complete the online application here on SASMS.';
      answerAr =
        'علشان تقدّم، لازم تسجل على بوابة الوزارة، وتختار EVA School كاختيار أول، وبعدها تدفع رسوم التقييم 250 جنيه عن طريق إنستاباي، وبعدين تكمل استمارة التقديم أونلاين من خلال نظام SASMS.';
    } else if (
      lower.includes('requirement') ||
      lower.includes('documents') ||
      lower.includes('docs') ||
      lower.includes('اوراق') ||
      lower.includes('مستندات') ||
      lower.includes('شروط')
    ) {
      answerEn =
        'Main required documents: National ID/Passport, Birth Certificate, Statement of Success, Ministry portal result, and the 250 EGP payment receipt.';
      answerAr =
        'أهم المستندات المطلوبة: بطاقة الرقم القومي أو الباسبور، شهادة الميلاد، بيان النجاح، نتيجة بوابة الوزارة، وإيصال سداد رسوم التقييم 250 جنيه.';
    } else if (
      lower.includes('department') ||
      lower.includes('program') ||
      lower.includes('قسم') ||
      lower.includes('أقسام') ||
      lower.includes('تخصص')
    ) {
      answerEn =
        'Our main departments include Computer Science, Advanced Mathematics, Physical Sciences, and Arts & Humanities. Each has its own dedicated academic track.';
      answerAr =
        'الأقسام الرئيسية عندنا: علوم الحاسب، الرياضيات المتقدمة، العلوم الفيزيائية، والفنون والعلوم الإنسانية، وكل قسم ليه مسار أكاديمي واضح ومجهّز لسوق العمل.';
    } else if (
      lower.includes('fees') ||
      lower.includes('payment') ||
      lower.includes('instapay') ||
      lower.includes('مصروفات') ||
      lower.includes('رسوم') ||
      lower.includes('دفع')
    ) {
      answerEn =
        'Application assessment fees are paid via Instapay. Keep the receipt and upload it during your online application step.';
      answerAr =
        'رسوم التقييم والتقديم بتتدفع عن طريق إنستاباي، وضروري تحتفظ بالإيصال علشان ترفعه أثناء تعبئة استمارة التقديم أونلاين.';
    } else if (
      lower.includes('support') ||
      lower.includes('help') ||
      lower.includes('contact') ||
      lower.includes('مساعدة') ||
      lower.includes('دعم') ||
      lower.includes('تواصل')
    ) {
      answerEn =
        'Our admissions support center is available 24/7. You can open the Support Center from here and chat with the school team directly.';
      answerAr =
        'فريق دعم القبول شغّال 24/7، تقدر تفتح صفحة مركز الدعم من هنا وتتواصل مباشرة مع فريق المدرسة لأي استفسار.';
    } else if (
      lower.includes('teacher of the month') ||
      lower.includes('teacher') ||
      lower.includes('مدرس الشهر') ||
      lower.includes('معلم الشهر') ||
      lower.includes('مدرس')
    ) {
      answerEn =
        'The Teacher of the Month is selected based on performance, student feedback, and leadership inside SASMS. You can manage this from the admin panel.';
      answerAr =
        'اختيار "Teacher of the Month" بيكون بناءً على الأداء، وتقييم الطلاب، ودور المدرّس داخل المجتمع التعليمي في SASMS. إعداد البيانات دي بيتّم من لوحة تحكم الإدارة.';
    } else if (
      lower.includes('login') ||
      lower.includes('track') ||
      lower.includes('portal') ||
      lower.includes('تتبع') ||
      lower.includes('متابعة') ||
      lower.includes('تسجيل الدخول')
    ) {
      answerEn =
        'Use the SASMS login portal to track your application status, view notifications, and access your digital student profile.';
      answerAr =
        'تقدر تدخل على بوابة تسجيل الدخول بتاعة SASMS علشان تتابع حالة التقديم، وتشوف الإشعارات، وتدخل على الملف الطلابي الرقمي الخاص بيك.';
    } else {
      answerEn =
        "I'm here to guide you with admissions, departments, requirements, and how to use the SASMS system. Try asking about how to apply, required documents, or fees.";
      answerAr =
        'أنا موجود علشان أساعدك في كل ما يخص التقديم، الأقسام، المتطلبات، وطريقة استخدام نظام SASMS. جرّب تسأل عن خطوات التقديم، الأوراق المطلوبة، أو الرسوم.';
    }

    const answer = lang === 'ar' ? answerAr : answerEn;

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, from: 'bot', text: answer },
      ]);
    }, 250);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickAsk = (q: string) => {
    sendMessage(q);
  };

  return (
    <>
      {/* Floating launcher button */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          right: 26,
          bottom: 26,
          zIndex: 160,
          background: GOLD,
          color: '#000',
          borderRadius: 999,
          border: 'none',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 800,
          fontSize: 13,
          boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
          cursor: 'pointer',
          fontFamily: "'Syne', system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 18 }}>💬</span>
        <span>SASMS Assistant</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              right: 26,
              bottom: 90,
              width: 360,
              maxWidth: 'calc(100% - 40px)',
              zIndex: 155,
            }}
          >
            <div
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: 'rgba(10,10,10,0.96)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                height: 440,
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: GOLD,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    S
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      {lang === 'ar' ? 'مساعد القبول في SASMS' : 'SASMS Admissions Bot'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                      {lang === 'ar'
                        ? 'يرد فورًا • متاح ٢٤/٧'
                        : 'Replies instantly • 24/7'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: 999,
                      padding: 2,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        fontSize: 10,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        background: lang === 'en' ? GOLD : 'transparent',
                        color: lang === 'en' ? '#000' : 'rgba(255,255,255,0.7)',
                        fontWeight: 700,
                      }}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('ar')}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        fontSize: 10,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        background: lang === 'ar' ? GOLD : 'transparent',
                        color: lang === 'ar' ? '#000' : 'rgba(255,255,255,0.7)',
                        fontWeight: 700,
                      }}
                    >
                      ع
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.65)',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 4,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  direction: lang === 'ar' ? 'rtl' : 'ltr',
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '8px 11px',
                        borderRadius: 12,
                        fontSize: 13,
                        lineHeight: 1.6,
                        background:
                          m.from === 'user'
                            ? 'linear-gradient(135deg, #FFC600, #FFD740)'
                            : 'rgba(255,255,255,0.08)',
                        color: m.from === 'user' ? '#000' : '#fff',
                        border:
                          m.from === 'user'
                            ? '1px solid rgba(0,0,0,0.06)'
                            : '1px solid rgba(255,255,255,0.12)',
                        direction: lang === 'ar' ? 'rtl' : 'ltr',
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '8px 10px 10px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    lang === 'ar' ? 'إزاي أقدّم؟' : 'How do I apply?',
                    lang === 'ar'
                      ? 'إيه هي المستندات المطلوبة؟'
                      : 'What are the requirements?',
                    lang === 'ar'
                      ? 'عرّفني بالأقسام / البرامج'
                      : 'Tell me about departments',
                    lang === 'ar' ? 'محتاج مساعدة / دعم' : 'Need help / support',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => quickAsk(q)}
                      style={{
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.16)',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '4px 9px',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.75)',
                        cursor: 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'اسأل عن التقديم، الرسوم، الأقسام...'
                        : 'Ask about admissions, fees, departments...'
                    }
                    style={{
                      flex: 1,
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '8px 11px',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      borderRadius: 999,
                      border: 'none',
                      background: GOLD,
                      color: '#000',
                      fontWeight: 800,
                      padding: '0 14px',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'ar' ? 'إرسال' : 'Send'}
                  </button>
                </form>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {lang === 'ar' ? (
                    <>
                      للمساعدة التفصيلية تقدر{' '}
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/applicant/support');
                          setOpen(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          color: GOLD,
                          cursor: 'pointer',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        تفتح صفحة مركز الدعم
                      </button>
                      .
                    </>
                  ) : (
                    <>
                      For detailed help you can also{' '}
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/applicant/support');
                          setOpen(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          color: GOLD,
                          cursor: 'pointer',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        open the Support Center
                      </button>
                      .
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [teacher, setTeacher] = useState<{ name: string; title?: string; imageUrl?: string; quote?: string; month?: string; year?: string; imageOffsetX?: number; imageOffsetY?: number } | null>(null);
  const branding = useBranding();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Load teacher of the month when user is authenticated (apiClient adds token if present)
  useEffect(() => {
    import('@/src/lib/api/client')
      .then(({ apiClient }) => apiClient<any>('/system/teacher-of-month'))
      .then((data) => setTeacher(data))
      .catch(() => {});
  }, []);

  const teacherImageUrl = (() => {
    const src = teacher?.imageUrl || '';
    if (!src) return '';
    if (src.startsWith('http')) return src;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const root = apiBase.replace('/api', '');
    return `${root}/${src.replace(/^\/+/, '')}`;
  })();

  useEffect(() => {
    if (!statsVisible) return;
    const animate = (target: number, setter: (v: number) => void, duration = 2000) => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setter(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    animate(1200, setCount1);
    animate(98, setCount2);
    animate(15, setCount3);
  }, [statsVisible]);

  const steps = [
    { num: '01', title: 'Ministry Registration', desc: "Register on the Ministry of Education portal and select EVA School as your 1st choice.", icon: '🏛️' },
    { num: '02', title: 'Pay Assessment Fee', desc: "Pay the 250 EGP application fee via Instapay. Keep your receipt — you'll need to upload it.", icon: '💳' },
    { num: '03', title: 'Electronic Entrance Exam', desc: 'Sit the standardized electronic entrance assessment at our campus exam center.', icon: '📝' },
    { num: '04', title: 'Personal Interview', desc: 'Top-scoring applicants are invited for a final personal interview with faculty.', icon: '🎤' },
  ];

  const departments = [
    { name: 'Computer Science', icon: '💻', count: '420+', color: '#4FC3F7' },
    { name: 'Advanced Mathematics', icon: '📐', count: '380+', color: '#81C784' },
    { name: 'Physical Sciences', icon: '🔬', count: '310+', color: '#F48FB1' },
    { name: 'Arts & Humanities', icon: '🎭', count: '290+', color: '#CE93D8' },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
    .sasms-home * { box-sizing: border-box; }
    .sasms-home ::-webkit-scrollbar { width: 6px; }
    .sasms-home ::-webkit-scrollbar-thumb { background: ${GOLD}; border-radius: 3px; }
    .nav-link-h { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; transition: color 0.2s; cursor: pointer; }
    .nav-link-h:hover { color: ${GOLD}; }
    .btn-ph { background: ${GOLD}; color: #000; border: none; padding: 16px 36px; font-size: 15px; font-weight: 800; border-radius: 6px; cursor: pointer; letter-spacing: 0.02em; transition: all 0.2s; font-family: 'Syne', system-ui, sans-serif; }
    .btn-ph:hover { background: #FFD740; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,198,0,0.4); }
    .btn-oh { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.3); padding: 15px 36px; font-size: 15px; font-weight: 700; border-radius: 6px; cursor: pointer; letter-spacing: 0.02em; transition: all 0.2s; font-family: 'Syne', system-ui, sans-serif; }
    .btn-oh:hover { border-color: ${GOLD}; color: ${GOLD}; transform: translateY(-2px); }
    .step-card-h { border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 28px; cursor: pointer; transition: all 0.3s; background: rgba(255,255,255,0.02); }
    .step-card-h:hover { border-color: ${GOLD}40; background: rgba(255,198,0,0.03); }
    .step-card-h.active-h { border-color: ${GOLD}; background: rgba(255,198,0,0.06); }
    .dept-card-h { border-radius: 16px; padding: 36px 28px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); transition: all 0.3s; }
    .dept-card-h:hover { background: rgba(255,255,255,0.08); transform: translateY(-6px); border-color: rgba(255,255,255,0.15); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .marquee-wrap { overflow: hidden; }
    .marquee-track-h { display: flex; gap: 60px; white-space: nowrap; animation: marquee-h 20s linear infinite; }
    @keyframes marquee-h { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .section-tag-h { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: ${GOLD}; text-transform: uppercase; border: 1px solid rgba(255,198,0,0.3); border-radius: 4px; padding: 4px 12px; margin-bottom: 20px; }
    .grid-line-h { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; }
  `;

  return (
    <div
      className="sasms-home"
      suppressHydrationWarning
      style={{
        background: DARK,
        color: '#fff',
        fontFamily: "'Syne', system-ui, sans-serif",
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      <style>{css}</style>

      {/* NAV */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              padding: '18px 60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(10,10,10,0.9)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: branding.logoUrl ? 'transparent' : GOLD,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {branding.logoUrl ? (
                  <img
                    src={getLogoUrl(branding.logoUrl)}
                    alt="SASMS"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontWeight: 900, fontSize: 13, color: '#000' }}>S</span>
                )}
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>SASMS</span>
            </div>
            <div style={{ display: 'flex', gap: 36 }}>
              <span
                className="nav-link-h"
                onClick={() =>
                  document.getElementById('admissions')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Admissions
              </span>
              <span
                className="nav-link-h"
                onClick={() =>
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                About
              </span>
              <span
                className="nav-link-h"
                onClick={() =>
                  document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Departments
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-oh"
                style={{ padding: '9px 22px', fontSize: 13 }}
                onClick={() => router.push('/login')}
              >
                Sign In
              </button>
              <button
                className="btn-ph"
                style={{ padding: '9px 22px', fontSize: 13 }}
                onClick={() => router.push('/applicant/register')}
              >
                Apply Now
              </button>
            </div>
          </motion.nav>

          {/* HERO */}
          <div
            ref={heroRef}
            style={{
              position: 'relative',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div className="grid-line-h" />
            <motion.div style={{ position: 'absolute', inset: 0, y }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'url(/7.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.12) saturate(0.3)',
                }}
              />
            </motion.div>
            <div
              style={{
                position: 'absolute',
                top: '15%',
                right: '8%',
                width: 500,
                height: 500,
                background: `radial-gradient(circle, ${GOLD}15 0%, transparent 65%)`,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '5%',
                left: '3%',
                width: 350,
                height: 350,
                background: `radial-gradient(circle, ${GOLD}08 0%, transparent 65%)`,
                pointerEvents: 'none',
              }}
            />

            <motion.div
              style={{
                position: 'relative',
                zIndex: 1,
                opacity,
                padding: '0 60px',
                maxWidth: 1000,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="section-tag-h">Egypt's Premier Technical Institution</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  fontSize: 'clamp(52px, 8vw, 92px)',
                  fontWeight: 800,
                  lineHeight: 1.0,
                  letterSpacing: '-0.04em',
                  marginBottom: 24,
                  marginTop: 8,
                }}
              >
                Shape Your
                <br />
                <span style={{ color: GOLD }}>Future</span> in
                <br />
                Technical
                <br />
                Excellence.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.55)',
                  maxWidth: 520,
                  lineHeight: 1.8,
                  marginBottom: 48,
                }}
              >
                SASMS provides a world-class integrated digital ecosystem for Egypt's next generation
                of technical leaders. Join a community of innovators.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}
              >
                <button
                  className="btn-ph"
                  onClick={() => router.push('/applicant/register')}
                >
                  Start Application →
                </button>
                <button
                  className="btn-oh"
                  onClick={() =>
                    document
                      .getElementById('admissions')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  View Requirements
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute',
                bottom: 36,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                opacity: 0.35,
              }}
            >
              <div
                style={{
                  width: 1,
                  height: 44,
                  background: 'linear-gradient(to bottom, transparent, #fff)',
                }}
              />
              <span style={{ fontSize: 10, letterSpacing: '0.15em' }}>SCROLL</span>
            </motion.div>
          </div>

          {/* MARQUEE */}
          <div
            style={{ background: GOLD, padding: '13px 0', overflow: 'hidden' }}
            className="marquee-wrap"
          >
            <div className="marquee-track-h">
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 60 }}>
                  {[
                    'Academic Excellence',
                    'Digital Innovation',
                    'Technical Mastery',
                    'Global Partnerships',
                    'Ministry Certified',
                    'EVA School System',
                    '2025 Enrollment Open',
                  ].map((t, j) => (
                    <div
                      key={j}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        color: '#000',
                        fontWeight: 800,
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>◆</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div
            ref={statsRef}
            style={{
              padding: '100px 60px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0,
              }}
            >
              {[
                {
                  value: count1.toLocaleString() + '+',
                  label: 'Enrolled Students',
                  sub: 'Across all programs',
                },
                {
                  value: count2 + '%',
                  label: 'Graduate Employment',
                  sub: 'Within 6 months',
                },
                {
                  value: count3 + '+',
                  label: 'Years of Excellence',
                  sub: 'Technical education',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  style={{
                    padding: '60px 48px',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(48px, 5vw, 72px)',
                      fontWeight: 800,
                      color: GOLD,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      marginTop: 12,
                      marginBottom: 6,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                    {stat.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* INTRO VIDEO SECTION */}
          <div
            id="intro-video"
            style={{
              padding: '80px 60px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 48,
                alignItems: 'center',
              }}
            >
              <div>
                <span className="section-tag-h">Inside SASMS</span>
                <h2
                  style={{
                    fontSize: 'clamp(30px, 3.5vw, 46px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    marginBottom: 16,
                  }}
                >
                  Watch our school overview
                </h2>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 15,
                    lineHeight: 1.9,
                    marginBottom: 20,
                  }}
                >
                  Get a quick tour of our campus, labs, and digital ecosystem. This short video
                  introduces SASMS, our mission, and how we support students throughout their
                  technical journey.
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                  Replace the placeholder video URL in the code with your official school
                  introduction video.
                </p>
              </div>
              <div
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                  background: '#000',
                }}
              >
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <video
                    src="/EvaSchool.mp4"
                    title="SASMS Intro Video"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      objectFit: 'cover',
                    }}
                    controls
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ADMISSIONS */}
          <div id="admissions" style={{ padding: '120px 60px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 80,
                  alignItems: 'start',
                }}
              >
                <div>
                  <span className="section-tag-h">How to Apply</span>
                  <h2
                    style={{
                      fontSize: 'clamp(34px, 4vw, 54px)',
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      marginBottom: 20,
                    }}
                  >
                    The Admission
                    <br />
                    Journey
                  </h2>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 16,
                      lineHeight: 1.8,
                      marginBottom: 36,
                    }}
                  >
                    Our multi-stage process identifies Egypt's brightest technical minds. Each stage
                    assesses different dimensions of your potential.
                  </p>
                  <div
                    style={{
                      background: 'rgba(255,198,0,0.07)',
                      border: '1px solid rgba(255,198,0,0.18)',
                      borderRadius: 12,
                      padding: 24,
                      marginBottom: 32,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: GOLD,
                        letterSpacing: '0.1em',
                        marginBottom: 14,
                        textTransform: 'uppercase',
                      }}
                    >
                      Required Documents
                    </div>
                    {[
                      'National ID / Passport',
                      'Birth Certificate',
                      'Statement of Success',
                      'Ministry Portal Result',
                      'Payment Receipt (250 EGP)',
                    ].map((doc, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 0',
                          borderBottom:
                            i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: GOLD,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.65)',
                          }}
                        >
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-ph"
                    onClick={() => router.push('/applicant/register')}
                  >
                    Apply Now — It's Free →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      className={`step-card-h${activeStep === i ? ' active-h' : ''}`}
                      onClick={() =>
                        setActiveStep(activeStep === i ? null : i)
                      }
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          marginBottom: activeStep === i ? 14 : 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: GOLD,
                            letterSpacing: '0.08em',
                            minWidth: 26,
                          }}
                        >
                          {step.num}
                        </div>
                        <div style={{ fontSize: 26 }}>{step.icon}</div>
                        <div
                          style={{
                            flex: 1,
                            fontWeight: 700,
                            fontSize: 15,
                          }}
                        >
                          {step.title}
                        </div>
                        <div
                          style={{
                            color: 'rgba(255,255,255,0.25)',
                            transition: 'transform 0.3s',
                            transform:
                              activeStep === i ? 'rotate(180deg)' : 'none',
                            fontSize: 12,
                          }}
                        >
                          ▼
                        </div>
                      </div>
                      <AnimatePresence>
                        {activeStep === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              overflow: 'hidden',
                              paddingLeft: 40,
                            }}
                          >
                            <p
                              style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 13,
                                lineHeight: 1.7,
                              }}
                            >
                              {step.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA BAND */}
          <div style={{ background: GOLD, padding: '80px 60px' }}>
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 40,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.45)',
                    marginBottom: 12,
                  }}
                >
                  Limited Seats Available
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(28px, 3vw, 44px)',
                    fontWeight: 800,
                    color: '#000',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  Ready to begin
                  <br />
                  your journey?
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button
                  onClick={() => router.push('/applicant/register')}
                  style={{
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    padding: '16px 36px',
                    fontWeight: 800,
                    fontSize: 14,
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: "'Syne', system-ui, sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 24px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Start Application
                </button>
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    background: 'transparent',
                    color: '#000',
                    border: '2px solid rgba(0,0,0,0.25)',
                    padding: '14px 36px',
                    fontWeight: 800,
                    fontSize: 14,
                    borderRadius: 7,
                    cursor: 'pointer',
                    fontFamily: "'Syne', system-ui, sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Track Application
                </button>
              </div>
            </div>
          </div>

          {/* DEPARTMENTS */}
          <div id="departments" style={{ padding: '120px 60px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 60 }}>
                <span className="section-tag-h">Academic Programs</span>
                <h2
                  style={{
                    display: 'block',
                    fontSize: 'clamp(34px, 4vw, 54px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    marginTop: 0,
                  }}
                >
                  Our Departments
                </h2>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16,
                }}
              >
                {departments.map((d, i) => (
                  <motion.div
                    key={i}
                    className="dept-card-h"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div style={{ fontSize: 38, marginBottom: 20 }}>{d.icon}</div>
                    <div
                      style={{
                        width: 40,
                        height: 3,
                        background: d.color,
                        borderRadius: 2,
                        marginBottom: 16,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {d.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {d.count} Students Enrolled
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div
            id="about"
            style={{
              padding: '120px 60px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 80,
                alignItems: 'center',
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="section-tag-h">Our Mission</span>
                <h2
                  style={{
                    fontSize: 'clamp(34px, 4vw, 50px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: 20,
                  }}
                >
                  Forging the Technical
                  <br />
                  Leaders of Tomorrow
                </h2>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 15,
                    lineHeight: 1.9,
                    marginBottom: 20,
                  }}
                >
                  SASMS integrates advanced data analytics, AI-driven learning paths, and strategic
                  industry partnerships to ensure our students excel in real-world technical
                  scenarios.
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 15,
                    lineHeight: 1.9,
                    marginBottom: 40,
                  }}
                >
                  Our fully digital administrative ecosystem means students, parents, and staff are
                  always connected — from attendance and fees to exams and admissions.
                </p>
                <div style={{ display: 'flex', gap: 40 }}>
                  {[
                    ['Ministry', 'Certified'],
                    ['Industry', 'Partnered'],
                    ['Data-Driven', 'Learning'],
                  ].map(([a, b], i) => (
                    <div key={i}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 13,
                          color: GOLD,
                        }}
                      >
                        {a}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{b}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                style={{ position: 'relative' }}
              >
                <div
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <img
                    src="/school_hero_banner.png"
                    alt="SASMS Campus"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.75,
                    }}
                  />
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    background: GOLD,
                    borderRadius: 12,
                    padding: '18px 22px',
                    boxShadow: '0 20px 60px rgba(255,198,0,0.25)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: '#000',
                      lineHeight: 1,
                    }}
                  >
                    A+
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'rgba(0,0,0,0.55)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginTop: 4,
                    }}
                  >
                    Rated Institution
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* MANAGEMENT + TEACHER TEMPLATE SECTION */}
          <div
            style={{
              padding: '120px 60px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 36,
              }}
            >
              {/* Mona banner - left image + right copy */}
              <div>
                <div
                  style={{
                    borderRadius: 26,
                    background: '#FFC600',
                    padding: '30px 40px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 40,
                  }}
                >
                  <div
                    style={{
                      flex: '0 0 320px',
                      borderRadius: 24,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                      background: '#fff',
                    }}
                  >
                    <img
                      src="/mona2.jpg"
                      alt="Mrs. Mona Rabbat"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, color: '#111' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Our Manager
                    </div>
                    <p
                      style={{
                        fontSize: 18,
                        lineHeight: 1.7,
                        fontWeight: 600,
                        maxWidth: 520,
                      }}
                    >
                      At our School, we aim to empower students with the skills, knowledge, and
                      values needed for success.
                    </p>
                    <div style={{ marginTop: 18 }}>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>Mrs. Mona Rabbat</div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginTop: 4,
                        }}
                      >
                        Chairman of EVA Group
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Our Managers - two cards */}
              <div>
                <span className="section-tag-h">Our Managers</span>
                <div
                  className="home-managers-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 20,
                    marginTop: 18,
                  }}
                >
                  {[
                    {
                      role: 'Academic Director',
                      name: 'Mrs. Gehan Ahmed',
                      img: '/ja.jpg',
                    },
                    {
                      role: 'Executive Supervisor',
                      name: 'Mrs. Mariam Fayez',
                      img: '/mf.jpg',
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 20,
                        overflow: 'hidden',
                        background: 'rgba(0,0,0,0.7)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: 260,
                        margin: '0 auto',
                        transform: 'translateY(0)',
                        transition:
                          'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                      }}
                      className="manager-card"
                    >
                      <div style={{ aspectRatio: '4/5', background: '#111' }}>
                        <img
                          src={m.img}
                          alt={m.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          padding: 14,
                          background: 'rgba(0,0,0,0.9)',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 850 }}>{m.name}</div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.7)',
                            marginTop: 4,
                          }}
                        >
                          {m.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher of the Month - certificate template */}
              <div>
                <span className="section-tag-h">Teacher of the Month</span>
                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,198,0,0.25)',
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      padding: 26,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: 'rgba(255,198,0,0.25)',
                          border: '1px solid rgba(255,198,0,0.6)',
                        }}
                      />
                      <div style={{ fontWeight: 900, color: '#111' }}>SASMS</div>
                    </div>
                    <div style={{ fontWeight: 850, color: '#111' }}>
                      {(teacher as any)?.month || 'Month'}{' '}
                      {(teacher as any)?.year || new Date().getFullYear()}
                    </div>
                  </div>
                  <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
                  <div style={{ padding: 26 }}>
                    <div
                      style={{
                        fontSize: 52,
                        fontWeight: 950,
                        color: '#111',
                        lineHeight: 1,
                      }}
                    >
                      Congratulations !
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: 'rgba(0,0,0,0.65)',
                        marginTop: 8,
                      }}
                    >
                      Teacher of the Month
                    </div>

                    <div
                      className="home-teacher-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '260px 1fr',
                        gap: 26,
                        alignItems: 'center',
                        marginTop: 26,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: 260,
                          height: 260,
                          margin: '0 auto',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: -10,
                            borderRadius: '50%',
                            border: '2px dashed rgba(255,198,0,0.8)',
                          }}
                        />
                        <div
                          style={{
                            width: 260,
                            height: 260,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid rgba(255,198,0,0.7)',
                            background: 'rgba(0,0,0,0.03)',
                          }}
                        >
                          <img
                            src={
                              (teacherImageUrl as any) ||
                              'https://via.placeholder.com/260x260.png?text=Teacher'
                            }
                            alt={teacher?.name || 'Teacher of the Month'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transform: `translate(${
                                (teacher as any)?.imageOffsetX ?? 0
                              }%, ${(teacher as any)?.imageOffsetY ?? 0}%)`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 30,
                            fontWeight: 950,
                            color: '#111',
                          }}
                        >
                          {teacher?.name || 'Not set yet'}
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 850,
                            color: 'rgba(0,0,0,0.7)',
                            marginTop: 6,
                          }}
                        >
                          {teacher?.title || ''}
                        </div>
                        {(teacher as any)?.quote && (
                          <div
                            style={{
                              marginTop: 14,
                              fontSize: 14,
                              lineHeight: 1.8,
                              color: 'rgba(0,0,0,0.68)',
                            }}
                          >
                            {(teacher as any).quote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @media (max-width: 980px) {
                .home-teacher-grid { grid-template-columns: 1fr !important; }
                .home-managers-grid { grid-template-columns: 1fr !important; }
              }
              .manager-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 18px 40px rgba(0,0,0,0.45);
                border-color: rgba(255,198,0,0.6);
              }
            `}</style>
          </div>

          {/* SUPPORT CTA */}
          <div
            style={{
              padding: '80px 60px',
              background: 'rgba(255,255,255,0.02)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                maxWidth: 680,
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                Need help with your application?
              </h3>
              <p
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  marginBottom: 32,
                  lineHeight: 1.8,
                  fontSize: 15,
                }}
              >
                Our admissions support team is available 24/7 to guide you through document
                uploads, department selection, and fee payments.
              </p>
              <button
                className="btn-ph"
                onClick={() => router.push('/applicant/support')}
              >
                Visit Support Center
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <footer
            style={{
              padding: '56px 60px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 36,
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      background: GOLD,
                      borderRadius: 5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 11,
                        color: '#000',
                      }}
                    >
                      S
                    </span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>
                    SASMS International
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 28 }}>
                  {['Privacy Policy', 'School Rules', 'Contact Office'].map((l, i) => (
                    <span key={i} className="nav-link-h" style={{ fontSize: 12 }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  paddingTop: 24,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.25)',
                  }}
                >
                  © 2025 SASMS International. All Rights Reserved.
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  Powered by EVA School Digital System
                </p>
              </div>
            </div>
          </footer>

      <SasmsChatbot />
    </div>
  );
}
