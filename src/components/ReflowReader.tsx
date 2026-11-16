import React from 'react';
import type { ReaderSettings, Book } from '../types';

interface ReflowReaderProps {
  book: Book;
  currentPage: number;
  totalPages: number;
  textPages: string[];
  settings: ReaderSettings;
  onPageChange: (newPage: number) => void;
}

export const ReflowReader: React.FC<ReflowReaderProps> = ({
  book,
  currentPage,
  totalPages,
  textPages,
  settings,
  onPageChange,
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
        return 'max-w-4xl px-4 md:px-8';
      case 'wide':
        return 'max-w-xl px-4 md:px-12';
      case 'normal':
      default:
        return 'max-w-2xl px-4 md:px-10';
    }
  };

  const currentPageText =
    textPages && textPages.length >= currentPage
      ? textPages[currentPage - 1]
      : 'Không tìm thấy nội dung văn bản cho trang này.';

  return (
    <div
      className={`w-full h-full flex flex-col items-center overflow-y-auto ${getThemeClass()} transition-colors duration-300 py-16`}
      style={{
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
      }}
    >
      <article className={`w-full ${getMarginClass()} my-auto`}>
        {/* Book Header / Chapter Meta */}
        <div className="mb-8 pb-4 border-b border-current/10 flex justify-between items-center text-xs opacity-50 font-mono">
          <span className="font-semibold uppercase tracking-wider">{book.title}</span>
          <span>Trang {currentPage} / {totalPages}</span>
        </div>

        {/* Text Content with Custom Typography */}
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

        {/* Bottom Pagination Controls in Reflow */}
        <div className="mt-12 pt-6 border-t border-current/10 flex justify-between items-center text-sm font-mono opacity-60">
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
