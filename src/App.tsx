import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { RequestsPage } from './pages/RequestsPage';
import { CalendarPage } from './pages/CalendarPage';
import { DecisionEnginePage } from './pages/DecisionEnginePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }
  return <>{children}</>;
}

function ConnectionStatus() {
  return (
    <div className="connection-status">
      <div className="connection-dot online" />
      <span>Live</span>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />

        {/* Protected App */}
        <Route path="/app/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/app/requests" element={
          <ProtectedRoute><RequestsPage /></ProtectedRoute>
        } />
        <Route path="/app/calendar" element={
          <ProtectedRoute><CalendarPage /></ProtectedRoute>
        } />
        <Route path="/app/decision-engine" element={
          <ProtectedRoute><DecisionEnginePage /></ProtectedRoute>
        } />
        <Route path="/app/employees" element={
          <ProtectedRoute><EmployeesPage /></ProtectedRoute>
        } />
        <Route path="/app/analytics" element={
          <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
        } />
        <Route path="/app/settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && <ConnectionStatus />}
    </BrowserRouter>
  );
}
