import React, { useEffect, useRef } from 'react';
import { ExternalLink, Copy, Edit2, Trash2, Star, Move, Folder } from 'lucide-react';
import { Link, Folder as FolderType } from '../types/index';
import { cn } from '../utils/cn';

interface ContextMenuProps {
  x: number;
  y: number;
  link: Link;
  folders: FolderType[];
  onClose: () => void;
  onOpenLink: (url: string, newTab?: boolean) => void;
  onCopyLink: (url: string) => void;
  onEdit: (linkId: string, updatedLink: Partial<Link>) => void;
  onDelete: (linkId: string) => void;
  onMoveLink: (linkId: string, folderId: string) => void;
  onToggleFavorite: (linkId: string, isFavorite: boolean) => void;
}

export function ContextMenu({
  x,
  y,
  link,
  folders,
  onClose,
  onOpenLink,
  onCopyLink,
  onEdit,
  onDelete,
  onMoveLink,
  onToggleFavorite
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: ExternalLink,
      label: 'Open link',
      action: () => onOpenLink(link.url, true),
      shortcut: ''
    },
    {
      icon: Copy,
      label: 'Copy link',
      action: () => onCopyLink(link.url),
      shortcut: 'Ctrl+C'
    },
    {
      icon: Star,
      label: link.isFavorite ? 'Remove from favorites' : 'Add to favorites',
      action: () => onToggleFavorite(link.id, link.isFavorite),
      className: link.isFavorite ? 'text-yellow-600' : ''
    },
    {
      icon: Edit2,
      label: 'Edit',
      action: () => {
        // Edit functionality would go here
        onClose();
      }
    },
    {
      type: 'separator'
    },
    {
      icon: Move,
      label: 'Move to folder',
      submenu: [
        {
          icon: Folder,
          label: 'No folder',
          action: () => onMoveLink(link.id, ''),
          active: !link.folderId
        },
        ...folders.map(folder => ({
          icon: Folder,
          label: folder.name,
          action: () => onMoveLink(link.id, folder.id),
          active: link.folderId === folder.id,
          color: folder.color
        }))
      ]
    },
    {
      type: 'separator'
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: () => {
        if (confirm('Are you sure you want to delete this link?')) {
          onDelete(link.id);
        }
      },
      className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-indigo-200 dark:border-slate-700 py-2 min-w-[200px] z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -10px)'
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="h-px bg-indigo-200 dark:bg-slate-700 my-1" />;
        }

        if (item.submenu) {
          return (
            <div key={index} className="group relative">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <span className="ml-auto">›</span>
              </button>
              
              <div className="absolute left-full top-0 ml-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-indigo-200 dark:border-slate-700 py-2 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {item.submenu.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => {
                      subItem.action();
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors",
                      subItem.active && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    )}
                  >
                    <subItem.icon className="w-4 h-4" style={{ color: subItem.color }} />
                    <span>{subItem.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors",
              item.className
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-xs text-gray-500 dark:text-slate-400">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}