import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // In a real app, validate the token here.
    if (token) {
      // Mock validation
      setUser({
        _id: '1',
        name: 'John Doe',
        email: 'john@skyline.edu',
        role: 'student', // student, volunteer, treasurer, officer
        membershipStatus: 'none', // none, active, expired
      });
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const register = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const isMember = user?.membershipStatus === 'active';
  const isAdmin = user?.role === 'officer';
  const isExecutive = user?.role === 'treasurer' || user?.role === 'officer';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      register,
      isMember,
      isAdmin,
      isExecutive,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
