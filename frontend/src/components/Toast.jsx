import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Info') => addToast({ type: 'info', title, message })
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-white transition-all transform animate-slide-in ${
              item.type === 'success'
                ? 'border-emerald-200'
                : item.type === 'error'
                ? 'border-rose-200'
                : item.type === 'warning'
                ? 'border-amber-200'
                : 'border-blue-200'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
              {item.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
              {item.type === 'warning' && <AlertCircle size={18} className="text-amber-500" />}
              {item.type === 'info' && <Info size={18} className="text-blue-500" />}
            </div>

            <div className="flex-1 min-w-0">
              {item.title && (
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-0.5">
                  {item.title}
                </p>
              )}
              <p className="text-sm font-medium text-gray-700 leading-snug">{item.message}</p>
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
