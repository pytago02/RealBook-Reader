import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { Book, ReaderSettings } from '../types';
import { soundService } from '../services/sound';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RealisticBookProps {
  book: Book;
  currentPage: number;
  totalPages: number;
  settings: ReaderSettings;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  textPages: string[] | null;
  isBookmarked: boolean;
  onPageChange: (newPage: number) => void;
  onExtractPage?: (pageNum: number) => Promise<string>;
}

export const RealisticBook: React.FC<RealisticBookProps> = ({
  book,
  currentPage,
  totalPages,
  settings,
  pdfDoc,
  textPages,
  isBookmarked,
  onPageChange,
  onExtractPage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Canvases for scan mode
  const currentLeftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentRightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active rendering tasks tracking
  const renderTasksRef = useRef<{ [key: string]: pdfjsLib.RenderTask | null }>({});
  const inFlightPagesRef = useRef<Set<number>>(new Set());

  // Slide transition states
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSliding, setIsSliding] = useState<'next' | 'prev' | null>(null);
  const [disableTransition, setDisableTransition] = useState<boolean>(false);

  // Mouse gesture coordination
  const dragModeRef = useRef<'scroll' | 'slide' | null>(null);
  const scrollTargetRef = useRef<HTMLElement | null>(null);
  const startScrollTopRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  const isDouble = settings.pageSpread === 'double';
  const isScanMode = settings.pdfDisplayMode === 'scan';

  // Compute page numbers for current spread
  const leftPageNum = isDouble
    ? currentPage % 2 === 0
      ? currentPage
      : Math.max(1, currentPage - 1)
    : currentPage;
  const rightPageNum = leftPageNum + 1;

  // Previous spread
  const prevLeftPageNum = isDouble ? Math.max(1, leftPageNum - 2) : Math.max(1, currentPage - 1);
  const prevRightPageNum = prevLeftPageNum + 1;

  // Next spread
  const nextLeftPageNum = isDouble ? leftPageNum + 2 : currentPage + 1;
  const nextRightPageNum = nextLeftPageNum + 1;

  // Slide animation trigger with seamless handoff
  const executeSlide = useCallback(
    (direction: 'next' | 'prev') => {
      const step = isDouble ? 2 : 1;
      if (direction === 'next' && currentPage >= totalPages) return;
      if (direction === 'prev' && currentPage <= 1) return;
      if (isSliding) return; // Prevent double trigger during transition

      if (settings.soundEnabled) {
        soundService.playPageTurn(settings.soundVolume);
      }

      setDisableTransition(false);
      setIsSliding(direction);

      const animationDuration = 260; // ms

      setTimeout(() => {
        // Step 1: Temporarily disable transition so position reset is completely invisible
        setDisableTransition(true);

        // Step 2: Commit new page and reset slide state
        if (direction === 'next') {
          onPageChange(Math.min(totalPages, currentPage + step));
        } else {
          onPageChange(Math.max(1, currentPage - step));
        }
        setIsSliding(null);
        setDragOffset(0);

        // Step 3: Re-enable transition after next paint frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDisableTransition(false);
          });
        });
      }, animationDuration);
    },
    [currentPage, totalPages, isDouble, isSliding, settings.soundEnabled, settings.soundVolume, onPageChange]
  );

  const turnNext = useCallback(() => executeSlide('next'), [executeSlide]);
  const turnPrev = useCallback(() => executeSlide('prev'), [executeSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        turnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        turnPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnNext, turnPrev]);

  // Safe canvas rendering for scan mode
  const renderPdfPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement | null, key: string) => {
      if (!pdfDoc || !canvas || pageNum < 1 || pageNum > pdfDoc.numPages) {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      if (renderTasksRef.current[key]) {
        try {
          renderTasksRef.current[key]?.cancel();
        } catch {
          // ignore cancel error
        }
        renderTasksRef.current[key] = null;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1 });

        const parent = canvas.parentElement;
        const availWidth = parent ? parent.clientWidth - 16 : isDouble ? 600 : 850;
        const availHeight = parent ? parent.clientHeight - 16 : 820;

        const scaleX = availWidth / unscaledViewport.width;
        const scaleY = availHeight / unscaledViewport.height;

        const userZoom = settings.zoom || 1.0;
        const fitScale = Math.min(scaleX, scaleY) * userZoom;
        const dpr = Math.max(window.devicePixelRatio || 1, 1.75);

        const viewport = page.getViewport({ scale: fitScale * dpr });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        });

        renderTasksRef.current[key] = task;
        await task.promise;
      } catch (err) {
        if ((err as { name?: string })?.name === 'RenderingCancelledException') {
          return;
        }
        console.warn(`Render page ${pageNum} warning:`, err);
      } finally {
        renderTasksRef.current[key] = null;
      }
    },
    [pdfDoc, isDouble, settings.zoom]
  );

  // Render canvas when in scan mode
  useEffect(() => {
    if (!pdfDoc || !isScanMode) return;

    if (isDouble) {
      renderPdfPage(leftPageNum, currentLeftCanvasRef.current, 'currentLeft');
      if (rightPageNum <= pdfDoc.numPages) {
        renderPdfPage(rightPageNum, currentRightCanvasRef.current, 'currentRight');
      }
    } else {
      renderPdfPage(currentPage, singleCanvasRef.current, 'single');
    }
  }, [pdfDoc, isScanMode, currentPage, isDouble, leftPageNum, rightPageNum, renderPdfPage, settings.zoom]);

  // Clean up render tasks on unmount
  useEffect(() => {
    return () => {
      Object.values(renderTasksRef.current).forEach((t) => {
        try {
          t?.cancel();
        } catch {}
      });
    };
  }, []);

  // Safe background on-demand page extraction without render-phase state update
  useEffect(() => {
    if (!onExtractPage || !pdfDoc || isScanMode) return;
    const pagesToCheck = isDouble ? [leftPageNum, rightPageNum] : [currentPage];

    pagesToCheck.forEach((p) => {
      if (p >= 1 && p <= totalPages) {
        const content = textPages ? textPages[p - 1] : undefined;
        if (content === undefined && !inFlightPagesRef.current.has(p)) {
          inFlightPagesRef.current.add(p);
          onExtractPage(p).finally(() => {
            inFlightPagesRef.current.delete(p);
          });
        }
      }
    });
  }, [leftPageNum, rightPageNum, currentPage, isDouble, totalPages, pdfDoc, isScanMode, textPages, onExtractPage]);

  // Theme styling for paper background
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

  const getPdfCanvasFilter = () => {
    switch (settings.theme) {
      case 'sepia':
        return 'sepia(0.35) contrast(1.05) brightness(0.97)';
      case 'warm':
        return 'sepia(0.5) hue-rotate(-10deg) contrast(1.03) brightness(0.96)';
      case 'eink':
        return 'grayscale(1) contrast(1.15) brightness(0.96)';
      case 'dark':
        return 'invert(0.9) hue-rotate(180deg) contrast(1.15) brightness(0.95)';
      case 'white':
      default:
        return 'contrast(1.02)';
    }
  };

  /**
   * Render structured book page (like the Demo Book!)
   */
  const renderFormattedBookPage = (pageNum: number, isCenter = false) => {
    if (pageNum < 1 || pageNum > totalPages) {
      return (
        <div className="flex-1 flex items-center justify-center text-current/30 italic text-sm">
          (Hết trang sách)
        </div>
      );
    }

    const rawContent = textPages ? textPages[pageNum - 1] : undefined;

    // Explicit Scan Mode (original PDF canvas)
    if (isScanMode) {
      if (pdfDoc && isCenter) {
        return (
          <div className="flex-1 flex items-center justify-center overflow-hidden w-full h-full">
            <canvas
              ref={
                !isDouble
                  ? singleCanvasRef
                  : pageNum === leftPageNum
                  ? currentLeftCanvasRef
                  : currentRightCanvasRef
              }
              className="w-full h-full object-contain"
              style={{ filter: getPdfCanvasFilter() }}
            />
          </div>
        );
      }
      return (
        <div className="flex-1 flex items-center justify-center text-current/30 italic text-sm">
          (Trang scan)
        </div>
      );
    }

    // Book Mode (Demo Book Style):
    // 1. If text is not loaded yet (undefined or null in cache):
    if (rawContent === undefined || rawContent === null) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-current/40 italic text-sm gap-2">
          <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          <span>Đang nạp trang {pageNum}...</span>
        </div>
      );
    }

    // 2. If page has been loaded, but contains no extractable text (e.g. cover image, scans, or blank page):
    if (rawContent.trim().length === 0) {
      if (pageNum === 1 && book.coverUrl) {
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-6 select-none">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="max-h-[75vh] max-w-[85%] object-contain rounded shadow-lg border border-current/10"
            />
            <p className="mt-3 text-sm font-serif font-bold text-center tracking-wide opacity-80">{book.title}</p>
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-current/35 italic text-sm select-none">
          <span>(Trang hình ảnh / minh họa)</span>
          <span className="text-xs mt-2 opacity-70">
            Bạn có thể bật "Bản gốc PDF" trên thanh công cụ để xem ảnh scan gốc đầy đủ.
          </span>
        </div>
      );
    }

    const paragraphs = rawContent.split(/\n\s*\n/);
    const typo = settings.typography;
    const userZoom = settings.zoom || 1.0;
    const computedFontSize = Math.round(typo.fontSize * userZoom);

    const getFontFamilyStyle = () => {
      switch (typo.fontFamily) {
        case 'Be Vietnam Pro':
          return "'Be Vietnam Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        case 'EB Garamond':
          return "'EB Garamond', 'Times New Roman', 'Garamond', serif";
        case 'Literata':
          return "'Literata', 'Times New Roman', 'Merriweather', serif";
        case 'Lora':
          return "'Lora', 'Times New Roman', serif";
        case 'Merriweather':
          return "'Merriweather', 'Times New Roman', serif";
        case 'Playfair Display':
          return "'Playfair Display', 'Times New Roman', serif";
        case 'Inter':
        default:
          return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      }
    };

    return (
      <div
        className={`book-scroll-pane flex-1 overflow-y-auto pr-3 font-${typo.fontFamily.toLowerCase().replace(/\s+/g, '')} paper-texture select-none`}
        style={{
          fontFamily: getFontFamilyStyle(),
          fontSize: `${computedFontSize}px`,
          lineHeight: typo.lineHeight,
          letterSpacing: `${typo.letterSpacing}px`,
          textAlign: typo.textAlign,
        }}
      >
        <div className="space-y-3.5 selection:bg-amber-500/30">
          {paragraphs.map((p, idx) => {
            const clean = p.trim();
            if (!clean) return null;

            if (clean.startsWith('# ')) {
              return (
                <h1
                  key={idx}
                  className="text-2xl md:text-3xl font-bold my-5 text-center tracking-tight border-b border-current/15 pb-2"
                >
                  {clean.replace(/^#\s*/, '')}
                </h1>
              );
            }
            if (clean.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-lg md:text-xl font-bold mt-5 mb-2.5 tracking-wide opacity-90"
                >
                  {clean.replace(/^##\s*/, '')}
                </h2>
              );
            }
            if (clean.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-base md:text-lg font-semibold mt-4 mb-1.5 italic opacity-85"
                >
                  {clean.replace(/^###\s*/, '')}
                </h3>
              );
            }
            if (clean.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="border-l-2 border-current/30 pl-4 my-3 italic opacity-80"
                >
                  {clean.replace(/^>\s*/, '')}
                </blockquote>
              );
            }

            return (
              <p key={idx} className="indent-6 leading-relaxed">
                {clean}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render spread (either 2-page or 1-page)
   */
  const renderSpreadView = (leftNum: number, rightNum: number, isCenter = false) => {
    if (isDouble) {
      return (
        <div className="w-full h-full flex rounded-xl overflow-hidden shadow-sm">
          {/* LEFT PAGE */}
          <div
            key={`page-left-${leftNum}`}
            className={`flex-1 relative flex flex-col ${isScanMode ? 'p-2' : 'p-6 md:p-10'} border-r border-black/10 book-edge-stack-left ${getThemeClass()} transition-colors duration-200`}
          >
            <div className="absolute inset-y-0 right-0 w-16 book-spine-shadow-right pointer-events-none z-20" />
            {!isScanMode && (
              <div className="flex justify-between items-center text-xs opacity-50 font-mono mb-3">
                <span className="truncate max-w-[200px]">{book.title}</span>
                <span>{leftNum <= totalPages && leftNum >= 1 ? leftNum : ''}</span>
              </div>
            )}
            {renderFormattedBookPage(leftNum, isCenter)}
            {!isScanMode && (
              <div className="text-center text-[11px] opacity-40 font-mono mt-2">
                {leftNum <= totalPages && leftNum >= 1 ? `${leftNum} / ${totalPages}` : ''}
              </div>
            )}
          </div>

          {/* REALISTIC BOOK CENTER SPINE */}
          <div className="w-3 bg-gradient-to-r from-black/25 via-black/10 to-black/25 shadow-inner relative z-20 flex-shrink-0" />

          {/* RIGHT PAGE */}
          <div
            key={`page-right-${rightNum}`}
            className={`flex-1 relative flex flex-col ${isScanMode ? 'p-2' : 'p-6 md:p-10'} border-l border-black/10 book-edge-stack-right ${getThemeClass()} transition-colors duration-200`}
          >
            <div className="absolute inset-y-0 left-0 w-16 book-spine-shadow-left pointer-events-none z-20" />
            {!isScanMode && (
              <div className="flex justify-between items-center text-xs opacity-50 font-mono mb-3">
                <span>{rightNum <= totalPages && rightNum >= 1 ? rightNum : ''}</span>
                <span className="truncate max-w-[200px]">{book.author || ''}</span>
              </div>
            )}
            {renderFormattedBookPage(rightNum, isCenter)}
            {!isScanMode && (
              <div className="text-center text-[11px] opacity-40 font-mono mt-2">
                {rightNum <= totalPages && rightNum >= 1 ? `${rightNum} / ${totalPages}` : ''}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Single page mode
    return (
      <div
        key={`page-single-${leftNum}`}
        className={`w-full h-full flex flex-col ${isScanMode ? 'p-2' : 'p-8 md:p-12'} rounded-2xl shadow-sm border border-black/10 relative ${getThemeClass()} transition-colors duration-200`}
      >
        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none rounded-l-2xl" />
        {!isScanMode && (
          <div className="flex justify-between items-center text-xs opacity-50 font-mono mb-3">
            <span className="truncate max-w-[250px]">{book.title}</span>
            <span>Trang {leftNum <= totalPages && leftNum >= 1 ? leftNum : ''}</span>
          </div>
        )}
        {renderFormattedBookPage(leftNum, isCenter)}
        {!isScanMode && (
          <div className="text-center text-xs opacity-40 font-mono mt-2">
            {leftNum <= totalPages && leftNum >= 1 ? `Trang ${leftNum} / ${totalPages}` : ''}
          </div>
        )}
      </div>
    );
  };

  /* ================= MOUSE GRAB: VERTICAL SCROLL + HORIZONTAL SLIDE ================= */

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    startXRef.current = clientX;
    startYRef.current = clientY;

    const scrollContainer = (e.target as HTMLElement).closest('.book-scroll-pane') as HTMLElement | null;
    scrollTargetRef.current = scrollContainer;
    startScrollTopRef.current = scrollContainer ? scrollContainer.scrollTop : 0;
    dragModeRef.current = null;

    setIsDragging(true);
    setDragOffset(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - startXRef.current;
      const deltaY = clientY - startYRef.current;

      // Determine dragMode: vertical drag = scroll lines; horizontal drag = slide pages
      if (!dragModeRef.current) {
        if (Math.abs(deltaY) > 5 && Math.abs(deltaY) >= Math.abs(deltaX)) {
          dragModeRef.current = 'scroll';
        } else if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          dragModeRef.current = 'slide';
        }
      }

      // 1. Grab-to-Scroll lines inside page
      if (dragModeRef.current === 'scroll') {
        if (scrollTargetRef.current) {
          scrollTargetRef.current.scrollTop = startScrollTopRef.current - deltaY;
        }
        return;
      }

      // 2. Grab-to-Slide (Hiệu ứng trượt ngang sang trang)
      if (dragModeRef.current === 'slide') {
        // Resistance at ends
        if (currentPage <= 1 && deltaX > 0) {
          setDragOffset(deltaX * 0.25);
        } else if (currentPage >= totalPages && deltaX < 0) {
          setDragOffset(deltaX * 0.25);
        } else {
          setDragOffset(deltaX);
        }
      }
    };

    const handleMouseUp = () => {
      if (dragModeRef.current === 'slide') {
        const threshold = 60;
        if (dragOffset < -threshold && currentPage < totalPages) {
          executeSlide('next');
        } else if (dragOffset > threshold && currentPage > 1) {
          executeSlide('prev');
        } else {
          // Snap back smoothly
          setDisableTransition(false);
          setDragOffset(0);
        }
      }

      dragModeRef.current = null;
      scrollTargetRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, currentPage, totalPages, executeSlide]);

  // Compute slide track transform with 3D GPU acceleration
  const getTrackTransform = () => {
    if (isSliding === 'next') {
      return 'translate3d(-200%, 0, 0)';
    }
    if (isSliding === 'prev') {
      return 'translate3d(0%, 0, 0)';
    }
    // Idle or active drag
    return `translate3d(calc(-100% + ${dragOffset}px), 0, 0)`;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStartDrag}
      onTouchStart={handleStartDrag}
      className={`relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`,
      }}
    >
      {/* Side Arrow Navigation Buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          turnPrev();
        }}
        disabled={currentPage <= 1 || !!isSliding}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition-all shadow-lg disabled:opacity-0 disabled:pointer-events-none"
        title="Trang trước (Mũi tên trái)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          turnNext();
        }}
        disabled={currentPage >= totalPages || !!isSliding}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition-all shadow-lg disabled:opacity-0 disabled:pointer-events-none"
        title="Trang sau (Mũi tên phải)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* The Physical Book Structure with Slide Carousel Viewport */}
      <div
        className="relative flex rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-black/10 select-none overflow-hidden"
        style={{
          maxWidth: isDouble ? 'min(96vw, 1560px)' : 'min(92vw, 980px)',
          width: '100%',
          height: 'min(92vh, 960px)',
        }}
      >
        {/* Silk Ribbon Bookmark */}
        {isBookmarked && (
          <div
            className="absolute top-0 right-14 z-40 w-5 h-28 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 shadow-xl ribbon-bookmark rounded-b-sm pointer-events-none"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)',
            }}
          />
        )}

        {/* 3-SLIDE HORIZONTAL CAROUSEL TRACK */}
        <div
          className="w-full h-full flex"
          style={{
            transform: getTrackTransform(),
            transition: isDragging || disableTransition
              ? 'none'
              : 'transform 0.26s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* SLIDE 0: PREVIOUS SPREAD */}
          <div className="w-full h-full flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
            {renderSpreadView(prevLeftPageNum, prevRightPageNum, false)}
          </div>

          {/* SLIDE 1: CURRENT SPREAD */}
          <div className="w-full h-full flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
            {renderSpreadView(leftPageNum, rightPageNum, true)}
          </div>

          {/* SLIDE 2: NEXT SPREAD */}
          <div className="w-full h-full flex-shrink-0" style={{ transform: 'translateZ(0)' }}>
            {renderSpreadView(nextLeftPageNum, nextRightPageNum, false)}
          </div>
        </div>
      </div>
    </div>
  );
};
