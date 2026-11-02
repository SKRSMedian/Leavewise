import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#3E5C76" />
      <rect x="6" y="9" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.9" />
      <rect x="18" y="6" width="8" height="8" rx="1.5" fill="#748CAB" />
      <rect x="12" y="19" width="8" height="8" rx="1.5" fill="#F0EBD8" opacity="0.7" />
      <line x1="14" y1="13" x2="18" y2="10" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="18" y1="14" x2="16" y2="19" stroke="#F0EBD8" strokeWidth="1.2" strokeOpacity="0.6" />
    </svg>
  );
}

const DEMO_ACCOUNTS = [
  { email: 'deepak.mehta@company.com', password: 'manager123', role: 'Manager', label: 'DM' },
  { email: 'arjun.sharma@company.com', password: 'employee123', role: 'Employee', label: 'AS' },
  { email: 'meera.joshi@company.com', password: 'admin123', role: 'Admin', label: 'MJ' },
];

export function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 600));

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/app/dashboard');
    } else {
      setError(result.error || 'Sign in failed.');
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    // Instant login for convenience
    login(acc.email, acc.password);
    navigate('/app/dashboard');
  };

  return (
    <div className="auth-page">
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(62,92,118,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(62,92,118,0.04) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <LogoMark />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
              LeaveWise
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-40)', marginTop: 1 }}>
              Intelligent Leave Management
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Sign in to continue</h2>
        <p style={{ fontSize: '0.875rem', marginBottom: 28 }}>Access your leave management dashboard.</p>

        {/* Demo accounts */}
        <div style={{
          background: 'rgba(62,92,118,0.12)',
          border: 'var(--border-accent)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-accent)', marginBottom: 10, textTransform: 'uppercase' }}>
            Demo Accounts
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(29,45,68,0.6)',
                  border: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  color: 'var(--color-text-60)',
                  fontSize: '0.75rem', fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 3, background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5625rem', fontWeight: 700, color: 'var(--color-text)',
                }}>
                  {acc.label}
                </div>
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signin-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signin-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-40)',
                }}
                aria-label="Toggle password visibility"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px',
              background: 'var(--color-danger-bg)',
              border: '1px solid rgba(140,74,74,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#E06060',
              fontSize: '0.8125rem',
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4, justifyContent: 'center' }}
            id="signin-submit"
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                Signing in...
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8125rem', color: 'var(--color-text-40)' }}>
          <Link to="/" style={{ color: 'var(--color-accent)' }}>← Back to homepage</Link>
        </div>
      </motion.div>
    </div>
  );
}
