import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const QUARTER = 'Q2';

export default function AdminDashboard({ user }) {
  const { users, goals, cycles, thrustAreas, unlockGoal, pushSharedGoal, setCycles, auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockGoalId, setUnlockGoalId] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [showSharedGoalModal, setShowSharedGoalModal] = useState(false);
  const [sharedGoal, setSharedGoal] = useState({ thrustArea: '', title: '', description: '', uom: 'Min', target: '', weightage: 20 });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [saved, setSaved] = useState('');

  const employees = users.filter(u => u.role === 'employee');
  const managers = users.filter(u => u.role === 'manager');

  const getEmpGoals = (empId) => goals.filter(g => g.employeeId === empId);
  const getApproved = (empId) => getEmpGoals(empId).filter(g => g.status === 'approved');
  const getPending = (empId) => getEmpGoals(empId).filter(g => g.status === 'pending');

  const totalPending = employees.reduce((s, e) => s + getPending(e.id).length, 0);
  const totalApproved = employees.filter(e => getApproved(e.id).length > 0).length;
  const checkinDone = employees.filter(e => getApproved(e.id).some(g => g.quarterlyActuals?.[QUARTER] !== null)).length;

  const handleUnlock = () => {
    if (!unlockGoalId || !unlockReason.trim()) return;
    unlockGoal(unlockGoalId, unlockReason, user.name);
    setShowUnlockModal(false);
    setUnlockGoalId('');
    setUnlockReason('');
    setSaved('Goal unlocked successfully!');
    setTimeout(() => setSaved(''), 2500);
  };

  const handlePushSharedGoal = () => {
    if (!sharedGoal.title || !selectedEmployees.length) return;
    pushSharedGoal(selectedEmployees, sharedGoal, user.name);
    setShowSharedGoalModal(false);
    setSharedGoal({ thrustArea: '', title: '', description: '', uom: 'Min', target: '', weightage: 20 });
    setSelectedEmployees([]);
    setSaved('Shared goal pushed to selected employees!');
    setTimeout(() => setSaved(''), 2500);
  };

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
  };

  const lockedGoals = goals.filter(g => g.status === 'approved' && g.lockedAt);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Admin Portal</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>HR Administration · Manage cycles, users & governance</p>
      </div>

      {saved && <div className="alert alert-success" style={{ marginBottom: 20 }}>✓ {saved}</div>}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Employees</div>
          <div className="value" style={{ color: 'var(--accent2)' }}>{employees.length}</div>
          <div className="sub">Across {[...new Set(employees.map(e => e.department))].length} departments</div>
        </div>
        <div className="stat-card">
          <div className="label">Goals Submitted</div>
          <div className="value" style={{ color: 'var(--yellow2)' }}>{totalPending}</div>
          <div className="sub">Pending approval</div>
        </div>
        <div className="stat-card">
          <div className="label">Goals Approved</div>
          <div className="value" style={{ color: 'var(--green2)' }}>{totalApproved}/{employees.length}</div>
          <div className="sub">Completion rate</div>
        </div>
        <div className="stat-card">
          <div className="label">{QUARTER} Check-ins</div>
          <div className="value" style={{ color: 'var(--purple)' }}>{checkinDone}/{employees.length}</div>
          <div className="sub">Updated this quarter</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'employees', 'cycles', 'audit'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Employee Goal Status */}
            <div className="card">
              <div className="section-header">
                <span className="section-title">Employee Status</span>
              </div>
              {employees.map(emp => {
                const approved = getApproved(emp.id).length;
                const pending = getPending(emp.id).length;
                const hasCheckin = getApproved(emp.id).some(g => g.quarterlyActuals?.[QUARTER] !== null);
                return (
                  <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{emp.department}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {pending > 0 && <span className="badge badge-pending">Pending</span>}
                      {approved > 0 && <span className="badge badge-approved">Approved</span>}
                      {hasCheckin && <span className="badge badge-active">Q2 ✓</span>}
                      {!approved && !pending && <span className="badge badge-locked">No Goals</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 16 }}>Admin Actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => setShowSharedGoalModal(true)} className="btn btn-primary">
                    ⬡ Push Shared Goal to Employees
                  </button>
                  <button onClick={() => setShowUnlockModal(true)} className="btn btn-ghost">
                    🔓 Unlock a Locked Goal
                  </button>
                </div>
              </div>

              {/* Cycle Status */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>Active Cycles</div>
                {cycles.map(cy => (
                  <div key={cy.id} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cy.year} — {cy.phase}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 2 }}>
                          Opens: {cy.opens} · Closes: {cy.closes}
                        </div>
                      </div>
                      <span className={`badge ${cy.status === 'active' ? 'badge-active' : 'badge-locked'}`}>
                        {cy.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPLOYEES ── */}
      {activeTab === 'employees' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>User Management</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Manager</th>
                  <th>Goals Status</th>
                  <th>Q2 Update</th>
                </tr>
              </thead>
              <tbody>
                {[...employees, ...managers].map(u => {
                  const mgr = users.find(m => m.id === u.managerId);
                  const approved = getApproved(u.id).length;
                  const pending = getPending(u.id).length;
                  const hasCheckin = getApproved(u.id).some(g => g.quarterlyActuals?.[QUARTER] !== null);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>{u.email}</div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{u.department}</td>
                      <td><span className={`badge ${u.role === 'employee' ? 'badge-active' : u.role === 'manager' ? 'badge-approved' : 'badge-pending'}`}>{u.role}</span></td>
                      <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{mgr?.name || '—'}</td>
                      <td>
                        {pending > 0 && <span className="badge badge-pending">Pending</span>}
                        {approved > 0 && <span className="badge badge-approved">{approved} Approved</span>}
                        {!approved && !pending && <span className="badge badge-locked">None</span>}
                      </td>
                      <td>{hasCheckin ? <span className="badge badge-active">Done</span> : <span className="badge badge-locked">Pending</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CYCLES ── */}
      {activeTab === 'cycles' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Cycle Management</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Year</th><th>Phase</th><th>Opens</th><th>Closes</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {cycles.map(cy => (
                  <tr key={cy.id}>
                    <td>{cy.year}</td>
                    <td style={{ fontWeight: 500 }}>{cy.phase}</td>
                    <td style={{ color: 'var(--text2)' }}>{cy.opens}</td>
                    <td style={{ color: 'var(--text2)' }}>{cy.closes}</td>
                    <td><span className={`badge ${cy.status === 'active' ? 'badge-active' : 'badge-locked'}`}>{cy.status}</span></td>
                    <td>
                      <button onClick={() => {
                        setCycles(prev => prev.map(c => c.id === cy.id ? { ...c, status: c.status === 'active' ? 'closed' : 'active' } : c));
                      }} className="btn btn-ghost btn-sm">
                        {cy.status === 'active' ? 'Close' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AUDIT ── */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Audit Trail</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th></tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.user}</td>
                    <td><span className="badge badge-active">{log.action}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="modal-overlay" onClick={() => setShowUnlockModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Unlock a Goal</h2>
            <div className="form-group">
              <label>Select Goal</label>
              <select value={unlockGoalId} onChange={e => setUnlockGoalId(e.target.value)}>
                <option value="">Choose a locked goal…</option>
                {lockedGoals.map(g => {
                  const emp = users.find(u => u.id === g.employeeId);
                  return <option key={g.id} value={g.id}>{emp?.name} — {g.title}</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Reason for Unlock *</label>
              <textarea value={unlockReason} onChange={e => setUnlockReason(e.target.value)}
                placeholder="Explain why this goal is being unlocked…" rows={3} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowUnlockModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleUnlock} className="btn btn-primary" disabled={!unlockGoalId || !unlockReason.trim()}>
                Unlock Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Goal Modal */}
      {showSharedGoalModal && (
        <div className="modal-overlay" onClick={() => setShowSharedGoalModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Push Shared Goal</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>Thrust Area</label>
                <select value={sharedGoal.thrustArea} onChange={e => setSharedGoal({ ...sharedGoal, thrustArea: e.target.value })}>
                  <option value="">Select…</option>
                  {thrustAreas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>UoM</label>
                <select value={sharedGoal.uom} onChange={e => setSharedGoal({ ...sharedGoal, uom: e.target.value })}>
                  {['Min', 'Max', 'Timeline', 'Zero'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Goal Title *</label>
              <input value={sharedGoal.title} onChange={e => setSharedGoal({ ...sharedGoal, title: e.target.value })} placeholder="Shared departmental KPI…" />
            </div>
            <div className="form-group">
              <label>Target</label>
              <input value={sharedGoal.target} onChange={e => setSharedGoal({ ...sharedGoal, target: e.target.value })} placeholder="Enter target value" />
            </div>
            <div className="form-group">
              <label>Default Weightage (%)</label>
              <input type="number" min={10} max={100} value={sharedGoal.weightage} onChange={e => setSharedGoal({ ...sharedGoal, weightage: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Select Employees</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {employees.map(emp => (
                  <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textTransform: 'none', letterSpacing: 'normal', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => toggleEmployee(emp.id)} style={{ width: 'auto' }} />
                    {emp.name} — {emp.department}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSharedGoalModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handlePushSharedGoal} className="btn btn-primary"
                disabled={!sharedGoal.title || !selectedEmployees.length}>
                Push to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
