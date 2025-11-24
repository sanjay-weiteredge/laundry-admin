const API_BASE_URL = 'http://13.51.13.251:8000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Helper function to get stored user from localStorage
const getStoredUser = () => {
  const userStr = localStorage.getItem('authUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set user in localStorage
const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('authUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('authUser');
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || `Request failed with status ${response.status}` };
      }
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.status) {
      throw error;
    }
    // Otherwise, it's a network or parsing error
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

// Admin API methods
export const adminAPI = {
  // Login
  login: async (email, password) => {
    const response = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      setAuthToken(response.token);
      if (response.data) {
        setStoredUser(response.data);
      }
    }

    return response;
  },

  // Signup
  signup: async (name, email, password) => {
    const response = await apiRequest('/admin/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (response.success && response.token) {
      setAuthToken(response.token);
      if (response.data) {
        setStoredUser(response.data);
      }
    }

    return response;
  },

  // Get profile
  getProfile: async () => {
    return await apiRequest('/admin/profile', {
      method: 'GET',
    });
  },

  // Fetch paginated users
  getUsers: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    return await apiRequest(`/users?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Fetch orders (no auth required)
  getOrders: async () => {
    return await apiRequest('/orders/all', {
      method: 'GET',
      headers: {
        Authorization: undefined,
      },
    });
  },

  // Stores
  getStores: async () => {
    return await apiRequest('/stores/admin/stores', {
      method: 'GET',
    });
  },

  createStore: async (payload) => {
    return await apiRequest('/stores/admin/stores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStore: async (storeId, payload) => {
    return await apiRequest(`/stores/admin/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteStore: async (storeId) => {
    return await apiRequest(`/stores/admin/stores/${storeId}`, {
      method: 'DELETE',
    });
  },

  // Logout (client-side only)
  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },
};

// Export utility functions
export { getAuthToken, setAuthToken, getStoredUser, setStoredUser };

