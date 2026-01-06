import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (skipCookieCheck = false) => {
    // Check if auth cookie exists before making request (unless skipped)
    if (!skipCookieCheck) {
      const hasCookie = document.cookie.split(';').some(item => item.trim().startsWith('token='));
      
      if (!hasCookie) {
        setUser(null);
        setLoading(false);
        return null;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLoading(false);
        return data.user;
      } else {
        setUser(null);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (name, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, password })
      });

      if (response.ok) {
        // Skip cookie check - we just got a successful response
        const userData = await checkAuth(true);
        return { success: true, user: userData };
      } else {
        const data = await response.json();
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};