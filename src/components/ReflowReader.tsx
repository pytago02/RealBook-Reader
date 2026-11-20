import React from "react";
import type { ReaderSettings, Book } from "../types";
import { Bookmark } from "lucide-react";

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
  const isComic = book.format === "cbz" || book.isComic;

  // ================= WEremote/LOCAL WEBTOON VERTICAL SCROLL MODE =================
  if (isComic) {
    const pages = textPages && textPages.length > 0 ? textPages : [];
    const userZoom = settings.zoom || 1.0;

    return (
      <div
        className="relative w-full h-full flex flex-col items-center overflow-y-auto bg-[#0a0d14] text-[#e2e8f0] selection:bg-amber-500/30 scroll-smooth pt-safe pb-safe-nav"
        style={{
          filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
        }}
      >
        {/* Silk Ribbon Bookmark on top edge of reflow container */}
        {isBookmarked && (
          <div
            onClick={() => onToggleBookmark?.(currentPage)}
            className="fixed top-0 right-8 md:right-20 z-40 w-5 h-20 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 shadow-md cursor-pointer hover:h-22 transition-all rounded-b-sm"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
            }}
            title="Bỏ đánh dấu trang này"
          />
        )}

        {/* Floating Webtoon Header Banner */}
        <div className="w-full max-w-2xl px-3 py-2 flex items-center justify-between border-b border-gray-800/80 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold uppercase text-[10px]">
              Cuộn Webtoon
            </span>
            <span className="truncate max-w-[200px] font-semibold text-gray-200">
              {book.title}
            </span>
          </div>
          <span>
            {pages.length || totalPages} trang
          </span>
        </div>

        {/* Continuous Webtoon Pages Column */}
        <div className="w-full max-w-2xl flex flex-col items-center my-2 space-y-0.5 sm:space-y-1">
          {pages.length > 0 ? (
            pages.map((content, idx) => {
              const pageNum = idx + 1;
              const isSvg = content.trim().startsWith("<svg");
              return (
                <div
                  key={pageNum}
                  id={`webtoon-page-${pageNum}`}
                  className="w-full flex flex-col items-center select-none"
                  onClick={() => onPageChange(pageNum)}
                >
                  {isSvg ? (
                    <div
                      className="w-full flex items-center justify-center shadow-lg"
                      dangerouslySetInnerHTML={{ __html: content }}
                      style={{
                        transform: `scale(${userZoom})`,
                        transformOrigin: "center top",
                      }}
                    />
                  ) : (
                    <img
                      src={content}
                      alt={`Trang ${pageNum}`}
                      className="w-full h-auto object-contain shadow-lg"
                      style={{
                        transform: `scale(${userZoom})`,
                        transformOrigin: "center top",
                      }}
                      loading="lazy"
                    />
                  )}
                  <div className="py-2 text-[10px] font-mono text-gray-500 text-center">
                    Trang {pageNum} / {totalPages}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-gray-400">
              Đang tải nội dung truyện tranh...
            </div>
          )}
        </div>

        {/* End of Comic Banner */}
        <div className="w-full max-w-2xl my-8 p-6 text-center rounded-2xl bg-[#141824] border border-gray-800 text-sm">
          <h4 className="font-bold text-amber-400 text-base mb-1">
            Đã đọc đến cuối tập truyện
          </h4>
          <p className="text-xs text-gray-400">
            Bạn có thể đổi sang chế độ Lật trang trên thanh công cụ hoặc quay lại Thư viện.
          </p>
        </div>
      </div>
    );
  }

  const getThemeClass = () => {
    switch (settings.theme) {
      case "sepia":
        return "theme-sepia";
      case "warm":
        return "theme-warm";
      case "eink":
        return "theme-eink";
      case "dark":
        return "theme-dark";
      case "white":
      default:
        return "theme-white";
    }
  };

  const getMarginClass = () => {
    switch (typo.margin) {
      case "narrow":
        return "max-w-4xl px-2 sm:px-4 md:px-8";
      case "wide":
        return "max-w-xl px-4 sm:px-8 md:px-12";
      case "normal":
      default:
        return "max-w-2xl px-3 sm:px-6 md:px-10";
    }
  };

  const currentPageText =
    textPages && textPages.length >= currentPage
      ? textPages[currentPage - 1]
      : "Không tìm thấy nội dung văn bản cho trang này.";

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center overflow-y-auto ${getThemeClass()} transition-colors duration-300 ${
        isFocusMode ? "py-4 px-3 sm:px-6" : "pt-safe pb-safe-nav px-3 sm:px-6"
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
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
          }}
          title="Bỏ đánh dấu trang này"
        />
      )}

      <article className={`w-full ${getMarginClass()} my-auto`}>
        {/* Book Header / Chapter Meta */}
        <div className="mb-4 pb-2 border-b border-current/10 flex justify-between items-center text-xs opacity-60 font-mono">
          <span className="font-semibold uppercase tracking-wider truncate max-w-[65%]">
            {book.title}
          </span>
          <div className="flex items-center gap-2">
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            {onToggleBookmark && (
              <button
                type="button"
                onClick={() => onToggleBookmark(currentPage)}
                className="p-1 hover:text-amber-500 transition-colors"
                title={
                  isBookmarked ? "Bỏ đánh dấu trang" : "Đánh dấu trang này"
                }
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Text or Comic Image Content */}
        {currentPageText.trim().startsWith("<svg") ? (
          <div
            className="w-full flex items-center justify-center my-2 select-none [&>svg]:max-w-full [&>svg]:h-auto shadow-md rounded overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentPageText }}
          />
        ) : currentPageText.startsWith("data:image/") ||
          currentPageText.startsWith("blob:") ||
          currentPageText.startsWith("http://") ||
          currentPageText.startsWith("https://") ? (
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
            className={`font-${typo.fontFamily.toLowerCase().replace(/\s+/g, "")} select-text whitespace-pre-wrap selection:bg-amber-500/30 leading-relaxed`}
            style={{
              fontFamily:
                typo.fontFamily === "Be Vietnam Pro"
                  ? "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  : typo.fontFamily === "EB Garamond"
                    ? "'EB Garamond', 'Times New Roman', 'Garamond', serif"
                    : typo.fontFamily === "Merriweather"
                      ? "'Merriweather', 'Times New Roman', serif"
                      : typo.fontFamily === "Literata"
                        ? "'Literata', 'Times New Roman', 'Merriweather', serif"
                        : typo.fontFamily === "Lora"
                          ? "'Lora', 'Times New Roman', serif"
                          : typo.fontFamily === "Playfair Display"
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
