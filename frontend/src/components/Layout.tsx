/**
 * Main layout component with navigation.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
      ? 'bg-primary-50 text-primary-900 shadow-sm border border-primary-100'
      : 'text-slate-600 hover:text-primary-800 hover:bg-slate-100';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="h-9 w-9 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-900/20">
                  B
                </div>
                <div>
                  <span className="block text-lg font-bold text-slate-900 tracking-tight">BrightSteps</span>
                  <span className="text-xs text-slate-500">Real Estate Intelligence</span>
                </div>
              </Link>

              {isAuthenticated && (
                <div className="hidden md:flex md:space-x-2">
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/leads"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/leads')}`}
                  >
                    Leads
                  </Link>
                  <Link
                    to="/ai-tools"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/ai-tools')}`}
                  >
                    AI Tools
                  </Link>
                  <Link
                    to="/billing"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/billing')}`}
                  >
                    Billing
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'Admin') && (
                    <Link
                        to="/admin"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            location.pathname.startsWith('/admin')
                            ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100'
                            : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50'
                        }`}
                    >
                        Admin
                    </Link>
                  )}
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-primary-700 hover:border-primary-200 shadow-sm transition-colors"
                  aria-label="View notifications"
                >
                  <svg className="h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <Link
                  to="/deals/new"
                  className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-900/10 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Analysis
                </Link>
                <Link to="/profile" className="flex items-center space-x-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-primary-800 hover:border-primary-200 shadow-sm transition-colors">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                        {user.full_name.charAt(0)}
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block">{user.full_name}</span>
                      <span className="text-xs text-slate-500">View profile</span>
                    </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isAuthenticated && (
                  <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
                    <Link to="/register" className="btn-primary">Sign up</Link>
                  </div>
              )
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-primary-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                    <span className="sr-only">Open main menu</span>
                    {mobileMenuOpen ? (
                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
            <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-800 hover:bg-slate-50">Dashboard</Link>
                    <Link to="/leads" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-800 hover:bg-slate-50">Leads</Link>
                    <Link to="/ai-tools" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-800 hover:bg-slate-50">AI Tools</Link>
                    <Link to="/billing" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-800 hover:bg-slate-50">Billing</Link>
                     {(user?.role === 'admin' || user?.role === 'Admin') && (
                        <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:text-purple-800 hover:bg-purple-50">Admin</Link>
                    )}
                </div>
                <div className="pt-4 pb-4 border-t border-slate-200 bg-slate-50/60">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                                {user?.full_name.charAt(0)}
                            </div>
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-slate-800">{user?.full_name}</div>
                            <div className="text-sm font-medium leading-none text-slate-500 mt-1">{user?.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                        <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-primary-800 hover:bg-slate-50">Your Profile</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-primary-800 hover:bg-slate-50">Sign out</button>
                    </div>
                </div>
            </div>
        )}
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} BrightSteps Platform. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
