import { useState, useEffect } from 'react';
import { Link, Folder, Tag } from '../types/index';
import { apiService } from '../services/api';
import { transformApiLinkToLink, transformLinkToApiLink, extractFoldersFromLinks, extractTagsFromLinks } from '../utils/dataTransform';
import { useLinkCache } from './useLinkCache';
import { useOfflineStatus } from './useOfflineStatus';

export function useApi() {
  const [links, setLinks] = useState<Link[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { saveToCache, loadFromCache } = useLinkCache();
  const { isOnline } = useOfflineStatus();

  const loadLinks = async () => {
    try {
      setError(null);
      
      // Load from cache immediately and show content
      const cachedLinks = loadFromCache();
      if (cachedLinks) {
        setLinks(cachedLinks);
        setFolders(extractFoldersFromLinks(cachedLinks));
        setTags(extractTagsFromLinks(cachedLinks));
        setIsLoading(false); // Immediately hide loading
      }
      
      // Only try to fetch from network if online
      if (isOnline) {
        try {
          const apiLinks = await apiService.getLinks();
          const transformedLinks = apiLinks.map(transformApiLinkToLink);
          
          setLinks(transformedLinks);
          setFolders(extractFoldersFromLinks(transformedLinks));
          setTags(extractTagsFromLinks(transformedLinks));
          
          // Save to cache
          saveToCache(transformedLinks);
          setIsLoading(false);
        } catch (err) {
          console.error('Network fetch failed, using cached data:', err);
          if (!cachedLinks) {
            setError('No internet connection and no cached data available');
          }
          setIsLoading(false);
        }
      } else {
        // Offline mode
        if (!cachedLinks) {
          setError('No internet connection and no cached data available');
        }
        setIsLoading(false);
      }
    } catch (err) {
      setError(isOnline ? 'Failed to load links' : 'No internet connection');
      console.error('Error loading links:', err);
      setIsLoading(false);
    }
  };

  const refreshLinks = async () => {
    if (!isOnline) {
      setError('No internet connection. Cannot refresh data.');
      return;
    }

    try {
      setError(null);
      
      // Force fetch fresh data from API
      const apiLinks = await apiService.getLinks();
      const transformedLinks = apiLinks.map(transformApiLinkToLink);
      
      setLinks(transformedLinks);
      setFolders(extractFoldersFromLinks(transformedLinks));
      setTags(extractTagsFromLinks(transformedLinks));
      
      // Save to cache with new timestamp
      saveToCache(transformedLinks);
    } catch (err) {
      setError('Failed to refresh links');
      console.error('Error refreshing links:', err);
    }
  };

  const addLink = async (linkData: Omit<Link, 'id' | 'createdAt' | 'clickCount'>) => {
    if (!isOnline) {
      setError('No internet connection. Cannot add link.');
      return false;
    }

    try {
      setError(null);
      const apiLinkData = transformLinkToApiLink(linkData);
      const response = await apiService.addLink(apiLinkData);
      
      if (response.status === 'success') {
        await loadLinks(); // Reload to get the updated list
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError('Failed to add link');
      console.error('Error adding link:', err);
      return false;
    }
  };

  const updateLink = async (id: string, linkData: Partial<Link>) => {
    if (!isOnline) {
      setError('No internet connection. Cannot update link.');
      return false;
    }

    try {
      setError(null);
      const currentLink = links.find(link => link.id === id);
      if (!currentLink) {
        setError('Link not found');
        return false;
      }

      const updatedLink = { ...currentLink, ...linkData };
      const apiLinkData = transformLinkToApiLink(updatedLink);
      const response = await apiService.updateLink(id, apiLinkData);
      
      if (response.status === 'success') {
        await loadLinks(); // Reload to get the updated list
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError('Failed to update link');
      console.error('Error updating link:', err);
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    if (!isOnline) {
      setError('No internet connection. Cannot delete link.');
      return false;
    }

    try {
      setError(null);
      const response = await apiService.deleteLink(id);
      
      if (response.status === 'success') {
        await loadLinks(); // Reload to get the updated list
        return true;
      } else {
        setError(response.message);
        return false;
      }
    } catch (err) {
      setError('Failed to delete link');
      console.error('Error deleting link:', err);
      return false;
    }
  };

  const incrementClickCount = async (id: string) => {
    if (!isOnline) {
      // Still update local state for better UX, but don't sync to server
      setLinks(prevLinks => 
        prevLinks.map(l => 
          l.id === id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l
        )
      );
      return;
    }

    try {
      const link = links.find(l => l.id === id);
      if (link) {
        // Send increment request to backend
        const response = await apiService.incrementClickCount(id);
        
        if (response.status === 'success') {
          // Update local state immediately for better UX
          setLinks(prevLinks => 
            prevLinks.map(l => 
              l.id === id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l
            )
          );
        }
      }
    } catch (err) {
      console.error('Error incrementing click count:', err);
    }
  };

  useEffect(() => {
    loadLinks();

    // Listen for background sync success
    const handleBackgroundSync = () => {
      console.log('App: Received background sync success, reloading data');
      loadLinks();
    };

    window.addEventListener('background-sync-success', handleBackgroundSync);

    return () => {
      window.removeEventListener('background-sync-success', handleBackgroundSync);
    };
  }, []);

  return {
    links,
    folders,
    tags,
    isLoading,
    error,
    addLink,
    updateLink,
    deleteLink,
    incrementClickCount,
    refreshLinks,
    isOnline,
  };
}