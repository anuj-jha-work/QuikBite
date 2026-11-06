import { createContext, useEffect, useState } from 'react';
import api, { setAdminAuthToken } from '../api/client';

export const AdminAuthContext = createContext(null);

const tokenKey = 'quikbite.admin.token';
const userKey = 'quikbite.admin.user';

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clearSession = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setAdminAuthToken(null);
    setUser(null);
  };

  const setSession = (token, nextUser) => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(nextUser));
    setAdminAuthToken(token);
    setUser(nextUser);
  };

  const bootstrap = async () => {
    const token = localStorage.getItem(tokenKey);
    const storedUser = localStorage.getItem(userKey);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setAdminAuthToken(token);
      const response = await api.get('/api/user/me');
      if (!response.data.user?.isAdmin) {
        throw new Error('Admin access required');
      }

      setUser(response.data.user || (storedUser ? JSON.parse(storedUser) : null));
    } catch (requestError) {
      clearSession();
      setError(requestError.response?.data?.message || requestError.message || 'Session expired');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/user/login', { email, password });
    if (!response.data.user?.isAdmin) {
      throw new Error('Admin access required');
    }

    setSession(response.data.token, response.data.user);
    return response.data.user;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        setError,
        clearError: () => setError('')
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
