import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary-600">
              WorkConnect
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/jobs" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Jobs
                </Link>
                <Link to="/messages" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Messages
                </Link>
                {user.userType === 'contractor' && (
                  <Link to="/post-job" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Post Job
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
                  How It Works
                </Link>
                <Link to="/find-workers" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Find Workers
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <MessageSquare size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.userType === 'worker' ? user.profile?.firstName : user.profile?.companyName}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/jobs"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/messages"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                {user.userType === 'contractor' && (
                  <Link
                    to="/post-job"
                    className="block py-2 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Job
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/how-it-works"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  to="/find-workers"
                  className="block py-2 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Workers
                </Link>
                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" fullWidth>Login</Button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button fullWidth>Sign Up</Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};