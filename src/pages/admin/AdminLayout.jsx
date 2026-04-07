import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import * as authService from "../../services/authService";

const NAV_ICONS = {
  Dashboard: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  Guests: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Groups: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  RSVP: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  Wishes: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
  Journey: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  Gallery: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Gifts: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v13m0-13V6a2 2 0 112.83 2.83l-.47.47m0 0H12m0 0l-.47.47A2 2 0 119.17 6v2M12 8H4.5a2 2 0 000 4H12m0-4h7.5a2 2 0 010 4H12m-8 4h16"
      />
    </svg>
  ),
  Settings: (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

export const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getAdminUser();
  const role = user?.role || "parents";

  const allNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", roles: ["admin"] },
    { name: "Guests", path: "/admin/guests", roles: ["admin", "parents"] },
    {
      name: "Groups",
      path: "/admin/guest-groups",
      roles: ["admin", "parents"],
    },
    { name: "RSVP", path: "/admin/rsvp", roles: ["admin"] },
    { name: "Wishes", path: "/admin/wishes", roles: ["admin"] },
    { name: "Journey", path: "/admin/our-journey", roles: ["admin"] },
    { name: "Gallery", path: "/admin/gallery", roles: ["admin"] },
    { name: "Gifts", path: "/admin/gifts", roles: ["admin"] },
    { name: "Settings", path: "/admin/settings", roles: ["admin"] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    /* Fix Windows scrollbar: overflow-hidden on outer, let inner scroll */
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* ── Mobile Header ── */}
      <header className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex flex-col">
          <h2 className="text-xl font-display font-bold text-maroon leading-tight">
            Wedding Admin
          </h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Invitation Suite
          </p>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </header>

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-maroon">
                  Wedding Admin
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">
                  Invitation Suite
                </p>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-maroon/5 text-maroon font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-maroon"
                    }`}
                  >
                    {NAV_ICONS[item.name]}
                    <span className="text-sm">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-maroon" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col bg-white shadow-lg border-r border-gray-200 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[68px]" : "w-64"
        }`}
      >
        {/* Logo area */}
        <div
          className={`border-b border-gray-100 shrink-0 transition-all duration-300 ${isCollapsed ? "p-4" : "p-8"}`}
        >
          {isCollapsed ? (
            <div className="flex items-center justify-center">
              <span className="text-maroon font-display font-bold text-xl">
                W
              </span>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-display font-bold text-maroon">
                Wedding Admin
              </h2>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">
                Invitation Suite
              </p>
            </>
          )}
        </div>

        {/* Nav */}
        <nav
          className={`space-y-1 flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 group ${
                  isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
                } ${
                  isActive
                    ? "bg-maroon/5 text-maroon font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-maroon"
                }`}
              >
                {NAV_ICONS[item.name]}
                {!isCollapsed && (
                  <>
                    <span className="text-sm">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-maroon" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: logout + collapse toggle */}
        <div
          className={`border-t border-gray-100 shrink-0 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}
        >
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
              isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>

          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed((c) => !c)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-1 w-full flex items-center rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200 ${
              isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
            }`}
          >
            <svg
              className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            {!isCollapsed && (
              <span className="text-xs font-medium">Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      {/* overflow-y-auto here so only main scrolls, not the whole page — fixes Windows scrollbar layout */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFAFA]">
        <div
          className={`mx-auto p-6 md:p-10 transition-all duration-300 ${isCollapsed ? "max-w-full" : "max-w-8xl"}`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};
