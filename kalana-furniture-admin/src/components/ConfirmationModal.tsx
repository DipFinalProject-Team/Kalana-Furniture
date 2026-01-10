import React from 'react';
import { FaExclamationTriangle, FaTimes, FaCheckCircle } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'red' | 'green' | 'blue';
  iconType?: 'warning' | 'success' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonColor = 'red',
  iconType = 'warning',
}) => {
  if (!isOpen) return null;

  const getIconAndStyle = () => {
    switch (iconType) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-xl text-green-600" />,
          bgColor: 'bg-green-100'
        };
      case 'info':
        return {
          icon: <FaCheckCircle className="text-xl text-blue-600" />,
          bgColor: 'bg-blue-100'
        };
      case 'warning':
      default:
        return {
          icon: <FaExclamationTriangle className="text-xl text-orange-600" />,
          bgColor: 'bg-orange-100'
        };
    }
  };

  const { icon, bgColor } = getIconAndStyle();

  const getConfirmButtonClasses = () => {
    const baseClasses = "px-5 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all transform hover:-translate-y-0.5 focus:ring-2";
    
    switch (confirmButtonColor) {
      case 'green':
        return `${baseClasses} bg-green-600 hover:bg-green-700 shadow-green-200 focus:ring-green-500`;
      case 'blue':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 shadow-blue-200 focus:ring-blue-500`;
      case 'red':
      default:
        return `${baseClasses} bg-red-600 hover:bg-red-700 shadow-red-200 focus:ring-red-500`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 border-t-4 border-wood-brown overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-wood-brown">
              <div className={`p-2 rounded-full ${bgColor}`}>
                {icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={getConfirmButtonClasses()}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
