import React, { useState, useEffect } from 'react';
import { BookOpen, User, Tag, X, Check, FileText, Sparkles } from 'lucide-react';
import { GENRE_LIST } from '../utils/genre';
import type { Book } from '../types';

export interface PendingBookData {
  id: string;
  buffer: ArrayBuffer;
  format: Book['format'];
  totalPages: number;
  coverUrl?: string;
  fileSize: number;
  defaultTitle: string;
  defaultAuthor: string;
  defaultGenre: string;
  initialTextPages: string[] | null;
}

export interface BookMetadataForm {
  title: string;
  author: string;
  genre: string;
}

export interface BookMetadataModalProps {
  isOpen: boolean;
  data: PendingBookData | null;
  onConfirm: (form: BookMetadataForm, openImmediately: boolean) => void;
  onCancel: () => void;
}

export const BookMetadataModal: React.FC<BookMetadataModalProps> = ({
  isOpen,
  data,
  onConfirm,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [customGenreText, setCustomGenreText] = useState('');

  // Sync state whenever data opens
  useEffect(() => {
    if (data && isOpen) {
      setTitle(data.defaultTitle || 'Tài liệu');
      setAuthor(data.defaultAuthor || 'Cá nhân');
      
      const foundGenre = GENRE_LIST.find((g) => g.label === data.defaultGenre);
      if (foundGenre) {
        setGenre(foundGenre.label);
        setIsCustomGenre(false);
        setCustomGenreText('');
      } else if (data.defaultGenre) {
        setGenre(data.defaultGenre);
        setIsCustomGenre(true);
        setCustomGenreText(data.defaultGenre);
      } else {
        setGenre(GENRE_LIST[0].label);
        setIsCustomGenre(false);
        setCustomGenreText('');
      }
    }
  }, [data, isOpen]);

  // Keyboard shortcut: Esc to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !data) return null;

  const handleSubmit = (openImmediately: boolean) => {
    const finalTitle = title.trim() || data.defaultTitle || 'Tài liệu';
    const finalAuthor = author.trim() || 'Cá nhân';
    const finalGenre = isCustomGenre
      ? customGenreText.trim() || 'Tài liệu cá nhân'
      : genre || 'Văn học & Tiểu thuyết';

    onConfirm(
      {
        title: finalTitle,
        author: finalAuthor,
        genre: finalGenre,
      },
      openImmediately
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#181920] border border-gray-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-safe sm:pb-6 shadow-2xl shadow-black/90 max-h-[90vh] flex flex-col transform transition-all animate-scale-up overflow-hidden"
      >
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2">
                Thêm sách mới vào kệ
              </h2>
              <p className="text-xs text-gray-400">
                Tùy chỉnh thông tin hiển thị trước khi lưu vào kệ sách của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1 custom-scrollbar">
          {/* Top Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#1f2029] border border-gray-800/80">
            {data.coverUrl ? (
              <img
                src={data.coverUrl}
                alt="Bìa sách"
                className="w-13 h-17 sm:w-16 sm:h-21 object-cover rounded-lg shadow-md border border-gray-700/60 flex-shrink-0"
              />
            ) : (
              <div className="w-13 h-17 sm:w-16 sm:h-21 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/60 flex flex-col items-center justify-center text-amber-400 flex-shrink-0 p-1 text-center shadow-md">
                <FileText className="w-6 h-6 mb-1 opacity-75" />
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider">
                  {data.format}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="uppercase text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {data.format}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {data.totalPages} trang
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  • {formatFileSize(data.fileSize)}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium truncate">
                Tệp: {data.defaultTitle}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500/80" />
                Đã nhận diện thành công nội dung sách
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* 1. Tên sách */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Tên sách <span className="text-amber-500">*</span></span>
                <span className="text-[11px] text-gray-500 font-normal">Hiển thị trên bìa & kệ</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên sách..."
                autoFocus
                className="w-full h-10 px-3.5 bg-[#14151b] border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium"
              />
            </div>

            {/* 2. Tác giả */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Tác giả</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tên tác giả (hoặc để trống)..."
                className="w-full h-10 px-3.5 bg-[#14151b] border border-gray-700/80 rounded-xl text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
              />
            </div>

            {/* 3. Thể loại */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chọn thể loại</span>
                </span>
                <span className="text-[11px] text-gray-500 font-normal">
                  Giúp lọc & sắp xếp trên kệ
                </span>
              </label>

              {/* Genre Pills Grid */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {GENRE_LIST.map((g) => {
                  const isSelected = !isCustomGenre && genre === g.label;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGenre(g.label);
                        setIsCustomGenre(false);
                      }}
                      className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold shadow-sm shadow-amber-500/20'
                          : 'bg-[#14151b] text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                      <span>{g.label}</span>
                    </button>
                  );
                })}

                {/* Custom Genre Pill Toggle */}
                <button
                  type="button"
                  onClick={() => setIsCustomGenre(true)}
                  className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    isCustomGenre
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold shadow-sm shadow-amber-500/20'
                      : 'bg-[#14151b] text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  {isCustomGenre && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                  <span>+ Thể loại khác...</span>
                </button>
              </div>

              {/* Custom Genre Text Input (when + Thể loại khác is selected) */}
              {isCustomGenre && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customGenreText}
                    onChange={(e) => setCustomGenreText(e.target.value)}
                    placeholder="Nhập tên thể loại riêng..."
                    autoFocus
                    className="w-full h-9 px-3 bg-[#14151b] border border-amber-500/50 rounded-xl text-xs text-amber-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-gray-800/80 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors cursor-pointer text-center"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="h-10 px-4 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer active:scale-[0.98] text-center"
          >
            Chỉ lưu vào kệ
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="h-10 px-5 rounded-xl text-xs font-bold text-[#141518] bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-600/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 fill-current stroke-[1.5]" />
            <span>Lưu & Đọc ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
