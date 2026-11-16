import React from 'react';
import {
  ArrowLeft,
  Bookmark as BookmarkIcon,
  SunMedium,
  Type,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  List,
  Columns,
  Square,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Book, ReaderSettings } from '../types';
import { getTranslation } from '../i18n';
import { AppLogo } from './AppLogo';

interface ZenToolbarProps {
  book: Book;
  currentPage: number;
  totalPages: number;
  isVisible: boolean;
  settings: ReaderSettings;
  isFullscreen: boolean;
  isBookmarked: boolean;
  onBackToLibrary: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onToggleBookmark: () => void;
  onOpenThemeModal: () => void;
  onOpenTypographyModal: () => void;
  onOpenTocModal: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onToggleSpread: () => void;
  onToggleViewerMode: () => void;
  onTogglePdfDisplayMode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const ZenToolbar: React.FC<ZenToolbarProps> = ({
  book,
  currentPage,
  totalPages,
  isVisible,
  settings,
  isFullscreen,
  isBookmarked,
  onBackToLibrary,
  onPrevPage,
  onNextPage,
  onPageChange,
  onToggleBookmark,
  onOpenThemeModal,
  onOpenTypographyModal,
  onOpenTocModal,
  onToggleSound,
  onToggleFullscreen,
  onToggleSpread,
  onToggleViewerMode,
  onTogglePdfDisplayMode,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const t = getTranslation(settings.language || 'vi');
  const percent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const zoomPercent = Math.round((settings.zoom || 1.0) * 100);

  return (
    <>
      {/* Top Floating Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-2.5 flex items-center justify-between backdrop-blur-md border-b ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          settings.theme === 'dark'
            ? 'bg-[#18191d]/90 border-[#282930] text-gray-200 shadow-lg'
            : settings.theme === 'sepia' || settings.theme === 'warm'
            ? 'bg-[#3b2d1d]/90 border-[#4e3d29] text-[#fbf6ec] shadow-lg'
            : 'bg-white/90 border-gray-200 text-gray-800 shadow-md'
        }`}
      >
        {/* Left: Back & Book Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-sm font-medium"
            title={t.reader.backToLibrary}
          >
            <ArrowLeft className="w-4 h-4" />
            <AppLogo className="w-4 h-4 rounded object-contain hidden sm:inline-block" />
            <span className="hidden sm:inline">{t.header.badgeShelf}</span>
          </button>
          <div className="border-l border-current/20 h-5" />
          <div className="truncate max-w-[180px] md:max-w-[350px]">
            <h1 className="text-sm font-semibold truncate leading-tight">{book.title}</h1>
            <p className="text-xs opacity-70 truncate">{book.author || t.shelf.unknownAuthor}</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Zoom Controls (especially useful for PDF reading) */}
          <div className="flex items-center space-x-0.5 bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded-lg mr-1">
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={t.reader.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onResetZoom}
              className="px-1.5 py-0.5 text-[11px] font-mono hover:underline"
              title={t.reader.resetZoom}
            >
              {zoomPercent}%
            </button>
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={t.reader.zoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TOC */}
          <button
            onClick={onOpenTocModal}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={t.reader.tocBookmarks}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Bookmark Ribbon Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked
                ? 'text-amber-500 bg-amber-500/15'
                : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-80'
            }`}
            title={isBookmarked ? t.reader.bookmarked : t.reader.bookmarkPage}
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Spread Mode Toggle (Double vs Single Page) */}
          <button
            onClick={onToggleSpread}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={settings.pageSpread === 'double' ? t.reader.spreadSingle : t.reader.spreadDouble}
          >
            {settings.pageSpread === 'double' ? (
              <Columns className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>

          {/* PDF Mode Toggle (Book Typography like Demo vs Original Scan) */}
          {book.format === 'pdf' && (
            <button
              onClick={onTogglePdfDisplayMode}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                settings.pdfDisplayMode === 'book'
                  ? 'bg-amber-500/25 text-amber-500 dark:text-amber-300 border border-amber-500/50 font-semibold'
                  : 'bg-black/10 dark:bg-white/10 text-gray-400 hover:text-gray-200'
              }`}
              title={settings.pdfDisplayMode === 'book' ? t.reader.pdfModeScan : t.reader.pdfModeBook}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {settings.pdfDisplayMode === 'book' ? t.reader.pdfModeBook : t.reader.pdfModeScan}
              </span>
            </button>
          )}

          {/* Viewer Mode Toggle (Realistic Book vs Reflow text) */}
          <button
            onClick={onToggleViewerMode}
            className={`p-2 rounded-lg transition-colors ${
              settings.viewerMode === 'reflow' ? 'bg-amber-500/20 text-amber-500 font-bold' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            title={settings.viewerMode === 'realistic' ? t.reader.viewerMode3D : t.reader.viewerModeScroll}
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Eye Comfort Theme */}
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={t.reader.themeComfort}
          >
            <SunMedium className="w-4 h-4" />
          </button>

          {/* Typography Controls */}
          <button
            onClick={onOpenTypographyModal}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={t.reader.typography}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg transition-colors ${
              settings.soundEnabled ? 'hover:bg-black/10 dark:hover:bg-white/10' : 'opacity-40 hover:opacity-100'
            }`}
            title={settings.soundEnabled ? t.reader.soundOn : t.reader.soundOff}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Fullscreen / Zen */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={isFullscreen ? t.reader.exitFullscreen : t.reader.fullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Floating Footer / Reading Progress */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-2.5 backdrop-blur-md border-t ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        } ${
          settings.theme === 'dark'
            ? 'bg-[#18191d]/90 border-[#282930] text-gray-200 shadow-lg'
            : settings.theme === 'sepia' || settings.theme === 'warm'
            ? 'bg-[#3b2d1d]/90 border-[#4e3d29] text-[#fbf6ec] shadow-lg'
            : 'bg-white/90 border-gray-200 text-gray-800 shadow-md'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center space-x-3">
          {/* Previous Page */}
          <button
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            title={t.reader.prevPage}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Progress Slider */}
          <div className="flex-1 flex items-center space-x-3">
            <span className="text-xs font-mono min-w-[50px] text-right">
              {currentPage}
            </span>
            <input
              type="range"
              min={1}
              max={Math.max(1, totalPages)}
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="flex-1 h-1.5 bg-current/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-xs font-mono min-w-[65px]">
              / {totalPages} ({percent}%)
            </span>
          </div>

          {/* Next Page */}
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            title={t.reader.nextPage}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </>
  );
};
