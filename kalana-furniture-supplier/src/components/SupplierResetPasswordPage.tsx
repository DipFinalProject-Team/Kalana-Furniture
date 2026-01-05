import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { supplierService } from '../services/api';
import Toast from './Toast';

const SupplierResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    } else {
      setIsValidToken(true);
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supplierService.resetPassword({
        token,
        newPassword: formData.password
      });

      if (response.success) {
        setToast({ message: "Password updated successfully!", type: 'success' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setToast({ message: response.message || "Failed to reset password", type: 'error' });
      }
    } catch (error: unknown) {
      console.error("Reset password failed:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to reset password. Please try again.";
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex bg-white font-sans">
        <div className="w-full flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Reset Link</h2>
              <p className="text-red-700 mb-4">This password reset link is invalid or has expired.</p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-wood-brown text-white font-bold py-3 px-4 rounded-xl hover:bg-nav-brown transition-colors"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
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
              Reset Your Password
            </h1>
            <p className="text-lg text-wood-light/80 max-w-md leading-relaxed">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-wood-light/60">
            <span>© 2024 Kalana Furniture</span>
            <span className="w-1 h-1 bg-wood-accent rounded-full"></span>
            <span>Supplier Network</span>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">Set New Password</h2>
            <p className="text-gray-500">Enter your new password below.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaLock className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-12 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${errors.password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"}`}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-wood-brown transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaLock className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-12 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-wood-brown transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierResetPasswordPage;