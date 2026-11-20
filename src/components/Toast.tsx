import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-3 right-3 sm:top-auto sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:max-w-sm z-[9999] flex flex-col space-y-2 pointer-events-none pt-safe sm:pt-0 transition-all">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all transform duration-300 cursor-pointer active:scale-95 ${
              isSuccess
                ? 'bg-[#18261e]/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : isError
                ? 'bg-[#29181a]/95 border-red-500/40 text-red-100 shadow-red-950/40'
                : isWarning
                ? 'bg-[#292218]/95 border-amber-500/40 text-amber-100 shadow-amber-950/40'
                : 'bg-[#1a1b22]/95 border-blue-500/40 text-blue-100 shadow-blue-950/40'
            }`}
          >
            <div className="flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <h4 className="text-xs font-bold leading-snug tracking-tight text-white mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs leading-relaxed text-gray-200 line-clamp-2">
                {toast.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className="p-1 -mr-1 text-gray-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
