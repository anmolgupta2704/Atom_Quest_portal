import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const STATUS_OPTIONS = ['Not Started', 'On Track', 'Completed'];

const CURRENT_QUARTER = 'Q2';

export default function CheckIn({ user }) {
  const { goals, updateActuals, computeProgress } = useApp();
  const approvedGoals = goals.filter(g => g.employeeId === user.id && g.status === 'approved');

  const [selectedQ, setSelectedQ] = useState(CURRENT_QUARTER);
  const [actuals, setActuals] = useState({});
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    Object.keys(actuals).forEach(goalId => {
      const status = statuses[goalId] || 'On Track';
      updateActuals(goalId, selectedQ, actuals[goalId], status, user.name);
    });
    setSaved(true);
    setActuals({});
    setStatuses({});
    setTimeout(() => setSaved(false), 3000);
  };

 const isWindowOpen = (q) => {
  return q === CURRENT_QUARTER;
};

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Quarterly Check-In</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          Log your actual achievements against planned targets
        </p>
      </div>

      {/* Quarter tabs */}
      <div className="tabs">
        {QUARTERS.map(q => (
          <button key={q} className={`tab ${selectedQ === q ? 'active' : ''}`} onClick={() => setSelectedQ(q)}>
            {q} {q === CURRENT_QUARTER && '⚡'}
          </button>
        ))}
      </div>

      {!isWindowOpen(selectedQ) && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ℹ {selectedQ} check-in window is {selectedQ < CURRENT_QUARTER ? 'closed' : 'not yet open'}.
          {selectedQ < CURRENT_QUARTER && ' You can view your past submissions below.'}
        </div>
      )}

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          ✓ {selectedQ} achievements saved successfully!
        </div>
      )}

      {approvedGoals.length === 0 ? (
        <div className="empty-state">
          <p>No approved goals found. Submit and get goals approved first.</p>
        </div>
      ) : (
        <>
          {approvedGoals.map(goal => {
            const existingActual = goal.quarterlyActuals?.[selectedQ];
            const existingStatus = goal.quarterlyStatus?.[selectedQ];
            const comment = goal.checkinComments?.[selectedQ];
            const progress = computeProgress(goal, selectedQ);
            const currentActual = actuals[goal.id] !== undefined ? actuals[goal.id] : (existingActual ?? '');
            const currentStatus = statuses[goal.id] || existingStatus || 'Not Started';
            const editable = isWindowOpen(selectedQ);

            return (
              <div key={goal.id} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{goal.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                      {goal.thrustArea} · UoM: {goal.uom} · Weight: {goal.weightage}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 4 }}>Target</div>
                    <div style={{ fontWeight: 600 }}>{goal.uom === 'Timeline' ? goal.target : Number(goal.target).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Actual Achievement ({selectedQ})</label>
                    <input
                      type={goal.uom === 'Timeline' ? 'date' : 'number'}
                      value={currentActual}
                      onChange={e => setActuals({ ...actuals, [goal.id]: e.target.value })}
                      placeholder={goal.uom === 'Timeline' ? '' : 'Enter actual value'}
                      disabled={!editable}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Status</label>
                    <select
                      value={currentStatus}
                      onChange={e => setStatuses({ ...statuses, [goal.id]: e.target.value })}
                      disabled={!editable}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Progress bar */}
                {progress !== null && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Computed Progress</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: progress >= 90 ? 'var(--green2)' : progress >= 60 ? 'var(--yellow2)' : 'var(--red2)' }}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${progress >= 90 ? 'green' : progress >= 60 ? 'yellow' : 'red'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Manager comment */}
                {comment && (
                  <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: 'rgba(59,130,246,0.08)', borderRadius: 8,
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Manager Check-in Comment
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{comment}</div>
                  </div>
                )}
              </div>
            );
          })}

          {isWindowOpen(selectedQ) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={handleSave} className="btn btn-success" disabled={Object.keys(actuals).length === 0}>
                Save {selectedQ} Achievements ✓
              </button>
            </div>
          )}
        </>
      )}

      {/* Check-in schedule */}
      <div className="card" style={{ marginTop: 32 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Check-In Schedule</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Window Opens</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Goal Setting</td><td>1st May</td><td>Goal Creation & Approval</td><td><span className="badge badge-approved">Done</span></td></tr>
              <tr><td>Q1 Check-in</td><td>July</td><td>Progress Update</td><td><span className="badge badge-approved">Closed</span></td></tr>
              <tr style={{ background: 'rgba(59,130,246,0.05)' }}>
                <td><strong>Q2 Check-in</strong></td><td><strong>October</strong></td><td>Progress Update</td>
                <td><span className="badge badge-active">⚡ Active</span></td>
              </tr>
              <tr><td>Q3 Check-in</td><td>January</td><td>Progress Update</td><td><span className="badge badge-locked">Upcoming</span></td></tr>
              <tr><td>Q4 / Annual</td><td>March/April</td><td>Final Achievement</td><td><span className="badge badge-locked">Upcoming</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
