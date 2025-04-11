import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const bgColorClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 ${bgColorClass} text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
