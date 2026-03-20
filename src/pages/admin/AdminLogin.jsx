import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getAdminUser();
      navigate(user?.role === 'parents' ? '/admin/guests' : '/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      const user = data.user;
      navigate(user?.role === 'parents' ? '/admin/guests' : '/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-maroon p-10 text-white text-center">
          <h1 className="text-3xl font-display font-bold mb-2">Admin Login</h1>
          <p className="text-maroon-light opacity-80">Welcome back to your invitation suite</p>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-shake">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-maroon focus:border-transparent transition-all outline-none"
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-maroon focus:border-transparent transition-all outline-none"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-maroon text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-[0.98] hover:shadow-maroon/20 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-maroon-dark'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
