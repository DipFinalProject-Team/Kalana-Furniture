import { useState } from 'react';
import { FaUser, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

type AdminForgotPasswordPageProps = {
  onSwitchToLogin: () => void;
};

const AdminForgotPasswordPage = ({ onSwitchToLogin }: AdminForgotPasswordPageProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Admin password reset request for:', email);
      setIsSubmitted(true);
    } catch {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      </div>

      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl overflow-hidden border-t-4 border-wood-brown z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-wood-light rounded-full mb-4 shadow-inner">
               <img
                src="/logo.png"
                alt="Kalana Furniture"
                className="w-16 h-auto object-contain"
              />
            </div>
            <h2 className="font-serif text-2xl font-bold text-wood-brown">
              Reset Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Admin Account Recovery
            </p>
          </div>
          
          {isSubmitted ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm">
                <p>If an admin account with that email exists, we've sent a password reset link to it.</p>
              </div>
              <button 
                onClick={onSwitchToLogin} 
                className="flex items-center justify-center w-full text-wood-brown hover:text-wood-accent font-bold transition-colors"
              >
                <FaArrowLeft className="mr-2" /> Back to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center text-sm mb-8">
                Enter your administrator email address and we'll send you a link to reset your password.
              </p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaUser />
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-accent focus:border-transparent transition-all ${
                        error ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@kalana.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmail}
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                </div>
                
                <button 
                  className="w-full bg-wood-brown text-white font-bold py-3 px-4 rounded-lg hover:bg-wood-accent hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-500 hover:text-wood-brown font-medium transition-colors flex items-center justify-center w-full"
                >
                  <FaArrowLeft className="mr-2" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Kalana Furniture. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
