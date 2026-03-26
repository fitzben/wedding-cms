import { apiClient } from './apiClient';

export const login = async (email, password) => {
  try {
    const data = await apiClient.post('/api/auth/login', { email, password }, { useAuth: false });

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin_user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getAdminUser = () => {
  const user = localStorage.getItem('admin_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing admin_user from localStorage:', error);
    localStorage.removeItem('admin_user');
    return null;
  }
};
