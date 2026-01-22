// Service Worker for GroomRoute PWA
// This enables the "Add to Home Screen" prompt on Android/Chrome

const CACHE_NAME = 'groomroute-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event - network-first strategy (always get fresh data)
self.addEventListener('fetch', (event) => {
  // For API calls and dynamic content, always go to network
  // This is a minimal service worker just to enable PWA install
  event.respondWith(fetch(event.request));
});
