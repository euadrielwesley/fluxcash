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
      case 'success': return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 'warning': return 'bg-amber-500 text-white shadow-amber-500/30';
      case 'error': return 'bg-rose-500 text-white shadow-rose-500/30';
      default: return 'bg-slate-800 text-white shadow-slate-900/30';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            layout
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md ${getColor(toast.type)}`}
          >
            <span className="material-symbols-outlined text-[20px] mt-0.5 filled">
              {getIcon(toast.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>
              <p className="text-xs opacity-90 leading-tight mt-1">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;