import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { Book, ReaderSettings, TocItem, TypographySettings } from './types';
import { storageService, DEFAULT_SETTINGS } from './services/storage';
import { pdfParser } from './services/parsers/pdfParser';
import { docxParser } from './services/parsers/docxParser';
import { txtParser } from './services/parsers/txtParser';
import { SAMPLE_BOOK_PAGES } from './services/sampleBook';
import { Library } from './components/Library';
import { RealisticBook } from './components/RealisticBook';
import { ReflowReader } from './components/ReflowReader';
import { ZenToolbar } from './components/ZenToolbar';
import { EyeComfortControl } from './components/EyeComfortControl';
import { TypographyControl } from './components/TypographyControl';
import { TocAndBookmarksModal } from './components/TocAndBookmarksModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, EyeOff } from 'lucide-react';
import { freeBooksApi, type OnlineBook } from './services/freeBooksApi';
import { inferGenre } from './utils/genre';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { BookMetadataModal, type PendingBookData, type BookMetadataForm } from './components/BookMetadataModal';
import { getTranslation } from './i18n';
import { setupNativeStatusBar, registerBackButtonHandler } from './utils/mobile';

export const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);

  // Synchronized Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { ...msg, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update book genre
  const handleUpdateBookGenre = useCallback(
    async (bookId: string, newGenre: string) => {
      const target = books.find((b) => b.id === bookId);
      if (!target) return;
      const updated: Book = { ...target, genre: newGenre };
      await storageService.saveBookMeta(updated);
      setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
      if (currentBook?.id === bookId) {
        setCurrentBook(updated);
      }
      showToast({
        type: 'success',
        title: 'Cập nhật thể loại',
        message: `Cuốn "${target.title}" đã chuyển sang thể loại "${newGenre}".`,
      });
    },
    [books, currentBook, showToast]
  );

  // Reader state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [textPages, setTextPages] = useState<string[] | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Đang mở sách...');

  // UI state
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const inFlightExtractionsRef = useRef<Set<number>>(new Set());

  // Modals
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isTypoModalOpen, setIsTypoModalOpen] = useState<boolean>(false);
  const [isTocModalOpen, setIsTocModalOpen] = useState<boolean>(false);
  const [pendingBookImport, setPendingBookImport] = useState<PendingBookData | null>(null);

  // Load books & settings on startup
  useEffect(() => {
    const init = async () => {
      setupNativeStatusBar();
      const [savedBooks, savedSettings] = await Promise.all([
        storageService.getBooks(),
        storageService.getSettings(),
      ]);
      setBooks(savedBooks);
      setSettings(savedSettings);
    };
    init();
  }, []);

  // Keyboard shortcut listener (Esc to exit focus mode, F to toggle)
  useEffect(() => {
    if (!currentBook) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsFocusMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBook, isFocusMode]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Active reading timer: track reading duration every 10s when tab is active
  useEffect(() => {
    if (!currentBook) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      const addSeconds = 10;
      setCurrentBook((prev) =>
        prev
          ? {
              ...prev,
              readingTimeSeconds: (prev.readingTimeSeconds || 0) + addSeconds,
            }
          : null
      );
      setBooks((prev) =>
        prev.map((b) =>
          b.id === currentBook.id
            ? { ...b, readingTimeSeconds: (b.readingTimeSeconds || 0) + addSeconds }
            : b
        )
      );
      storageService.updateProgress(
        currentBook.id,
        currentBook.currentPage,
        currentBook.totalPages,
        addSeconds
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [currentBook?.id, currentBook?.currentPage, currentBook?.totalPages]);

  // Open a book
  const handleOpenBook = async (book: Book, preloadedDoc?: pdfjsLib.PDFDocumentProxy) => {
    setIsLoading(true);
    setLoadingText('Đang nạp dữ liệu sách...');
    setIsFocusMode(false);

    // Fetch freshest book data from storage to guarantee latest progress and bookmarks
    const freshBooks = await storageService.getBooks();
    const freshBook = freshBooks.find((b) => b.id === book.id) || book;
    const now = Date.now();
    const activeBook: Book = { ...freshBook, lastReadAt: now };
    setCurrentBook(activeBook);
    setBooks(freshBooks.map((b) => (b.id === activeBook.id ? activeBook : b)));

    // Failsafe timer: loading overlay will NEVER spin longer than 4.5 seconds under any circumstance
    const failsafeTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    try {
      if (book.id === 'sample-hoang-tu-be') {
        // Sample book
        setTextPages(SAMPLE_BOOK_PAGES);
        setPdfDoc(null);
        setToc([
          { title: 'Trang bìa & Giới thiệu', page: 1 },
          { title: 'Gửi Léon Werth', page: 2 },
          { title: 'Chương I: Bức tranh số 1', page: 3 },
          { title: 'Chương II: Gặp Hoàng Tử Bé', page: 5 },
          { title: 'Chiếc hộp của con cừu', page: 8 },
          { title: 'Bông hoa hồng duy nhất', page: 10 },
          { title: 'Bí mật của Cáo', page: 11 },
          { title: 'Điều cốt lõi vô hình trước mắt', page: 12 },
        ]);
        window.clearTimeout(failsafeTimer);
        setIsLoading(false);
        return;
      }

      let doc = preloadedDoc || null;

      // If document is not preloaded, fetch binary from IndexedDB
      if (!doc) {
        const fileData = await storageService.getBookFile(book.id);
        if (!fileData || fileData.byteLength === 0) {
          showToast({
            type: 'error',
            title: 'Lỗi mở file',
            message: 'Không tìm thấy dữ liệu file sách hoặc file bị trống. Vui lòng mở lại file.',
          });
          window.clearTimeout(failsafeTimer);
          setIsLoading(false);
          return;
        }

        if (book.format === 'pdf') {
          doc = await pdfParser.loadDocument(fileData.slice(0));
        } else if (book.format === 'docx') {
          const parsed = await docxParser.parseDocx(fileData.slice(0));
          setTextPages(parsed.pages);
          setPdfDoc(null);
          window.clearTimeout(failsafeTimer);
          setIsLoading(false);
          return;
        } else {
          // txt / md
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(fileData.slice(0));
          const parsed = txtParser.parseText(text);
          setTextPages(parsed.pages);
          setPdfDoc(null);
          window.clearTimeout(failsafeTimer);
          setIsLoading(false);
          return;
        }
      }

      if (doc && book.format === 'pdf') {
        setPdfDoc(doc);

        // Background load outline without blocking screen opening
        pdfParser.extractOutline(doc).then((outline) => {
          if (outline && outline.length > 0) setToc(outline);
        }).catch(() => {});

        // Instant Display: Extract ONLY the currently visible 1-2 pages!
        const total = doc.numPages;
        const cur = Math.max(1, Math.min(total, book.currentPage || 1));
        const isDouble = settings.pageSpread === 'double';
        const startPage = isDouble ? (cur % 2 === 0 ? Math.max(1, cur - 1) : cur) : cur;
        const neededPages = isDouble
          ? [startPage, startPage + 1].filter((p) => p <= total)
          : [startPage];

        const visibleTexts = await Promise.all(
          neededPages.map((p) => pdfParser.extractPageText(doc!, p))
        );

        const allPages: string[] = new Array(total).fill(undefined as any);
        neededPages.forEach((p, idx) => {
          allPages[p - 1] = visibleTexts[idx];
        });
        setTextPages(allPages);

        // Reader is ready to display! Dismiss loading overlay immediately
        window.clearTimeout(failsafeTimer);
        setIsLoading(false);

        // Background preloader: smoothly extract remaining pages in small gentle batches
        (async () => {
          for (let p = 1; p <= total; p += 4) {
            const batch: number[] = [];
            for (let b = p; b < Math.min(p + 4, total + 1); b++) {
              if (allPages[b - 1] === undefined) batch.push(b);
            }
            if (batch.length > 0) {
              const batchTexts = await Promise.all(
                batch.map((bp) => pdfParser.extractPageText(doc!, bp))
              );
              batch.forEach((bp, idx) => {
                allPages[bp - 1] = batchTexts[idx];
              });
              setTextPages([...allPages]);
              // Yield 20ms to UI thread to keep navigation completely fluid
              await new Promise((r) => setTimeout(r, 20));
            }
          }
        })();
        return;
      }
    } catch (e) {
      console.error('Error opening book:', e);
      const msg = e instanceof Error ? e.message : String(e);
      showToast({
        type: 'error',
        title: 'Lỗi đọc sách',
        message: `Có lỗi xảy ra khi mở sách (${msg}).`,
      });
    } finally {
      window.clearTimeout(failsafeTimer);
      setIsLoading(false);
    }
  };

  // Universal helper to read File or Blob to ArrayBuffer across Web, Electron, and Android WebView
  const readBlobAsArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
    if (typeof blob.arrayBuffer === 'function') {
      try {
        return await blob.arrayBuffer();
      } catch {
        // Fallback to FileReader below if native arrayBuffer() fails in Android WebView
      }
    }
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return an ArrayBuffer'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
      reader.readAsArrayBuffer(blob);
    });
  };

  // Import file from machine
  const handleImportFile = async (file: File) => {
    setIsLoading(true);
    setLoadingText(`Đang xử lý ${file.name || 'tài liệu'}...`);

    const failsafeTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, 30000);

    try {
      const buffer = await readBlobAsArrayBuffer(file);
      const lowerName = (file.name || '').toLowerCase();

      // Inspect binary magic bytes to guarantee 100% accurate format identification on Android
      const header = new Uint8Array(buffer.slice(0, 5));
      const hasPdfMagic =
        header.length >= 4 &&
        header[0] === 0x25 && // %
        header[1] === 0x50 && // P
        header[2] === 0x44 && // D
        header[3] === 0x46;   // F
      const hasZipMagic =
        header.length >= 4 &&
        header[0] === 0x50 && // P
        header[1] === 0x4B;   // K

      const isPdf = hasPdfMagic || lowerName.endsWith('.pdf') || file.type === 'application/pdf';
      const isDocx =
        (hasZipMagic && (lowerName.endsWith('.docx') || file.type.includes('word'))) ||
        lowerName.endsWith('.docx') ||
        file.type.includes('word') ||
        file.type.includes('document');

      let format: Book['format'] = 'pdf';
      let totalPages = 1;
      let coverUrl: string | undefined = undefined;
      let title = (file.name || 'Tài liệu')
        .replace(/\.[^/.]+$/, '')
        .replace(/^(content|file):[/\\]*/i, '')
        .trim();
      let author = 'Cá nhân';
      let initialTextPages: string[] | null = null;
      let pdfDocumentInstance: pdfjsLib.PDFDocumentProxy | undefined = undefined;

      const newBookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      if (isPdf) {
        format = 'pdf';
        pdfDocumentInstance = await pdfParser.loadDocument(buffer.slice(0));
        totalPages = Math.max(1, pdfDocumentInstance.numPages);

        // Try extracting embedded PDF title & author metadata if available
        try {
          const meta = await pdfDocumentInstance.getMetadata().catch(() => null);
          const info = meta?.info as Record<string, any> | undefined;
          const metaTitle = info?.Title;
          if (typeof metaTitle === 'string' && metaTitle.trim().length > 1) {
            title = metaTitle.trim();
          }
          const metaAuthor = info?.Author;
          if (typeof metaAuthor === 'string' && metaAuthor.trim().length > 1) {
            author = metaAuthor.trim();
          }
        } catch {}

        try {
          coverUrl = await pdfParser.generateCoverThumbnail(pdfDocumentInstance);
        } catch (e) {
          console.warn('Could not generate cover:', e);
        }
      } else if (isDocx) {
        format = 'docx';
        const parsed = await docxParser.parseDocx(buffer.slice(0));
        totalPages = parsed.pages.length;
        initialTextPages = parsed.pages;
      } else {
        format = 'txt';
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(buffer.slice(0));
        const parsed = txtParser.parseText(text);
        title = parsed.title || title;
        totalPages = parsed.pages.length;
        initialTextPages = parsed.pages;
      }

      if (!title || /^(content|file):/i.test(title) || /^[0-9_.-]+$/.test(title)) {
        title = isPdf ? 'Tài liệu PDF' : isDocx ? 'Tài liệu Word' : 'Văn bản';
      }

      const genre = inferGenre(title);

      // Open the Metadata Modal so the user can review/edit Title, Author, and Genre!
      setPendingBookImport({
        id: newBookId,
        buffer: buffer.slice(0),
        format,
        totalPages,
        coverUrl,
        fileSize: file.size,
        defaultTitle: title,
        defaultAuthor: author,
        defaultGenre: genre,
        initialTextPages,
        pdfDoc: pdfDocumentInstance,
      });
    } catch (err) {
      console.error('Import failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast({
        type: 'error',
        title: 'Lỗi nạp file',
        message: `Không thể đọc file đã chọn (${msg}). Vui lòng kiểm tra định dạng.`,
      });
    } finally {
      window.clearTimeout(failsafeTimer);
      setIsLoading(false);
    }
  };

  // Confirm and persist book import with customized Title, Author, and Genre
  const handleConfirmBookImport = async (form: BookMetadataForm, openImmediately: boolean) => {
    if (!pendingBookImport) return;
    const item = pendingBookImport;
    setPendingBookImport(null);

    setIsLoading(true);
    setLoadingText(openImmediately ? 'Đang mở sách...' : 'Đang lưu sách...');

    try {
      // Save binary copy to IndexedDB safely
      await storageService.saveBookFile(item.id, item.buffer);

      const finalTitle = form.title.trim() || item.defaultTitle || 'Tài liệu';
      const finalAuthor = form.author.trim() || item.defaultAuthor || 'Cá nhân';
      const finalGenre = form.genre.trim() || item.defaultGenre || 'Văn học & Tiểu thuyết';

      const newBook: Book = {
        id: item.id,
        title: finalTitle,
        author: finalAuthor,
        genre: finalGenre,
        format: item.format,
        totalPages: item.totalPages,
        currentPage: 1,
        coverUrl: item.coverUrl,
        fileSize: item.fileSize,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 0,
      };

      await storageService.saveBookMeta(newBook);

      // Update library list
      setBooks((prev) => [newBook, ...prev.filter((b) => b.id !== newBook.id)]);

      showToast({
        type: 'success',
        title: 'Nạp sách thành công',
        message: `Đã thêm "${newBook.title}" vào kệ sách (${newBook.genre}).`,
      });

      if (openImmediately) {
        if (item.initialTextPages) {
          setTextPages(item.initialTextPages);
        }
        await handleOpenBook(newBook, item.pdfDoc);
      }
    } catch (err) {
      console.error('Error finalizing book import:', err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast({
        type: 'error',
        title: 'Lỗi lưu sách',
        message: `Không thể lưu thông tin sách (${msg}).`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete book
  const handleDeleteBook = async (id: string) => {
    await storageService.deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (currentBook?.id === id) {
      setCurrentBook(null);
    }
  };

  // Download online book from free API and open immediately
  const handleDownloadOnlineBook = async (onlineBook: OnlineBook) => {
    setIsLoading(true);
    setLoadingText(`Đang tải "${onlineBook.title}" từ kho sách...`);
    try {
      const { book, pages } = await freeBooksApi.downloadAndImportBook(onlineBook);
      setBooks((prev) => [book, ...prev.filter((b) => b.id !== book.id)]);
      setTextPages(pages);
      showToast({
        type: 'success',
        title: 'Tải sách thành công',
        message: `Đã lưu "${onlineBook.title}" vào kệ sách ngoại tuyến.`,
      });
      await handleOpenBook(book);
    } catch (err) {
      console.error('Download failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      showToast({
        type: 'error',
        title: 'Lỗi tải sách',
        message: `Không thể tải sách: ${msg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Page change: updates current book, syncs books array, and persists progress
  const handlePageChange = (newPage: number) => {
    if (!currentBook) return;
    const clamped = Math.max(1, Math.min(newPage, currentBook.totalPages));
    const now = Date.now();
    setCurrentBook((prev) => (prev ? { ...prev, currentPage: clamped, lastReadAt: now } : null));
    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === currentBook.id ? { ...b, currentPage: clamped, lastReadAt: now } : b
      )
    );
    storageService.updateProgress(currentBook.id, clamped, currentBook.totalPages);
  };

  // Bookmark toggle: supports explicit targetPage or current visible spread
  const handleToggleBookmark = (targetPage?: unknown) => {
    if (!currentBook) return;

    // Strictly validate targetPage to ensure no MouseEvent or invalid object ever passes as page number
    const isDouble = settings.pageSpread === 'double';
    const leftPage = isDouble
      ? currentBook.currentPage % 2 === 0
        ? currentBook.currentPage - 1
        : currentBook.currentPage
      : currentBook.currentPage;

    let curPage: number;
    if (typeof targetPage === 'number' && Number.isFinite(targetPage)) {
      curPage = Math.max(1, Math.min(Math.round(targetPage), currentBook.totalPages));
    } else {
      // In double mode: if toolbar toggle is clicked without explicit page parameter,
      // toggle the left page or right page if one of them is already bookmarked
      const hasLeftBm = (currentBook.bookmarks || []).some((b) => b.page === leftPage);
      const hasRightBm = (currentBook.bookmarks || []).some((b) => b.page === leftPage + 1);

      if (hasLeftBm) {
        curPage = leftPage;
      } else if (hasRightBm) {
        curPage = leftPage + 1;
      } else {
        curPage = currentBook.currentPage;
      }
    }

    const existing = (currentBook.bookmarks || []).find((b) => b.page === curPage);

    if (existing) {
      storageService.removeBookmark(currentBook.id, existing.id);
      const updatedBookmarks = (currentBook.bookmarks || []).filter(
        (b) => b.id !== existing.id && b.page !== curPage
      );
      setCurrentBook((prev) => (prev ? { ...prev, bookmarks: updatedBookmarks } : null));
      setBooks((prevBooks) =>
        prevBooks.map((b) => (b.id === currentBook.id ? { ...b, bookmarks: updatedBookmarks } : b))
      );
      showToast({
        type: 'info',
        title: 'Dấu trang',
        message: `Đã bỏ đánh dấu trang ${curPage}.`,
      });
    } else {
      const newBm = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        page: curPage,
        label: `Trang ${curPage}`,
        createdAt: Date.now(),
      };
      storageService.addBookmark(currentBook.id, newBm);
      const updatedBookmarks = [...(currentBook.bookmarks || []), newBm];
      setCurrentBook((prev) => (prev ? { ...prev, bookmarks: updatedBookmarks } : null));
      setBooks((prevBooks) =>
        prevBooks.map((b) => (b.id === currentBook.id ? { ...b, bookmarks: updatedBookmarks } : b))
      );
      showToast({
        type: 'success',
        title: 'Dấu trang',
        message: `Đã đánh dấu trang ${curPage}.`,
      });
    }
  };

  // Extract single page text on demand
  const handleExtractPage = useCallback(
    async (pageNum: number): Promise<string> => {
      if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return '';
      if (textPages && textPages[pageNum - 1] !== undefined) {
        return textPages[pageNum - 1];
      }
      if (inFlightExtractionsRef.current.has(pageNum)) {
        return '';
      }
      inFlightExtractionsRef.current.add(pageNum);
      try {
        const text = await pdfParser.extractPageText(pdfDoc, pageNum);
        setTextPages((prev) => {
          if (!prev) return null;
          const next = [...prev];
          next[pageNum - 1] = text;
          return next;
        });
        return text;
      } finally {
        inFlightExtractionsRef.current.delete(pageNum);
      }
    },
    [pdfDoc, textPages]
  );

  // Update Settings
  const handleUpdateSettings = (updates: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleUpdateTypography = (typoUpdates: Partial<TypographySettings>) => {
    const updated = {
      ...settings,
      typography: { ...settings.typography, ...typoUpdates },
    };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  // Back to Library: flushes progress, re-fetches latest library state
  const handleBackToLibrary = async () => {
    setIsFocusMode(false);
    if (currentBook) {
      await storageService.updateProgress(
        currentBook.id,
        currentBook.currentPage,
        currentBook.totalPages
      );
      const refreshedBooks = await storageService.getBooks();
      setBooks(refreshedBooks);
    }
    setCurrentBook(null);
    setPdfDoc(null);
    setTextPages(null);
    setToc([]);
  };

  // Hardware Back Button integration for Android & Mobile
  useEffect(() => {
    return registerBackButtonHandler(() => {
      if (isTocModalOpen) {
        setIsTocModalOpen(false);
        return true;
      }
      if (isThemeModalOpen) {
        setIsThemeModalOpen(false);
        return true;
      }
      if (isTypoModalOpen) {
        setIsTypoModalOpen(false);
        return true;
      }
      if (isFocusMode) {
        setIsFocusMode(false);
        return true;
      }
      if (currentBook) {
        handleBackToLibrary();
        return true;
      }
      return false;
    });
  }, [
    isTocModalOpen,
    isThemeModalOpen,
    isTypoModalOpen,
    isFocusMode,
    currentBook,
    handleBackToLibrary,
  ]);

  const isDoubleSpread = settings.pageSpread === 'double';
  const spreadLeftPage = currentBook
    ? isDoubleSpread
      ? currentBook.currentPage % 2 === 0
        ? currentBook.currentPage - 1
        : currentBook.currentPage
      : currentBook.currentPage
    : 1;

  // Bookmarked status for toolbar: true if any visible page in the current spread is bookmarked
  const isCurrentPageBookmarked =
    !!currentBook?.bookmarks?.some(
      (b) =>
        b.page === spreadLeftPage ||
        (isDoubleSpread && b.page === spreadLeftPage + 1)
    );

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#121316] text-[#e2e2e8]">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
          <p className="text-sm font-medium tracking-wide">{loadingText}</p>
        </div>
      )}

      {!currentBook ? (
        /* Library Screen */
        <Library
          books={books}
          onOpenBook={handleOpenBook}
          onImportFile={handleImportFile}
          onDeleteBook={handleDeleteBook}
          onLoadSample={() => {
            const sample = storageService.createSampleBook();
            handleOpenBook(sample);
          }}
          onDownloadOnlineBook={handleDownloadOnlineBook}
          currentLanguage={settings.language || 'vi'}
          onSelectLanguage={(lang) => handleUpdateSettings({ language: lang })}
          onUpdateBookGenre={handleUpdateBookGenre}
          showToast={showToast}
        />
      ) : (
        /* Reading Screen */
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Floating Focus Mode Exit Button (Icon Only) */}
          {isFocusMode && (
            <button
              onClick={() => setIsFocusMode(false)}
              className="fixed top-3 right-4 z-50 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all opacity-30 hover:opacity-100 active:scale-95 shadow-xl cursor-pointer"
              title={getTranslation(settings.language || 'vi').reader.exitFocusMode}
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Zen Toolbar */}
          <ZenToolbar
            book={currentBook}
            currentPage={currentBook.currentPage}
            totalPages={currentBook.totalPages}
            isVisible={!isFocusMode}
            isFocusMode={isFocusMode}
            settings={settings}
            isFullscreen={isFullscreen}
            isBookmarked={isCurrentPageBookmarked}
            onBackToLibrary={handleBackToLibrary}
            onPrevPage={() =>
              handlePageChange(
                isDoubleSpread ? Math.max(1, spreadLeftPage - 2) : currentBook.currentPage - 1
              )
            }
            onNextPage={() =>
              handlePageChange(
                isDoubleSpread
                  ? Math.min(currentBook.totalPages, spreadLeftPage + 2)
                  : currentBook.currentPage + 1
              )
            }
            onPageChange={handlePageChange}
            onToggleBookmark={handleToggleBookmark}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onOpenTypographyModal={() => setIsTypoModalOpen(true)}
            onOpenTocModal={() => setIsTocModalOpen(true)}
            onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            onToggleFullscreen={toggleFullscreen}
            onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
            onToggleSpread={() =>
              handleUpdateSettings({
                pageSpread: settings.pageSpread === 'double' ? 'single' : 'double',
              })
            }
            onToggleViewerMode={() =>
              handleUpdateSettings({
                viewerMode: settings.viewerMode === 'realistic' ? 'reflow' : 'realistic',
              })
            }
            onTogglePdfDisplayMode={() =>
              handleUpdateSettings({
                pdfDisplayMode: settings.pdfDisplayMode === 'scan' ? 'book' : 'scan',
              })
            }
            onZoomIn={() =>
              handleUpdateSettings({
                zoom: Math.min(1.8, Math.round(((settings.zoom || 1.0) + 0.1) * 10) / 10),
              })
            }
            onZoomOut={() =>
              handleUpdateSettings({
                zoom: Math.max(0.7, Math.round(((settings.zoom || 1.0) - 0.1) * 10) / 10),
              })
            }
            onResetZoom={() =>
              handleUpdateSettings({
                zoom: 1.0,
              })
            }
          />

          {/* Reader Body */}
          <div className="w-full h-full">
            <ErrorBoundary fallbackTitle="Lỗi hiển thị nội dung sách">
              {settings.viewerMode === 'reflow' && textPages ? (
                <ReflowReader
                  book={currentBook}
                  currentPage={currentBook.currentPage}
                  totalPages={currentBook.totalPages}
                  textPages={textPages}
                  settings={settings}
                  isBookmarked={isCurrentPageBookmarked}
                  isFocusMode={isFocusMode}
                  onPageChange={handlePageChange}
                  onToggleBookmark={handleToggleBookmark}
                />
              ) : (
                <RealisticBook
                  book={currentBook}
                  currentPage={currentBook.currentPage}
                  totalPages={currentBook.totalPages}
                  settings={settings}
                  pdfDoc={pdfDoc}
                  textPages={textPages}
                  isBookmarked={isCurrentPageBookmarked}
                  isFocusMode={isFocusMode}
                  onPageChange={handlePageChange}
                  onExtractPage={handleExtractPage}
                  onToggleBookmark={handleToggleBookmark}
                />
              )}
            </ErrorBoundary>
          </div>

          {/* Modals */}
          <EyeComfortControl
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />

          <TypographyControl
            isOpen={isTypoModalOpen}
            onClose={() => setIsTypoModalOpen(false)}
            settings={settings}
            onUpdateTypography={handleUpdateTypography}
          />

          <ErrorBoundary fallbackTitle="Lỗi hiển thị mục lục và dấu trang">
            <TocAndBookmarksModal
              isOpen={isTocModalOpen}
              onClose={() => setIsTocModalOpen(false)}
              language={settings.language || 'vi'}
              toc={toc}
              bookmarks={currentBook.bookmarks || []}
              currentPage={currentBook.currentPage}
              onSelectPage={handlePageChange}
              onDeleteBookmark={(bmId) => {
                storageService.removeBookmark(currentBook.id, bmId);
                const updatedBookmarks = (currentBook.bookmarks || []).filter((b) => b.id !== bmId);
                setCurrentBook((prev) =>
                  prev ? { ...prev, bookmarks: updatedBookmarks } : null
                );
                setBooks((prevBooks) =>
                  prevBooks.map((b) =>
                    b.id === currentBook.id ? { ...b, bookmarks: updatedBookmarks } : b
                  )
                );
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Book Metadata Customization Modal when importing file */}
      <BookMetadataModal
        isOpen={!!pendingBookImport}
        data={pendingBookImport}
        onConfirm={handleConfirmBookImport}
        onCancel={() => setPendingBookImport(null)}
      />

      {/* Global Synchronized System Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
