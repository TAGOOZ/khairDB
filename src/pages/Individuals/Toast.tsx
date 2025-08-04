import React from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
  const Icon = type === 'success' ? CheckCircle : XCircle;
  
  // Get document direction for RTL-aware positioning
  const isRTL = document.documentElement.dir === 'rtl';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center p-4 rounded-lg border shadow-lg ${bgColor} ${borderColor} max-w-md`}>
      <Icon className={`w-5 h-5 ${textColor} ${isRTL ? 'ml-2' : 'mr-2'}`} />
      <span className={`text-sm ${textColor} flex-1`}>{message}</span>
      <button
        onClick={onClose}
        className={`${isRTL ? 'mr-4' : 'ml-4'} ${textColor} hover:opacity-75 flex-shrink-0`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export const toast = {
  success: (message: string) => {
    showToast(message, 'success');
  },
  error: (message: string) => {
    showToast(message, 'error');
  }
};

function showToast(message: string, type: 'success' | 'error') {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);
  
  root.render(
    <Toast
      message={message}
      type={type}
      onClose={() => {
        root.unmount();
        container.remove();
      }}
    />
  );

  setTimeout(() => {
    root.unmount();
    container.remove();
  }, 5000);
}
