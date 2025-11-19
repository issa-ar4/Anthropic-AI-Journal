import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import JournalPage from '@/pages/JournalPage';
import InsightsPage from '@/pages/InsightsPage';
import CanvasPage from '@/pages/CanvasPage';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/ToastContainer';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
      />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route 
        path="/journal" 
        element={
          isAuthenticated ? (
            <Layout>
              <JournalPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route 
        path="/insights" 
        element={
          isAuthenticated ? (
            <Layout>
              <InsightsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
      <Route 
        path="/canvas" 
        element={
          isAuthenticated ? (
            <Layout>
              <CanvasPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
