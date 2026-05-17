import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GoalSheet from './pages/GoalSheet';
import CheckIn from './pages/CheckIn';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import './App.css';

function ProtectedRoute({ children, allowedRoles, user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect({ user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/employee" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/" element={<RootRedirect user={user} />} />

          <Route path="/employee" element={
            <ProtectedRoute user={user} allowedRoles={['employee']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <EmployeeDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/goals" element={
            <ProtectedRoute user={user} allowedRoles={['employee']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <GoalSheet user={user} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/checkin" element={
            <ProtectedRoute user={user} allowedRoles={['employee']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <CheckIn user={user} />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/manager" element={
            <ProtectedRoute user={user} allowedRoles={['manager']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <ManagerDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute user={user} allowedRoles={['admin']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <AdminDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'manager']}>
              <Layout user={user} onLogout={() => setUser(null)}>
                <Reports user={user} />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
