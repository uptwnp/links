import { useState, useEffect } from 'react';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('App: Connection restored');
      setIsOnline(true);
      
      // If we were offline, trigger background sync
      if (wasOffline) {
        setWasOffline(false);
        
        // Request background sync from service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'REQUEST_SYNC'
          });
        }
      }
    };

    const handleOffline = () => {
      console.log('App: Connection lost');
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BACKGROUND_SYNC_SUCCESS') {
        console.log('App: Background sync completed, refreshing data');
        // Trigger a data refresh in the app
        window.dispatchEvent(new CustomEvent('background-sync-success'));
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}