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

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <Icon className={`w-5 h-5 ${textColor} mr-2`} />
      <span className={`text-sm ${textColor}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-4 ${textColor} hover:opacity-75`}
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
  },
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
