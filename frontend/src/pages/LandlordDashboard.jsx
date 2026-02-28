import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardSidebar from '../components/DashboardSidebar';
import PropertyCard from '../components/PropertyCard';
import ApplicationCard from '../components/ApplicationCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { landlordAPI } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const LandlordDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'properties';
  
  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    rent_price: '',
    location: '',
    city: '',
    state: '',
    address: '',
    zip_code: '',
    country: 'USA',
    property_type: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    deposit_amount: '',
    available_from: '',
    available_to: '',
    status: 'available'
  });

  const { user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (activeTab === 'properties') {
      loadProperties();
    } else if (activeTab === 'applications') {
      loadApplications();
    } else if (activeTab === 'bookings') {
      loadBookings();
    } else if (activeTab === 'add') {
      setShowPropertyModal(true);
    }
  }, [activeTab]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await landlordAPI.getProperties();
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await landlordAPI.getApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const allBookings = [];
      
      // Fetch properties first to get all property IDs
      const propertiesData = await landlordAPI.getProperties();
      
      // Fetch bookings for each property
      for (const property of propertiesData) {
        const response = await fetch(
          `http://localhost:8000/api/bookings/property/${property.id}/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.ok) {
          const bookingsData = await response.json();
          // Add property info to each booking
          const bookingsWithProperty = bookingsData.map(booking => ({
            ...booking,
            property: property
          }));
          allBookings.push(...bookingsWithProperty);
        }
      }
      
      // Sort by created_at descending
      allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(allBookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyFormChange = (e) => {
    setPropertyForm({
      ...propertyForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...propertyForm,
        rent_price: parseFloat(propertyForm.rent_price),
        bedrooms: propertyForm.bedrooms ? parseInt(propertyForm.bedrooms) : 1,
        bathrooms: propertyForm.bathrooms ? parseFloat(propertyForm.bathrooms) : 1,
        area_sqft: propertyForm.area_sqft ? parseInt(propertyForm.area_sqft) : null,
        deposit_amount: propertyForm.deposit_amount ? parseFloat(propertyForm.deposit_amount) : null,
        available_from: propertyForm.available_from || null,
        available_to: propertyForm.available_to || null
      };

      console.log('Submitting property data:', data);

      if (editingProperty) {
        await landlordAPI.updateProperty(editingProperty.id, data);
        success('Property updated successfully!');
      } else {
        await landlordAPI.createProperty(data);
        success('Property created successfully!');
      }

      setShowPropertyModal(false);
      setEditingProperty(null);
      resetPropertyForm();
      loadProperties();
      window.history.pushState({}, '', '/landlord/dashboard');
    } catch (err) {
      console.error('Property submission error:', err);
      showError(err.message || 'Failed to save property');
    }
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      title: '',
      description: '',
      rent_price: '',
      location: '',
      city: '',
      state: '',
      address: '',
      zip_code: '',
      country: 'USA',
      property_type: 'apartment',
      bedrooms: '',
      bathrooms: '',
      area_sqft: '',
      deposit_amount: '',
      available_from: '',
      available_to: '',
      status: 'available'
    });
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title || '',
      description: property.description || '',
      rent_price: property.rent_price?.toString() || '',
      location: property.location || '',
      city: property.city || '',
      state: property.state || '',
      address: property.address || '',
      zip_code: property.zip_code || '',
      country: property.country || 'USA',
      property_type: property.property_type || 'apartment',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area_sqft: property.area_sqft?.toString() || '',
      deposit_amount: property.deposit_amount?.toString() || '',
      available_from: property.available_from || '',
      available_to: property.available_to || '',
      status: property.status || 'available'
    });
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (propertyId) => {
    setDeletingPropertyId(propertyId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProperty = async () => {
    try {
      await landlordAPI.deleteProperty(deletingPropertyId);
      success('Property deleted successfully!');
      setShowDeleteDialog(false);
      setDeletingPropertyId(null);
      loadProperties();
    } catch (err) {
      showError(err.message || 'Failed to delete property');
      setShowDeleteDialog(false);
    }
  };

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    try {
      await landlordAPI.updateApplicationStatus(applicationId, status);
      success(`Application ${status} successfully!`);
      loadApplications();
    } catch (err) {
      showError(err.message || 'Failed to update application status');
    }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        success(`Booking ${newStatus} successfully!`);
        loadBookings();
      } else {
        const data = await response.json();
        showError(data.detail || 'Failed to update booking status');
      }
    } catch (err) {
      showError('An error occurred. Please try again.');
    } finally {
      setUpdatingBookingId(null);
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
      
      <div className="container pt-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="display-5 fw-bold text-dark mb-2">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-muted">Manage your properties and applications</p>
        </motion.div>

        <div className="row g-4">
          <div className="col-lg-3">
            <DashboardSidebar role="landlord" />
          </div>

          <div className="col-lg-9">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '16rem' }}>
                <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                {error}
              </div>
            ) : activeTab === 'properties' ? (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="fs-3 fw-bold text-dark">
                    My Properties ({properties.length})
                  </h2>
                  <button
                    onClick={() => setShowPropertyModal(true)}
                    className="btn btn-gradient"
                  >
                    + Add Property
                  </button>
                </div>
                
                {properties.length === 0 ? (
                  <div className="card-custom text-center py-5">
                    <span className="fs-1 d-block mb-3">🏢</span>
                    <h3 className="fs-5 fw-bold text-dark mb-2">No properties yet</h3>
                    <p className="text-muted mb-4">Start by adding your first property</p>
                    <button
                      onClick={() => setShowPropertyModal(true)}
                      className="btn btn-gradient"
                    >
                      Add Property
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {properties.map((property) => (
                      <div key={property.id} className="col-md-6">
                        <PropertyCard
                          property={property}
                          isLandlord={true}
                          onEdit={handleEditProperty}
                          onDelete={handleDeleteProperty}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === 'bookings' ? (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="fs-3 fw-bold text-dark">
                    Bookings ({bookings.length})
                  </h2>
                </div>
                
                {bookings.length === 0 ? (
                  <div className="card-custom text-center py-5">
                    <span className="fs-1 d-block mb-3">📅</span>
                    <h3 className="fs-5 fw-bold text-dark mb-2">No bookings yet</h3>
                    <p className="text-muted">Booking requests will appear here when tenants book your properties</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="col-md-12">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="d-flex align-items-start justify-content-between mb-3">
                                  <div>
                                    <h5 className="fw-bold mb-1">{booking.property.title}</h5>
                                    <p className="text-muted mb-2">
                                      <i className="bi bi-geo-alt me-1"></i>
                                      {booking.property.city && booking.property.state
                                        ? `${booking.property.city}, ${booking.property.state}`
                                        : booking.property.location}
                                    </p>
                                  </div>
                                  <span className={`badge bg-${getStatusVariant(booking.status)}`}>
                                    {booking.status.toUpperCase()}
                                  </span>
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
                                  <small className="text-muted d-block mb-1">Tenant</small>
                                  <div className="d-flex align-items-center">
                                    <i className="bi bi-person-circle fs-4 me-2 text-primary"></i>
                                    <div>
                                      <strong className="d-block">{booking.tenant.full_name}</strong>
                                      <small className="text-muted">{booking.tenant.email}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-md-4 d-flex flex-column">
                                {booking.status === 'pending' && (
                                  <div className="d-grid gap-2">
                                    <button
                                      className="btn btn-success"
                                      onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                      disabled={updatingBookingId === booking.id}
                                    >
                                      {updatingBookingId === booking.id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-check-circle me-2"></i>
                                          Confirm Booking
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                      disabled={updatingBookingId === booking.id}
                                    >
                                      <i className="bi bi-x-circle me-2"></i>
                                      Decline
                                    </button>
                                  </div>
                                )}

                                {booking.status === 'confirmed' && (
                                  <div className="d-grid">
                                    <button
                                      className="btn btn-info"
                                      onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                      disabled={updatingBookingId === booking.id}
                                    >
                                      {updatingBookingId === booking.id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" />
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-check-circle me-2"></i>
                                          Mark as Completed
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}

                                {booking.status === 'completed' && (
                                  <div className="alert alert-info mb-0">
                                    <small>
                                      <i className="bi bi-check-circle me-1"></i>
                                      Rental completed
                                    </small>
                                  </div>
                                )}

                                {booking.status === 'cancelled' && (
                                  <div className="alert alert-danger mb-0">
                                    <small>
                                      <i className="bi bi-x-circle me-1"></i>
                                      Booking cancelled
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="fs-3 fw-bold text-dark">
                    Applications ({applications.length})
                  </h2>
                </div>
                
                {applications.length === 0 ? (
                  <div className="card-custom text-center py-5">
                    <span className="fs-1 d-block mb-3">📋</span>
                    <h3 className="fs-5 fw-bold text-dark mb-2">No applications yet</h3>
                    <p className="text-muted">Applications will appear here when tenants apply</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {applications.map((application) => (
                      <div key={application.id} className="col-md-6">
                        <ApplicationCard
                          application={application}
                          isLandlord={true}
                          onStatusUpdate={handleApplicationStatusUpdate}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', overflowY: 'auto' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content glass border-0 rounded-4 my-5"
            >
              <div className="modal-header border-0">
                <h3 className="modal-title fs-4 fw-bold">
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                    resetPropertyForm();
                    window.history.pushState({}, '', '/landlord/dashboard');
                  }}
                ></button>
              </div>
              
              <form onSubmit={handlePropertySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Property Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={propertyForm.title}
                      onChange={handlePropertyFormChange}
                      className="form-control form-control-custom"
                      placeholder="Modern 2BR Apartment"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={propertyForm.description}
                      onChange={handlePropertyFormChange}
                      className="form-control form-control-custom"
                      rows="3"
                      placeholder="Describe your property..."
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Property Type
                      </label>
                      <select
                        name="property_type"
                        value={propertyForm.property_type}
                        onChange={handlePropertyFormChange}
                        className="form-select form-control-custom"
                        required
                      >
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="studio">Studio</option>
                        <option value="villa">Villa</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Status
                      </label>
                      <select
                        name="status"
                        value={propertyForm.status}
                        onChange={handlePropertyFormChange}
                        className="form-select form-control-custom"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={propertyForm.city}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="New York"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={propertyForm.state}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={propertyForm.address}
                      onChange={handlePropertyFormChange}
                      className="form-control form-control-custom"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        value={propertyForm.zip_code}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="10001"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={propertyForm.country}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={propertyForm.bedrooms}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="2"
                        min="0"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={propertyForm.bathrooms}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="1.5"
                        step="0.5"
                        min="0"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Area (sqft)
                      </label>
                      <input
                        type="number"
                        name="area_sqft"
                        value={propertyForm.area_sqft}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="1200"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Monthly Rent ($)
                      </label>
                      <input
                        type="number"
                        name="rent_price"
                        value={propertyForm.rent_price}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="1200"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Deposit Amount ($)
                      </label>
                      <input
                        type="number"
                        name="deposit_amount"
                        value={propertyForm.deposit_amount}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                        placeholder="2400"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Available From
                      </label>
                      <input
                        type="date"
                        name="available_from"
                        value={propertyForm.available_from}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Available To
                      </label>
                      <input
                        type="date"
                        name="available_to"
                        value={propertyForm.available_to}
                        onChange={handlePropertyFormChange}
                        className="form-control form-control-custom"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Location (Legacy)
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={propertyForm.location}
                      onChange={handlePropertyFormChange}
                      className="form-control form-control-custom"
                      placeholder="New York, NY"
                      required
                    />
                    <small className="text-muted">This field is for backward compatibility</small>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPropertyModal(false);
                      setEditingProperty(null);
                      resetPropertyForm();
                      window.history.pushState({}, '', '/landlord/dashboard');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gradient"
                  >
                    {editingProperty ? 'Update Property' : 'Create Property'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteProperty}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default LandlordDashboard;
