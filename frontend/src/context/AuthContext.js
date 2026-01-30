// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const AuthContext = createContext();

// Custom hook to use the auth context easily in other components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await fetch(API_ENDPOINTS.auth.me, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
          } else {
            // Token expired or invalid, try refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshResponse = await fetch(API_ENDPOINTS.auth.refresh, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${refreshToken}`,
                },
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                localStorage.setItem('accessToken', refreshData.accessToken);
                // Retry getting user
                const retryResponse = await fetch(API_ENDPOINTS.auth.me, {
                  headers: {
                    Authorization: `Bearer ${refreshData.accessToken}`,
                  },
                });
                if (retryResponse.ok) {
                  const userData = await retryResponse.json();
                  setCurrentUser(userData.user);
                } else {
                  clearAuth();
                }
              } else {
                clearAuth();
              }
            } else {
              clearAuth();
            }
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          clearAuth();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Register new user
  const register = useCallback(async (email, password, fullName) => {
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save tokens and user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save tokens and user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update user in context (after profile update)
  const updateUser = useCallback((userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    }
  }, []);

  // Refresh current user from API
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    refreshUser,
    isAuthenticated: !!currentUser,
  };

  // We show a loading screen until we've checked auth state
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
