import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import ConfirmationModal from './ConfirmationModal';
import { useState, useEffect, useRef } from 'react';

const Header = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartItemCount = getTotalItems();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate('/');
  };
  return (
    <header className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group relative">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-wood-accent via-wood-brown to-wood-accent-hover rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-xl p-2 transform transition-all duration-500">
                  <img 
                    src='/logo.png' 
                    alt="Kalana Furniture Logo" 
                    className='w-50 h-10 object-cover'
                  />
                </div>
              </div>
              <div className="ml-6 text-left">
                <h1 className="font-serif text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-wood-brown to-wood-accent group-hover:from-wood-accent group-hover:to-wood-brown transition-all duration-500">
                  Kalana
                </h1>
                <p className="text-md font-semibold text-wood-accent group-hover:text-wood-brown transition-colors duration-300">
                  Furniture
                </p>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-wood-accent transition duration-300">Products</Link>
            <Link to="/offers" className="text-gray-600 hover:text-wood-accent transition duration-300">Offers</Link>
            <Link to="/contact" className="text-gray-600 hover:text-wood-accent transition duration-300">Contact</Link>
            <div className="border-l border-gray-300 h-6"></div>
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 text-gray-600">
                  <Link to="/profile" className="flex items-center gap-2 hover:text-wood-accent transition duration-300">
                    <span className="hidden sm:inline">Welcome, {user?.name}</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-wood-accent transition duration-300">Login</Link>
                <Link to="/register" className="bg-wood-accent text-white font-bold py-2 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300">
                  Register
                </Link>
              </>
            )}
            <div className="border-l border-gray-300 h-6"></div>
            <Link to="/cart" className="relative text-gray-600 hover:text-wood-accent transition duration-300" title="Shopping Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-wood-accent text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-wood-accent transition duration-300" title="Order History">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </Link>
            <Link to="/notifications" className="text-gray-600 hover:text-wood-accent transition duration-300" title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center text-gray-600 hover:text-wood-accent transition duration-300"
                  title="User Profile"
                >
                  <img
                    src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name?.charAt(0) || 'U')}&background=8B4513&color=fff&size=32`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-wood-accent object-cover hover:border-wood-accent-hover transition duration-300"
                  />
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-wood-accent transition duration-300"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      User Profile
                    </Link>
                  </div>
                )}
              </div>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogoutClick}
                className="text-gray-600 hover:text-wood-accent transition duration-300 flex items-center gap-1"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500 hover:text-wood-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button>
              {/* Mobile Menu Icon */}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </header>
  );
};

export default Header;
