import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
    setLoginError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberMe");
        }
        navigate("/");
      } else {
        setLoginError(result.message || "Invalid credentials");
      }
    } catch {
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-wood-light flex items-center justify-center p-4 bg-[url('/wood-texture.jpg')] bg-cover bg-blend-overlay">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-wood-brown/30 relative">
        {/* Decorative border elements */}
        <div className="absolute inset-0 rounded-xl border border-wood-accent/20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-wood-brown/40 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-wood-brown/40 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-wood-brown/40 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-wood-brown/40 rounded-br-xl"></div>
        <div className="p-8 text-center border-b-2 border-wood-brown/20 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-wood-light rounded-full mb-4 shadow-inner border-2 border-wood-brown/30">
            <img
              src="/logo.png"
              alt="Kalana Furniture"
              className="w-16 h-auto object-contain"
            />
          </div>{" "}
          <p className="text-gray-500">Sign in to manage customer support.</p>
          {/* Decorative line */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-wood-brown to-transparent"></div>
        </div>

        <div className="p-8">
          {loginError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-wood-accent focus:border-wood-accent transition-all duration-200
                    ${errors.email ? "border-red-400 bg-red-50 shadow-red-100" : "border-wood-brown/30 bg-gray-50 hover:border-wood-brown/50 focus:shadow-lg focus:shadow-wood-accent/20"}`}
                  placeholder="admin@kalana.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-wood-accent focus:border-wood-accent transition-all duration-200
                    ${errors.password ? "border-red-400 bg-red-50 shadow-red-100" : "border-wood-brown/30 bg-gray-50 hover:border-wood-brown/50 focus:shadow-lg focus:shadow-wood-accent/20"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-wood-brown focus:ring-wood-accent border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 border border-transparent rounded-lg text-white font-medium shadow-sm transition-all
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-wood-brown hover:bg-wood-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wood-accent active:scale-[0.98]"
                }`}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t-2 border-wood-brown/20 flex justify-center">
          <p className="text-xs text-gray-400">© 2026 Kalana Furniture</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
