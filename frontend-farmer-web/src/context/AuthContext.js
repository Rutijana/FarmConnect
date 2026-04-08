import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('farmer_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem('farmer_token', token);
    localStorage.setItem('farmer_user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);