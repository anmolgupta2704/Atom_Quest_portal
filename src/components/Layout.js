import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = {
  employee: [
    { path: '/employee', label: 'Dashboard', icon: '⬡' },
    { path: '/employee/goals', label: 'My Goals', icon: '◎' },
    { path: '/employee/checkin', label: 'Check-In', icon: '◈' },
  ],
  manager: [
    { path: '/manager', label: 'Team Dashboard', icon: '⬡' },
    { path: '/reports', label: 'Reports', icon: '◉' },
  ],
  admin: [
    { path: '/admin', label: 'Admin Portal', icon: '⬡' },
    { path: '/reports', label: 'Reports', icon: '◉' },
  ],
};

const ROLE_COLOR = { employee: '#3b82f6', manager: '#10b981', admin: '#8b5cf6' };

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV[user?.role] || [];
  const roleColor = ROLE_COLOR[user?.role] || '#3b82f6';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 60 : 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                <span style={{ color: roleColor }}>Atom</span>Quest
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                Goal Portal
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', fontSize: '1.1rem', padding: 4,
          }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: 12, padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  marginBottom: 4, justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? `rgba(${roleColor === '#3b82f6' ? '59,130,246' : roleColor === '#10b981' ? '16,185,129' : '139,92,246'},0.15)` : 'transparent',
                  color: active ? roleColor : 'var(--text2)',
                  fontFamily: 'var(--font)', fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem', transition: 'all 0.2s',
                  borderLeft: active ? `2px solid ${roleColor}` : '2px solid transparent',
                }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 20px',
          borderTop: '1px solid var(--border)',
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}>
                {user?.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'capitalize' }}>
                  {user?.role}
                </div>
              </div>
              <button onClick={onLogout} title="Logout" style={{
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', fontSize: '1rem', padding: 4,
              }}>⏻</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
              }}>
                {user?.avatar}
              </div>
              <button onClick={onLogout} title="Logout" style={{
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', fontSize: '0.9rem',
              }}>⏻</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: collapsed ? 60 : 240, transition: 'margin-left 0.3s', padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
