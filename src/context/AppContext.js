import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const USERS = [
  { id: 'emp1', name: 'Arjun Sharma', email: 'arjun@atomquest.in', password: 'emp123', role: 'employee', department: 'Sales', managerId: 'mgr1', avatar: 'AS' },
  { id: 'emp2', name: 'Priya Gupta', email: 'priya@atomquest.in', password: 'emp123', role: 'employee', department: 'Sales', managerId: 'mgr1', avatar: 'PG' },
  { id: 'emp3', name: 'Rohit Verma', email: 'rohit@atomquest.in', password: 'emp123', role: 'employee', department: 'Engineering', managerId: 'mgr2', avatar: 'RV' },
  { id: 'mgr1', name: 'Neha Agarwal', email: 'neha@atomquest.in', password: 'mgr123', role: 'manager', department: 'Sales', managerId: 'admin1', avatar: 'NA' },
  { id: 'mgr2', name: 'Suresh Yadav', email: 'suresh@atomquest.in', password: 'mgr123', role: 'manager', department: 'Engineering', managerId: 'admin1', avatar: 'SY' },
  { id: 'admin1', name: 'HR Admin', email: 'admin@atomquest.in', password: 'admin123', role: 'admin', department: 'HR', avatar: 'HR' },
];

const THRUST_AREAS = [
  'Revenue Growth', 'Customer Satisfaction', 'Operational Efficiency',
  'People Development', 'Innovation & Technology', 'Risk & Compliance',
  'Cost Optimisation', 'Market Expansion',
];

const INITIAL_GOALS = [
  {
    id: 'g1', employeeId: 'emp1', thrustArea: 'Revenue Growth',
    title: 'Achieve Q1 Sales Target', description: 'Close deals worth ₹50L in Q1',
    uom: 'Min', target: 5000000, weightage: 40, status: 'approved',
    quarterlyActuals: { Q1: 4200000, Q2: 4800000, Q3: null, Q4: null },
    quarterlyStatus: { Q1: 'On Track', Q2: 'On Track', Q3: null, Q4: null },
    checkinComments: { Q1: 'Good progress, keep it up!', Q2: 'On track for the year.' },
    isShared: false, lockedAt: '2025-05-10',
  },
  {
    id: 'g2', employeeId: 'emp1', thrustArea: 'Customer Satisfaction',
    title: 'Maintain NPS Score', description: 'Achieve NPS ≥ 70',
    uom: 'Min', target: 70, weightage: 30, status: 'approved',
    quarterlyActuals: { Q1: 72, Q2: 68, Q3: null, Q4: null },
    quarterlyStatus: { Q1: 'Completed', Q2: 'On Track', Q3: null, Q4: null },
    checkinComments: { Q1: 'Excellent! Above target.', Q2: 'Slightly dipped, monitor closely.' },
    isShared: false, lockedAt: '2025-05-10',
  },
  {
    id: 'g3', employeeId: 'emp1', thrustArea: 'People Development',
    title: 'Complete Leadership Training', description: 'Finish 2 leadership modules',
    uom: 'Timeline', target: '2025-12-31', weightage: 30, status: 'approved',
    quarterlyActuals: { Q1: null, Q2: '2025-10-15', Q3: null, Q4: null },
    quarterlyStatus: { Q1: 'Not Started', Q2: 'On Track', Q3: null, Q4: null },
    checkinComments: { Q1: 'Not yet started.', Q2: 'Module 1 done.' },
    isShared: false, lockedAt: '2025-05-10',
  },
  {
    id: 'g4', employeeId: 'emp2', thrustArea: 'Revenue Growth',
    title: 'New Client Acquisition', description: 'Onboard 5 new enterprise clients',
    uom: 'Min', target: 5, weightage: 50, status: 'pending',
    quarterlyActuals: { Q1: null, Q2: null, Q3: null, Q4: null },
    quarterlyStatus: { Q1: null, Q2: null, Q3: null, Q4: null },
    checkinComments: {},
    isShared: false, lockedAt: null,
  },
  {
    id: 'g5', employeeId: 'emp2', thrustArea: 'Operational Efficiency',
    title: 'Reduce Follow-up TAT', description: 'Reduce avg follow-up time to < 2 days',
    uom: 'Max', target: 2, weightage: 50, status: 'pending',
    quarterlyActuals: { Q1: null, Q2: null, Q3: null, Q4: null },
    quarterlyStatus: { Q1: null, Q2: null, Q3: null, Q4: null },
    checkinComments: {},
    isShared: false, lockedAt: null,
  },
];

const INITIAL_AUDIT_LOGS = [
  { id: 'al1', timestamp: '2025-05-10T10:00:00', user: 'Neha Agarwal', action: 'Goal Approved', details: 'Approved goals for Arjun Sharma', targetUser: 'emp1' },
  { id: 'al2', timestamp: '2025-07-05T14:30:00', user: 'Arjun Sharma', action: 'Q1 Actuals Updated', details: 'Updated Q1 actuals for Revenue Growth goal', targetUser: 'emp1' },
  { id: 'al3', timestamp: '2025-07-06T09:00:00', user: 'Neha Agarwal', action: 'Check-in Comment Added', details: 'Q1 check-in comment added for Arjun Sharma', targetUser: 'emp1' },
];

