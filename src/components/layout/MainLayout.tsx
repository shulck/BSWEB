import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { currentUser } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard', icon: '🏠' },
    { name: 'Calendar', href: '/calendar', current: location.pathname === '/calendar', icon: '📅' },
    { name: 'Chat', href: '/chat', current: location.pathname === '/chat', icon: '💬' },
    { name: 'Tasks', href: '/tasks', current: location.pathname === '/tasks', icon: '✅' },
    { name: 'Setlists', href: '/setlists', current: location.pathname === '/setlists', icon: '🎵' },
    { name: 'Finances', href: '/finances', current: location.pathname === '/finances', icon: '💰' },
    { name: 'Merchandise', href: '/merchandise', current: location.pathname === '/merchandise', icon: '🛍️' },
    { name: 'Contacts', href: '/contacts', current: location.pathname === '/contacts', icon: '📞' },
    { name: 'Groups', href: '/groups', current: location.pathname === '/groups', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Dark Header with Glass Effect */}
      <header className="glass-effect-dark border-b border-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 logo-circle rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎸</span>
                </div>
                <span className="text-2xl font-bold text-accent-gradient">BandSync</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-orange-gradient text-white shadow-dark'
                        : 'text-gray-300 hover:text-white hover:bg-surface-light'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="hidden md:flex items-center space-x-3 bg-surface-light rounded-full px-4 py-2 border border-dark">
                  <div className="w-8 h-8 bg-orange-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.role}</p>
                  </div>
                </div>
              )}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="hover-lift-dark"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="lg:hidden border-t border-dark">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-surface-light">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  item.current
                    ? 'bg-orange-gradient text-white'
                    : 'text-gray-300 hover:text-white hover:bg-surface-dark'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main content with dark background */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
