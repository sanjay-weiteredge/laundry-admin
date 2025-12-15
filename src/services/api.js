const API_BASE_URL = 'https://backend.thelaundryguyz.com/api';


const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

const getStoredUser = () => {
  const userStr = localStorage.getItem('authUser');
  return userStr ? JSON.parse(userStr) : null;
};

const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('authUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('authUser');
  }
};

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
    if (error.status) {
      throw error;
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

export const adminAPI = {
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

  getProfile: async () => {
    return await apiRequest('/admin/profile', {
      method: 'GET',
    });
  },

  getUsers: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    return await apiRequest(`/users?${params.toString()}`, {
      method: 'GET',
    });
  },

  deleteUser: async (userId) => {
    return await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  reportUser: async (userId) => {
    return await apiRequest(`/users/${userId}/report`, {
      method: 'POST',
    });
  },

  getOrders: async () => {
    return await apiRequest('/orders/all', {
      method: 'GET',
      headers: {
        Authorization: undefined,
      },
    });
  },

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

  getAllServices: async (audience) => {
    const query = audience ? `?audience=${encodeURIComponent(audience)}` : '';
    return await apiRequest(`/services/all${query}`, {
      method: 'GET',
    });
  },

  createService: async (payload) => {
    return await apiRequest('/services/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateService: async (serviceId, payload) => {
    return await apiRequest(`/services/update/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteService: async (serviceId) => {
    return await apiRequest(`/services/delete/${serviceId}`, {
      method: 'DELETE',
    });
  },

  logout: () => {
    setAuthToken(null);
    setStoredUser(null);
  },
};

export { getAuthToken, setAuthToken, getStoredUser, setStoredUser };

