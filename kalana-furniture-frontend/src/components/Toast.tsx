import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-close after 4 seconds to match UserProfile

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed top-28 right-4 z-[60] animate-in slide-in-from-right-4 fade-in-0 duration-300">
      <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-lg ${
        type === 'success'
          ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-100 shadow-emerald-500/20'
          : 'bg-red-500/25 border-red-400/40 text-red-100 shadow-red-500/20'
      }`}>
        {type === 'success' ? (
          <FaCheckCircle className="text-emerald-400 text-xl flex-shrink-0" />
        ) : (
          <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0" />
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white/70 hover:text-white transition-colors duration-200 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;

// Add this to your App.css or index.css for the animation
/* 
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.5s ease-out forwards;
}
*/
