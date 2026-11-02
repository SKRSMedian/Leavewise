import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HeroCanvas } from '../components/three/HeroCanvas';
import {
  Brain, Shield, Calendar, BarChart3, Users, Zap,
  ChevronDown, ArrowRight, Check
} from 'lucide-react';

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#3E5C76" />
      <rect x="6" y="9" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.9" />
      <rect x="18" y="6" width="8" height="8" rx="1.5" fill="#748CAB" />
      <rect x="12" y="19" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.7" />
      <line x1="14" y1="13" x2="18" y2="10" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="18" y1="14" x2="16" y2="19" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Decisions',
    desc: 'Rule-based expert system, CSP constraint solving, and Bayesian risk estimation provide transparent, explainable recommendations.',
  },
  {
    icon: Shield,
    title: 'Policy Validation',
    desc: 'Every request is automatically validated against your company leave policies before reaching a manager.',
  },
  {
    icon: BarChart3,
    title: 'Priority Scoring',
    desc: 'A weighted priority algorithm ranks competing requests, balancing urgency, advance notice, and workforce impact.',
  },
  {
    icon: Calendar,
    title: 'Workforce Scheduling',
    desc: 'Visual calendar overlays prevent staffing conflicts before they happen. Minimum thresholds enforced automatically.',
  },
  {
    icon: Users,
    title: 'Team Visibility',
    desc: 'Real-time availability, department filters, and leave patterns give managers complete situational awareness.',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    desc: 'Live request feeds, instant approval notifications, and automatic balance updates across the entire organisation.',
  },
];

const STORY_SECTIONS = [
  {
    tag: 'The Challenge',
    title: 'Leave management is broken.',
    body: 'Overlapping requests. Manual spreadsheets. No staffing visibility. Decisions made on gut feel and email chains.',
    visual: 'conflict',
  },
  {
    tag: 'Intelligent Decisions',
    title: 'Every request gets a fair, explainable answer.',
    body: 'Our decision engine evaluates eligibility, priority, and workforce impact in milliseconds — with a clear explanation every time.',
    visual: 'decision',
  },
  {
    tag: 'Workforce Balance',
    title: 'Balance preserved, automatically.',
    body: 'Constraint satisfaction and staffing thresholds ensure you never drop below operational minimums — without manual oversight.',
    visual: 'balance',
  },
];

function VisualConflict() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {['Annual', 'Sick', 'Annual', 'Emergency', 'Annual', 'Personal', 'Sick'].map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{
            padding: '6px 14px',
            borderRadius: 4,
            border: '1px solid rgba(240,235,216,0.15)',
            background: t === 'Emergency' ? 'rgba(140,74,74,0.2)' : 'rgba(29,45,68,0.8)',
            fontSize: '0.75rem',
            color: t === 'Emergency' ? '#E06060' : 'rgba(240,235,216,0.6)',
            fontWeight: 500,
          }}
        >
          {t}
        </motion.div>
      ))}
    </div>
  );
}

function VisualDecision() {
  const steps = [
    { label: 'Policy Check', status: 'pass' },
    { label: 'Balance Valid', status: 'pass' },
    { label: 'CSP Constraint', status: 'pass' },
    { label: 'Priority Score', status: '82/100' },
    { label: 'AI Recommend', status: 'Approve' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300 }}>
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 14px',
            background: 'rgba(29,45,68,0.6)',
            border: '1px solid rgba(240,235,216,0.08)',
            borderRadius: 6,
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'rgba(240,235,216,0.6)' }}>{s.label}</span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: s.status === 'pass' ? '#5CBA8C' : s.status === 'Approve' ? '#5CBA8C' : '#748CAB'
          }}>
            {s.status === 'pass' ? '✓ Pass' : s.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function VisualBalance() {
  const bars = [
    { dept: 'Eng', available: 4, total: 6 },
    { dept: 'Design', available: 2, total: 3 },
    { dept: 'HR', available: 3, total: 4 },
    { dept: 'Fin', available: 3, total: 4 },
  ];
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'center' }}>
      {bars.map((b, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          transition={{ delay: i * 0.1 }}
        >
          <div style={{
            width: 40, height: (b.available / b.total) * 80,
            background: 'linear-gradient(to top, #3E5C76, #748CAB)',
            borderRadius: '4px 4px 0 0', minHeight: 16
          }} />
          <span style={{ fontSize: '0.6875rem', color: 'rgba(240,235,216,0.4)' }}>{b.dept}</span>
        </motion.div>
      ))}
    </div>
  );
}

