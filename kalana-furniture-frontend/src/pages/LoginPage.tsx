import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '../hooks/useAuth';

type LoginPageProps = {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
};

const LoginPage = ({
  onSwitchToRegister,
  onForgotPassword,
}: LoginPageProps) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe
      });

      if (result.success) {
        // Clear form
        setFormData({
          email: '',
          password: ''
        });
        // Show loading screen and redirect after a short delay
        setTimeout(() => {
          setShowLoadingScreen(true);
          setTimeout(() => {
            navigate('/');
          }, 2000); // Show loading screen for 2 seconds
        });
      } else {
        setErrors({ login: result.message });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors({ login: message });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg flex overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold text-wood-brown mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 mb-8">Please log in to your account.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-bold text-wood-brown mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${
                  errors.email ? "border-red-500" : ""
                }`}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <label
                  className="block text-sm font-bold text-wood-brown mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-wood-brown hover:text-wood-accent"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-wood-accent focus:ring-wood-accent border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-wood-brown">
                Remember me
              </label>
            </div>
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">{errors.login}</p>
            )}

            <button
              className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-wood-brown hover:text-wood-accent font-bold"
            >
              Sign up now
            </button>
          </p>
        </div>

        {/* Right Side - Decorative */}
        <div className="hidden md:flex md:w-1/2 bg-wood-brown p-12 flex-col justify-center items-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
          <img
            src="/logo.png"
            alt="Kalana Furniture Logo"
            className="w-[250px] h-[113px] object-cover mb-3"
          />
          <h1 className="font-serif text-2xl font-bold mb-2">
            Kalana Furniture
          </h1>
          <p className="text-center text-wood-light">Your space, your style.</p>
        </div>
      </div>

      {showLoadingScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-wood-light rounded-full animate-spin border-t-wood-brown mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-wood-brown rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-wood-brown mb-4">Welcome to Kalana Furniture!</h2>
            <p className="text-gray-600 mb-8">Preparing your personalized experience...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-wood-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
