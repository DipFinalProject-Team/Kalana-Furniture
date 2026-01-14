import { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaArrowLeft, FaList, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { supplierService } from "../services/api";
import Toast from "./Toast";

const SupplierRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    categories: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.contactPerson) newErrors.contactPerson = "Contact Person is required";
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const { confirmPassword, ...submissionData } = formData;
      void confirmPassword;
      
      const response = await supplierService.register(submissionData);
      
      if (response.success) {
        setToast({ message: "Registration successful! Please wait for admin approval.", type: 'success' });
        // Navigate to login immediately after successful registration
        navigate('/login');
      } else {
        setToast({ message: response.message || "Registration failed", type: 'error' });
      }
    } catch (error: unknown) {
      console.error("Submission failed:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed. Please try again.";
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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=1965&auto=format&fit=crop')" }}
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
              Join Our Network of <br/>
              <span className="text-wood-accent">Master Craftsmen.</span>
            </h1>
            <p className="text-lg text-wood-light/80 max-w-md leading-relaxed">
              Partner with Kalana Furniture to showcase your products to a wider audience. We value quality, sustainability, and craftsmanship.
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gray-50 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">Become a Partner</h2>
            <p className="text-gray-500">Fill out the form below to apply for a supplier account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="companyName">
                  Company Name *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaBuilding className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                      errors.companyName ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                    }`}
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Furniture Co. Ltd."
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.companyName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.companyName}</p>}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="contactPerson">
                  Contact Person *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaUser className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                      errors.contactPerson ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                    }`}
                    id="contactPerson"
                    name="contactPerson"
                    type="text"
                    placeholder="John Doe"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.contactPerson && <p className="text-red-500 text-xs mt-1 ml-1">{errors.contactPerson}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="username">
                  Username *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaUser className="w-5 h-5" />
                  </div>
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                      errors.username ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                    }`}
                    id="username"
                    name="username"
                    type="text"
                    placeholder="your_username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                    Password *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                      <FaLock className="w-4 h-4" />
                    </div>
                    <input
                      className={`w-full pl-9 pr-10 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                        errors.password ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-wood-brown transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
                    Confirm Password *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                      <FaLock className="w-4 h-4" />
                    </div>
                    <input
                      className={`w-full pl-9 pr-10 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                        errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                      }`}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-wood-brown transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                    Email Address *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                      <FaEnvelope className="w-4 h-4" />
                    </div>
                    <input
                      className={`w-full pl-9 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                        errors.email ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                      }`}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="phone">
                    Phone Number *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <input
                      className={`w-full pl-9 pr-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 ${
                        errors.phone ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-wood-accent/50"
                      }`}
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="categories">
                  Product Categories (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-wood-brown transition-colors">
                    <FaList className="w-5 h-5" />
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 hover:border-wood-accent/50"
                    id="categories"
                    name="categories"
                    type="text"
                    placeholder="e.g. Chairs, Tables, Lighting"
                    value={formData.categories}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="message">
                  Additional Information (Optional)
                </label>
                <textarea
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent/50 focus:border-wood-accent transition-all duration-200 hover:border-wood-accent/50"
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Tell us briefly about your products and manufacturing capacity..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-wood-brown transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Back to Login
                </Link>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegistrationPage;
