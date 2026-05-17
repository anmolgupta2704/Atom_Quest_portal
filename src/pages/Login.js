import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DEMO_CREDS = [
  { role: 'Employee', email: 'arjun@atomquest.in', password: 'emp123', color: '#3b82f6' },
  { role: 'Manager', email: 'neha@atomquest.in', password: 'mgr123', color: '#10b981' },
  { role: 'Admin', email: 'admin@atomquest.in', password: 'admin123', color: '#8b5cf6' },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const { users } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUser = (user) => {
    if (user.role === 'employee') navigate('/employee');
    else if (user.role === 'manager') navigate('/manager');
    else if (user.role === 'admin') navigate('/admin');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        onLogin(user);
        redirectUser(user);
      } else {
        setError('Invalid email or password.');
      }

      setLoading(false);
    }, 500);
  };

  const quickLogin = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');

    const user = users.find(
      (u) => u.email === cred.email && u.password === cred.password
    );

    if (user) {
      onLogin(user);
      redirectUser(user);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        backgroundImage:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.15), transparent)',
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 460,
          padding: '20px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              marginBottom: 16,
              fontSize: '1.5rem',
            }}
          >
            ⬡
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 6,
            }}
          >
            <span style={{ color: '#3b82f6' }}>Atom</span>Quest
          </h1>

          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            Goal Setting & Tracking Portal
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '36px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Sign In
          </h2>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@atomquest.in"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: 8,
                justifyContent: 'center',
              }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div style={{ marginTop: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--border)',
                }}
              />

              <span
                style={{
                  color: 'var(--text3)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Demo Access
              </span>

              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--border)',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
              }}
            >
              {DEMO_CREDS.map((cred) => (
                <button
                  type="button"
                  key={cred.role}
                  onClick={() => quickLogin(cred)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    background: `rgba(${
                      cred.color === '#3b82f6'
                        ? '59,130,246'
                        : cred.color === '#10b981'
                        ? '16,185,129'
                        : '139,92,246'
                    },0.1)`,
                    border: `1px solid ${cred.color}33`,
                    color: cred.color,
                    fontFamily: 'var(--font)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'var(--text3)',
            fontSize: '0.75rem',
          }}
        >
          AtomQuest Hackathon 1.0 — Goal Portal
        </p>
      </div>
    </div>
  );
}