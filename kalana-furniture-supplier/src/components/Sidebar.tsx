import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Modal from './Modal';
import { 
  FiGrid, 
  FiShoppingCart, 
  FiTruck, 
  FiFileText, 
  FiUser, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    // Add actual logout logic here (e.g., clear tokens, redirect)
    console.log('Logging out...');
    setIsLogoutModalOpen(false);
    window.location.href = '/login'; // Example redirect
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FiGrid /> },
    { path: '/orders', name: 'Orders', icon: <FiShoppingCart /> },
    { path: '/invoices', name: 'Invoices', icon: <FiFileText /> },
    { path: '/profile', name: 'Profile', icon: <FiUser /> },
    { path: '/settings', name: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div 
      className={`
        h-screen bg-nav-brown text-wood-light transition-all duration-300 ease-in-out flex flex-col shadow-xl
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo Section */}
      <div className="h-32 flex items-center justify-center border-b border-wood-accent/20 relative bg-wood-brown/30">
        <div className={`p-6 border-b border-wood-brown/30 flex justify-center transition-all duration-300 ease-in-out ${isOpen ? '' : 'p-3'}`}>
        <div className={`bg-wood-light rounded-full flex items-center justify-center shadow-inner overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-24 h-24' : 'w-12 h-12'}`}>
           <img src="/logo.png" alt="Logo" className={`h-auto object-contain transition-all duration-300 ease-in-out ${isOpen ? 'w-20' : 'w-10'}`} />
        </div>
      </div>
        
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-wood-accent text-nav-brown p-2 rounded-full shadow-lg hover:bg-wood-accent-hover transition-colors z-10"
        >
          {isOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-wood-accent text-nav-brown shadow-md font-medium' 
                    : 'text-wood-light/60 hover:bg-wood-brown/50 hover:text-wood-light'
                  }
                `}
              >
                <div className="text-xl min-w-[24px] flex justify-center">
                  {item.icon}
                </div>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isOpen && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-nav-brown text-wood-light text-sm invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-20 whitespace-nowrap shadow-lg border border-wood-accent/20">
                    {item.name}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer / User Info (Optional) */}
      <div className="p-4 border-t border-wood-accent/20">
        <div className={`flex items-center gap-3 ${isOpen ? '' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-wood-accent text-nav-brown flex items-center justify-center font-bold text-lg shrink-0">
            K
          </div>
          <div className={`overflow-hidden transition-all duration-200 flex-1 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <p className="text-sm font-medium text-wood-light truncate">Kalana Admin</p>
            <p className="text-xs text-wood-light/60 truncate">Supplier Portal</p>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className={`text-wood-light/60 hover:text-red-400 transition-colors ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        type="danger"
        onConfirm={handleLogout}
      >
        <p>Are you sure you want to log out? You will need to sign in again to access your account.</p>
      </Modal>
    </div>
  );
};

export default Sidebar;
