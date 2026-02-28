import { motion } from 'framer-motion';
import { Card, Badge, Button } from 'react-bootstrap';

const ApplicationCard = ({ application, isLandlord = false, onStatusUpdate }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="card-custom">
        <Card.Body>
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="flex-fill">
              <h3 className="fs-5 fw-bold text-dark mb-1">
                {application.property_title}
              </h3>
              <div className="d-flex align-items-center text-muted small">
                <svg style={{ width: '1rem', height: '1rem' }} className="me-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {application.property_location}
              </div>
            </div>
            <Badge bg={getStatusVariant(application.status)} className={`badge-${application.status} ms-2`}>
              {application.status}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Rent:</span>
              <span className="fw-semibold text-dark">${application.property_rent_price}/month</span>
            </div>
            
            {isLandlord && (
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Applicant:</span>
                <span className="fw-semibold text-dark">{application.tenant_name}</span>
              </div>
            )}

            <div className="d-flex justify-content-between small">
              <span className="text-muted">Applied:</span>
              <span className="fw-semibold text-dark">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {application.message && (
            <div className="p-3 bg-light rounded-3 mb-3">
              <p className="small text-muted fst-italic mb-0">"{application.message}"</p>
            </div>
          )}

          {isLandlord && application.status === 'pending' && (
            <div className="d-flex gap-2 pt-3 border-top">
              <Button
                onClick={() => onStatusUpdate(application.id, 'approved')}
                variant="success"
                className="flex-fill fw-semibold"
              >
                Approve
              </Button>
              <Button
                onClick={() => onStatusUpdate(application.id, 'rejected')}
                variant="danger"
                className="flex-fill fw-semibold"
              >
                Reject
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ApplicationCard;
