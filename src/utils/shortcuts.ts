import { Link } from '../types/index';

export interface AppShortcut {
  name: string;
  short_name: string;
  description: string;
  url: string;
  icons: Array<{
    src: string;
    sizes: string;
  }>;
}

export function getTopLinks(links: Link[], count: number = 3): Link[] {
  return [...links]
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, count);
}

export function generateAppShortcuts(links: Link[]): AppShortcut[] {
  const topLinks = getTopLinks(links, 3);
  
  return topLinks.map((link, index) => ({
    name: link.title,
    short_name: link.title.length > 12 ? link.title.substring(0, 12) + '...' : link.title,
    description: `Quick access to ${link.title}`,
    url: `/?shortcut=${encodeURIComponent(link.id)}`,
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192'
      }
    ]
  }));
}

export function getShortcutFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('shortcut');
}
