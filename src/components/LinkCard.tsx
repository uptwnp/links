import React from 'react';
import { ExternalLink, Star, Edit2, Trash2, MoreVertical, Calendar, Tag as TagIcon, Copy } from 'lucide-react';
import { Link, Folder, Tag } from '../types/index';
import { cn } from '../utils/cn';
import { getFaviconUrl } from '../utils/favicon';

interface LinkCardProps {
  link: Link;
  viewMode: 'list';
  folders: Folder[];
  tags: Tag[];
  onContextMenu: (e: React.MouseEvent, link: Link) => void;
  onOpenLink: (url: string, newTab?: boolean) => void;
  onToggleFavorite: (linkId: string, isFavorite: boolean) => void;
  onEdit: (linkId: string, updatedLink: Partial<Link>) => void;
  onDelete: (linkId: string) => void;
  onLinkClick: (linkId: string) => void;
  onCopyLink: (url: string) => void;
}

export function LinkCard({
  link,
  folders,
  tags,
  onContextMenu,
  onOpenLink,
  onToggleFavorite,
  onEdit,
  onDelete,
  onLinkClick,
  onCopyLink
}: LinkCardProps) {
  const folder = folders.find(f => f.id === link.folderId);
  const linkTags = tags.filter(tag => link.tags.includes(tag.name));

  const handleClick = (e: React.MouseEvent) => {
    // Then open the link
    if (e.ctrlKey || e.metaKey) {
      onOpenLink(link.url, true);
    } else {
      onOpenLink(link.url, true);
    }
    
    // Increment click count after opening (non-blocking)
    onLinkClick(link.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be handled by the parent component
    onEdit(link.id, {});
  };

  return (
    <div
      className="group bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, link)}
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden border border-blue-100 flex-shrink-0">
          <img
            src={getFaviconUrl(link.url)}
            alt=""
            className="w-6 h-6 sm:w-8 sm:h-8 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <ExternalLink className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 hidden" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
              {link.title}
            </h3>
            {link.isFavorite && (
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-blue-600 truncate hover:text-blue-800">
          </p>
          
          {link.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
              {link.description}
            </p>
          )}
          
          <div className="flex items-center flex-wrap gap-2 sm:gap-4 mt-2">
            {folder && (
              <div className="flex items-center space-x-1">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {folder.name}
                </span>
              </div>
            )}
            
            {linkTags.length > 0 && (
              <div className="flex items-center space-x-1">
                <TagIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="flex space-x-1">
                  {linkTags.slice(0, 3).map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {linkTags.length > 3 && (
                    <span className="text-xs text-gray-500">+{linkTags.length - 3}</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{new Date(link.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink(link.url);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy link"
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(link.id, link.isFavorite);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <Star className={cn(
              "w-3 h-3 sm:w-4 sm:h-4",
              link.isFavorite 
                ? "text-yellow-500 fill-current" 
                : "text-gray-400"
            )} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(e);
            }}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}