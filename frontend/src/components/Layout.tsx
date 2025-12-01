/**
 * Main layout component with navigation.
 */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
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
      ? 'bg-slate-100 text-primary-900' 
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  B
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  BrightSteps
                </span>
              </Link>
              
              {isAuthenticated && (
                <div className="hidden md:ml-10 md:flex md:space-x-1">
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/leads"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/leads')}`}
                  >
                    Leads
                  </Link>
                  <Link
                    to="/ai-tools"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ai-tools')}`}
                  >
                    AI Tools
                  </Link>
                  <Link
                    to="/billing"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/billing')}`}
                  >
                    Billing
                  </Link>
                  {user?.role === UserRole.ADMIN && (
                    <Link
                        to="/admin"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            location.pathname.startsWith('/admin')
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                    >
                        Admin
                    </Link>
                  )}
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-slate-700 hover:text-primary-700">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        {user.full_name.charAt(0)}
                    </div>
                    <span>{user.full_name}</span>
                </Link>
                <div className="h-4 w-px bg-slate-300 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800"
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
                    className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
            <div className="md:hidden border-t border-slate-200">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50">Dashboard</Link>
                    <Link to="/leads" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50">Leads</Link>
                    <Link to="/ai-tools" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50">AI Tools</Link>
                    <Link to="/billing" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50">Billing</Link>
                     {user?.role === UserRole.ADMIN && (
                        <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50">Admin</Link>
                    )}
                </div>
                <div className="pt-4 pb-4 border-t border-slate-200">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {user?.full_name.charAt(0)}
                            </div>
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium leading-none text-slate-800">{user?.full_name}</div>
                            <div className="text-sm font-medium leading-none text-slate-500 mt-1">{user?.email}</div>
                        </div>
                    </div>
                    <div className="mt-3 px-2 space-y-1">
                        <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Your Profile</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">Sign out</button>
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
