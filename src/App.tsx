import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Folder,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  Star,
  SortAsc,
  SortDesc,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  X,
} from "lucide-react";
import { LinkManager } from "./components/LinkManager";
import { AddLinkModal } from "./components/AddLinkModal";
import { EditLinkModal } from "./components/EditLinkModal";
import { Link, Folder as FolderType, Tag as TagType } from "./types/index";
import { useApi } from "./hooks/useApi";
import { useAppSettings } from "./hooks/useAppSettings";
import { useLinkCache } from "./hooks/useLinkCache";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { cn } from "./utils/cn";
import { APP_VERSION, BUILD_TIMESTAMP } from "./config/version";

type SortOption = "newest" | "oldest" | "mostUsed";

function App() {
  const {
    links,
    folders,
    tags,
    isLoading,
    error,
    addLink: apiAddLink,
    updateLink: apiUpdateLink,
    deleteLink: apiDeleteLink,
    incrementClickCount,
    refreshLinks,
  } = useApi();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { saveSettings, loadSettings } = useAppSettings();
  const { lastFetched } = useLinkCache();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const {
    isOnline: isOnlineStatus,
    updateAvailable,
    installUpdate,
  } = useOfflineStatus();
  const { shortcutLinkId, clearShortcut } = useAppShortcuts(links);

  // Handle shortcut events
  useEffect(() => {
    const handleShortcutAddLink = () => {
      setShowAddModal(true);
    };

    window.addEventListener("shortcut-add-link", handleShortcutAddLink);

    return () => {
      window.removeEventListener("shortcut-add-link", handleShortcutAddLink);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Handle URL parameters for shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "add") {
      setShowAddModal(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Handle sort shortcut
    const sortParam = urlParams.get("sort");
    if (sortParam === "mostUsed") {
      setSortBy("mostUsed");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle shortcut link clicks
  useEffect(() => {
    if (shortcutLinkId) {
      const link = links.find(l => l.id === shortcutLinkId);
      if (link) {
        // Open the link directly
        window.open(link.url, '_blank');
        // Increment click count
        incrementClickCount(link.id);
        // Clear the shortcut
        clearShortcut();
      }
    }
  }, [shortcutLinkId, links, incrementClickCount, clearShortcut]);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  // Load settings on mount
  useEffect(() => {
    const savedSettings = loadSettings();
    if (savedSettings) {
      setSearchTerm(savedSettings.searchTerm || "");
      setSelectedTags(savedSettings.selectedTags || []);
      setSelectedFolder(savedSettings.selectedFolder || "");
      setShowFolders(savedSettings.showFolders || false);
      setShowTags(savedSettings.showTags || false);
      setShowFavorites(savedSettings.showFavorites || false);
      setSortBy(savedSettings.sortBy || "newest");
    }
  }, [loadSettings]);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      searchTerm,
      selectedTags,
      selectedFolder,
      showFolders,
      showTags,
      showFavorites,
      sortBy,
    };
    saveSettings(settings);
  }, [
    searchTerm,
    selectedTags,
    selectedFolder,
    showFolders,
    showTags,
    showFavorites,
    sortBy,
    saveSettings,
  ]);

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => link.tags.includes(tag));
    const matchesFolder = !selectedFolder || link.folderId === selectedFolder;
    const matchesFavorites = !showFavorites || link.isFavorite;

    return matchesSearch && matchesTags && matchesFolder && matchesFavorites;
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "mostUsed":
        return (b.clickCount || 0) - (a.clickCount || 0);
      default:
        return 0;
    }
  });

  const handleAddLink = async (
    newLink: Omit<Link, "id" | "createdAt" | "clickCount">
  ) => {
    setIsSubmitting(true);
    try {
      const success = await apiAddLink(newLink);
      if (success) {
        setShowAddModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    setIsSubmitting(true);
    try {
      await apiDeleteLink(linkId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLink = async (linkId: string, updatedLink: Partial<Link>) => {
    if (Object.keys(updatedLink).length === 0) {
      // Open edit modal
      const linkToEdit = links.find((link) => link.id === linkId);
      if (linkToEdit) {
        setEditingLink(linkToEdit);
      }
    } else {
      // Update link
      setIsSubmitting(true);
      try {
        await apiUpdateLink(linkId, updatedLink);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLinkClick = (linkId: string) => {
    // Update click count in database
    incrementClickCount(linkId);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleRefreshData = async () => {
    await refreshLinks();
  };

  const handleAddFolder = (name: string) => {
    // Folders are now managed by the API based on link data
    console.log("Folder creation is handled automatically when adding links");
  };

  const handleDeleteFolder = (folderId: string) => {
    // Update all links in this folder to have no folder
    const linksInFolder = links.filter((link) => link.folderId === folderId);
    linksInFolder.forEach((link) => {
      handleEditLink(link.id, { folderId: "" });
    });
  };

  const toggleFolder = (folderId: string) => {
    // This is now handled locally in state since it's just UI
    console.log("Toggle folder:", folderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshLinks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">Install LinkVault</p>
                <p className="text-xs opacity-90">
                  Get quick access and offline functionality
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallApp}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-6 left-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Update Available</p>
              <p className="text-xs opacity-90">
                A new version is ready to install
              </p>
            </div>
            <button
              onClick={installUpdate}
              className="px-3 py-1 bg-white text-green-600 rounded text-sm font-medium hover:bg-green-50 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "px-2 sm:px-4 lg:px-4 py-8",
          showInstallBanner && "pt-20"
        )}
      >
        {/* Search and Controls - Single Row */}
        <div className="mb-8">
          <div className="flex gap-2 sm:gap-4 items-center w-full">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm sm:text-base"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Folders Toggle */}
              <button
                onClick={() => setShowFolders(!showFolders)}
                className={cn(
                  "flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-colors border text-xs sm:text-sm",
                  showFolders
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                )}
              >
                <Folder className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {showFolders ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </button>

              {/* Tags Toggle */}
              <button
                onClick={() => setShowTags(!showTags)}
                className={cn(
                  "flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-lg transition-colors border text-xs sm:text-sm",
                  showTags
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                )}
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {showTags ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </button>

              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={cn(
                  "flex items-center px-2 sm:px-3 py-2 rounded-lg transition-colors border text-xs sm:text-sm",
                  showFavorites
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
                )}
              >
                <Star
                  className={cn("w-4 h-4", showFavorites && "fill-current")}
                />
              </button>

              {/* Clear Filters */}
              {(selectedFolder || selectedTags.length > 0 || showFavorites) && (
                <button
                  onClick={() => {
                    setSelectedFolder("");
                    setSelectedTags([]);
                    setShowFavorites(false);
                  }}
                  className="px-2 sm:px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 text-xs sm:text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Folders Section */}
        {showFolders && (
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm max-w-7xl mx-auto">
            <div className="px-3 py-2 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-medium text-gray-900">Folders</h2>
                  <span className="text-xs text-gray-500">
                    ({folders.length})
                  </span>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Enter folder name:");
                    if (name) handleAddFolder(name);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                  title="Add new folder"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-3 py-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedFolder("")}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border shadow-sm",
                    selectedFolder === ""
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                  )}
                >
                  <span className="whitespace-nowrap">
                    All ({links.length})
                  </span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border flex items-center space-x-1.5 shadow-sm",
                      selectedFolder === folder.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="whitespace-nowrap">{folder.name}</span>
                    <span className="text-xs opacity-75 whitespace-nowrap ml-1">
                      ({links.filter((l) => l.folderId === folder.id).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        {showTags && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm max-w-7xl mx-auto">
            <div className="px-3 py-2 border-b border-green-100">
              <div className="flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-green-600" />
                <h2 className="text-sm font-medium text-gray-900">Tags</h2>
                <span className="text-xs text-gray-500">({tags.length})</span>
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag.name)
                          ? prev.filter((t) => t !== tag.name)
                          : [...prev, tag.name]
                      );
                    }}
                    className={cn(
                      "flex-shrink-0 px-2.5 py-1 rounded-full text-xs border transition-colors shadow-sm",
                      selectedTags.includes(tag.name)
                        ? "bg-green-600 text-white border-green-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300 hover:shadow-md"
                    )}
                  >
                    <span className="whitespace-nowrap">{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Links Grid/List */}
        <div className="bg-white rounded-xl  shadow-sm max-w-7xl mx-auto">
          <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredLinks.length}{" "}
                    {filteredLinks.length === 1 ? "Link" : "Links"}
                  </h2>
                  <div className="text-xs text-gray-500">
                    {selectedFolder && (
                      <span>
                        in {folders.find((f) => f.id === selectedFolder)?.name}{" "}
                        •{" "}
                      </span>
                    )}
                    {selectedTags.length > 0 && (
                      <span>tagged: {selectedTags.join(", ")} • </span>
                    )}
                    {showFavorites && <span>favorites only</span>}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="relative flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-2 py-1.5 pr-6 text-xs text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostUsed">Most Used</option>
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <LinkManager
              links={sortedLinks}
              folders={folders}
              tags={tags}
              viewMode="list"
              onDeleteLink={handleDeleteLink}
              onEditLink={handleEditLink}
              onMoveLink={(linkId, folderId) => {
                handleEditLink(linkId, { folderId });
              }}
              onLinkClick={handleLinkClick}
              onCopyLink={handleCopyLink}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>v{APP_VERSION}</span>
              {lastFetched && (
                <span>
                  Last updated: {new Date(lastFetched).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshData}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4",
                  isLoading && "animate-spin"
                )}
              />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
        title="Add new link"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="fixed bottom-20 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="w-4 h-4" />
          <span>Link copied!</span>
        </div>
      )}
      {/* Modals */}
      {showAddModal && (
        <AddLinkModal
          folders={folders}
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onAddLink={handleAddLink}
          existingTags={tags.map((tag) => tag.name)}
          isSubmitting={isSubmitting}
        />
      )}

      {editingLink && (
        <EditLinkModal
          link={editingLink}
          folders={folders}
          tags={tags}
          onClose={() => setEditingLink(null)}
          onSave={async (updatedLink) => {
            await handleEditLink(editingLink.id, updatedLink);
            setEditingLink(null);
          }}
          onDelete={async () => {
            await handleDeleteLink(editingLink.id);
            setEditingLink(null);
          }}
          existingTags={tags.map((tag) => tag.name)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default App;
