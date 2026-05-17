import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const QUARTER = 'Q2';

export default function EmployeeDashboard({ user }) {
  const { goals, computeProgress } = useApp();
  const navigate = useNavigate();
  const myGoals = goals.filter(g => g.employeeId === user.id);
  const approved = myGoals.filter(g => g.status === 'approved');
  const pending = myGoals.filter(g => g.status === 'pending');
  const returned = myGoals.filter(g => g.status === 'returned');
  const totalWeight = approved.reduce((s, g) => s + Number(g.weightage), 0);

  // Average progress across approved goals with Q2 actuals
  const progresses = approved.map(g => computeProgress(g, QUARTER)).filter(p => p !== null);
  const avgProgress = progresses.length ? progresses.reduce((a, b) => a + b, 0) / progresses.length : null;

  const getProgressColor = (p) => {
    if (p >= 90) return 'green';
    if (p >= 60) return 'yellow';
    return 'red';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          {user.department} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {returned.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠ {returned.length} goal sheet returned for rework. <button onClick={() => navigate('/employee/goals')} style={{ background: 'none', border: 'none', color: 'var(--yellow2)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)' }}>Review now →</button>
        </div>
      )}
      {pending.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ℹ {pending.length} goal(s) pending manager approval.
        </div>
      )}
      {approved.length === 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          📋 No approved goals yet. <button onClick={() => navigate('/employee/goals')} style={{ background: 'none', border: 'none', color: 'var(--yellow2)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)' }}>Set your goals →</button>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Goals</div>
          <div className="value" style={{ color: 'var(--accent2)' }}>{myGoals.length}</div>
          <div className="sub">{approved.length} approved</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Weightage</div>
          <div className="value" style={{ color: totalWeight === 100 ? 'var(--green2)' : 'var(--yellow2)' }}>
            {totalWeight}%
          </div>
          <div className="sub">{totalWeight === 100 ? '✓ Balanced' : `${100 - totalWeight}% remaining`}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Progress ({QUARTER})</div>
          <div className="value" style={{ color: avgProgress !== null ? (avgProgress >= 90 ? 'var(--green2)' : avgProgress >= 60 ? 'var(--yellow2)' : 'var(--red2)') : 'var(--text3)' }}>
            {avgProgress !== null ? `${avgProgress.toFixed(0)}%` : '—'}
          </div>
          <div className="sub">Across {progresses.length} goals</div>
        </div>
        <div className="stat-card">
          <div className="label">Current Phase</div>
          <div className="value" style={{ fontSize: '1.1rem', marginTop: 4 }}>Q2 Check-In</div>
          <div className="sub">Window: Oct 2025</div>
        </div>
      </div>

      {/* Goals Summary */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <span className="section-title">My Goal Sheet</span>
          <button onClick={() => navigate('/employee/goals')} className="btn btn-ghost btn-sm">
            {approved.length > 0 ? 'View / Edit →' : 'Create Goals →'}
          </button>
        </div>

        {approved.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>◎</div>
            <p>No goals created yet. Start by setting your goals for this cycle.</p>
            <button onClick={() => navigate('/employee/goals')} className="btn btn-primary" style={{ marginTop: 16 }}>
              Create Goal Sheet
            </button>
          </div>
        ) : (
          <div>
            {approved.map(goal => {
              const progress = computeProgress(goal, QUARTER);
              return (
                <div key={goal.id} style={{
                  padding: '16px', marginBottom: 12, background: 'var(--bg3)',
                  borderRadius: 10, border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{goal.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                        {goal.thrustArea} · {goal.uom} · Weight: <strong>{goal.weightage}%</strong>
                        {goal.isShared && <span className="badge badge-active" style={{ marginLeft: 8 }}>Shared</span>}
                      </div>
                    </div>
                    <span className="badge badge-approved">Approved</span>
                  </div>
                  {progress !== null && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{QUARTER} Progress</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: progress >= 90 ? 'var(--green2)' : progress >= 60 ? 'var(--yellow2)' : 'var(--red2)' }}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${getProgressColor(progress)}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <button onClick={() => navigate('/employee/goals')} className="card card-hover" style={{
          textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card)',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>◎</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Goal Sheet</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Create, edit & submit your annual goals</div>
        </button>
        <button onClick={() => navigate('/employee/checkin')} className="card card-hover" style={{
          textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card)',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>◈</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Quarterly Check-In</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Log your actual achievements vs targets</div>
        </button>
      </div>
    </div>
  );
}
