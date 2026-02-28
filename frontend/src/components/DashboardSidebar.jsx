import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Nav } from 'react-bootstrap';

const DashboardSidebar = ({ role }) => {
  const location = useLocation();

  const tenantLinks = [
    { name: 'Browse Properties', icon: '🏠', path: '/tenant/dashboard' },
    { name: 'My Applications', icon: '📝', path: '/tenant/dashboard?tab=applications' },
    { name: 'My Bookings', icon: '📅', path: '/tenant/bookings' },
    { name: 'My Favorites', icon: '❤️', path: '/tenant/favorites' },
  ];

  const landlordLinks = [
    { name: 'My Properties', icon: '🏢', path: '/landlord/dashboard' },
    { name: 'Bookings', icon: '📅', path: '/landlord/dashboard?tab=bookings' },
    { name: 'Applications', icon: '📋', path: '/landlord/dashboard?tab=applications' },
    { name: 'Add Property', icon: '➕', path: '/landlord/dashboard?tab=add' },
  ];

  const links = role === 'tenant' ? tenantLinks : landlordLinks;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sidebar-custom position-sticky"
      style={{ top: '6rem' }}
    >
      <h2 className="fs-4 fw-bold text-dark mb-4 text-capitalize">
        {role} Dashboard
      </h2>
      
      <Nav className="flex-column gap-1">
        {links.map((link) => {
          const isActive = location.pathname + location.search === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`sidebar-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`}
            >
              <span className="fs-5">{link.icon}</span>
              <span className="fw-medium">{link.name}</span>
            </Link>
          );
        })}
      </Nav>
    </motion.div>
  );
};

export default DashboardSidebar;
