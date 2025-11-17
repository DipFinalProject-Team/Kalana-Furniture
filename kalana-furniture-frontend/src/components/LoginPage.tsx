import { useState } from 'react';
// You can replace this with your actual logo or an icon
const FurnitureIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
); 

type LoginPageProps = {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
};

const LoginPage = ({ onSwitchToRegister, onForgotPassword }: LoginPageProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      console.log('Login successful:', formData);
      // Here you would typically handle the login logic
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg flex overflow-hidden">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold text-wood-brown mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Please log in to your account.</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
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
            
            <div>
              <div className="flex justify-between items-baseline">
                <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="password">Password</label>
                <button type="button" onClick={onForgotPassword} className="text-sm text-wood-brown hover:text-wood-accent">Forgot password?</button>
              </div>
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
            </div>
            
            <button 
              className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="text-wood-brown hover:text-wood-accent font-bold">
              Sign up now
            </button>
          </p>
        </div>

        {/* Right Side - Decorative */}
        <div className="hidden md:flex md:w-1/2 bg-wood-brown p-12 flex-col justify-center items-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
          <FurnitureIcon className="w-24 h-24 mb-4 text-wood-accent" />
          <h1 className="font-serif text-4xl font-bold mb-2">Kalana Furniture</h1>
          <p className="text-center text-wood-light">Your space, your style.</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;