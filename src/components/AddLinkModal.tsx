import React, { useState, useEffect } from 'react';
import { X, Plus, Globe, Tag as TagIcon, Folder, Save, Link as LinkIcon } from 'lucide-react';
import { Link, Folder as FolderType, Tag } from '../types/index';
import { cn } from '../utils/cn';
import { getFaviconUrl, extractMetadata } from '../utils/favicon';
import { useClipboard } from '../hooks/useClipboard';
import { useFormPersistence } from '../hooks/useFormPersistence';

interface AddLinkModalProps {
  folders: FolderType[];
  tags: Tag[];
  onClose: () => void;
  onAddLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  onAddLink: (link: Omit<Link, 'id' | 'createdAt' | 'clickCount'>) => void;
  existingTags: string[];
  isSubmitting?: boolean;
}

export function AddLinkModal({ folders, tags, onClose, onAddLink, existingTags, isSubmitting = false }: AddLinkModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    folderId: '',
    tags: [] as string[],
    isFavorite: false
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<{ title?: string; description?: string } | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [newFolder, setNewFolder] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const { clipboardText, isValidUrl: isClipboardUrl, checkClipboard } = useClipboard();
  const { saveFormData, loadFormData, clearFormData } = useFormPersistence();
  const [hasAutoFilledFromClipboard, setHasAutoFilledFromClipboard] = useState(false);

  // Load saved form data on mount
  useEffect(() => {
    const savedFormData = loadFormData();
    if (savedFormData) {
      setFormData(savedFormData);
    }
  }, []);

  // Auto-paste clipboard URL on mount and when modal opens
  useEffect(() => {
    const autoFillFromClipboard = async () => {
      // Only auto-fill once when modal opens
      if (hasAutoFilledFromClipboard) return;
      
      // Check clipboard when modal opens
      await checkClipboard();
      
      // Small delay to ensure clipboard check is complete
      setTimeout(() => {
        if (isClipboardUrl && clipboardText && !formData.url) {
          setFormData(prev => ({ ...prev, url: clipboardText }));
          handleUrlChange(clipboardText);
          setHasAutoFilledFromClipboard(true);
        }
      }, 100);
    };

    autoFillFromClipboard();
  }, []); // Only run once on mount


  // Save form data whenever it changes
  useEffect(() => {
    // Only save if there's meaningful data
    if (formData.title || formData.url || formData.description || formData.tags.length > 0) {
      saveFormData(formData);
    }
  }, [formData, saveFormData]);

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    if (url && isValidUrl(url)) {
      setIsLoading(true);
      try {
        const meta = await extractMetadata(url);
        setMetadata(meta);
        if (meta.title && !formData.title) {
          setFormData(prev => ({ ...prev, title: meta.title || '' }));
        }
        if (meta.description && !formData.description) {
          setFormData(prev => ({ ...prev, description: meta.description || '' }));
        }
      } catch (error) {
        console.error('Error extracting metadata:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const handleAddFolder = () => {
    if (newFolder.trim()) {
      setFormData(prev => ({ ...prev, folderId: newFolder.trim() }));
      setNewFolder('');
      setShowFolderInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      return;
    }

    onAddLink({
      title: formData.title.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      folderId: formData.folderId,
      tags: formData.tags,
      isFavorite: formData.isFavorite,
      clickCount: 0
    });

    // Clear saved form data on successful submission
    clearFormData();
  };

  const handleClose = () => {
    // Clear saved form data when manually closing
    clearFormData();
    onClose();
  };

  const filteredTagSuggestions = existingTags.filter(tag => 
    tag.toLowerCase().includes(newTag.toLowerCase()) && 
    !formData.tags.includes(tag)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-indigo-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900">Add New Link</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {formData.url && isValidUrl(formData.url) && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={getFaviconUrl(formData.url)}
                    alt=""
                    className="w-8 h-8 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <LinkIcon className="w-6 h-6 text-gray-400 hidden" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {metadata?.title || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {formData.url}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter link title"
              required
              className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700">
              Folder
            </label>
            <div className="space-y-2">
              {!showFolderInput ? (
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="folder"
                    value={formData.folderId}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setShowFolderInput(true);
                      } else {
                        setFormData(prev => ({ ...prev, folderId: e.target.value }));
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">No folder</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                    <option value="__new__">+ Create new folder</option>
                  </select>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={newFolder}
                      onChange={(e) => setNewFolder(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFolder())}
                      placeholder="Enter folder name"
                      className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFolder}
                    className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFolderInput(false);
                      setNewFolder('');
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag"
                  className="w-full pl-10 pr-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
                />
                {showTagSuggestions && newTag && filteredTagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredTagSuggestions.slice(0, 5).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                          setNewTag('');
                          setShowTagSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.isFavorite}
              onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 bg-indigo-50 border-indigo-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="favorite" className="text-sm font-medium text-gray-700">
              Add to favorites
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                clearFormData();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.url.trim() || isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}