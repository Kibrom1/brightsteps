import { Link, useLocation, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Feature Flags', path: '/admin/feature-flags' },
    { name: 'Audit Logs', path: '/admin/audit-logs' },
    // { name: 'Plans', path: '/admin/plans' }, // Future
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Console</h1>
          <p className="text-xs text-gray-400 mt-1">BrightSteps Enterprise</p>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => {
             const isActive = location.pathname === item.path || 
                             (item.path !== '/admin' && location.pathname.startsWith(item.path));
             return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 text-sm font-medium ${
                  isActive 
                    ? 'bg-gray-800 text-white border-l-4 border-primary-500' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white flex items-center">
                ← Back to App
            </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

