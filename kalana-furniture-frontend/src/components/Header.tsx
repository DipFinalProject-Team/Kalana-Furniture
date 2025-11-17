import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="font-serif text-2xl font-bold text-wood-brown">
              Kalana Furniture
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/login" className="text-gray-600 hover:text-wood-accent transition duration-300">Login</Link>
            <Link to="/register" className="bg-wood-accent text-white font-bold py-2 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300">
              Register
            </Link>
            <div className="border-l border-gray-300 h-6"></div>
            <Link to="/cart" className="text-gray-600 hover:text-wood-accent transition duration-300" title="Shopping Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            <Link to="/orders" className="text-gray-600 hover:text-wood-accent transition duration-300" title="Order History">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-wood-accent transition duration-300" title="User Profile">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
          <div className="md:hidden">
            <button>
              {/* Mobile Menu Icon */}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
