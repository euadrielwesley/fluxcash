import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const NotificationPersistence: React.FC = () => {
    const { user, isDemo } = useAuth();
    const { notifications, loadNotifications } = useNotification();

    // Load from Storage on Mount / User Change
    useEffect(() => {
        if (!user) return;

        // Use user-specific key or 'demo' key
        const uniqueKey = `flux_notifications_${user.id}`;

        // Only load if we haven't loaded yet? Or simply overwrite?
        // Since this runs on mount of AuthenticatedApp, it's safe to overwrite initial state.
        try {
            const stored = localStorage.getItem(uniqueKey);
            if (stored) {
                loadNotifications(JSON.parse(stored));
            } else {
                loadNotifications([]);
            }
        } catch (e) {
            console.warn('Failed to load notifications', e);
        }
    }, [user?.id, loadNotifications]);

    // Save to Storage on Change
    useEffect(() => {
        if (!user) return;

        const uniqueKey = `flux_notifications_${user.id}`;
        // Debounce potential saves if needed, but for now direct save
        // Filter out temporary toasts if we had any flag, but assuming all are persistent
        // Limit to last 50 to avoid storage overflow
        const safePayload = JSON.stringify(notifications.slice(0, 50));
        localStorage.setItem(uniqueKey, safePayload);

    }, [notifications, user?.id]);

    return null; // Logic-only component
};

export default NotificationPersistence;
