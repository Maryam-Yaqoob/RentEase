import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import PropertyCard from '../../components/PropertyCard';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/favorites/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError('An error occurred while loading favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = () => {
    // Refresh favorites after removal
    fetchFavorites();
  };

  const handleApplyClick = (property) => {
    // Navigate to tenant dashboard with the property for booking
    navigate('/tenant/dashboard', { state: { applyToProperty: property } });
  };

  return (
    <div className="min-vh-100 pb-5">
      <Navbar />
      
      <Container className="pt-5 mt-5">
        <Row className="g-4">
          <Col lg={3}>
            <DashboardSidebar role="tenant" />
          </Col>
          <Col lg={9}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="fs-3 fw-bold text-dark">
                My Favorites ({favorites.length})
              </h2>
              <Button
                variant="outline-primary"
                onClick={() => navigate('/tenant/dashboard')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Properties
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading your favorites...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : favorites.length === 0 ? (
              <div className="card shadow-sm text-center py-5">
                <div className="card-body">
                  <span className="fs-1 d-block mb-3">❤️</span>
                  <h3 className="fs-5 fw-bold text-dark mb-2">No favorites yet</h3>
                  <p className="text-muted mb-4">
                    Save properties you like by clicking the heart icon to view them here.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/tenant/dashboard')}
                  >
                    Browse Properties
                  </Button>
                </div>
              </div>
            ) : (
              <Row className="g-4">
                {favorites.map((favorite) => {
                  // The API returns flattened favorite objects, need to reconstruct property object
                  const propertyData = {
                    id: favorite.property_id,
                    title: favorite.property_title,
                    city: favorite.property_city,
                    state: favorite.property_state,
                    rent_price: favorite.property_rent_price,
                    status: favorite.property_status,
                    location: favorite.property_city && favorite.property_state 
                      ? `${favorite.property_city}, ${favorite.property_state}` 
                      : '',
                    is_favorited: true
                  };
                  
                  return (
                    <Col md={6} key={favorite.id}>
                      <PropertyCard
                        property={propertyData}
                        onApply={() => handleApplyClick(propertyData)}
                        showFavorite={true}
                        onFavoriteChange={handleRemoveFavorite}
                      />
                    </Col>
                  );
                })}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Favorites;
