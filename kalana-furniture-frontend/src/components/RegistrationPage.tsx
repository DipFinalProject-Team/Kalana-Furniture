import { useState } from 'react';
import PasswordStrengthMeter from './PasswordStrengthMeter.tsx';
// You can replace this with your actual logo or an icon
const FurnitureIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
); 

type RegistrationPageProps = {
  onSwitchToLogin: () => void;
};

const RegistrationPage = ({ onSwitchToLogin }: RegistrationPageProps) => {
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
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Registration successful:', formData);
      // Here you would typically handle the registration logic
    } catch (error) {
      console.error('Registration failed:', error);
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
          <FurnitureIcon className="w-24 h-24 mb-4 text-wood-accent" />
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
                placeholder="John Doe"
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
                  <input 
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.password ? 'border-red-500' : ''}`} 
                    id="password" 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  <PasswordStrengthMeter password={formData.password} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="confirm-password">Confirm Password</label>
                  <input 
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${errors.confirmPassword ? 'border-red-500' : ''}`} 
                    id="confirm-password" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
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
    </div>
  );
};

export default RegistrationPage;

// NOTE: Create a file `src/assets/furniture-icon.svg` with an SVG icon. 
// A placeholder is provided below.