const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Make an authenticated API request
 */
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    
    // Handle validation errors (422)
    if (response.status === 422 && error.detail) {
      if (Array.isArray(error.detail)) {
        // Pydantic validation errors
        const messages = error.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
        throw new Error(messages);
      }
    }
    
    throw new Error(error.detail || 'Request failed');
  }

  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Authentication API
 */
export const authAPI = {
  signup: (userData) => fetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
};

/**
 * Tenant API
 */
export const tenantAPI = {
  getProperties: () => fetchAPI('/tenant/properties'),
  
  applyForProperty: (applicationData) => fetchAPI('/tenant/apply', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  getApplications: () => fetchAPI('/tenant/applications'),
};

/**
 * Landlord API
 */
export const landlordAPI = {
  createProperty: (propertyData) => fetchAPI('/landlord/property', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  }),
  
  getProperties: () => fetchAPI('/landlord/properties'),
  
  updateProperty: (propertyId, propertyData) => fetchAPI(`/landlord/property/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(propertyData),
  }),
  
  deleteProperty: (propertyId) => fetchAPI(`/landlord/property/${propertyId}`, {
    method: 'DELETE',
  }),
  
  getApplications: () => fetchAPI('/landlord/applications'),
  
  updateApplicationStatus: (applicationId, status) => fetchAPI(`/landlord/application/${applicationId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};
