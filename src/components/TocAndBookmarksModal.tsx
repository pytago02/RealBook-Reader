import React, { useState } from 'react';
import { X, List, Bookmark, Trash2, BookOpen } from 'lucide-react';
import type { TocItem, Bookmark as BookmarkType, AppLanguage } from '../types';
import { getTranslation } from '../i18n';

interface TocAndBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  bookmarks: BookmarkType[];
  currentPage: number;
  onSelectPage: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
  language?: AppLanguage;
}

export const TocAndBookmarksModal: React.FC<TocAndBookmarksModalProps> = ({
  isOpen,
  onClose,
  toc,
  bookmarks,
  currentPage,
  onSelectPage,
  onDeleteBookmark,
  language = 'vi',
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'bookmarks'>('toc');
  const t = getTranslation(language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#202127] text-gray-100 rounded-2xl shadow-2xl border border-gray-700/60 p-6 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">{t.tocModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-gray-800 p-1 rounded-xl my-4">
          <button
            onClick={() => setActiveTab('toc')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'toc' ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> {t.tocModal.tabToc} ({toc.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bookmarks' ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" /> {t.tocModal.tabBookmarks.replace('{count}', String(bookmarks.length))}
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {activeTab === 'toc' ? (
            toc.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {t.tocModal.noToc}
              </div>
            ) : (
              toc.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPage(item.page);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    currentPage === item.page
                      ? 'bg-amber-500/15 text-amber-400 font-semibold'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <span className="text-sm truncate pr-2">{item.title}</span>
                  <span className="text-xs font-mono opacity-60">{t.tocModal.pagePrefix} {item.page}</span>
                </button>
              ))
            )
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t.tocModal.noBookmarks}
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border border-gray-700/60 transition-colors ${
                  currentPage === bm.page ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-gray-800/40'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectPage(bm.page);
                    onClose();
                  }}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-medium">{t.tocModal.pagePrefix} {bm.page}</div>
                  <div className="text-xs opacity-60">
                    {new Date(bm.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')} {new Date(bm.createdAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
                <button
                  onClick={() => onDeleteBookmark(bm.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title={t.tocModal.deleteBookmark}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
