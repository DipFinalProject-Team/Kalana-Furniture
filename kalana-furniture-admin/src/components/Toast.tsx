import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-xl border-l-4 ${
        type === 'success' 
          ? 'bg-white border-green-500 text-gray-800' 
          : 'bg-white border-red-500 text-gray-800'
      }`}>
        <div className={`text-xl ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
        </div>
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Success' : 'Error'}</h4>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;
