import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, User, LogOut, Menu, X, Home,
  MapPin, BarChart3, Settings, Users, Wrench 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'citizen':
        return [
          { to: '/citizen', icon: Home, label: 'Dashboard' },
          { to: '/citizen/submit', icon: FileText, label: 'Submit Complaint' },
          { to: '/citizen/track', icon: MapPin, label: 'Track Complaints' },
          { to: '/citizen/community', icon: Users, label: 'Community' },
        ];
      case 'provider':
        return [
          { to: '/provider', icon: Home, label: 'Dashboard' },
          { to: '/provider/complaints', icon: FileText, label: 'Complaints' },
          { to: '/provider/tasks', icon: Wrench, label: 'Tasks' },
          { to: '/provider/analytics', icon: BarChart3, label: 'Analytics' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: Home, label: 'Dashboard' },
          { to: '/admin/users', icon: Users, label: 'Users' },
          { to: '/admin/departments', icon: Settings, label: 'Departments' },
          { to: '/admin/issue-management', icon: Wrench, label: 'Issue Management' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-4 left-12 right-12 rounded-xl z-50 backdrop-blur-sm bg-white/20 shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PublicCare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-[#022b63]'
                      : 'text-gray-700 hover:text-white hover:bg-sky-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <span className="text-xs bg-blue-100/80 text-blue-800 px-2 py-1 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-white/30"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-md shadow-lg z-10 border border-white/20">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="border-white/20 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/30"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex items-center space-x-2 px-3 py-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs bg-blue-100/80 text-blue-800 px-2 py-1 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-white/30"
              >
                <User className="w-5 h-5" />
                <span>View Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-red-700 hover:bg-red-50/50 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;