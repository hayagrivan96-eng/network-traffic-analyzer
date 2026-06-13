import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'technician' | 'viewer'>('viewer');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Small timeout to simulate network request
    setTimeout(async () => {
      try {
        if (mode === 'signin') {
          const success = await login(email, password);
          if (success) {
            navigate('/app/dashboard');
          } else {
            setErrorMsg('Invalid email or password. Please use the demo credentials.');
          }
        } else {
          const result = await register(name, email, password, role);
          if (result.success) {
            // Automatically log in
            const success = await login(email, password);
            if (success) {
              navigate('/app/dashboard');
            } else {
              setMode('signin');
              setSuccessMsg('Account created successfully! Please sign in.');
            }
          } else {
            setErrorMsg(result.error || 'An error occurred during registration.');
          }
        }
      } catch (err) {
        setErrorMsg('An error occurred during authentication.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const toggleMode = (m: 'signin' | 'signup') => {
    if (isLoading) return;
    setMode(m);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ── LEFT PANEL (BRAND PANEL) ─────────────────────────── */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--bg-surface-2)',
        borderRight: '1px solid var(--border)',
        padding: 'var(--space-12) var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <div className="sidebar-logo-icon" style={{ width: '40px', height: '40px' }}>
            <Shield size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
            Network Guardian Pro
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', lineHeight: 1.2, marginBottom: 'var(--space-4)' }}>
          Professional network visibility for modern teams.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', marginBottom: 'var(--space-10)' }}>
          Monitor your local and cloud infrastructure. Keep track of connections, bandwidth consumption, and detect security vulnerabilities.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Real-time device discovery</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Live traffic sniffing & visualization</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Automated port and vulnerability scanning</span>
          </li>
        </ul>
      </div>

      {/* ── RIGHT PANEL (LOGIN/SIGNUP FORM) ──────────────────── */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-10)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: 'var(--space-8)',
            gap: 'var(--space-6)'
          }}>
            <button
              onClick={() => toggleMode('signin')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: mode === 'signin' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                paddingBottom: 'var(--space-3)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleMode('signup')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: mode === 'signup' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                paddingBottom: 'var(--space-3)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Get started'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              {mode === 'signin' ? 'Sign in to your dashboard' : 'Create an operator account to monitor network hosts'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder="Alex Mitchell"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'signin' && (
                  <a href="#" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-500)', textDecoration: 'none' }}>
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="role" className="form-label">System Role</label>
                <select
                  id="role"
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  disabled={isLoading}
                  style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    width: '100%',
                    padding: 'var(--space-3)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="technician">Technician (Read & Scan)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
            )}

            {mode === 'signin' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  Remember me
                </label>
              </div>
            )}

            {errorMsg && (
              <div className="alert-message alert-critical" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3) var(--space-4)' }}>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="alert-message" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-success)', color: 'var(--color-success)', background: 'rgba(22, 163, 74, 0.1)' }}>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'signin' ? 'Signing In...' : 'Registering...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Credentials Info Box */}
          {mode === 'signin' && (
            <div className="info-box" style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-4)',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1.6
            }}>
              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Demo Credentials
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                <div><strong>Admin:</strong> admin@ngpro.local / admin123</div>
                <div><strong>Tech:</strong> tech@ngpro.local / tech123</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
