export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  folderId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  clickCount: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  isExpanded: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppSettings {
  darkMode: boolean;
  viewMode: 'grid' | 'list';
  searchTerm: string;
  selectedTags: string[];
  selectedFolder: string;
  showFolders: boolean;
  showTags: boolean;
  showFavorites: boolean;
  sortBy: 'newest' | 'oldest' | 'mostUsed';
}

export interface AppData {
  links: Link[];
  folders: Folder[];
  tags: Tag[];
  settings: AppSettings;
}