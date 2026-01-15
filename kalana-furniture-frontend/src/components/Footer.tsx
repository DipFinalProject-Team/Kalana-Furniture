import { Link } from 'react-router-dom';

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-wood-light hover:text-wood-accent transition duration-300 transform hover:scale-110">
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-wood-brown to-nav-brown text-wood-light relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="text-center sm:text-left">
            <h3 className="font-serif text-3xl mt-2 font-bold mb-4 text-white">
              <span className="text-wood-accent">K</span>alana <span className="text-wood-accent">F</span>urniture
            </h3>
            <p className="text-md text-wood-light max-w-xs mx-auto sm:mx-0">
              Crafting timeless pieces for your modern home.
            </p>
          </div>

          <div className="text-center ml-20 mt-2 sm:text-left">
            <h4 className="font-bold text-2xl mb-4 text-white tracking-wider uppercase">Shop</h4>
            <ul className="space-y-3 text-md">
              <li><Link to="/products" className="hover:text-wood-accent transition-colors duration-300">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-wood-accent transition-colors duration-300">Categories</Link></li>
              <li><Link to="/offers" className="hover:text-wood-accent transition-colors duration-300">Special Offers</Link></li>
            </ul>
          </div>
          
          <div className="text-center ml-20 mt-2  sm:text-left">
            <h4 className="font-bold text-2xl mb-4 text-white tracking-wider uppercase">About</h4>
            <ul className="space-y-3 text-md">
              <li><Link to="/about" className="hover:text-wood-accent transition-colors duration-300">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-wood-accent transition-colors duration-300">Contact</Link></li>
              <li><Link to="/careers" className="hover:text-wood-accent transition-colors duration-300">Careers</Link></li>
            </ul>
          </div>

          <div className="text-center mr-20 mt-2 sm:text-left">
            <h4 className="font-bold text-2xl mb-4 text-white tracking-wider uppercase">Follow Us</h4>
            <div className="flex space-x-7 justify-start">
              <SocialIcon href="https://facebook.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.791 4.649-.69.188-1.43.23-2.187.085.629 1.956 2.445 3.379 4.6 3.419-2.07 1.623-4.678 2.588-7.52 2.588-1.258 0-2.48-.074-3.68-.215 2.645 1.7 5.798 2.69 9.16 2.69 10.996 0 17.03-9.123 17.03-17.03 0-.261-.006-.522-.018-.781.926-.668 1.72-1.502 2.34-2.438z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"/></svg>
              </SocialIcon>
              <SocialIcon href="https://pinterest.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.117.223.084.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.318.545 3.582.545 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-wood-accent border-opacity-20">
          <p className="text-sm text-wood-light">&copy; {new Date().getFullYear()} Kalana Furniture. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
