import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboard = user?.role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
      navigate(dashboard);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await signup(userData);

    if (result.success) {
      success('Account created successfully! Please login to continue.', 4000);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } else {
      showError(result.error || 'Registration failed. Please try again.');
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
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '24rem',
            height: '24rem',
            background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.4))',
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
          <h2 className="fs-4 fw-bold text-dark">Create Account</h2>
          <p className="text-muted">Join RentEase today</p>
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
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-control form-control-custom"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control form-control-custom"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              I am a...
            </label>
            <div className="row g-3">
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'tenant' })}
                  className={`w-100 p-3 rounded-3 border-2 ${
                    formData.role === 'tenant'
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-secondary-subtle'
                  }`}
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="fs-2 d-block mb-2">🏠</span>
                  <span className="fw-semibold text-dark">Tenant</span>
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'landlord' })}
                  className={`w-100 p-3 rounded-3 border-2 ${
                    formData.role === 'landlord'
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-secondary-subtle'
                  }`}
                  style={{ transition: 'all 0.3s' }}
                >
                  <span className="fs-2 d-block mb-2">🏢</span>
                  <span className="fw-semibold text-dark">Landlord</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control form-control-custom"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: 'var(--primary-color)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
