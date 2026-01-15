import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppNotification } from '../types';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: CustomEvent<AppNotification>) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('flux-toast' as any, handleToastEvent);
    return () => window.removeEventListener('flux-toast' as any, handleToastEvent);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20';
      case 'warning': return 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20';
      case 'error': return 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/20';
      default: return 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-indigo-500/20';
    }
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-auto z-[200] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto w-full max-w-[360px] flex items-start gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/5 ${getColor(toast.type)}`}
          >
            <div className={`mt-0.5 p-1.5 rounded-full bg-white/20 flex items-center justify-center shrink-0`}>
              <span className="material-symbols-outlined text-[18px] filled text-white">
                {getIcon(toast.type)}
              </span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-sm font-black leading-tight tracking-tight text-white mb-1">{toast.title}</h4>
              <p className="text-xs font-medium text-white/90 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="p-1 -mr-2 -mt-2 opacity-50 hover:opacity-100 hover:bg-white/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-white">close</span>
            </button>

            {/* Progress Bar/Timer Effect Visualization could go here */}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;