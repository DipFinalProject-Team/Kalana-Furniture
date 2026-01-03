import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuChartBar,
  LuPackage,
  LuShoppingCart,
  LuUsers,
  LuClipboardList,
  LuTag,
  LuStar,
  LuSettings,
  LuLogOut,
  LuFileText,
  LuCheck,
} from 'react-icons/lu';
import ConfirmationModal from '../ConfirmationModal';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
  { path: '/', name: 'Dashboard', icon: LuLayoutDashboard },
  { path: '/analytics', name: 'Analytics', icon: LuChartBar },
  { path: '/products', name: 'Products', icon: LuPackage },
  { path: '/orders', name: 'Orders', icon: LuShoppingCart },
  { path: '/customers', name: 'Customers', icon: LuUsers },
  { path: '/inventory', name: 'Inventory', icon: LuClipboardList },
  { path: '/approvals', name: 'Approvals', icon: LuCheck },
  { path: '/invoices', name: 'Invoices', icon: LuFileText },
  { path: '/promotions', name: 'Promos', icon: LuTag },
  { path: '/reviews', name: 'Reviews', icon: LuStar },
  { path: '/settings', name: 'Settings', icon: LuSettings },
]

  const handleLogout = () => {
    // Perform any logout logic here (e.g., clearing tokens)
    console.log('Logging out...');
    setIsLogoutModalOpen(false);
    navigate('/login');
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

      <div className="p-6 border-b border-wood-brown/30 flex justify-center">
        <div className="w-24 h-24 bg-wood-light rounded-full flex items-center justify-center shadow-inner overflow-hidden">
           <img src="/logo.png" alt="Logo" className="w-20 h-auto object-contain" />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
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
