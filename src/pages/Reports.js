import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Reports({ user }) {
  const { users, goals, computeProgress } = useApp();
  const [activeTab, setActiveTab] = useState('achievement');

  const employees = users.filter(u => u.role === 'employee');
  const allApprovedGoals = goals.filter(g => g.status === 'approved');

  // Achievement data per employee
  const achievementData = employees.map(emp => {
    const empGoals = allApprovedGoals.filter(g => g.employeeId === emp.id);
    const q2Progresses = empGoals.map(g => computeProgress(g, 'Q2')).filter(p => p !== null);
    const avg = q2Progresses.length ? q2Progresses.reduce((a, b) => a + b, 0) / q2Progresses.length : 0;
    return { name: emp.name.split(' ')[0], progress: Math.round(avg), goals: empGoals.length, dept: emp.department };
  });

  // QoQ trend data
  const qoqData = QUARTERS.map(q => {
    const allProgress = allApprovedGoals
      .map(g => computeProgress(g, q))
      .filter(p => p !== null);
    const avg = allProgress.length ? allProgress.reduce((a, b) => a + b, 0) / allProgress.length : 0;
    return { quarter: q, avgProgress: Math.round(avg), count: allProgress.length };
  });

  // Department breakdown
  const depts = [...new Set(employees.map(e => e.department))];
  const deptData = depts.map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const deptGoals = allApprovedGoals.filter(g => deptEmps.some(e => e.id === g.employeeId));
    const progresses = deptGoals.map(g => computeProgress(g, 'Q2')).filter(p => p !== null);
    const avg = progresses.length ? progresses.reduce((a, b) => a + b, 0) / progresses.length : 0;
    return { dept, avg: Math.round(avg), goalCount: deptGoals.length, empCount: deptEmps.length };
  });

  // Export CSV
  const exportCSV = () => {
    const headers = ['Employee', 'Department', 'Goal', 'Thrust Area', 'UoM', 'Weightage', 'Target', 'Q1 Actual', 'Q2 Actual', 'Q1 Progress%', 'Q2 Progress%', 'Status'];
    const rows = allApprovedGoals.map(g => {
      const emp = users.find(u => u.id === g.employeeId);
      return [
        emp?.name, emp?.department, g.title, g.thrustArea, g.uom, g.weightage,
        g.target,
        g.quarterlyActuals?.Q1 ?? '',
        g.quarterlyActuals?.Q2 ?? '',
        computeProgress(g, 'Q1')?.toFixed(1) ?? '',
        computeProgress(g, 'Q2')?.toFixed(1) ?? '',
        g.quarterlyStatus?.Q2 ?? 'Not Updated',
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'AtomQuest_Achievement_Report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name.includes('%') || p.name === 'avgProgress' || p.name === 'progress' ? '%' : ''}</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>FY 2025–26 Goal Achievement Overview</p>
        </div>
        <button onClick={exportCSV} className="btn btn-success">
          ↓ Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="label">Total Goals</div>
          <div className="value" style={{ color: 'var(--accent2)' }}>{allApprovedGoals.length}</div>
          <div className="sub">Approved across all employees</div>
        </div>
        <div className="stat-card">
          <div className="label">Q2 Completion Rate</div>
          <div className="value" style={{ color: 'var(--green2)' }}>
            {allApprovedGoals.length ? Math.round((allApprovedGoals.filter(g => g.quarterlyActuals?.Q2 !== null).length / allApprovedGoals.length) * 100) : 0}%
          </div>
          <div className="sub">Goals with Q2 actuals</div>
        </div>
        <div className="stat-card">
          <div className="label">On Track Goals</div>
          <div className="value" style={{ color: 'var(--yellow2)' }}>
            {allApprovedGoals.filter(g => g.quarterlyStatus?.Q2 === 'On Track').length}
          </div>
          <div className="sub">Status: On Track</div>
        </div>
        <div className="stat-card">
          <div className="label">Completed Goals</div>
          <div className="value" style={{ color: 'var(--purple)' }}>
            {allApprovedGoals.filter(g => g.quarterlyStatus?.Q2 === 'Completed').length}
          </div>
          <div className="sub">Status: Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['achievement', 'trend', 'department', 'detail'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievement Chart */}
      {activeTab === 'achievement' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Employee Q2 Progress (%)</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={achievementData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="progress" name="Progress %" radius={[6, 6, 0, 0]}>
                {achievementData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.progress >= 90 ? '#10b981' : entry.progress >= 60 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* QoQ Trend */}
      {activeTab === 'trend' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Quarter-on-Quarter Avg Progress</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qoqData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={customTooltip} />
              <Line type="monotone" dataKey="avgProgress" name="Avg Progress %" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department breakdown */}
      {activeTab === 'department' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 20 }}>Department Performance</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="avg" name="Avg Progress %" radius={[6, 6, 0, 0]}>
                {deptData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="table-wrap" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr><th>Department</th><th>Employees</th><th>Total Goals</th><th>Avg Q2 Progress</th></tr>
              </thead>
              <tbody>
                {deptData.map(d => (
                  <tr key={d.dept}>
                    <td style={{ fontWeight: 500 }}>{d.dept}</td>
                    <td style={{ color: 'var(--text2)' }}>{d.empCount}</td>
                    <td style={{ color: 'var(--text2)' }}>{d.goalCount}</td>
                    <td>
                      <span style={{ color: d.avg >= 90 ? 'var(--green2)' : d.avg >= 60 ? 'var(--yellow2)' : 'var(--red2)', fontWeight: 600 }}>
                        {d.avg}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      {activeTab === 'detail' && (
        <div className="card">
          <div className="section-header">
            <span className="section-title">Achievement Detail Report</span>
            <button onClick={exportCSV} className="btn btn-ghost btn-sm">↓ Export</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>UoM</th>
                  <th>Weight</th>
                  <th>Target</th>
                  <th>Q1 Actual</th>
                  <th>Q2 Actual</th>
                  <th>Q2 Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allApprovedGoals.map(g => {
                  const emp = users.find(u => u.id === g.employeeId);
                  const progress = computeProgress(g, 'Q2');
                  return (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 500 }}>{emp?.name}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</td>
                      <td>{g.uom}</td>
                      <td>{g.weightage}%</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>
                        {g.uom === 'Timeline' ? g.target : Number(g.target).toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--text2)' }}>
                        {g.quarterlyActuals?.Q1 !== null && g.quarterlyActuals?.Q1 !== undefined
                          ? (g.uom === 'Timeline' ? g.quarterlyActuals.Q1 : Number(g.quarterlyActuals.Q1).toLocaleString())
                          : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', color: 'var(--text2)' }}>
                        {g.quarterlyActuals?.Q2 !== null && g.quarterlyActuals?.Q2 !== undefined
                          ? (g.uom === 'Timeline' ? g.quarterlyActuals.Q2 : Number(g.quarterlyActuals.Q2).toLocaleString())
                          : '—'}
                      </td>
                      <td>
                        {progress !== null ? (
                          <span style={{ fontWeight: 600, color: progress >= 90 ? 'var(--green2)' : progress >= 60 ? 'var(--yellow2)' : 'var(--red2)' }}>
                            {progress.toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {g.quarterlyStatus?.Q2
                          ? <span className={`badge ${g.quarterlyStatus.Q2 === 'Completed' ? 'badge-approved' : g.quarterlyStatus.Q2 === 'On Track' ? 'badge-active' : 'badge-pending'}`}>
                            {g.quarterlyStatus.Q2}
                          </span>
                          : <span className="badge badge-locked">No Update</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
