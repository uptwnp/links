import { useCallback } from 'react';
import { getCacheKey } from '../config/version';

const FORM_DATA_KEY = getCacheKey('linkVault_formData');

interface FormData {
  title: string;
  url: string;
  description: string;
  folderId: string;
  tags: string[];
  isFavorite: boolean;
  timestamp: number;
}

export function useFormPersistence() {
  const saveFormData = useCallback((formData: Omit<FormData, 'timestamp'>) => {
    const dataWithTimestamp: FormData = {
      ...formData,
      timestamp: Date.now(),
    };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataWithTimestamp));
  }, []);

  const loadFormData = useCallback((): Omit<FormData, 'timestamp'> | null => {
    try {
      const stored = localStorage.getItem(FORM_DATA_KEY);
      if (stored) {
        const formData: FormData = JSON.parse(stored);
        // Return form data if it's less than 2 minutes old
        if (Date.now() - formData.timestamp < 2 * 60 * 1000) {
          const { timestamp, ...dataWithoutTimestamp } = formData;
          return dataWithoutTimestamp;
        } else {
          // Clear expired form data
          localStorage.removeItem(FORM_DATA_KEY);
        }
      }
    } catch (err) {
      console.error('Error loading form data:', err);
    }
    return null;
  }, []);

  const clearFormData = useCallback(() => {
    localStorage.removeItem(FORM_DATA_KEY);
  }, []);

  return {
    saveFormData,
    loadFormData,
    clearFormData,
  };
}