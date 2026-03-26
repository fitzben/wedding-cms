const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Enhanced fetch wrapper that handles:
 * - Automatically adding Authorization header
 * - Centralized 401 Unauthorized handling (auto-logout)
 * - Uniform error handling
 */
async function request(path, options = {}) {
  const { useAuth = true, ...fetchOptions } = options;
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (useAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized: token expired or invalid
    // Only trigger auto-logout if we were attempting to use authentication
    if (response.status === 401 && useAuth) {
      console.warn('Authentication token expired or invalid. Logging out...');
      
      localStorage.removeItem('token');
      localStorage.removeItem('admin_user');
      
      // Force redirect to login page
      window.location.href = '/admin/login?expired=true';
      return null;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${path}]:`, error);
    throw error;
  }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
