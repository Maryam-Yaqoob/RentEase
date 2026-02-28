import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Navbar as BSNavbar, Container, Nav } from 'react-bootstrap';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050 }}
    >
      <BSNavbar className="navbar-custom py-3">
        <Container>
          <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <div className="logo-circle">
              <span>R</span>
            </div>
            <span className="fs-4 fw-bold gradient-text">
              RentEase
            </span>
          </BSNavbar.Brand>

          <Nav className="ms-auto align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="d-flex align-items-center gap-3 me-3">
                  <div className="avatar">
                    <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="mb-0 fw-semibold small text-dark">{user?.full_name}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      {user?.role}
                    </p>
                  </div>
                </div>
                
                <Link
                  to={user?.role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard'}
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Dashboard
                </Link>
                
                <button
                  onClick={logout}
                  className="btn btn-light rounded-3 fw-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-gradient text-decoration-none"
                >
                  Get Started
                </Link>
              </>
            )}
          </Nav>
        </Container>
      </BSNavbar>
    </motion.div>
  );
};

export default Navbar;
