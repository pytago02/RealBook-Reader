import React from 'react';
import type { ReaderSettings, Book } from '../types';
import { Bookmark } from 'lucide-react';

interface ReflowReaderProps {
  book: Book;
  currentPage: number;
  totalPages: number;
  textPages: string[];
  settings: ReaderSettings;
  isBookmarked?: boolean;
  isFocusMode?: boolean;
  onPageChange: (newPage: number) => void;
  onToggleBookmark?: (page?: number) => void;
}

export const ReflowReader: React.FC<ReflowReaderProps> = ({
  book,
  currentPage,
  totalPages,
  textPages,
  settings,
  isBookmarked = false,
  isFocusMode = false,
  onPageChange,
  onToggleBookmark,
}) => {
  const typo = settings.typography;

  const getThemeClass = () => {
    switch (settings.theme) {
      case 'sepia':
        return 'theme-sepia';
      case 'warm':
        return 'theme-warm';
      case 'eink':
        return 'theme-eink';
      case 'dark':
        return 'theme-dark';
      case 'white':
      default:
        return 'theme-white';
    }
  };

  const getMarginClass = () => {
    switch (typo.margin) {
      case 'narrow':
        return 'max-w-4xl px-2 sm:px-4 md:px-8';
      case 'wide':
        return 'max-w-xl px-4 sm:px-8 md:px-12';
      case 'normal':
      default:
        return 'max-w-2xl px-3 sm:px-6 md:px-10';
    }
  };

  const currentPageText =
    textPages && textPages.length >= currentPage
      ? textPages[currentPage - 1]
      : 'Không tìm thấy nội dung văn bản cho trang này.';

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center overflow-y-auto ${getThemeClass()} transition-colors duration-300 ${
        isFocusMode ? 'py-4 px-3 sm:px-6' : 'pt-safe pb-safe-nav px-3 sm:px-6'
      }`}
      style={{
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
      }}
    >
      {/* Silk Ribbon Bookmark on top edge of reflow container */}
      {isBookmarked && (
        <div
          onClick={() => onToggleBookmark?.(currentPage)}
          className="fixed top-0 right-10 md:right-24 z-30 w-5 h-20 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 shadow-md cursor-pointer hover:h-22 transition-all rounded-b-sm"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
          }}
          title="Bỏ đánh dấu trang này"
        />
      )}

      <article className={`w-full ${getMarginClass()} my-auto`}>
        {/* Book Header / Chapter Meta */}
        <div className="mb-4 pb-2 border-b border-current/10 flex justify-between items-center text-xs opacity-60 font-mono">
          <span className="font-semibold uppercase tracking-wider truncate max-w-[65%]">{book.title}</span>
          <div className="flex items-center gap-2">
            <span>Trang {currentPage} / {totalPages}</span>
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(currentPage)}
                className="p-1 hover:text-amber-500 transition-colors"
                title={isBookmarked ? 'Bỏ đánh dấu trang' : 'Đánh dấu trang này'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Text or Comic Image Content */}
        {currentPageText.trim().startsWith('<svg') ? (
          <div
            className="w-full flex items-center justify-center my-2 select-none [&>svg]:max-w-full [&>svg]:h-auto shadow-md rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentPageText }}
          />
        ) : currentPageText.startsWith('data:image/') ||
          currentPageText.startsWith('blob:') ||
          currentPageText.startsWith('http://') ||
          currentPageText.startsWith('https://') ? (
          <div className="w-full flex items-center justify-center my-2 select-none">
            <img
              src={currentPageText}
              alt={`Trang ${currentPage}`}
              className="max-w-full max-h-[85vh] object-contain rounded shadow-lg"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`font-${typo.fontFamily.toLowerCase().replace(/\s+/g, '')} select-text whitespace-pre-wrap selection:bg-amber-500/30 leading-relaxed`}
            style={{
              fontFamily: typo.fontFamily === 'Be Vietnam Pro'
                ? "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                : typo.fontFamily === 'EB Garamond'
                ? "'EB Garamond', 'Times New Roman', 'Garamond', serif"
                : typo.fontFamily === 'Merriweather'
                ? "'Merriweather', 'Times New Roman', serif"
                : typo.fontFamily === 'Literata'
                ? "'Literata', 'Times New Roman', 'Merriweather', serif"
                : typo.fontFamily === 'Lora'
                ? "'Lora', 'Times New Roman', serif"
                : typo.fontFamily === 'Playfair Display'
                ? "'Playfair Display', 'Times New Roman', serif"
                : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: `${typo.fontSize}px`,
              lineHeight: typo.lineHeight,
              letterSpacing: `${typo.letterSpacing}px`,
              textAlign: typo.textAlign,
            }}
          >
            {currentPageText}
          </div>
        )}

        {/* Bottom Pagination Controls in Reflow */}
        <div className="mt-6 pt-3 border-t border-current/10 flex justify-between items-center text-sm font-mono opacity-60">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="hover:underline disabled:opacity-30 disabled:no-underline"
          >
            ← Trang trước
          </button>
          <span>
            {Math.round((currentPage / Math.max(1, totalPages)) * 100)}% đã đọc
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="hover:underline disabled:opacity-30 disabled:no-underline"
          >
            Trang tiếp →
          </button>
        </div>
      </article>
    </div>
  );
};
