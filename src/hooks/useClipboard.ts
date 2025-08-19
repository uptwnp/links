import { useState, useEffect, useCallback } from 'react';

export function useClipboard() {
  const [clipboardText, setClipboardText] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const checkClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setClipboardText(text);
        
        // Check if it's a valid URL
        try {
          new URL(text);
          setIsValidUrl(true);
        } catch {
          setIsValidUrl(false);
        }
      }
    } catch (err) {
      // Clipboard access denied or not available
      console.log('Clipboard access not available');
    }
  }, []);

  useEffect(() => {
    checkClipboard();
  }, [checkClipboard]);

  return { clipboardText, isValidUrl, checkClipboard };
}