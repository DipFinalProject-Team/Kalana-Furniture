import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { 
  FiGrid, 
  FiShoppingCart,  
  FiFileText, 
  FiUser, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiMessageSquare,
  FiBell
} from 'react-icons/fi';
import Cookies from 'js-cookie';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface User {
  contactPerson?: string;
  companyName?: string;
  profileImage?: string;
  // Add other properties as needed
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Get user information from localStorage
  const getUserInfo = (): User | null => {
    const userData = Cookies.get('supplierUser') || localStorage.getItem('supplierUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    // Set initial user
    setUser(getUserInfo());

    // Check for updates every second
    const interval = setInterval(() => {
      const newUser = getUserInfo();
      setUser((prevUser: User | null) => {
        if (JSON.stringify(prevUser) !== JSON.stringify(newUser)) {
          return newUser;
        }
        return prevUser;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const userName = user?.contactPerson || 'User';
  const companyName = user?.companyName || 'Company';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    // Clear tokens and user data
    Cookies.remove('supplierToken');
    localStorage.removeItem('supplierToken');
    Cookies.remove('supplierUser');
    localStorage.removeItem('supplierUser');
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FiGrid /> },
    { path: '/orders', name: 'Orders', icon: <FiShoppingCart /> },
    { path: '/invoices', name: 'Invoices', icon: <FiFileText /> },
    { path: '/profile', name: 'Profile', icon: <FiUser /> },
    { path: '/settings', name: 'Settings', icon: <FiSettings /> },
    { path: '/contact-admin', name: 'Support', icon: <FiMessageSquare /> },
    { path: '/notifications', name: 'Notifications', icon: <FiBell /> },
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
        <div>
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
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-wood-accent text-nav-brown flex items-center justify-center font-bold text-lg shrink-0">
              {userInitial}
            </div>
          )}
          <div className={`overflow-hidden transition-all duration-200 flex-1 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
            <p className="text-sm font-medium text-wood-light truncate">{userName}</p>
            <p className="text-xs text-wood-light/60 truncate">{companyName}</p>
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
