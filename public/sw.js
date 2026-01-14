// FluxCash Dashboard - Service Worker
// Version 1.0.0

const CACHE_NAME = 'fluxcash-v1';
const RUNTIME_CACHE = 'fluxcash-runtime';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // API requests - network first
    if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Static assets - cache first
    if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML/JS - network first with cache fallback
    event.respondWith(networkFirst(request));
});

// Network First Strategy
async function networkFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request);

        // Cache successful responses
        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/');
        }

        throw error;
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);

        if (response.status === 200) {
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Failed to fetch:', request.url);
        throw error;
    }
}

// Background Sync for offline transactions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncTransactions());
    }
});

async function syncTransactions() {
    console.log('[SW] Syncing offline transactions...');
    // This will be implemented when integrating with Supabase
    // For now, just log
    return Promise.resolve();
}

// Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'FluxCash';
    const options = {
        body: data.body || 'Nova notificação',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        data: data.url || '/',
        vibrate: [200, 100, 200],
        tag: data.tag || 'notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || '/')
    );
});

console.log('[SW] Service Worker loaded');
