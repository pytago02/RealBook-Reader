import React, { useState } from 'react';
import { X, List, Bookmark, Trash2, BookOpen } from 'lucide-react';
import type { TocItem, Bookmark as BookmarkType, AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface TocAndBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  toc?: TocItem[];
  bookmarks?: BookmarkType[];
  currentPage: number;
  onSelectPage: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
  language?: AppLanguage;
}

export const TocAndBookmarksModal: React.FC<TocAndBookmarksModalProps> = ({
  isOpen,
  onClose,
  toc = [],
  bookmarks = [],
  currentPage,
  onSelectPage,
  onDeleteBookmark,
  language = 'vi',
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');
  const t = getTranslation(language);

  if (!isOpen) return null;

  const safeToc = Array.isArray(toc)
    ? toc.filter((item) => item && typeof item === 'object')
    : [];

  const safeBookmarks = Array.isArray(bookmarks)
    ? bookmarks.filter((bm) => bm && typeof bm === 'object')
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#202127] text-gray-100 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-700/60 p-5 sm:p-6 pb-safe sm:pb-6 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">{t.tocModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-gray-800/90 p-1 rounded-xl my-4">
          <button
            onClick={() => setActiveTab('toc')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'toc'
                ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <List className="w-4 h-4" /> {t.tocModal.tabToc} ({safeToc.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
            }`}
          >
            <Bookmark className="w-4 h-4" />{' '}
            {t.tocModal.tabBookmarks.replace('{count}', String(safeBookmarks.length))}
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {activeTab === 'toc' ? (
            safeToc.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {t.tocModal.noToc}
              </div>
            ) : (
              safeToc.map((item, idx) => {
                const targetPage =
                  typeof item.page === 'number' && Number.isFinite(item.page)
                    ? item.page
                    : Number(item.page) || 1;
                const isCurrent = currentPage === targetPage;

                return (
                  <button
                    key={`toc-${idx}-${targetPage}`}
                    onClick={() => {
                      onSelectPage(targetPage);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="text-sm truncate pr-2">{item.title}</span>
                    <span className="text-xs font-mono opacity-60 flex-shrink-0">
                      {t.tocModal.pagePrefix} {targetPage}
                    </span>
                  </button>
                );
              })
            )
          ) : safeBookmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t.tocModal.noBookmarks}
            </div>
          ) : (
            safeBookmarks.map((bm, index) => {
              // Extra defensive: never render object as page number
              const safePage =
                typeof bm.page === 'number' && Number.isFinite(bm.page)
                  ? Math.round(bm.page)
                  : typeof bm.page === 'string' && !isNaN(Number(bm.page))
                  ? Math.round(Number(bm.page))
                  : 1;

              const formattedDate = (() => {
                try {
                  const ts =
                    typeof bm.createdAt === 'number'
                      ? bm.createdAt
                      : Number(bm.createdAt);
                  if (!ts || isNaN(ts)) return '';
                  const d = new Date(ts);
                  if (isNaN(d.getTime())) return '';
                  return `${d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')} ${d.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`;
                } catch {
                  return '';
                }
              })();

              const isCurrent = currentPage === safePage;

              return (
                <div
                  key={bm.id || `bm-${safePage}-${index}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-gray-700/60 transition-colors ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-gray-800/40 hover:bg-gray-800/70'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectPage(safePage);
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium">
                      {t.tocModal.pagePrefix} {safePage}
                    </div>
                    {formattedDate ? (
                      <div className="text-xs opacity-60 mt-0.5">{formattedDate}</div>
                    ) : null}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(bm.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2"
                    title={t.tocModal.deleteBookmark}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
