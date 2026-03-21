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
      <div className="px-6 md:p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">RSVP Management</h1>
          <p className="text-gray-500">Monitor and manage guest RSVPs and meal preferences.</p>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}
        
        {/* ── Desktop Table ── */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
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

        {/* ── Mobile Card List ── */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading RSVPs...</div>
          ) : rsvps.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No RSVPs yet.</div>
          ) : (
            rsvps.map((rsvp) => (
              <div key={rsvp.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{rsvp.name}</h3>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{formatDate(rsvp.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getAttendanceStyle(rsvp.attendance)}`}>
                    {rsvp.attendance}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                     <span className="text-xs font-bold text-gray-700">{rsvp.pax}</span>
                     <span className="text-[10px] text-gray-400 uppercase font-black">Pax</span>
                   </div>
                   {rsvp.guest_display_name && rsvp.guest_display_name !== rsvp.name && (
                     <div className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                       <span className="text-[10px] text-indigo-400 font-bold uppercase">Linked:</span>
                       <span className="text-xs font-semibold text-indigo-600 truncate max-w-[120px]">{rsvp.guest_display_name}</span>
                     </div>
                   )}
                </div>

                {rsvp.message && (
                  <div className="p-4 bg-maroon/5 rounded-xl border border-maroon/10 relative">
                    <svg className="absolute top-2 left-2 w-4 h-4 text-maroon/10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V11H14.017V6H19.017C20.1216 6 21.017 6.89543 21.017 8V18C21.017 19.6569 19.6739 21 18.017 21H14.017ZM3.01705 21L3.01705 18C3.01705 16.8954 3.91248 16 5.01705 16H8.01705V11H3.01705V6H8.01705C9.12162 6 10.017 6.89543 10.017 8V18C10.017 19.6569 8.6739 21 7.01705 21H3.01705Z"/></svg>
                    <p className="text-sm text-gray-700 italic leading-relaxed pl-4">"{rsvp.message}"</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
