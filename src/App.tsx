import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionsPage from './pages/Transactions';
import AnalyticsPage from './pages/Analytics';
import CalendarPage from './pages/Calendar';
import SettingsPage from './pages/Settings';
import PinLock from './components/PinLock';
import { useAppContext } from './context/AppContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return isUnlocked ? <>{children}</> : <PinLock onSuccess={() => setIsUnlocked(true)} />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAppContext();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
