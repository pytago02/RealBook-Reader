import { get, set, del } from 'idb-keyval';
import type { Book, ReaderSettings, Bookmark, Highlight } from '../types';
import { SAMPLE_COMIC_BOOK } from './sampleComic';

const BOOKS_META_KEY = 'realbook_library_metadata';
const BOOK_DATA_PREFIX = 'realbook_file_';
const SETTINGS_KEY = 'realbook_user_settings';

// In-memory cache fallback to guarantee 100% reliability if IndexedDB is locked or unavailable
const memoryStore = new Map<string, any>();

async function safeGet<T>(key: string): Promise<T | undefined> {
  try {
    const val = await Promise.race([
      get<T>(key),
      new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2500)),
    ]);
    if (val !== undefined && val !== null) {
      memoryStore.set(key, val);
      return val;
    }
  } catch (err) {
    console.warn(`IndexedDB get('${key}') failed, using in-memory store:`, err);
  }
  return memoryStore.get(key) as T | undefined;
}

async function safeSet(key: string, val: any): Promise<void> {
  memoryStore.set(key, val);
  try {
    await Promise.race([
      set(key, val),
      new Promise<void>((resolve) => setTimeout(() => resolve(), 3000)),
    ]);
  } catch (err) {
    console.warn(`IndexedDB set('${key}') failed, cached in-memory:`, err);
  }
}

async function safeDel(key: string): Promise<void> {
  memoryStore.delete(key);
  try {
    await Promise.race([
      del(key),
      new Promise<void>((resolve) => setTimeout(() => resolve(), 2000)),
    ]);
  } catch (err) {
    console.warn(`IndexedDB del('${key}') failed:`, err);
  }
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  language: 'vi',
  theme: 'sepia',
  brightness: 100,
  contrast: 100,
  pageSpread: 'double',
  soundEnabled: true,
  soundVolume: 0.6,
  zoom: 1.0,
  pdfDisplayMode: 'book',
  viewerMode: 'realistic',
  typography: {
    fontFamily: 'Merriweather',
    fontSize: 18,
    lineHeight: 1.8,
    letterSpacing: 0.5,
    margin: 'normal',
    textAlign: 'justify',
  },
};

export class StorageService {
  private metaQueue: Promise<unknown> = Promise.resolve();

  /**
   * Run metadata read-modify-write tasks sequentially to avoid concurrency race conditions
   */
  private async runWithMetaLock<T>(task: () => Promise<T>): Promise<T> {
    const next = this.metaQueue.then(task, task);
    this.metaQueue = next;
    return next;
  }

  /**
   * Get all books in the library
   */
  async getBooks(): Promise<Book[]> {
    try {
      const books = await safeGet<Book[]>(BOOKS_META_KEY);
      if (!books || books.length === 0) {
        // Create initial sample books for quick testing
        const sampleBook = this.createSampleBook();
        const sampleComic = this.createSampleComicBook();
        await this.saveBookMeta(sampleBook);
        await this.saveBookMeta(sampleComic);
        return [sampleBook, sampleComic];
      }

      // Ensure sample comic book is also available in library if not present
      if (!books.some((b) => b.id === 'sample-comic-vu-tru')) {
        const sampleComic = this.createSampleComicBook();
        books.push(sampleComic);
        await safeSet(BOOKS_META_KEY, books);
      }

      // Sanitize loaded books to guard against any corrupted bookmark or progress data
      books.forEach((b) => {
        if (b && Array.isArray(b.bookmarks)) {
          b.bookmarks = b.bookmarks
            .filter((bm) => bm && typeof bm === 'object')
            .map((bm) => ({
              ...bm,
              page:
                typeof bm.page === 'number' && Number.isFinite(bm.page)
                  ? Math.round(bm.page)
                  : typeof bm.page === 'string' && !isNaN(Number(bm.page))
                  ? Math.round(Number(bm.page))
                  : 1,
              createdAt:
                typeof bm.createdAt === 'number' && Number.isFinite(bm.createdAt)
                  ? bm.createdAt
                  : Date.now(),
            }));
        }
      });

      return books;
    } catch (e) {
      console.error('Failed to get books:', e);
      return [];
    }
  }

