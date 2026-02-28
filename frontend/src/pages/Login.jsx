import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboard = user?.role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
      navigate(dashboard);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      success('Login successful! Welcome back.');
      const dashboard = user?.role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
      navigate(dashboard);
    } else {
      showError(result.error || 'Login failed. Please check your credentials.');
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      {/* Background Animation */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '24rem',
            height: '24rem',
            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.4))',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="position-relative glass rounded-4 p-5 w-100"
        style={{ maxWidth: '28rem' }}
      >
        {/* Logo */}
        <div className="text-center mb-5">
          <Link to="/" className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none">
            <div className="logo-circle" style={{ width: '3rem', height: '3rem' }}>
              <span>R</span>
            </div>
            <span className="fs-3 fw-bold gradient-text">
              RentEase
            </span>
          </Link>
          <h2 className="fs-4 fw-bold text-dark">Welcome Back</h2>
          <p className="text-muted">Sign in to continue to your account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-danger mb-4"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control form-control-custom"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control form-control-custom"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gradient w-100"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold" style={{ color: 'var(--primary-color)' }}>
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
