import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const QUARTER = 'Q2';

export default function ManagerDashboard({ user }) {
  const { users, goals, approveGoals, returnGoals, addCheckinComment, computeProgress } = useApp();

  const teamMembers = users.filter(u => u.managerId === user.id && u.role === 'employee');
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [view, setView] = useState('team');
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [editedGoals, setEditedGoals] = useState([]);
  const [comment, setComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);

  const getEmpGoals = (empId) => goals.filter(g => g.employeeId === empId);
  const getPending = (empId) => getEmpGoals(empId).filter(g => g.status === 'pending');
  const getApproved = (empId) => getEmpGoals(empId).filter(g => g.status === 'approved');

  const selectedMember = teamMembers.find(m => m.id === selectedEmpId);

 

  const openApproval = (empId) => {
    setSelectedEmpId(empId);
    const pending = getPending(empId);
    setEditedGoals(pending.map(g => ({ ...g })));
    setView('approval');
  };

  const openCheckin = (empId) => {
    setSelectedEmpId(empId);
    setView('checkin');
    setComment('');
  };

  const handleInlineEdit = (idx, field, value) => {
    const updated = [...editedGoals];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditedGoals(updated);
  };

  const handleApprove = () => {
    approveGoals(selectedEmpId, editedGoals, user.name);
    setView('team');
    setSelectedEmpId(null);
  };

  const handleReturn = () => {
    if (!returnReason.trim()) return;
    returnGoals(selectedEmpId, returnReason, user.name);
    setShowReturnModal(false);
    setReturnReason('');
    setView('team');
    setSelectedEmpId(null);
  };

  const handleSaveComment = () => {
    addCheckinComment(selectedEmpId, QUARTER, comment, user.name);
    setCommentSaved(true);
    setTimeout(() => setCommentSaved(false), 2500);
  };

  // Stats
  const totalPending = teamMembers.reduce((s, m) => s + getPending(m.id).length, 0);
  const totalApproved = teamMembers.filter(m => getApproved(m.id).length > 0).length;
  const checkinDone = teamMembers.filter(m => {
    const ag = getApproved(m.id);
    return ag.some(g => g.quarterlyActuals?.[QUARTER] !== null);
  }).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Team Dashboard</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          {user.name} · {user.department} Manager
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="label">Team Size</div>
          <div className="value" style={{ color: 'var(--accent2)' }}>{teamMembers.length}</div>
          <div className="sub">Direct reports</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Approvals</div>
          <div className="value" style={{ color: totalPending > 0 ? 'var(--yellow2)' : 'var(--text3)' }}>{totalPending}</div>
          <div className="sub">Awaiting your review</div>
        </div>
        <div className="stat-card">
          <div className="label">Goals Approved</div>
          <div className="value" style={{ color: 'var(--green2)' }}>{totalApproved}/{teamMembers.length}</div>
          <div className="sub">Members with approved goals</div>
        </div>
        <div className="stat-card">
          <div className="label">{QUARTER} Check-ins Done</div>
          <div className="value" style={{ color: 'var(--purple)' }}>{checkinDone}/{teamMembers.length}</div>
          <div className="sub">Updated this quarter</div>
        </div>
      </div>

      {/* ── TEAM LIST VIEW ── */}
      {view === 'team' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Team Members</div>
          {teamMembers.length === 0 ? (
            <div className="empty-state"><p>No direct reports assigned.</p></div>
          ) : (
            <div>
              {teamMembers.map(member => {
                const pending = getPending(member.id);
                const approved = getApproved(member.id);
                const hasUpdate = approved.some(g => g.quarterlyActuals?.[QUARTER] !== null);

                return (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px', marginBottom: 8,
                    background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)',
                    flexWrap: 'wrap', gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {member.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{member.department}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {pending.length > 0 && <span className="badge badge-pending">{pending.length} Pending</span>}
                      {approved.length > 0 && <span className="badge badge-approved">{approved.length} Approved</span>}
                      {hasUpdate && <span className="badge badge-active">Q2 Updated</span>}
                      {pending.length > 0 && (
                        <button onClick={() => openApproval(member.id)} className="btn btn-primary btn-sm">
                          Review Goals →
                        </button>
                      )}
                      {approved.length > 0 && (
                        <button onClick={() => openCheckin(member.id)} className="btn btn-ghost btn-sm">
                          Check-in →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── APPROVAL VIEW ── */}
      {view === 'approval' && selectedMember && (
        <div>
          <div className="section-header">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Goal Review — {selectedMember.name}</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>You can edit targets and weightages inline before approving.</p>
            </div>
            <button onClick={() => { setView('team'); setSelectedEmpId(null); }} className="btn btn-ghost btn-sm">
              ← Back
            </button>
          </div>

          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            ℹ Total weightage must be 100% before you can approve. Currently: {editedGoals.reduce((s, g) => s + Number(g.weightage || 0), 0)}%
          </div>

          {editedGoals.map((goal, idx) => (
            <div key={goal.id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{goal.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: 14 }}>
                {goal.thrustArea} · {goal.uom}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Target</label>
                  <input type={goal.uom === 'Timeline' ? 'date' : 'number'}
                    value={goal.target} onChange={e => handleInlineEdit(idx, 'target', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Weightage (%)</label>
                  <input type="number" min={10} max={100} value={goal.weightage}
                    onChange={e => handleInlineEdit(idx, 'weightage', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowReturnModal(true)} className="btn btn-danger">
              Return for Rework
            </button>
            <button onClick={handleApprove} className="btn btn-success"
              disabled={editedGoals.reduce((s, g) => s + Number(g.weightage || 0), 0) !== 100}>
              ✓ Approve & Lock Goals
            </button>
          </div>
        </div>
      )}

      {/* ── CHECK-IN VIEW ── */}
      {view === 'checkin' && selectedMember && (
        <div>
          <div className="section-header">
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Check-In — {selectedMember.name}</h2>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{QUARTER} Progress Review</p>
            </div>
            <button onClick={() => { setView('team'); setSelectedEmpId(null); }} className="btn btn-ghost btn-sm">← Back</button>
          </div>

          {getApproved(selectedEmpId).map(goal => {
            const actual = goal.quarterlyActuals?.[QUARTER];
            const progress = computeProgress(goal, QUARTER);
            return (
              <div key={goal.id} className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{goal.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                      {goal.thrustArea} · UoM: {goal.uom} · Weight: {goal.weightage}%
                    </div>
                  </div>
                  {goal.quarterlyStatus?.[QUARTER] && (
                    <span className={`badge ${goal.quarterlyStatus[QUARTER] === 'Completed' ? 'badge-approved' : goal.quarterlyStatus[QUARTER] === 'On Track' ? 'badge-active' : 'badge-pending'}`}>
                      {goal.quarterlyStatus[QUARTER]}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 4 }}>Target</div>
                    <div style={{ fontWeight: 600 }}>{goal.uom === 'Timeline' ? goal.target : Number(goal.target).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 4 }}>{QUARTER} Actual</div>
                    <div style={{ fontWeight: 600, color: actual !== null ? 'var(--text)' : 'var(--text3)' }}>
                      {actual !== null && actual !== undefined ? (goal.uom === 'Timeline' ? actual : Number(actual).toLocaleString()) : 'Not updated'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: 4 }}>Progress</div>
                    <div style={{ fontWeight: 600, color: progress !== null ? (progress >= 90 ? 'var(--green2)' : progress >= 60 ? 'var(--yellow2)' : 'var(--red2)') : 'var(--text3)' }}>
                      {progress !== null ? `${progress.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                </div>
                {progress !== null && (
                  <div style={{ marginTop: 12 }}>
                    <div className="progress-bar">
                      <div className={`progress-fill ${progress >= 90 ? 'green' : progress >= 60 ? 'yellow' : 'red'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Comment */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              {QUARTER} Check-In Comment
              {getApproved(selectedEmpId)[0]?.checkinComments?.[QUARTER] && (
                <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: '0.8rem', marginLeft: 12 }}>
                  (Previously saved)
                </span>
              )}
            </div>
            {getApproved(selectedEmpId)[0]?.checkinComments?.[QUARTER] && (
              <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 12, fontSize: '0.875rem', color: 'var(--text2)' }}>
                {getApproved(selectedEmpId)[0].checkinComments[QUARTER]}
              </div>
            )}
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add your check-in observation, feedback, and guidance…"
              rows={3} style={{ marginBottom: 12, resize: 'vertical' }}
            />
            <button onClick={handleSaveComment} className="btn btn-primary" disabled={!comment.trim()}>
              {commentSaved ? '✓ Comment Saved' : 'Save Check-in Comment'}
            </button>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Return Goals for Rework</h2>
            <div className="form-group">
              <label>Reason for Return *</label>
              <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                placeholder="Explain what needs to be revised…" rows={4} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReturnModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleReturn} className="btn btn-danger" disabled={!returnReason.trim()}>
                Return to Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
