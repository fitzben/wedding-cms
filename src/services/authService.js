const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
