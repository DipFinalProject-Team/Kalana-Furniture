import React from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-900 border-green-200';
      case 'warning': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'danger': return 'bg-red-50 text-red-900 border-red-200';
      default: return 'bg-white text-stone-900 border-stone-200';
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      default: return 'bg-stone-800 hover:bg-stone-900 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${getTypeStyles()}`}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-stone-600">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors font-medium"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-md transition-colors font-medium shadow-sm ${getButtonStyles()}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
