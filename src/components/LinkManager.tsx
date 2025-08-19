import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Copy, Move, MoreVertical, Star, Clock, Globe } from 'lucide-react';
import { Link, Folder, Tag } from '../types/index';
import { cn } from '../utils/cn';
import { LinkCard } from './LinkCard';
import { ContextMenu } from './ContextMenu';

interface LinkManagerProps {
  links: Link[];
  folders: Folder[];
  tags: Tag[];
  viewMode: 'list';
  onDeleteLink: (linkId: string) => void;
  onEditLink: (linkId: string, updatedLink: Partial<Link>) => void;
  onMoveLink: (linkId: string, folderId: string) => void;
  onLinkClick: (linkId: string) => void;
  onCopyLink: (url: string) => void;
}

export function LinkManager({
  links,
  folders,
  tags,
  viewMode,
  onDeleteLink,
  onEditLink,
  onMoveLink,
  onLinkClick,
  onCopyLink
}: LinkManagerProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    link: Link;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, link: Link) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      link
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleOpenLink = (url: string, newTab = true) => {
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleToggleFavorite = (linkId: string, isFavorite: boolean) => {
    onEditLink(linkId, { isFavorite: !isFavorite });
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <ExternalLink className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Links Found</h3>
        <p className="text-gray-500">
          Start by adding your first link to get organized!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Links container */}
      <div className="space-y-3">
        {links.map(link => (
          <LinkCard
            key={link.id}
            link={link}
            viewMode="list"
            folders={folders}
            tags={tags}
            onContextMenu={handleContextMenu}
            onOpenLink={handleOpenLink}
            onToggleFavorite={handleToggleFavorite}
            onEdit={onEditLink}
            onDelete={onDeleteLink}
            onLinkClick={onLinkClick}
            onCopyLink={onCopyLink}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          link={contextMenu.link}
          folders={folders}
          onClose={handleCloseContextMenu}
          onOpenLink={handleOpenLink}
          onCopyLink={handleCopyLink}
          onEdit={onEditLink}
          onDelete={onDeleteLink}
          onMoveLink={onMoveLink}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}