
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  pushNotification: (data: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  loadNotifications: (data: AppNotification[]) => void;
  requestPermission: () => Promise<void>;
  permissionStatus: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const loadNotifications = useCallback((data: AppNotification[]) => {
    setNotifications(data);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
  };

  // --- REFINED SOUND DESIGN ---
  const playNotificationSound = (type: string = 'info') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'success') {
        // Suave "Ding" (Sine wave pura, sem ramping agressivo)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Attack mais suave
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Decay longo
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      } else if (type === 'error') {
        // "Bop" suave (Sine de baixa frequência, sem serra)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      } else {
        // "Pop" de vidro (Glassy)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
      }

    } catch (error) {
      console.error('Audio synthesis failed', error);
    }
  };

  const sendNativeNotification = (title: string, body: string) => {
    if (permissionStatus === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'fluxcash-notification'
      });
    }
  };

  const pushNotification = useCallback((data: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    playNotificationSound(data.type);

    if (document.visibilityState === 'hidden' || data.type === 'warning' || data.type === 'success') {
      sendNativeNotification(data.title, data.message);
    }

    window.dispatchEvent(new CustomEvent('flux-toast', { detail: newNotification }));
  }, [permissionStatus]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      pushNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      requestPermission,
      permissionStatus,
      loadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
