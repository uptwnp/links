import { useState, useEffect } from 'react';
import { Link } from '../types/index';
import { getCacheKey, CACHE_VERSION } from '../config/version';

const CACHE_KEY = getCacheKey('linkVault_cache');
const LAST_FETCHED_KEY = getCacheKey('linkVault_lastFetched');
const VERSION_KEY = 'linkVault_version';

interface CacheData {
  links: Link[];
  timestamp: number;
}

export function useLinkCache() {
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_FETCHED_KEY);
    if (stored) {
      setLastFetched(stored);
    }
    
    // Clear old cache if version changed
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CACHE_VERSION) {
      clearOldCache();
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
    }
  }, []);

  const clearOldCache = () => {
    // Clear all linkVault related items from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('linkVault_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const saveToCache = (links: Link[]) => {
    const cacheData: CacheData = {
      links,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    const now = new Date().toISOString();
    localStorage.setItem(LAST_FETCHED_KEY, now);
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
    setLastFetched(now);
  };

  const loadFromCache = (): Link[] | null => {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const cacheData: CacheData = JSON.parse(stored);
        // Always return cached data for instant loading
        // Background refresh will update it if needed
        return cacheData.links;
      }
    } catch (err) {
      console.error('Error loading from cache:', err);
    }
    return null;
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LAST_FETCHED_KEY);
    setLastFetched(null);
  };

  return {
    saveToCache,
    loadFromCache,
    clearCache,
    lastFetched,
  };
}