import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useToast } from '../context/ToastContext';

const BookingCalendar = ({ property, onBookingSuccess }) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchExistingBookings();
  }, [property.id]);

  useEffect(() => {
    calculatePrice();
  }, [startDate, endDate, property.rent_price]);

  const fetchExistingBookings = async () => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/bookings/property/${property.id}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out cancelled bookings
        const activeBookings = data.filter(
          booking => booking.status !== 'cancelled'
        );
        setExistingBookings(activeBookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const calculatePrice = () => {
    if (!startDate || !endDate) {
      setTotalPrice(0);
      setDuration(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      setTotalPrice(0);
      setDuration(0);
      return;
    }

    // Calculate months between dates
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    
    setDuration(months);
    setTotalPrice(months * property.rent_price);
  };

  const isDateRangeOverlapping = (checkStart, checkEnd) => {
    const start = new Date(checkStart);
    const end = new Date(checkEnd);

    return existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      
      return (start <= bookingEnd && end >= bookingStart);
    });
  };

  const validateDates = () => {
    if (!startDate || !endDate) {
      return 'Please select both start and end dates';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return 'Start date cannot be in the past';
    }

    if (end <= start) {
      return 'End date must be after start date';
    }

    if (property.available_from) {
      const availFrom = new Date(property.available_from);
      if (start < availFrom) {
        return `Property is available from ${availFrom.toLocaleDateString()}`;
      }
    }

    if (property.available_to) {
      const availTo = new Date(property.available_to);
      if (end > availTo) {
        return `Property is available until ${availTo.toLocaleDateString()}`;
      }
    }

    if (isDateRangeOverlapping(startDate, endDate)) {
      return 'Selected dates overlap with existing bookings';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateDates();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_id: property.id,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (response.ok) {
        toast.success('Booking request submitted successfully!');
        setStartDate('');
        setEndDate('');
        setTotalPrice(0);
        setDuration(0);
        fetchExistingBookings();
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to create booking');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const availFrom = property.available_from ? new Date(property.available_from) : null;
    
    if (availFrom && availFrom > today) {
      return availFrom.toISOString().split('T')[0];
    }
    
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    if (property.available_to) {
      return new Date(property.available_to).toISOString().split('T')[0];
    }
    return '';
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3 fw-bold">Book This Property</h5>
        
        {loadingBookings ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 text-muted mb-0">Loading availability...</p>
          </div>
        ) : (
          <>
            {existingBookings.length > 0 && (
              <Alert variant="info" className="mb-3">
                <small>
                  <strong>Booked dates:</strong>
                  <ul className="mb-0 mt-2">
                    {existingBookings.slice(0, 3).map((booking, idx) => (
                      <li key={idx}>
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()} ({booking.status})
                      </li>
                    ))}
                    {existingBookings.length > 3 && (
                      <li>...and {existingBookings.length - 3} more</li>
                    )}
                  </ul>
                </small>
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || getMinDate()}
                  max={getMaxDate()}
                  required
                />
              </Form.Group>

              {duration > 0 && (
                <Alert variant="success" className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="d-block mb-1">Duration: {duration} month{duration > 1 ? 's' : ''}</small>
                      <small className="d-block">Monthly rent: ${property.rent_price.toLocaleString()}</small>
                    </div>
                    <div className="text-end">
                      <strong className="fs-5">${totalPrice.toLocaleString()}</strong>
                      <small className="d-block text-muted">Total</small>
                    </div>
                  </div>
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              {property.deposit_amount && (
                <Alert variant="warning" className="mb-3">
                  <small>
                    <strong>Security Deposit:</strong> ${property.deposit_amount.toLocaleString()} (required at move-in)
                  </small>
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={loading || !startDate || !endDate}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </Button>
            </Form>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookingCalendar;
