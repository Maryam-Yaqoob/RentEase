import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const HeroSection = () => {
  return (
    <div className="position-relative min-vh-100 d-flex align-items-center justify-content-center overflow-hidden">
      {/* Animated Background Elements */}
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
            top: '-10rem',
            right: '-10rem',
            width: '24rem',
            height: '24rem',
            background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.4))',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)'
          }}
        />
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
            bottom: '-10rem',
            left: '-10rem',
            width: '24rem',
            height: '24rem',
            background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.4))',
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Content */}
      <Container className="position-relative" style={{ zIndex: 10, paddingTop: '5rem', paddingBottom: '5rem' }}>
        <Row className="align-items-center justify-content-between g-5">
          {/* Text Content */}
          <Col lg={6} className="text-center text-lg-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="d-inline-block mb-4 px-4 py-2 rounded-pill fw-semibold"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', fontSize: '0.875rem' }}
              >
                🏠 Welcome to RentEase
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="display-2 fw-bold mb-4 gradient-text"
              >
                Find Your Perfect Home Easily
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="fs-5 text-muted mb-5"
              >
                Connect with landlords, discover amazing properties, and manage your rental journey all in one place. 
                Simple, secure, and seamless.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start"
              >
                <Link to="/register" className="btn btn-gradient text-decoration-none">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary-custom text-decoration-none">
                  Sign In
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-5"
              >
                <Row className="g-4 mx-auto mx-lg-0" style={{ maxWidth: '28rem' }}>
                  <Col xs={4} className="text-center text-lg-start">
                    <div className="fs-2 fw-bold" style={{ color: 'var(--primary-color)' }}>500+</div>
                    <div className="small text-muted">Properties</div>
                  </Col>
                  <Col xs={4} className="text-center text-lg-start">
                    <div className="fs-2 fw-bold" style={{ color: 'var(--primary-color)' }}>1000+</div>
                    <div className="small text-muted">Happy Tenants</div>
                  </Col>
                  <Col xs={4} className="text-center text-lg-start">
                    <div className="fs-2 fw-bold" style={{ color: 'var(--primary-color)' }}>200+</div>
                    <div className="small text-muted">Landlords</div>
                  </Col>
                </Row>
              </motion.div>
            </motion.div>
          </Col>

          {/* Illustration */}
          <Col lg={6} className="position-relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="position-relative mx-auto"
              style={{ maxWidth: '32rem' }}
            >
              {/* Floating Cards */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="card-custom p-4 position-absolute top-0 end-0"
                style={{ width: '16rem', transform: 'rotate(6deg)' }}
              >
                <div className="w-100 rounded-3 mb-3 overflow-hidden" style={{ height: '10rem' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop" 
                    alt="Modern Apartment"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="fw-semibold text-dark mb-1">Modern Apartment</h3>
                <p className="small text-muted mb-0">$1,200/month</p>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 20, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="card-custom p-4 position-absolute bottom-0 start-0"
                style={{ width: '16rem', transform: 'rotate(-6deg)' }}
              >
                <div className="w-100 rounded-3 mb-3 overflow-hidden" style={{ height: '10rem' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" 
                    alt="Cozy Studio"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="fw-semibold text-dark mb-1">Cozy Studio</h3>
                <p className="small text-muted mb-0">$850/month</p>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="card-custom p-4 mx-auto"
                style={{ width: '16rem', marginTop: '8rem' }}
              >
                <div className="w-100 rounded-3 mb-3 overflow-hidden" style={{ height: '12rem' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=350&fit=crop" 
                    alt="Luxury Penthouse"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 className="fw-semibold text-dark mb-1">Luxury Penthouse</h3>
                <p className="small text-muted mb-0">$2,500/month</p>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeroSection;
