import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Header with mobile-first design */}
      <header className="glass-effect-dark border-b border-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo section - компактный для мобильных */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/dashboard" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 logo-circle rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">🎸</span>
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-gradient hidden xs:block">BandSync</span>
              </Link>
            </div>
            
            {/* Desktop Navigation - только на больших экранах */}
            <nav className="hidden xl:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-orange-gradient text-white shadow-dark'
                      : 'text-gray-300 hover:text-white hover:bg-surface-light'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="hidden 2xl:block">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* Right side - компактный дизайн */}
            <div className="flex items-center space-x-2">
              {/* User info - только на desktop */}
              {currentUser && (
                <div className="hidden lg:flex items-center space-x-2 bg-surface-light rounded-full px-3 py-1 border border-dark">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {currentUser.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs hidden xl:block">
                    <p className="font-medium text-white truncate max-w-20">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.role}</p>
                  </div>
                </div>
              )}
              
              {/* Desktop logout - только на больших экранах */}
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleLogout}
                className="hidden lg:flex text-xs px-3 py-2"
              >
                Logout
              </Button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-surface-light transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-dark bg-surface-dark">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-orange-gradient text-white'
                      : 'text-gray-300 hover:text-white hover:bg-surface-light'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile user info and logout */}
              {currentUser && (
                <div className="mt-4 pt-4 border-t border-dark">
                  <div className="flex items-center px-3 py-2 text-gray-300">
                    <div className="w-10 h-10 bg-orange-gradient rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {currentUser.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{currentUser.name}</p>
                      <p className="text-sm text-gray-400">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 text-red-400 hover:text-red-300 hover:bg-surface-light rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content with responsive padding */}
      <main className="max-w-7xl mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
};
