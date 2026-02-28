import { createContext, useContext, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, variant = 'info', duration = 3000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      variant,
      show: true,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-hide toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => showToast(message, 'success', duration);
  const error = (message, duration) => showToast(message, 'danger', duration);
  const warning = (message, duration) => showToast(message, 'warning', duration);
  const info = (message, duration) => showToast(message, 'info', duration);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => removeToast(toast.id)}
            bg={toast.variant}
            autohide
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {toast.variant === 'success' && '✓ Success'}
                {toast.variant === 'danger' && '✗ Error'}
                {toast.variant === 'warning' && '⚠ Warning'}
                {toast.variant === 'info' && 'ℹ Info'}
              </strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === 'danger' || toast.variant === 'success' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
