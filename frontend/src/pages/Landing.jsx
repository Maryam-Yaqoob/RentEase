import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const dashboard = user?.role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
      navigate(dashboard);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-vh-100">
      <Navbar />
      <HeroSection />
      
      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-5"
      >
        <Container className="py-5">
          <h2 className="fs-1 fw-bold text-center mb-5 text-dark">
            Why Choose RentEase?
          </h2>
          
          <Row className="g-4">
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="card-custom p-4 text-center h-100"
              >
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-3" 
                     style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, var(--primary-color), #1e40af)' }}>
                  <span style={{ fontSize: '2rem' }}>🔍</span>
                </div>
                <h3 className="fs-5 fw-bold text-dark mb-2">Easy Search</h3>
                <p className="text-muted mb-0">
                  Find your perfect home with our intuitive search and filter system
                </p>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="card-custom p-4 text-center h-100"
              >
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-3" 
                     style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, var(--secondary-color), #6d28d9)' }}>
                  <span style={{ fontSize: '2rem' }}>🔒</span>
                </div>
                <h3 className="fs-5 fw-bold text-dark mb-2">Secure Platform</h3>
                <p className="text-muted mb-0">
                  Your data is protected with industry-standard security measures
                </p>
              </motion.div>
            </Col>

            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="card-custom p-4 text-center h-100"
              >
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-3" 
                     style={{ width: '4rem', height: '4rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <span style={{ fontSize: '2rem' }}>⚡</span>
                </div>
                <h3 className="fs-5 fw-bold text-dark mb-2">Quick Process</h3>
                <p className="text-muted mb-0">
                  Apply for properties and get responses faster than ever
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.section>
    </div>
  );
};

export default Landing;
