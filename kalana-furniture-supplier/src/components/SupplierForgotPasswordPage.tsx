import React, { useState } from 'react';
import { FaUser, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { supplierService } from '../services/api';

const SupplierForgotPasswordPage = () => {
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
    setError('');

    try {
      const response = await supplierService.forgotPassword({ email });
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to send reset link. Please try again.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Visual & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-wood-brown overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=1974&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-wood-brown/80 to-nav-brown/90"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-16 text-wood-light w-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-wood-accent rounded-lg flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-8 h-auto opacity-90" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-wide">Kalana Furniture</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-serif font-bold leading-tight">
              Account Recovery
            </h1>
            <p className="text-lg text-wood-light/80 max-w-md leading-relaxed">
              Don't worry, it happens. We'll help you get back to managing your inventory in no time.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-wood-light/60">
            <span>© 2024 Kalana Furniture</span>
            <span className="w-1 h-1 bg-wood-accent rounded-full"></span>
            <span>Supplier Network</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">Reset Password</h2>
            <p className="text-gray-500">Enter your email to receive reset instructions.</p>
          </div>
          
          {isSubmitted ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 border border-green-100 rounded-xl text-green-800">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-bold">Check your email</span>
                </div>
                <p className="text-sm opacity-90 mb-4">If an account exists for <span className="font-semibold">{email}</span>, we've sent a password reset link to it.</p>
                <p className="text-sm opacity-75">Please check your inbox and spam folder. The link will expire in 1 hour.</p>
              </div>
              <Link 
                to="/login" 
                className="flex items-center justify-center w-full py-4 px-4 bg-white border-2 border-wood-brown text-wood-brown font-bold rounded-xl hover:bg-wood-brown hover:text-white transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                      <FaUser className="w-5 h-5" />
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                        error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                      }`}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmail}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span>
                      {error}
                    </p>
                  )}
                </div>
                
                <button 
                  className="w-full bg-wood-brown text-white font-bold py-4 px-4 rounded-xl hover:bg-nav-brown hover:shadow-lg hover:shadow-wood-brown/20 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-6 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-wood-brown transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierForgotPasswordPage;
