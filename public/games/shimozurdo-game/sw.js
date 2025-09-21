// Service Worker for Shimozurdo Game PWA
const CACHE_NAME = 'shimozurdo-game-v1.0.4';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './scenes/menu.js',
  './scenes/hub.js',
  './scenes/handler.js',
  './scenes/game.js',
  './utils/buttons.js',
  './utils/fullscreen.js',
  './utils/pointer.js',
  './assets/images/background.png',
  './assets/images/play-button.png',
  './assets/images/fullscreen.png',
  './assets/images/sound.png',
  './assets/images/quit.png',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Install complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Install failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          console.log('📦 Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        console.log('🌐 Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(error => {
        console.error('❌ Service Worker: Fetch failed', error);
        // Return offline fallback if available
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Handle PWA installation
self.addEventListener('beforeinstallprompt', event => {
  console.log('📱 PWA: Install prompt available');
  event.preventDefault();
  // Store the event for later use
  self.deferredPrompt = event;
});

// Handle PWA app installed
self.addEventListener('appinstalled', event => {
  console.log('🎉 PWA: App installed successfully');
  // Clear the deferredPrompt
  self.deferredPrompt = null;
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Service Worker: Skip waiting requested');
    self.skipWaiting();
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle any background sync tasks
  return Promise.resolve();
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('📬 Service Worker: Push notification received', data);
    
    const options = {
      body: data.body,
      icon: './assets/icon-192.png',
      badge: './assets/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🔔 Service Worker: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
});
