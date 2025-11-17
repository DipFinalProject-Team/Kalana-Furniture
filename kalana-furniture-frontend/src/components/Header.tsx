import { Link } from 'react-router-dom';

const Header = () => {
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
