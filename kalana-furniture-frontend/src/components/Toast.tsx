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
    }, 5000); // Auto-close after 5 seconds for better readability

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed top-28 right-4 z-[60] animate-in slide-in-from-right-4 fade-in-0 duration-500">
      <div className={`flex items-center space-x-4 px-8 py-5 rounded-2xl shadow-2xl border-2 backdrop-blur-md ${
        type === 'success'
          ? 'bg-amber-50/95 border-amber-200/60 text-amber-900 shadow-amber-100/50'
          : 'bg-red-50/95 border-red-200/60 text-red-900 shadow-red-100/50'
      }`}>
        <div className={`p-2 rounded-full ${
          type === 'success'
            ? 'bg-amber-100/80'
            : 'bg-red-100/80'
        }`}>
          {type === 'success' ? (
            <FaCheckCircle className="text-xl flex-shrink-0 text-amber-600" />
          ) : (
            <FaExclamationTriangle className="text-xl flex-shrink-0 text-red-600" />
          )}
        </div>
        <span className="font-medium text-base leading-relaxed">{message}</span>
        <button
          onClick={onClose}
          className={`ml-4 p-1 rounded-full transition-all duration-200 hover:bg-black/5 ${
            type === 'success' ? 'text-amber-700 hover:text-amber-900' : 'text-red-700 hover:text-red-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
