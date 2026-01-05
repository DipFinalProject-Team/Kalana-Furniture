import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // Supabase sends the token as a hash fragment, not query params
  // e.g. http://localhost:5173/reset-password#access_token=...&refresh_token=...
  // We need to parse the hash if query params are empty
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (!accessToken || !refreshToken)) {
      const params = new URLSearchParams(hash.substring(1)); // remove the #
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      
      if (access_token && refresh_token) {
        // We found tokens in the hash, we can use them
        // But for consistency with the rest of the code, let's just store them in state or use them directly
        // For now, let's just check if we have them.
      } else {
         // If we don't have tokens in query or hash, show error
         if (!accessToken && !refreshToken) {
             // It's possible Supabase sends them in the URL query string if configured that way, 
             // but usually it's hash for implicit flow. 
             // However, for resetPasswordForEmail with redirectTo, it might be a code or token in query.
             // Let's handle both.
         }
      }
    }
  }, [accessToken, refreshToken]);

  const getTokens = () => {
      if (accessToken && refreshToken) return { accessToken, refreshToken };
      
      const hash = window.location.hash;
      if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          return {
              accessToken: params.get('access_token'),
              refreshToken: params.get('refresh_token')
          };
      }
      return { accessToken: null, refreshToken: null };
  };

  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const { accessToken: token, refreshToken: refresh } = getTokens();

    if (!token || !refresh) {
        setError('Invalid or missing reset token. Please request a new password reset link.');
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update password using Supabase
      const response = await axios.post('http://localhost:3000/api/users/reset-password', {
        password: password,
        accessToken: token,
        refreshToken: refresh
      });

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="Kalana Furniture Logo"
                className="w-[140px] h-[63px] object-cover"
              />
            </div>
            <h2 className="font-serif text-3xl font-bold text-wood-brown mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">Your password has been updated successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="Kalana Furniture Logo"
              className="w-[140px] h-[63px] object-cover"
            />
          </div>
          <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-2">Reset Your Password</h2>
          <p className="text-gray-600 text-center mb-8">Enter your new password below.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="password">New Password</label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${error ? 'border-red-500' : ''}`}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="confirm-password">Confirm New Password</label>
              <div className="relative">
                <input
                  className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${error ? 'border-red-500' : ''}`}
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;