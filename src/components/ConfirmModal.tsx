import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemTitle?: string;
  itemSubtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemTitle,
  itemSubtitle,
  confirmLabel = 'Xác nhận xóa',
  cancelLabel = 'Hủy bỏ',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#1a1b22] border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-black/80 transform transition-all animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#252632] rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              variant === 'danger'
                ? 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-lg shadow-red-500/10'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-6 h-6 animate-pulse" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Item Preview Box */}
        {itemTitle && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#22232c] border border-gray-800/90 flex flex-col justify-center">
            <span className="text-xs font-semibold text-gray-200 line-clamp-1">{itemTitle}</span>
            {itemSubtitle && (
              <span className="text-[11px] text-gray-400 truncate mt-0.5">{itemSubtitle}</span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-[#252632] hover:bg-[#2e303f] hover:text-white transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all active:scale-95 ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-600/30 text-black font-bold'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
