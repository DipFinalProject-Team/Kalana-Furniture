import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.tsx';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '../hooks/useAuth';

type RegistrationPageProps = {
  onSwitchToLogin: () => void;
};

const RegistrationPage = ({ onSwitchToLogin }: RegistrationPageProps) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional but if provided, validate format)
    if (formData.phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
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
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });

      if (result.success) {
        if (result.requiresConfirmation) {
          // Keep form data for user to try again after email confirmation
          setErrors({ registration: result.message });
        } else {
          // Clear form
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            address: ''
          });
          // Show loading screen and redirect after a short delay
          setTimeout(() => {
            setShowLoadingScreen(true);
            setTimeout(() => {
              navigate('/login');
            }, 2000); // Show loading screen for 2 seconds
          });
        }
      } else {
        setErrors({ registration: result.message });
      }
    } catch {
      setErrors({ registration: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-lg flex overflow-hidden">
        {/* Left Side - Decorative */}
        <div className="hidden md:flex md:w-1/2 bg-wood-brown p-12 flex-col justify-center items-center text-white relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
         <img
            src="/logo.png"
            alt="Kalana Furniture Logo"
            className="w-[250px] h-[113px] object-cover mb-6"
          />
          <h1 className="font-serif text-4xl font-bold mb-2">Kalana Furniture</h1>
          <p className="text-center text-wood-light">Crafting comfort for your modern life.</p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold text-wood-brown mb-6">Create an Account</h2>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="name">Full Name</label>
              <input 
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.name ? 'border-red-500' : ''}`} 
                id="name" 
                name="name"
                type="text" 
                placeholder="Kalana Furniture"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="email">Email Address</label>
              <input 
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.email ? 'border-red-500' : ''}`} 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="password">Password</label>
                  <div className="relative">
                    <input 
                      className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.password ? 'border-red-500' : ''}`} 
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
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  <PasswordStrengthMeter password={formData.password}/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="confirm-password">Confirm Password</label>
                  <div className="relative">
                    <input 
                      className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.confirmPassword ? 'border-red-500' : ''}`} 
                      id="confirm-password" 
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

             <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="phone">Phone Number</label>
              <input 
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.phone ? 'border-red-500' : ''}`} 
                id="phone" 
                name="phone"
                type="tel" 
                placeholder="+94 77-345-7890"
                value={formData.phone}
                onChange={handleInputChange}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

             <div>
              <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="address">Address</label>
              <input 
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.address ? 'border-red-500' : ''}`} 
                id="address" 
                name="address"
                type="text" 
                placeholder="123 Main St, Anytown, USA"
                value={formData.address}
                onChange={handleInputChange}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {errors.registration && (
              <p className="text-red-500 text-sm mt-1">{errors.registration}</p>
            )}
            
            <button 
              className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>

           <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-wood-brown hover:text-wood-accent font-bold">
              Log in here
            </button>
          </p>
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
            <h2 className="text-2xl font-bold text-wood-brown mb-4">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-8">Redirecting you to login...</p>
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

export default RegistrationPage;

// NOTE: Create a file `src/assets/furniture-icon.svg` with an SVG icon. 
// A placeholder is provided below.