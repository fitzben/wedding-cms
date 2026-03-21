import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* ── Mobile Header ── */}
      <header className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex flex-col">
          <h2 className="text-xl font-display font-bold text-maroon leading-tight">Wedding Admin</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Invitation Suite</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      {/* ── Mobile Sidebar Drawer ── */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={closeSidebar}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col transform transition-transform animate-slide-in-left">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-maroon">Wedding Admin</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Invitation Suite</p>
              </div>
              <button onClick={closeSidebar} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeSidebar}
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
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg border-r border-gray-200 flex-col sticky top-0 h-screen">
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

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 md:p-10 bg-[#FAFAFA] overflow-x-hidden min-h-screen">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
