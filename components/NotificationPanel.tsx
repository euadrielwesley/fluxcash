import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from './NotificationContext';
import { AppNotification } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, isMobile }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, requestPermission, permissionStatus } = useNotification();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  // Group notifications logic
  const groupedNotifications = filteredNotifications.reduce((acc, curr) => {
    const isToday = new Date(curr.timestamp).toDateString() === new Date().toDateString();
    const isYesterday = new Date(curr.timestamp).toDateString() === new Date(Date.now() - 86400000).toDateString();
    
    let key = 'Anteriores';
    if (isToday) key = 'Hoje';
    else if (isYesterday) key = 'Ontem';

    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, AppNotification[]>);

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'notifications';
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/20';
      case 'error': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-500/20';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return new Date(timestamp).toLocaleDateString();
  };

  const PanelContent = (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 ${isMobile ? '' : 'rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800'}`}>
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Notificações</h3>
            {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{unreadCount}</span>}
          </div>
          <div className="flex gap-2">
             <button onClick={markAllAsRead} className="p-1.5 text-zinc-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Marcar todas como lidas">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
             </button>
             <button onClick={clearAll} className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Limpar tudo">
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
             </button>
             {isMobile && (
                <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-slate-900 rounded-lg hover:bg-zinc-100 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-200/50 dark:bg-zinc-800 rounded-lg">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'all' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'unread' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            Não Lidas
          </button>
        </div>
      </div>

      {/* Permission Banner */}
      {permissionStatus === 'default' && (
        <div onClick={requestPermission} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
            <div className="bg-indigo-200 dark:bg-indigo-800 p-1.5 rounded-full">
               <span className="material-symbols-outlined text-sm">notifications_active</span>
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold">Ativar Push</span>
               <span className="text-[10px] opacity-80">Receba alertas mesmo com o app fechado</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-xs text-indigo-400">chevron_right</span>
        </div>
      )}

      {/* Content */}
      <div className="overflow-y-auto flex-1 overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-8 text-zinc-400">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-full mb-4 animate-bounce-slow">
                  <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-600">notifications_off</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-300">Nada por aqui</p>
                <p className="text-xs mt-1 max-w-[200px]">Quando houver novidades sobre suas finanças, elas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {Object.entries(groupedNotifications).map(([group, items]: [string, AppNotification[]]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/30 text-[10px] font-bold text-zinc-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm border-y border-zinc-100 dark:border-zinc-800/50 z-10">
                    {group}
                  </div>
                  {items.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`group relative p-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all border-b border-zinc-50 dark:border-zinc-800 last:border-0 cursor-pointer ${!n.read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                    >
                        <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getColor(n.type)}`}>
                          <span className="material-symbols-outlined text-[20px] filled">{getIcon(n.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm leading-tight truncate ${!n.read ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-600 dark:text-zinc-400'}`}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">{formatTime(n.timestamp)}</span>
                          </div>
                          <p className={`text-xs mt-1 leading-snug line-clamp-2 ${!n.read ? 'text-slate-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`}>{n.message}</p>
                        </div>
                        
                        {!n.read && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 size-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                        )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-900 flex flex-col animate-fade-in">
         {PanelContent}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 md:w-96 h-[500px] max-h-[80vh] z-50 origin-top-right"
    >
      {PanelContent}
    </motion.div>
  );
};

export default NotificationPanel;