const visuals: Record<string, React.FC> = {
  conflict: VisualConflict,
  decision: VisualDecision,
  balance: VisualBalance,
};

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--color-bg-deep)', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">
          <LogoMark />
          LeaveWise
        </div>

        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
        </div>

        <div className="nav-actions">
          <Link to="/auth/signin" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/auth/signin" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '100vh' }}>
        <HeroCanvas />

        {/* Gradient overlay for readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(13,19,33,0.4) 0%, rgba(13,19,33,0.75) 100%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="hero-label">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#748CAB', display: 'inline-block' }} />
            Enterprise Leave Management Platform
          </div>

          <h1 className="hero-title">
            A Smarter Way to<br />
            <span className="accent">Manage Time Away.</span>
          </h1>

          <p className="hero-subtitle">
            Intelligent leave management. Balanced workforce. Better decisions.
          </p>

          <div className="hero-cta">
            <Link to="/auth/signin" className="btn btn-primary btn-lg" id="hero-get-started">
              Explore Platform
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg" id="hero-how-it-works">
              Discover How It Works
            </a>
          </div>
        </motion.div>

        <div className="scroll-indicator">
          <span style={{ fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* Story Sections */}
      <div id="how-it-works" style={{ padding: '80px 0' }}>
        {STORY_SECTIONS.map((section, i) => {
          const Visual = visuals[section.visual];
          const isEven = i % 2 === 0;

          return (
            <motion.section
              key={i}
              className="section"
              id={`section-${i + 1}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
            >
              <div className="container">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 64,
                  alignItems: 'center',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                }}>
                  <div style={{ order: isEven ? 1 : 2 }}>
                    <div className="section-tag">{section.tag}</div>
                    <h2 className="section-title">{section.title}</h2>
                    <p className="section-subtitle">{section.body}</p>
                  </div>
                  <div style={{
                    order: isEven ? 2 : 1,
                    background: 'var(--color-bg-panel)',
                    border: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 220,
                  }}>
                    <Visual />
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Features */}
      <section id="features" className="section" style={{ borderTop: 'var(--border-subtle)', paddingTop: 80 }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div className="section-tag" style={{ justifyContent: 'center', display: 'flex' }}>Platform Features</div>
            <h2 className="section-title">Everything your HR team needs.</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Built for modern enterprises. Designed for every stakeholder.
            </p>
          </motion.div>

          <div className="feature-grid" id="product">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="feature-icon">
                  <feature.icon size={20} />
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-desc">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="section" style={{ borderTop: 'var(--border-subtle)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <div className="section-tag" style={{ justifyContent: 'center', display: 'flex' }}>The Platform</div>
            <h2 className="section-title">A control centre for your workforce.</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              background: 'var(--color-bg-panel)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Mock topbar */}
            <div style={{
              height: 48, background: 'var(--color-bg-deep)',
              borderBottom: 'var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#8C4A4A','#C4842A','#4A8C6F'].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: 'rgba(240,235,216,0.04)', borderRadius: 4,
                height: 24, maxWidth: 400,
              }} />
            </div>

            {/* Mock layout */}
            <div style={{ display: 'flex', height: 360 }}>
              {/* Sidebar preview */}
              <div style={{
                width: 160, borderRight: 'var(--border-subtle)',
                padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {['Overview', 'Leave Requests', 'Calendar', 'AI Centre', 'Employees', 'Analytics'].map((item, i) => (
                  <div key={i} style={{
                    padding: '8px 16px', fontSize: '0.75rem',
                    color: i === 0 ? 'var(--color-text)' : 'rgba(240,235,216,0.4)',
                    background: i === 0 ? 'rgba(62,92,118,0.2)' : 'transparent',
                    borderLeft: i === 0 ? '2px solid var(--color-accent)' : '2px solid transparent',
                    fontWeight: i === 0 ? 600 : 400,
                  }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Main preview */}
              <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-40)' }}>Good morning, Deepak Mehta</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Pending', value: '3' },
                    { label: 'On Leave', value: '2' },
                    { label: 'Available', value: '27' },
                    { label: 'Risk', value: 'Low' },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: 'rgba(13,19,33,0.5)', borderRadius: 6, border: 'var(--border-subtle)',
                      padding: '10px 12px',
                    }}>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(240,235,216,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, background: 'rgba(13,19,33,0.5)', borderRadius: 6, border: 'var(--border-subtle)', opacity: 0.6 }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="section" style={{
        borderTop: 'var(--border-subtle)',
        background: 'linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg-panel) 100%)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Better decisions.<br />Better workplaces.
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto 40px' }}>
              Join teams that trust LeaveWise to manage their workforce intelligently.
            </p>
            <Link to="/auth/signin" className="btn btn-primary btn-lg" id="footer-cta">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: 'var(--border-subtle)',
        padding: '32px 0',
        color: 'var(--color-text-40)',
        fontSize: '0.8125rem',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-logo">
            <LogoMark />
            LeaveWise
          </div>
          <div>© 2026 LeaveWise. Built with intelligence.</div>
        </div>
      </footer>
    </div>
  );
}
