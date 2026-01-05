import { useNavigate } from 'react-router-dom';

interface AuthRequiredMessageProps {
  title: string;
  message: string;
  description: string;
}

const AuthRequiredMessage = ({ title, message, description }: AuthRequiredMessageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-wood-light font-sans p-4">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg flex overflow-hidden">
        {/* Left Side - Message */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="font-serif text-3xl font-bold text-wood-brown mb-2">
            {title}
          </h2>
          <p className="text-gray-600 mb-8">{message}</p>

          <div className="space-y-6">
            <p className="text-gray-700">
              {description}
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-wood-accent text-white font-bold py-3 px-4 rounded-md hover:bg-wood-accent-hover transition duration-300"
            >
              Log In Now
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate('/register')}
                className="text-wood-brown hover:text-wood-accent font-bold"
              >
                Sign up now
              </button>
            </p>
          </div>
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
    </div>
  );
};

export default AuthRequiredMessage;