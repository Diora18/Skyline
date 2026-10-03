import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Your session has expired.');
        }

        if (!cancelled) {
          setUser(result.data.user);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const authenticate = async (endpoint, payload) => {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Unable to ${endpoint}.`);
    }

    const { token: newToken, user: authenticatedUser } = result.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const login = (credentials) => authenticate('login', credentials);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = (userData) => authenticate('register', userData);

  const refreshUser = async () => {
    if (!token) return null;

    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to refresh your account.');
    }

    setUser(result.data.user);
    return result.data.user;
  };

  const isMember = user?.membershipStatus === 'active';
  const isAdmin = user?.role === 'officer';
  const isExecutive = user?.role === 'treasurer' || user?.role === 'officer';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      authLoading,
      login,
      logout,
      register,
      refreshUser,
      isMember,
      isAdmin,
      isExecutive,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