  /**
   * Save or update book metadata
   */
  async saveBookMeta(book: Book): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      const index = books.findIndex((b) => b.id === book.id);
      if (index >= 0) {
        books[index] = book;
      } else {
        books.unshift(book);
      }
      await safeSet(BOOKS_META_KEY, books);
    });
  }

  /**
   * Save book file binary to IndexedDB
   */
  async saveBookFile(id: string, data: ArrayBuffer): Promise<void> {
    await safeSet(`${BOOK_DATA_PREFIX}${id}`, data);
  }

  /**
   * Save text content as book file to IndexedDB
   */
  async saveBookData(id: string, text: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.saveBookFile(id, encoder.encode(text).buffer as ArrayBuffer);
  }

  /**
   * Get book file binary
   */
  async getBookFile(id: string): Promise<ArrayBuffer | null> {
    const data = await safeGet<ArrayBuffer>(`${BOOK_DATA_PREFIX}${id}`);
    return data || null;
  }

  /**
   * Update reading progress and reading duration
   */
  async updateProgress(
    id: string,
    page: number,
    totalPages?: number,
    addedTimeSeconds = 0
  ): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      let book = books.find((b) => b.id === id);
      if (!book && id === 'sample-hoang-tu-be') {
        book = this.createSampleBook();
        books.push(book);
      } else if (!book && id === 'sample-comic-vu-tru') {
        book = this.createSampleComicBook();
        books.push(book);
      }
      if (book) {
        book.currentPage = page;
        if (totalPages) book.totalPages = totalPages;
        book.lastReadAt = Date.now();
        if (addedTimeSeconds > 0) {
          book.readingTimeSeconds = (book.readingTimeSeconds || 0) + addedTimeSeconds;
        }
        await safeSet(BOOKS_META_KEY, books);
      }
    });
  }

  /**
   * Add bookmark to book
   */
  async addBookmark(bookId: string, bookmark: Bookmark): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      let book = books.find((b) => b.id === bookId);
      if (!book && bookId === 'sample-hoang-tu-be') {
        book = this.createSampleBook();
        books.push(book);
      } else if (!book && bookId === 'sample-comic-vu-tru') {
        book = this.createSampleComicBook();
        books.push(book);
      }
      if (book) {
        if (!book.bookmarks) book.bookmarks = [];

        const cleanPage =
          typeof bookmark.page === 'number' && Number.isFinite(bookmark.page)
            ? Math.round(bookmark.page)
            : typeof bookmark.page === 'string' && !isNaN(Number(bookmark.page))
            ? Math.round(Number(bookmark.page))
            : 1;

        const cleanBookmark: Bookmark = {
          ...bookmark,
          page: cleanPage,
          label: bookmark.label || `Trang ${cleanPage}`,
          createdAt:
            typeof bookmark.createdAt === 'number' && Number.isFinite(bookmark.createdAt)
              ? bookmark.createdAt
              : Date.now(),
        };

        const idx = book.bookmarks.findIndex((b) => b.page === cleanPage);
        if (idx >= 0) {
          book.bookmarks[idx] = cleanBookmark;
        } else {
          book.bookmarks.push(cleanBookmark);
        }
        await safeSet(BOOKS_META_KEY, books);
      }
    });
  }

  /**
   * Remove bookmark by ID or by Page
   */
  async removeBookmark(bookId: string, bookmarkIdOrPage: string | number): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      let book = books.find((b) => b.id === bookId);
      if (!book && bookId === 'sample-hoang-tu-be') {
        book = this.createSampleBook();
        books.push(book);
      } else if (!book && bookId === 'sample-comic-vu-tru') {
        book = this.createSampleComicBook();
        books.push(book);
      }
      if (book && book.bookmarks) {
        book.bookmarks = book.bookmarks.filter((b) => {
          if (!b) return false;
          if (b.id === bookmarkIdOrPage) return false;
          if (typeof bookmarkIdOrPage === 'number' && b.page === bookmarkIdOrPage) return false;
          if (typeof b.page !== 'number') return false; // Purge corrupt non-numeric bookmark pages
          return true;
        });
        await safeSet(BOOKS_META_KEY, books);
      }
    });
  }

  /**
   * Add or update highlight
   */
  async addHighlight(bookId: string, highlight: Highlight): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      let book = books.find((b) => b.id === bookId);
      if (!book && bookId === 'sample-hoang-tu-be') {
        book = this.createSampleBook();
        books.push(book);
      } else if (!book && bookId === 'sample-comic-vu-tru') {
        book = this.createSampleComicBook();
        books.push(book);
      }
      if (book) {
        if (!book.highlights) book.highlights = [];
        book.highlights.push(highlight);
        await safeSet(BOOKS_META_KEY, books);
      }
    });
  }

  /**
   * Delete book and its file
   */
  async deleteBook(id: string): Promise<void> {
    return this.runWithMetaLock(async () => {
      const books = (await safeGet<Book[]>(BOOKS_META_KEY)) || [];
      const filtered = books.filter((b) => b.id !== id);
      await safeSet(BOOKS_META_KEY, filtered);
      await safeDel(`${BOOK_DATA_PREFIX}${id}`);
    });
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<ReaderSettings> {
    try {
      const settings = await safeGet<ReaderSettings>(SETTINGS_KEY);
      const merged = settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
      if (!merged.language) {
        merged.language = 'vi';
      }
      // Guarantee 'book' mode is used by default so PDF displays beautifully like demo book
      if (!merged.pdfDisplayMode || merged.pdfDisplayMode === 'scan') {
        merged.pdfDisplayMode = 'book';
      }
      return merged;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save user settings
   */
  async saveSettings(settings: ReaderSettings): Promise<void> {
    await safeSet(SETTINGS_KEY, settings);
  }

  /**
   * Generate initial demo book
   */
  createSampleBook(): Book {
    return {
      id: 'sample-hoang-tu-be',
      title: 'Hoàng Tử Bé (Le Petit Prince)',
      author: 'Antoine de Saint-Exupéry',
      genre: 'Văn học & Tiểu thuyết',
      format: 'txt',
      totalPages: 12,
      currentPage: 1,
      fileSize: 24500,
      addedAt: Date.now(),
      lastReadAt: Date.now(),
      bookmarks: [{ id: 'bm-1', page: 1, label: 'Bắt đầu', createdAt: Date.now() }],
      highlights: [],
      readingTimeSeconds: 120,
      tags: ['Kinh điển', 'Triết lý', 'Văn học'],
    };
  }

  /**
   * Generate initial sample comic book
   */
  createSampleComicBook(): Book {
    return {
      ...SAMPLE_COMIC_BOOK,
      addedAt: Date.now(),
      lastReadAt: Date.now(),
    };
  }
}

export const storageService = new StorageService();
