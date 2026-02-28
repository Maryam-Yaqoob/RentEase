import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/Navbar';

const Bookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/bookings/my-bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by created_at descending (newest first)
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setBookings(sortedData);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError('An error occurred while loading bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    try {
      setCancellingId(selectedBooking.id);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/bookings/${selectedBooking.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }
      );

      if (response.ok) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to cancel booking');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancellingId(null);
      setShowCancelDialog(false);
      setSelectedBooking(null);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    return months;
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
              <h2 className="fs-3 fw-bold text-dark">My Bookings</h2>
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
                <p className="mt-3 text-muted">Loading your bookings...</p>
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : bookings.length === 0 ? (
              <Card className="shadow-sm text-center py-5">
                <Card.Body>
                  <span className="fs-1 d-block mb-3">📅</span>
                  <h3 className="fs-5 fw-bold text-dark mb-2">No bookings yet</h3>
                  <p className="text-muted mb-4">
                    You haven't made any booking requests yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/tenant/dashboard')}
                  >
                    Browse Properties
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-4">
                {bookings.map((booking) => (
                  <Col md={12} key={booking.id}>
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <Row>
                          <Col md={8}>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div>
                                <h5 className="fw-bold mb-1">
                                  {booking.property.title}
                                </h5>
                                <p className="text-muted mb-2">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {booking.property.city && booking.property.state
                                    ? `${booking.property.city}, ${booking.property.state}`
                                    : booking.property.location}
                                </p>
                              </div>
                              <Badge bg={getStatusVariant(booking.status)}>
                                {booking.status.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="row g-3 mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">Check-in</small>
                                <strong>{formatDate(booking.start_date)}</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Check-out</small>
                                <strong>{formatDate(booking.end_date)}</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Duration</small>
                                <strong>
                                  {calculateDuration(booking.start_date, booking.end_date)} month
                                  {calculateDuration(booking.start_date, booking.end_date) > 1 ? 's' : ''}
                                </strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Total Amount</small>
                                <strong className="text-primary">
                                  ${(booking.property.rent_price * 
                                     calculateDuration(booking.start_date, booking.end_date)).toLocaleString()}
                                </strong>
                              </div>
                            </div>

                            <div className="border-top pt-3">
                              <small className="text-muted d-block mb-1">Landlord</small>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                                <div>
                                  <strong className="d-block">{booking.property.owner.full_name}</strong>
                                  <small className="text-muted">{booking.property.owner.email}</small>
                                </div>
                              </div>
                            </div>
                          </Col>

                          <Col md={4} className="d-flex flex-column justify-content-between">
                            <div>
                              <small className="text-muted d-block mb-2">Property Details</small>
                              <div className="mb-2">
                                <i className="bi bi-house-door me-2 text-muted"></i>
                                <small>{booking.property.property_type || 'Property'}</small>
                              </div>
                              <div className="mb-2">
                                <i className="bi bi-door-closed me-2 text-muted"></i>
                                <small>{booking.property.bedrooms || 'N/A'} Bedrooms</small>
                              </div>
                              <div className="mb-2">
                                <i className="bi bi-droplet me-2 text-muted"></i>
                                <small>{booking.property.bathrooms || 'N/A'} Bathrooms</small>
                              </div>
                              <div className="mb-2">
                                <i className="bi bi-cash me-2 text-muted"></i>
                                <small>${booking.property.rent_price.toLocaleString()}/month</small>
                              </div>
                            </div>

                            {booking.status === 'pending' && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="mt-3"
                                onClick={() => handleCancelClick(booking)}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-x-circle me-2"></i>
                                    Cancel Booking
                                  </>
                                )}
                              </Button>
                            )}

                            {booking.status === 'confirmed' && (
                              <Alert variant="success" className="mb-0 mt-3 py-2">
                                <small>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Confirmed by landlord
                                </small>
                              </Alert>
                            )}

                            {booking.status === 'cancelled' && (
                              <Alert variant="danger" className="mb-0 mt-3 py-2">
                                <small>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Booking cancelled
                                </small>
                              </Alert>
                            )}

                            {booking.status === 'completed' && (
                              <Alert variant="info" className="mb-0 mt-3 py-2">
                                <small>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Stay completed
                                </small>
                              </Alert>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <ConfirmDialog
        show={showCancelDialog}
        onHide={() => {
          setShowCancelDialog(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking"
        message={`Are you sure you want to cancel this booking for ${selectedBooking?.property.title}? This action cannot be undone.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        confirmVariant="danger"
        isLoading={cancellingId !== null}
      />
    </div>
  );
};

export default Bookings;
