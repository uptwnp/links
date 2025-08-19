import { Link, Folder, Tag } from '../types/index';
import { ApiLink } from '../services/api';
import { getFaviconUrl } from './favicon';

export function transformApiLinkToLink(apiLink: ApiLink): Link {
  return {
    id: apiLink.id,
    title: apiLink.title,
    url: apiLink.link,
    description: apiLink.description,
    folderId: apiLink.folder,
    tags: apiLink.tags ? apiLink.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    isFavorite: apiLink.isfav === '1',
    createdAt: apiLink.created_time || new Date().toISOString(),
    clickCount: parseInt(apiLink.clicks || '0', 10),
  };
}

export function transformLinkToApiLink(link: Partial<Link>): {
  link: string;
  title: string;
  description: string;
  folder: string;
  tags: string;
  img: string;
  isfav: boolean;
} {
  return {
    link: link.url || '',
    title: link.title || '',
    description: link.description || '',
    folder: link.folderId || '',
    tags: link.tags ? link.tags.join(', ') : '',
    img: link.url ? getFaviconUrl(link.url) : '',
    isfav: link.isFavorite || false,
  };
}

export function extractFoldersFromLinks(links: Link[]): Folder[] {
  const folderMap = new Map<string, Folder>();
  
  links.forEach(link => {
    if (link.folderId && !folderMap.has(link.folderId)) {
      folderMap.set(link.folderId, {
        id: link.folderId,
        name: link.folderId,
        color: generateColorFromString(link.folderId),
        isExpanded: true,
      });
    }
  });

  return Array.from(folderMap.values());
}

export function extractTagsFromLinks(links: Link[]): Tag[] {
  const tagMap = new Map<string, Tag>();
  
  links.forEach(link => {
    link.tags.forEach(tagName => {
      if (!tagMap.has(tagName)) {
        tagMap.set(tagName, {
          id: `tag-${tagName}`,
          name: tagName,
          color: generateColorFromString(tagName),
        });
      }
    });
  });

  return Array.from(tagMap.values());
}

function generateColorFromString(str: string): string {
  const colors = [
    '#6366F1', '#06B6D4', '#8B5CF6', '#059669', '#DC2626',
    '#2563EB', '#7C3AED', '#DB2777', '#0891B2', '#65A30D',
    '#C2410C', '#4338CA', '#16A34A', '#9333EA', '#BE185D',
    '#0369A1', '#0284C7', '#CA8A04', '#7C2D12', '#1D4ED8',
    '#BE123C'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}