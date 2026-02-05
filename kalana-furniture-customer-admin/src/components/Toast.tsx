import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-green-500 text-xl" />;
      case 'error': return <FiAlertCircle className="text-red-500 text-xl" />;
      case 'warning': return <FiAlertCircle className="text-amber-500 text-xl" />;
      default: return <FiInfo className="text-blue-500 text-xl" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': return 'border-green-500 bg-white';
      case 'error': return 'border-red-500 bg-white';
      case 'warning': return 'border-amber-500 bg-white';
      default: return 'border-blue-500 bg-white';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border-l-4 transition-all duration-300 transform translate-y-0 opacity-100 ${getStyles()}`}>
      {getIcon()}
      <div className="flex-1">
        <p className="text-gray-800 font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FiX />
      </button>
    </div>
  );
};

export default Toast;
