import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LuLayoutDashboard,
  LuLogOut,
  LuUsers,
  LuMessageSquare
} from 'react-icons/lu';
import { FaCreditCard } from 'react-icons/fa';
import ConfirmationModal from '../ConfirmationModal';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LuLayoutDashboard },
    { path: '/customers', name: 'Customers', icon: LuUsers },
    { path: '/inquiries', name: 'Inquiries', icon: LuMessageSquare },
    { path: '/refunds', name: 'Refunds', icon: FaCreditCard },
  ];

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  const isNavItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen w-64 bg-nav-brown text-wood-light flex flex-col fixed left-0 top-0 overflow-y-auto shadow-xl z-20 custom-scrollbar">
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will be redirected to the login page."
        confirmText="Logout"
      />

      <div className="p-6 border-b border-wood-brown/30 flex justify-center flex-col items-center">
        <div className="w-20 h-20 bg-wood-light rounded-full flex items-center justify-center shadow-inner overflow-hidden mb-3">
           {/* Placeholder for logo */}
           <img
              src="/logo.png"
              alt="Kalana Furniture"
              className="w-16 h-auto object-contain"
            />
        </div>
        <h2 className="text-wood-accent font-serif font-bold text-sm tracking-wider">CUSTOMER HANDLING</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isNavItemActive(item.path)
                  ? 'bg-wood-accent text-nav-brown shadow-md font-bold'
                  : 'text-wood-light/80 hover:bg-wood-brown hover:text-white hover:pl-5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-wood-brown/30">
        <button
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-300 hover:bg-wood-brown hover:text-red-200 transition-colors"
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <LuLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
