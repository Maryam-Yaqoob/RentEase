import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardSidebar from '../components/DashboardSidebar';
import PropertyCard from '../components/PropertyCard';
import ApplicationCard from '../components/ApplicationCard';
import SearchFilters from '../components/SearchFilters';
import { tenantAPI } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const TenantDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'properties';
  
  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingPropertyId, setApplyingPropertyId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [filters, setFilters] = useState({});

  const { user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (activeTab === 'properties') {
      loadProperties();
    } else if (activeTab === 'applications') {
      loadApplications();
    }
  }, [activeTab]);

  const loadProperties = async (searchFilters = {}) => {
    try {
      setLoading(true);
      // Build query params from filters
      const params = new URLSearchParams();
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key]) {
          params.append(key, searchFilters[key]);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/properties?${queryString}` : '/properties';
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tenant${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load properties');
      }
      
      const data = await response.json();
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
      const data = await tenantAPI.getApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (propertyId) => {
    setApplyingPropertyId(propertyId);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = async () => {
    try {
      await tenantAPI.applyForProperty({
        property_id: applyingPropertyId,
        message: applicationMessage
      });
      setShowApplicationModal(false);
      setApplicationMessage('');
      setApplyingPropertyId(null);
      success('Application submitted successfully!');
      loadProperties(filters);
    } catch (err) {
      showError(err.message || 'Failed to submit application');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadProperties(newFilters);
  };

  const handleResetFilters = (resetFilters) => {
    setFilters(resetFilters);
    loadProperties(resetFilters);
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
          <p className="text-muted">Find your perfect home today</p>
        </motion.div>

        <div className="row g-4">
          <div className="col-lg-3">
            <DashboardSidebar role="tenant" />
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
                    Available Properties ({properties.length})
                  </h2>
                </div>
                
                <SearchFilters 
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
                
                {properties.length === 0 ? (
                  <div className="card-custom text-center py-5">
                    <span className="fs-1 d-block mb-3">🏠</span>
                    <h3 className="fs-5 fw-bold text-dark mb-2">No properties available</h3>
                    <p className="text-muted">Check back later for new listings</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {properties.map((property) => (
                      <div key={property.id} className="col-md-6">
                        <PropertyCard
                          property={property}
                          onApply={handleApplyClick}
                          showFavorite={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h2 className="fs-3 fw-bold text-dark">
                    My Applications ({applications.length})
                  </h2>
                </div>
                
                {applications.length === 0 ? (
                  <div className="card-custom text-center py-5">
                    <span className="fs-1 d-block mb-3">📝</span>
                    <h3 className="fs-5 fw-bold text-dark mb-2">No applications yet</h3>
                    <p className="text-muted">Start applying for properties to see them here</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {applications.map((application) => (
                      <div key={application.id} className="col-md-6">
                        <ApplicationCard
                          application={application}
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

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content glass border-0 rounded-4"
            >
              <div className="modal-header border-0">
                <h3 className="modal-title fs-4 fw-bold">Submit Application</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApplicationModal(false);
                    setApplicationMessage('');
                    setApplyingPropertyId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  Add a message to introduce yourself to the landlord (optional)
                </p>
                
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  className="form-control form-control-custom"
                  rows="5"
                  placeholder="Tell the landlord why you're interested in this property..."
                />
              </div>
              <div className="modal-footer border-0">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setApplicationMessage('');
                    setApplyingPropertyId(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplicationSubmit}
                  className="btn btn-gradient"
                >
                  Submit Application
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
