import { useState, useEffect } from 'react';
import { getWishes } from '../../services/wishService';

export const AdminWishes = () => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getWishes();
        setWishes(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load wishes');
      } finally {
        setLoading(false);
      }
    };
    fetchWishes();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Wishes</h1>
        <p className="text-gray-500">Read and manage beautiful messages from your loved ones.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-maroon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading wishes...
          </span>
        </div>
      ) : wishes.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            No wishes have been received yet.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishes.map((wish) => (
            <div key={wish.id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-maroon/5 hover:border-maroon/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-maroon transition-colors">{wish.name}</h3>
                <span className="text-xs text-gray-400 font-medium">{formatDate(wish.created_at)}</span>
              </div>
              <p className="text-gray-600 italic leading-relaxed text-sm">"{wish.message}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

