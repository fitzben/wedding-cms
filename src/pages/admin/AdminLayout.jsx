import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getAdminUser();
  const role = user?.role || 'parents';
  
  const allNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', roles: ['admin'] },
    { name: 'Guests',    path: '/admin/guests',    roles: ['admin', 'parents'] },
    { name: 'Groups',    path: '/admin/guest-groups', roles: ['admin'] },
    { name: 'RSVP',      path: '/admin/rsvp',      roles: ['admin'] },
    { name: 'Wishes',    path: '/admin/wishes',    roles: ['admin'] },
    { name: 'Gallery',   path: '/admin/gallery',   roles: ['admin'] },
    { name: 'Gifts',     path: '/admin/gifts',     roles: ['admin'] },
    { name: 'Settings',  path: '/admin/settings',  roles: ['admin'] }
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-2xl font-display font-bold text-maroon">Wedding Admin</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Invitation Suite</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-maroon/5 text-maroon font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-maroon'
                }`}
              >
                <span className="text-sm">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-maroon" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-10 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
