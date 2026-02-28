import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import FavoriteButton from './FavoriteButton';

const PropertyCard = ({ property, onApply, isLandlord = false, onEdit, onDelete, showFavorite = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="card-custom h-100">
        {/* Property Image Placeholder */}
        <div className="w-100 rounded-3 mb-3 overflow-hidden" style={{ height: '12rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.9))' }}>
          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
            <svg style={{ width: '5rem', height: '5rem', color: 'rgba(255, 255, 255, 0.3)' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
        </div>

        <Card.Body>
          {/* Property Info */}
          <div className="d-flex align-items-start justify-content-between mb-3">
            <h3 className="fs-5 fw-bold text-dark mb-0">
              {property.title}
            </h3>
            <div className="d-flex gap-2 align-items-center">
              {showFavorite && (
                <FavoriteButton 
                  propertyId={property.id} 
                  initialIsFavorited={property.is_favorited}
                />
              )}
              <Badge bg={property.status === 'available' ? 'success' : property.status === 'booked' ? 'warning' : 'secondary'} className="ms-2">
                {property.status}
              </Badge>
            </div>
          </div>

          <div className="d-flex align-items-center text-muted mb-2">
            <svg style={{ width: '1.25rem', height: '1.25rem' }} className="me-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="small">
              {property.city && property.state ? `${property.city}, ${property.state}` : property.location}
            </span>
          </div>

          {/* Property Details */}
          <div className="d-flex gap-3 mb-3">
            {property.bedrooms && (
              <div className="d-flex align-items-center text-muted small">
                <i className="bi bi-door-closed me-1"></i>
                {property.bedrooms} Bed
              </div>
            )}
            {property.bathrooms && (
              <div className="d-flex align-items-center text-muted small">
                <i className="bi bi-droplet me-1"></i>
                {property.bathrooms} Bath
              </div>
            )}
            {property.area_sqft && (
              <div className="d-flex align-items-center text-muted small">
                <i className="bi bi-rulers me-1"></i>
                {property.area_sqft} sqft
              </div>
            )}
          </div>

          {property.property_type && (
            <Badge bg="info" className="mb-2 text-capitalize">
              {property.property_type}
            </Badge>
          )}

          <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {property.description}
          </p>

          <div className="d-flex align-items-center justify-content-between pt-3 border-top">
            <div>
              <span className="fs-4 fw-bold" style={{ color: 'var(--primary-color)' }}>
                ${property.rent_price}
              </span>
              <span className="text-muted small">/month</span>
            </div>

            {!isLandlord && (
              <Button
                onClick={() => onApply(property.id)}
                disabled={property.status !== 'available'}
                variant={property.status === 'available' ? 'primary' : 'secondary'}
                className={property.status === 'available' ? 'btn-gradient' : ''}
              >
                Apply Now
              </Button>
            )}
          </div>

          {isLandlord && (
            <div className="d-flex gap-2 pt-3 border-top mt-3">
              <Button
                onClick={() => onEdit(property)}
                variant="outline-primary"
                className="flex-fill"
              >
                Edit
              </Button>
              <Button
                onClick={() => onDelete(property.id)}
                variant="outline-danger"
                className="flex-fill"
              >
                Delete
              </Button>
            </div>
          )}

          {property.landlord_name && (
            <div className="small text-muted pt-2">
              Listed by: <span className="fw-semibold">{property.landlord_name}</span>
            </div>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PropertyCard;
