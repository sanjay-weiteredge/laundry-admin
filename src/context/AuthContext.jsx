import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { adminAPI, getStoredUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await adminAPI.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    adminAPI.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ 
      user, 
      isAuthenticated: Boolean(user), 
      login, 
      logout,
      loading 
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);


