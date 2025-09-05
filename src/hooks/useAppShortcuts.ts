import { useEffect, useState } from 'react';
import { Link } from '../types/index';
import { generateAppShortcuts, getShortcutFromUrl } from '../utils/shortcuts';

export function useAppShortcuts(links: Link[]) {
  const [shortcuts, setShortcuts] = useState<any[]>([]);
  const [shortcutLinkId, setShortcutLinkId] = useState<string | null>(null);

  // Generate shortcuts when links change
  useEffect(() => {
    if (links.length > 0) {
      const appShortcuts = generateAppShortcuts(links);
      setShortcuts(appShortcuts);
      
      // Update manifest.json with new shortcuts
      updateManifestShortcuts(appShortcuts);
    }
  }, [links]);

  // Check for shortcut from URL on mount
  useEffect(() => {
    const shortcutId = getShortcutFromUrl();
    if (shortcutId) {
      setShortcutLinkId(shortcutId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const updateManifestShortcuts = (appShortcuts: any[]) => {
    try {
      // Get current manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        fetch(manifestLink.href)
          .then(response => response.json())
          .then(manifest => {
            // Update shortcuts in manifest
            const updatedManifest = {
              ...manifest,
              shortcuts: [
                {
                  name: "Add Link",
                  short_name: "Add",
                  description: "Quickly add a new link",
                  url: "/?action=add",
                  icons: [
                    {
                      src: "/icon-192.png",
                      sizes: "192x192"
                    }
                  ]
                },
                ...appShortcuts
              ]
            };

            // Create new manifest blob and update link
            const manifestBlob = new Blob([JSON.stringify(updatedManifest, null, 2)], {
              type: 'application/json'
            });
            const manifestUrl = URL.createObjectURL(manifestBlob);
            manifestLink.href = manifestUrl;
          })
          .catch(error => {
            console.error('Error updating manifest shortcuts:', error);
          });
      }
    } catch (error) {
      console.error('Error updating manifest shortcuts:', error);
    }
  };

  return {
    shortcuts,
    shortcutLinkId,
    clearShortcut: () => setShortcutLinkId(null)
  };
}
