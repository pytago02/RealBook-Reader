import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEFAULT_SETTINGS } from '../src/services/storage';
import type { Book, Bookmark, Highlight, ReaderSettings } from '../src/types';

describe('StorageService & Core Reading Models', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService();
  });

  describe('DEFAULT_SETTINGS', () => {
    it('has standard initial settings', () => {
      expect(DEFAULT_SETTINGS.language).toBe('vi');
      expect(DEFAULT_SETTINGS.theme).toBe('sepia');
      expect(DEFAULT_SETTINGS.brightness).toBe(100);
      expect(DEFAULT_SETTINGS.contrast).toBe(100);
      expect(DEFAULT_SETTINGS.pageSpread).toBe('double');
      expect(DEFAULT_SETTINGS.soundEnabled).toBe(true);
      expect(DEFAULT_SETTINGS.zoom).toBe(1.0);
      expect(DEFAULT_SETTINGS.pdfDisplayMode).toBe('book');
      expect(DEFAULT_SETTINGS.viewerMode).toBe('realistic');
      expect(DEFAULT_SETTINGS.typography.fontFamily).toBe('Merriweather');
      expect(DEFAULT_SETTINGS.typography.fontSize).toBe(18);
    });
  });

  describe('Sample Book Generation', () => {
    it('creates a complete sample book object', () => {
      const sample = storage.createSampleBook();
      expect(sample.id).toBe('sample-hoang-tu-be');
      expect(sample.title).toBe('Hoàng Tử Bé (Le Petit Prince)');
      expect(sample.author).toBe('Antoine de Saint-Exupéry');
      expect(sample.genre).toBe('Văn học & Tiểu thuyết');
      expect(sample.format).toBe('txt');
      expect(sample.totalPages).toBe(12);
      expect(sample.currentPage).toBe(1);
      expect(sample.bookmarks.length).toBeGreaterThan(0);
      expect(sample.bookmarks[0].page).toBe(1);
      expect(sample.readingTimeSeconds).toBe(120);
      expect(Array.isArray(sample.tags)).toBe(true);
    });

    it('creates a complete sample comic book object', () => {
      const comic = storage.createSampleComicBook();
      expect(comic.id).toBe('sample-comic-vu-tru');
      expect(comic.title).toBe('Hành Tinh Bí Ẩn (Tập 1)');
      expect(comic.author).toBe('RealBook Studio');
      expect(comic.genre).toBe('Truyện tranh & Manga');
      expect(comic.format).toBe('cbz');
      expect(comic.totalPages).toBe(6);
      expect(comic.currentPage).toBe(1);
      expect(comic.isComic).toBe(true);
      expect(comic.bookmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Settings CRUD', () => {
    it('returns default settings when none saved, guaranteeing pdfDisplayMode is "book"', async () => {
      const settings = await storage.getSettings();
      expect(settings.language).toBe('vi');
      expect(settings.pdfDisplayMode).toBe('book');
    });

    it('saves and retrieves updated settings', async () => {
      const updated: ReaderSettings = {
        ...DEFAULT_SETTINGS,
        language: 'en',
        theme: 'dark',
        brightness: 90,
        contrast: 110,
        zoom: 1.2,
      };

      await storage.saveSettings(updated);
      const retrieved = await storage.getSettings();
      expect(retrieved.language).toBe('en');
      expect(retrieved.theme).toBe('dark');
      expect(retrieved.brightness).toBe(90);
      expect(retrieved.contrast).toBe(110);
      expect(retrieved.zoom).toBe(1.2);
    });
  });

  describe('Book Metadata & Progress CRUD', () => {
    it('saves book metadata and retrieves it', async () => {
      const testBook: Book = {
        id: 'test-book-1',
        title: 'Truyện Kiều',
        author: 'Nguyễn Du',
        format: 'pdf',
        totalPages: 100,
        currentPage: 5,
        fileSize: 10240,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 50,
        genre: 'Thơ ca & Ca dao',
      };

      await storage.saveBookMeta(testBook);
      const books = await storage.getBooks();
      const found = books.find((b) => b.id === 'test-book-1');
      expect(found).toBeDefined();
      expect(found?.title).toBe('Truyện Kiều');
      expect(found?.genre).toBe('Thơ ca & Ca dao');
      expect(found?.currentPage).toBe(5);
    });

    it('updates reading progress and lastReadAt', async () => {
      const testBook: Book = {
        id: 'test-book-progress',
        title: 'Tắt Đèn',
        author: 'Ngô Tất Tố',
        format: 'txt',
        totalPages: 80,
        currentPage: 1,
        fileSize: 5000,
        addedAt: Date.now(),
        lastReadAt: Date.now() - 10000,
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 10,
      };

      await storage.saveBookMeta(testBook);
      const beforeUpdate = Date.now();
      await storage.updateProgress('test-book-progress', 42, 80);

      const books = await storage.getBooks();
      const updated = books.find((b) => b.id === 'test-book-progress');
      expect(updated?.currentPage).toBe(42);
      expect(updated?.totalPages).toBe(80);
      expect(updated?.lastReadAt).toBeGreaterThanOrEqual(beforeUpdate);
    });

    it('deletes a book', async () => {
      const testBook: Book = {
        id: 'book-to-delete',
        title: 'Temporary Book',
        author: 'Author',
        format: 'txt',
        totalPages: 10,
        currentPage: 1,
        fileSize: 100,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 0,
      };

      await storage.saveBookMeta(testBook);
      let books = await storage.getBooks();
      expect(books.some((b) => b.id === 'book-to-delete')).toBe(true);

      await storage.deleteBook('book-to-delete');
      books = await storage.getBooks();
      expect(books.some((b) => b.id === 'book-to-delete')).toBe(false);
    });
  });

  describe('Bookmarks & Highlights', () => {
    it('adds and removes bookmarks correctly', async () => {
      const testBook: Book = {
        id: 'book-bookmarks',
        title: 'Dế Mèn Phiêu Lưu Ký',
        author: 'Tô Hoài',
        format: 'pdf',
        totalPages: 50,
        currentPage: 1,
        fileSize: 12000,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 0,
      };

      await storage.saveBookMeta(testBook);

      const bm1: Bookmark = {
        id: 'bm-test-1',
        page: 15,
        label: 'Gặp Dế Trũi',
        createdAt: Date.now(),
      };

      const bm2: Bookmark = {
        id: 'bm-test-2',
        page: 30,
        label: 'Bài học đường đời đầu tiên',
        createdAt: Date.now(),
      };

      await storage.addBookmark('book-bookmarks', bm1);
      await storage.addBookmark('book-bookmarks', bm2);

      let books = await storage.getBooks();
      let book = books.find((b) => b.id === 'book-bookmarks');
      expect(book?.bookmarks.length).toBe(2);
      expect(book?.bookmarks.map((b) => b.id)).toContain('bm-test-1');
      expect(book?.bookmarks.map((b) => b.id)).toContain('bm-test-2');

      await storage.removeBookmark('book-bookmarks', 'bm-test-1');
      books = await storage.getBooks();
      book = books.find((b) => b.id === 'book-bookmarks');
      expect(book?.bookmarks.length).toBe(1);
      expect(book?.bookmarks[0].id).toBe('bm-test-2');
    });

    it('adds highlights correctly', async () => {
      const testBook: Book = {
        id: 'book-highlights',
        title: 'Số Đỏ',
        author: 'Vũ Trọng Phụng',
        format: 'txt',
        totalPages: 60,
        currentPage: 1,
        fileSize: 15000,
        addedAt: Date.now(),
        lastReadAt: Date.now(),
        bookmarks: [],
        highlights: [],
        readingTimeSeconds: 0,
      };

      await storage.saveBookMeta(testBook);

      const hl: Highlight = {
        id: 'hl-test-1',
        page: 10,
        text: 'Hạnh phúc của một tang gia',
        color: 'yellow',
        createdAt: Date.now(),
      };

      await storage.addHighlight('book-highlights', hl);

      const books = await storage.getBooks();
      const book = books.find((b) => b.id === 'book-highlights');
      expect(book?.highlights.length).toBe(1);
      expect(book?.highlights[0].text).toBe('Hạnh phúc của một tang gia');
      expect(book?.highlights[0].color).toBe('yellow');
    });
  });

  describe('File Binary Storage', () => {
    it('saves and retrieves text data as file binary', async () => {
      const bookId = 'binary-test-id';
      const content = 'Nội dung sách tiếng Việt có dấu: Hoàng Tử Bé, bông hoa hồng duy nhất.';

      await storage.saveBookData(bookId, content);
      const buffer = await storage.getBookFile(bookId);

      expect(buffer).not.toBeNull();
      const decoder = new TextDecoder('utf-8');
      const decoded = decoder.decode(buffer!);
      expect(decoded).toBe(content);
    });

    it('saves and retrieves raw ArrayBuffer', async () => {
      const bookId = 'raw-buffer-id';
      const rawBytes = new Uint8Array([1, 2, 3, 4, 5, 255]);
      await storage.saveBookFile(bookId, rawBytes.buffer as ArrayBuffer);

      const retrieved = await storage.getBookFile(bookId);
      expect(retrieved).not.toBeNull();
      const uint8 = new Uint8Array(retrieved!);
      expect(Array.from(uint8)).toEqual([1, 2, 3, 4, 5, 255]);
    });
  });
});
