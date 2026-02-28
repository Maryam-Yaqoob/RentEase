import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import Bookings from './pages/tenant/Bookings';
import Favorites from './pages/tenant/Favorites';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/tenant/dashboard"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <TenantDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenant/bookings"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <Bookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenant/favorites"
              element={
                <ProtectedRoute requiredRole="tenant">
                  <Favorites />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/landlord/dashboard"
              element={
                <ProtectedRoute requiredRole="landlord">
                  <LandlordDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
