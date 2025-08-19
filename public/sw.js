const CACHE_NAME = 'linkvault-v1.0.1';
const STATIC_CACHE = 'linkvault-static-v1.0.1';
const DYNAMIC_CACHE = 'linkvault-dynamic-v1.0.1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Service Worker: Dynamic cache ready');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.includes('/api/') || url.hostname.includes('prop.digiheadway.in')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      url.pathname.startsWith('/assets/')) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle app shell (SPA routing)
  event.respondWith(handleAppShell(request));
});

// Handle API requests - network first, cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    console.log('Service Worker: Attempting network request for API');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses (only GET requests)
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        console.log('Service Worker: Cached API response');
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving API from cache');
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection and no cached data available',
        offline: true 
      }), 
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - cache first, network fallback
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving static asset from cache');
      return cachedResponse;
    }

    console.log('Service Worker: Fetching static asset from network');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Cached static asset');
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset');
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle app shell - cache first, network fallback
async function handleAppShell(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving app shell from cache');
      return cachedResponse;
    }

    console.log('Service Worker: Fetching app shell from network');
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Cached app shell');
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, serving index.html from cache');
    
    // Fallback to cached index.html for SPA routing
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
    
    return new Response('App not available offline', { status: 404 });
  }
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync-links') {
    event.waitUntil(syncLinks());
  }
});

// Sync links when connection is restored
async function syncLinks() {
  try {
    console.log('Service Worker: Syncing links in background');
    
    // Notify all clients that sync is happening
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACKGROUND_SYNC_START' });
    });

    // Try to fetch fresh data
    const response = await fetch('https://prop.digiheadway.in/api/mylinks.php?action=get');
    
    if (response.ok) {
      // Cache the fresh data
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('https://prop.digiheadway.in/api/mylinks.php?action=get', response.clone());
      
      // Notify clients that fresh data is available
      clients.forEach(client => {
        client.postMessage({ type: 'BACKGROUND_SYNC_SUCCESS' });
      });
      
      console.log('Service Worker: Background sync completed successfully');
    }
  } catch (error) {
    console.log('Service Worker: Background sync failed:', error);
    
    // Notify clients that sync failed
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'BACKGROUND_SYNC_FAILED' });
    });
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    // Register background sync
    self.registration.sync.register('background-sync-links');
  }
});

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('LinkVault', options)
  );
});