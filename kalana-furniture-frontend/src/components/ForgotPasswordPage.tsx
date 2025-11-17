import { useState } from 'react';

// Re-using the FurnitureIcon from other pages for consistency
const FurnitureIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
    <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

type ForgotPasswordPageProps = {
  onSwitchToLogin: () => void;
};

const ForgotPasswordPage = ({ onSwitchToLogin }: ForgotPasswordPageProps) => {
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
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password reset request for:', email);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-6">
            <FurnitureIcon className="w-20 h-20 text-wood-accent" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-wood-brown text-center mb-2">Forgot Password?</h2>
          
          {isSubmitted ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">If an account with that email exists, we've sent a password reset link to it.</p>
              <button onClick={onSwitchToLogin} className="text-wood-brown hover:text-wood-accent font-bold">
                &larr; Back to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-8">Enter your email and we'll send you a link to reset your password.</p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-wood-brown mb-1" htmlFor="email">Email Address</label>
                  <input 
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wood-accent ${error ? 'border-red-500' : ''}`} 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>
                
                <button 
                  className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remembered your password?{' '}
                <button onClick={onSwitchToLogin} className="text-wood-brown hover:text-wood-accent font-bold">
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
