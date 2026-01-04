import { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { supplierService } from "../services/api";
import Toast from "./Toast";

const SupplierLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await supplierService.login(formData);
      
      if (response.success && response.token) {
        localStorage.setItem('supplierToken', response.token);
        localStorage.setItem('supplierUser', JSON.stringify(response.supplier));
        setToast({ message: "Login successful!", type: 'success' });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setToast({ message: response.message || "Login failed", type: 'error' });
      }
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed. Please check your credentials.";
      setToast({ 
        message: errorMessage, 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-5xl font-serif font-bold leading-tight">
              Crafting Excellence <br/>
              <span className="text-wood-accent">Together.</span>
            </h1>
            <p className="text-lg text-wood-light/80 max-w-md leading-relaxed">
              Welcome to the Supplier Portal. Manage your inventory, track orders, and collaborate with our design team in one seamless workspace.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-wood-light/60">
            <span>© 2024 Kalana Furniture</span>
            <span className="w-1 h-1 bg-wood-accent rounded-full"></span>
            <span>Supplier Network</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to access your dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
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
                      errors.email ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                    }`}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaLock className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-12 py-3.5 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                      errors.password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                    }`}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-gray-300 rounded transition-colors peer-checked:bg-wood-brown peer-checked:border-wood-brown"></div>
                  <svg className="absolute w-3 h-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-wood-brown hover:text-wood-accent transition-colors"
              >
                Forgot password?
              </Link>
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <div className="pt-6 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Not a supplier yet?{" "}
              <Link to="/apply" className="font-medium text-wood-brown hover:text-wood-accent transition-colors">
                Apply for partnership
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierLoginPage;
