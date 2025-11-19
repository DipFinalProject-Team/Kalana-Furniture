import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-wood-brown',
      text: 'text-wood-light',
      icon: <FaCheckCircle className="text-wood-light" size={24} />,
    },
    error: {
      bg: 'bg-red-700',
      text: 'text-white',
      icon: <FaTimesCircle className="text-white" size={24} />,
    },
  };

  const styles = typeStyles[type];

  return (
    <div 
      className={`fixed top-20 right-5 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-4 ${styles.bg} ${styles.text} animate-slide-in`}
    >
      {styles.icon}
      <span className="font-semibold">{message}</span>
      <button onClick={onClose} className="text-xl font-bold ml-auto pl-2">&times;</button>
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