const CYCLES = [
  { id: 'cy1', year: 2025, phase: 'Q2 Check-in', status: 'active', opens: '2025-10-01', closes: '2025-10-31' },
  { id: 'cy2', year: 2026, phase: 'Goal Setting', status: 'upcoming', opens: '2026-05-01', closes: '2026-05-31' },
];

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [cycles, setCycles] = useState(CYCLES);

  const addLog = (user, action, details, targetUser) => {
    const log = {
      id: 'al' + Date.now(),
      timestamp: new Date().toISOString(),
      user, action, details, targetUser,
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const submitGoals = (employeeId, newGoals) => {
    const cleaned = newGoals.map(g => ({
      ...g,
      id: g.id || 'g' + Date.now() + Math.random(),
      employeeId,
      status: 'pending',
      quarterlyActuals: { Q1: null, Q2: null, Q3: null, Q4: null },
      quarterlyStatus: { Q1: null, Q2: null, Q3: null, Q4: null },
      checkinComments: {},
      lockedAt: null,
    }));
    setGoals(prev => [
      ...prev.filter(g => g.employeeId !== employeeId || g.status === 'approved'),
      ...cleaned,
    ]);
    const emp = USERS.find(u => u.id === employeeId);
    addLog(emp?.name, 'Goals Submitted', `${cleaned.length} goals submitted for approval`, employeeId);
  };

  const approveGoals = (employeeId, updatedGoals, managerName) => {
    const lockDate = new Date().toISOString().split('T')[0];
    setGoals(prev => prev.map(g => {
      if (g.employeeId !== employeeId) return g;
      const updated = updatedGoals.find(u => u.id === g.id);
      if (!updated) return g;
      return { ...g, ...updated, status: 'approved', lockedAt: lockDate };
    }));
    addLog(managerName, 'Goals Approved', `Goals approved for employee ${employeeId}`, employeeId);
  };

  const returnGoals = (employeeId, reason, managerName) => {
    setGoals(prev => prev.map(g =>
      g.employeeId === employeeId && g.status === 'pending'
        ? { ...g, status: 'returned', returnReason: reason }
        : g
    ));
    addLog(managerName, 'Goals Returned', reason, employeeId);
  };

  const updateActuals = (goalId, quarter, actual, status, employeeName) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        quarterlyActuals: { ...g.quarterlyActuals, [quarter]: actual },
        quarterlyStatus: { ...g.quarterlyStatus, [quarter]: status },
      };
    }));
    addLog(employeeName, 'Actuals Updated', `${quarter} actuals updated`, goalId);
  };

  const addCheckinComment = (employeeId, quarter, comment, managerName) => {
    setGoals(prev => prev.map(g => {
      if (g.employeeId !== employeeId) return g;
      return { ...g, checkinComments: { ...g.checkinComments, [quarter]: comment } };
    }));
    addLog(managerName, 'Check-in Comment Added', `${quarter} check-in for employee ${employeeId}`, employeeId);
  };

  const unlockGoal = (goalId, reason, adminName) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, status: 'unlocked', lockedAt: null } : g
    ));
    addLog(adminName, 'Goal Unlocked', reason, goalId);
  };

  const pushSharedGoal = (employeeIds, sharedGoal, adminName) => {
    const newGoals = employeeIds.map(empId => ({
      ...sharedGoal,
      id: 'sg' + Date.now() + empId,
      employeeId: empId,
      isShared: true,
      status: 'approved',
      lockedAt: new Date().toISOString().split('T')[0],
      quarterlyActuals: { Q1: null, Q2: null, Q3: null, Q4: null },
      quarterlyStatus: { Q1: null, Q2: null, Q3: null, Q4: null },
      checkinComments: {},
    }));
    setGoals(prev => [...prev, ...newGoals]);
    addLog(adminName, 'Shared Goal Pushed', `Shared goal "${sharedGoal.title}" pushed to ${employeeIds.length} employees`, 'multiple');
  };

  const computeProgress = (goal, quarter = 'Q2') => {
    const actual = goal.quarterlyActuals?.[quarter];
    if (actual === null || actual === undefined) return null;
    const target = goal.target;
    if (goal.uom === 'Min') return Math.min((actual / target) * 100, 150);
    if (goal.uom === 'Max') return Math.min((target / actual) * 100, 150);
    if (goal.uom === 'Zero') return actual === 0 ? 100 : 0;
    if (goal.uom === 'Timeline') {
      const deadline = new Date(target);
      const completion = new Date(actual);
      return completion <= deadline ? 100 : Math.max(0, 100 - ((completion - deadline) / (1000 * 3600 * 24)) * 2);
    }
    return null;
  };

  return (
    <AppContext.Provider value={{
      users: USERS, goals, auditLogs, cycles, thrustAreas: THRUST_AREAS,
      submitGoals, approveGoals, returnGoals, updateActuals,
      addCheckinComment, unlockGoal, pushSharedGoal, computeProgress,
      setCycles,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
