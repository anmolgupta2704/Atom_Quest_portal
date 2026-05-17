import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const UOM_OPTIONS = ['Min', 'Max', 'Timeline', 'Zero'];
const UOM_DESC = {
  Min: 'Higher is better (e.g., Sales Revenue)',
  Max: 'Lower is better (e.g., TAT, Cost)',
  Timeline: 'Date-based completion',
  Zero: 'Zero = Success (e.g., Safety incidents)',
};

function emptyGoal() {
  return { id: null, thrustArea: '', title: '', description: '', uom: 'Min', target: '', weightage: '' };
}

export default function GoalSheet({ user }) {
  const { goals, thrustAreas, submitGoals } = useApp();
  const myGoals = goals.filter(g => g.employeeId === user.id);
  const approvedGoals = myGoals.filter(g => g.status === 'approved');
  const pendingGoals = myGoals.filter(g => g.status === 'pending');
  const returnedGoals = myGoals.filter(g => g.status === 'returned');

  const isLocked = approvedGoals.length > 0 && returnedGoals.length === 0;
  const hasPending = pendingGoals.length > 0;

  const [draftGoals, setDraftGoals] = useState([]);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (returnedGoals.length > 0) {
      setDraftGoals(returnedGoals.map(g => ({ ...g })));
    } else if (!isLocked && !hasPending && draftGoals.length === 0) {
      setDraftGoals([emptyGoal()]);
    }
    // eslint-disable-next-line
  }, []);

  const totalWeight = draftGoals.reduce((s, g) => s + (Number(g.weightage) || 0), 0);

  const validate = () => {
    const e = {};
    if (draftGoals.length === 0) { e.general = 'Add at least one goal.'; return e; }
    if (draftGoals.length > 8) { e.general = 'Maximum 8 goals allowed.'; return e; }
    if (totalWeight !== 100) { e.general = `Total weightage must be exactly 100% (currently ${totalWeight}%).`; return e; }
    draftGoals.forEach((g, i) => {
      if (!g.thrustArea) e[`${i}_thrust`] = 'Required';
      if (!g.title.trim()) e[`${i}_title`] = 'Required';
      if (!g.uom) e[`${i}_uom`] = 'Required';
      if (!g.target) e[`${i}_target`] = 'Required';
      const w = Number(g.weightage);
      if (!w || w < 10) e[`${i}_weight`] = 'Min 10%';
    });
    return e;
  };

  const addGoal = () => {
    if (draftGoals.length >= 8) return;
    setDraftGoals([...draftGoals, emptyGoal()]);
    setErrors({});
  };

  const removeGoal = (idx) => {
    setDraftGoals(draftGoals.filter((_, i) => i !== idx));
    setErrors({});
  };

  const updateGoal = (idx, field, value) => {
    const updated = [...draftGoals];
    updated[idx] = { ...updated[idx], [field]: value };
    setDraftGoals(updated);
    const newErrors = { ...errors };
    delete newErrors[`${idx}_${field}`];
    delete newErrors.general;
    setErrors(newErrors);
  };

  const handleSaveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    submitGoals(user.id, draftGoals);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
        <h2 style={{ marginBottom: 8 }}>Goals Submitted!</h2>
        <p style={{ color: 'var(--text2)' }}>Your goals have been sent to your manager for approval.</p>
        <button onClick={() => setSubmitted(false)} className="btn btn-ghost" style={{ marginTop: 24 }}>
          ← Back to Goal Sheet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>My Goal Sheet</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>FY 2025–26 · {user.department}</p>
        </div>
        {!isLocked && !hasPending && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSaveDraft} className="btn btn-ghost btn-sm">
              {saved ? '✓ Saved' : '↓ Save Draft'}
            </button>
            <button onClick={handleSubmit} className="btn btn-primary btn-sm">
              Submit for Approval →
            </button>
          </div>
        )}
      </div>

      {/* Return reason */}
      {returnedGoals.length > 0 && returnedGoals[0].returnReason && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <div>
            <strong>Returned for rework:</strong> {returnedGoals[0].returnReason}
          </div>
        </div>
      )}

      {/* Locked state */}
      {isLocked && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✓ Goals approved and locked. Contact Admin to make changes after lock date ({approvedGoals[0]?.lockedAt}).
        </div>
      )}

      {hasPending && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ⏳ Goals submitted — awaiting manager approval.
        </div>
      )}

      {/* Validation error */}
      {errors.general && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          ⚠ {errors.general}
        </div>
      )}

      {/* Weight tracker */}
      {!isLocked && !hasPending && (
        <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Total Weightage ({draftGoals.length}/8 goals)</span>
            <span style={{ fontWeight: 700, color: totalWeight === 100 ? 'var(--green2)' : 'var(--yellow2)' }}>
              {totalWeight}% / 100%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className={`progress-fill ${totalWeight === 100 ? 'green' : totalWeight > 100 ? 'red' : 'blue'}`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Goals List */}
      {(isLocked ? approvedGoals : hasPending ? pendingGoals : draftGoals).map((goal, idx) => (
        <div key={goal.id || idx} className="card" style={{ marginBottom: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--text2)', fontSize: '0.85rem' }}>
              Goal #{idx + 1}
              {goal.isShared && <span className="badge badge-active" style={{ marginLeft: 10 }}>Shared — Weightage Only Editable</span>}
            </div>
            {!isLocked && !hasPending && !goal.isShared && (
              <button onClick={() => removeGoal(idx)} className="btn btn-ghost btn-sm" style={{ color: 'var(--red2)' }}>
                ✕ Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Thrust Area *</label>
              <select value={goal.thrustArea} onChange={e => updateGoal(idx, 'thrustArea', e.target.value)} disabled={isLocked || hasPending || goal.isShared}
                className={errors[`${idx}_thrust`] ? 'input-error' : ''}>
                <option value="">Select area…</option>
                {thrustAreas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors[`${idx}_thrust`] && <div className="error-msg">{errors[`${idx}_thrust`]}</div>}
            </div>
            <div className="form-group">
              <label>Unit of Measurement *</label>
              <select value={goal.uom} onChange={e => updateGoal(idx, 'uom', e.target.value)} disabled={isLocked || hasPending || goal.isShared}
                className={errors[`${idx}_uom`] ? 'input-error' : ''}>
                {UOM_OPTIONS.map(u => <option key={u} value={u}>{u} — {UOM_DESC[u]}</option>)}
              </select>
              {errors[`${idx}_uom`] && <div className="error-msg">{errors[`${idx}_uom`]}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Goal Title *</label>
            <input value={goal.title} onChange={e => updateGoal(idx, 'title', e.target.value)}
              placeholder="e.g. Achieve Q1 Sales Target" disabled={isLocked || hasPending || goal.isShared}
              className={errors[`${idx}_title`] ? 'input-error' : ''} />
            {errors[`${idx}_title`] && <div className="error-msg">{errors[`${idx}_title`]}</div>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={goal.description} onChange={e => updateGoal(idx, 'description', e.target.value)}
              placeholder="Describe how you will achieve this goal…" rows={2}
              disabled={isLocked || hasPending || goal.isShared}
              style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Target *</label>
              <input type={goal.uom === 'Timeline' ? 'date' : 'number'}
                value={goal.target} onChange={e => updateGoal(idx, 'target', e.target.value)}
                placeholder={goal.uom === 'Timeline' ? '' : 'Enter numeric target'}
                disabled={isLocked || hasPending || goal.isShared}
                className={errors[`${idx}_target`] ? 'input-error' : ''} />
              {errors[`${idx}_target`] && <div className="error-msg">{errors[`${idx}_target`]}</div>}
            </div>
            <div className="form-group">
              <label>Weightage (%) * — Min 10%</label>
              <input type="number" min={10} max={100} value={goal.weightage}
                onChange={e => updateGoal(idx, 'weightage', e.target.value)}
                placeholder="e.g. 30" disabled={isLocked || hasPending}
                className={errors[`${idx}_weight`] ? 'input-error' : ''} />
              {errors[`${idx}_weight`] && <div className="error-msg">{errors[`${idx}_weight`]}</div>}
            </div>
          </div>
        </div>
      ))}

      {/* Add Goal Button */}
      {!isLocked && !hasPending && draftGoals.length < 8 && (
        <button onClick={addGoal} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 24, borderStyle: 'dashed' }}>
          + Add Goal ({draftGoals.length}/8)
        </button>
      )}

      {/* Submit bottom */}
      {!isLocked && !hasPending && draftGoals.length > 0 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={handleSaveDraft} className="btn btn-ghost">{saved ? '✓ Saved' : 'Save Draft'}</button>
          <button onClick={handleSubmit} className="btn btn-primary">Submit for Approval →</button>
        </div>
      )}
    </div>
  );
}
