import { useCallback } from 'react';
import { getCacheKey } from '../config/version';

const SETTINGS_KEY = getCacheKey('linkVault_settings');

interface AppSettings {
  searchTerm: string;
  selectedTags: string[];
  selectedFolder: string;
  showFolders: boolean;
  showTags: boolean;
  showFavorites: boolean;
  sortBy: 'newest' | 'oldest' | 'mostUsed';
}

const defaultSettings: AppSettings = {
  searchTerm: '',
  selectedTags: [],
  selectedFolder: '',
  showFolders: false,
  showTags: false,
  showFavorites: false,
  sortBy: 'newest'
};

export function useAppSettings() {
  const saveSettings = useCallback((settings: AppSettings) => {
    try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }, []);

  const loadSettings = useCallback((): AppSettings | null => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch (err) {
      console.error('Error loading settings:', err);
      return defaultSettings;
    }
  }, []);

  const clearSettings = useCallback(() => {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch (err) {
      console.error('Error clearing settings:', err);
    }
  }, []);

  return {
    saveSettings,
    loadSettings,
    clearSettings,
  };
}