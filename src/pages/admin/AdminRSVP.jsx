import { useState, useEffect } from 'react';
import { getRsvps } from '../../services/rsvpService';

export const AdminRSVP = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRsvps = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getRsvps();
        setRsvps(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load RSVPs');
      } finally {
        setLoading(false);
      }
    };
    fetchRsvps();
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

  const getAttendanceStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'yes': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'no': return 'bg-red-50 text-red-600 border border-red-100';
      case 'maybe': return 'bg-amber-50 text-amber-600 border border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">RSVP Management</h1>
          <p className="text-gray-500">Monitor and manage guest RSVPs and meal preferences.</p>
        </div>
      </div>
      
      <div className="p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Attendance</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider">Pax</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider w-1/3">Message</th>
                <th className="py-4 px-6 font-bold text-gray-700 text-xs uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading RSVPs...
                    </span>
                  </td>
                </tr>
              ) : rsvps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      No RSVPs have been received yet.
                    </div>
                  </td>
                </tr>
              ) : (
                rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-b border-gray-50 hover:bg-maroon/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 group-hover:text-maroon transition-colors">{rsvp.name}</div>
                      {rsvp.guest_display_name && rsvp.guest_display_name !== rsvp.name && (
                        <div className="text-xs text-gray-400 mt-0.5">Linked: {rsvp.guest_display_name}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${getAttendanceStyle(rsvp.attendance)}`}>
                        {rsvp.attendance}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold border border-gray-200">
                          {rsvp.pax}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-600 text-sm line-clamp-2 italic">
                        {rsvp.message ? `"${rsvp.message}"` : '-'}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap text-sm text-gray-500">
                      {formatDate(rsvp.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
