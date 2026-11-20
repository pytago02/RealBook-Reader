import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FreeBooksApiService, type OnlineBook } from '../src/services/freeBooksApi';
import { storageService } from '../src/services/storage';

describe('FreeBooksApiService', () => {
  let api: FreeBooksApiService;

  beforeEach(() => {
    api = new FreeBooksApiService();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Deduplication & Caching', () => {
    it('caches subsequent identical queries and returns identical results without re-fetch', async () => {
      // Mock fetch
      const mockArchiveResponse = {
        response: {
          numFound: 1,
          start: 0,
          docs: [
            {
              identifier: 'truyen-kieu-1866',
              title: 'Kim Vân Kiều Truyện',
              creator: 'Nguyễn Du',
              year: 1866,
              downloads: 1250,
            },
          ],
        },
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockArchiveResponse,
      } as any);

      const res1 = await api.searchBooks('kiều', 'vietnamese', 1, 'vi', 'archive');
      expect(res1.books.length).toBe(1);
      expect(res1.books[0].title).toBe('Kim Vân Kiều Truyện');
      expect(res1.books[0].source).toBe('archive');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Second identical call should hit memory cache directly
      const res2 = await api.searchBooks('kiều', 'vietnamese', 1, 'vi', 'archive');
      expect(res2).toEqual(res1);
      expect(fetchSpy).toHaveBeenCalledTimes(1); // fetch not called again!
    });

    it('deduplicates books that have identical titles across sources', async () => {
      // Mock fetch returning same title from different calls
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
        const urlStr = String(url);
        if (urlStr.includes('archive.org')) {
          return {
            ok: true,
            json: async () => ({
              response: {
                numFound: 1,
                docs: [{ identifier: 'ia-prince', title: 'The Little Prince', creator: 'Antoine' }],
              },
            }),
          } as any;
        }
        if (urlStr.includes('gutendex.com')) {
          return {
            ok: true,
            json: async () => ({
              count: 1,
              results: [
                {
                  id: 9999,
                  title: 'the little prince  ', // same title with whitespace & casing
                  authors: [{ name: 'Antoine de Saint-Exupéry' }],
                  languages: ['en'],
                  formats: {},
                  subjects: ['Classic'],
                },
              ],
            }),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({ docs: [], numFound: 0 }),
        } as any;
      });

      const res = await api.searchBooks('prince', 'all', 1, 'en', 'all');
      // Should deduplicate 'The Little Prince' and 'the little prince  '
      expect(res.books.length).toBe(1);
      expect(res.books[0].title).toBe('The Little Prince');
    });
  });

  describe('Source Filtering', () => {
    it('queries Internet Archive exclusively when sourceFilter is "archive"', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
        expect(String(url)).toContain('archive.org/advancedsearch.php');
        return {
          ok: true,
          json: async () => ({ response: { numFound: 0, docs: [] } }),
        } as any;
      });

      await api.searchBooks('', 'philosophy', 1, 'vi', 'archive');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('queries Gutenberg exclusively when sourceFilter is "gutenberg"', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
        expect(String(url)).toContain('gutendex.com/books');
        return {
          ok: true,
          json: async () => ({ count: 0, results: [] }),
        } as any;
      });

      await api.searchBooks('', 'world_classics', 1, 'en', 'gutenberg');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('queries Open Library exclusively when sourceFilter is "openlibrary"', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
        expect(String(url)).toContain('openlibrary.org/search.json');
        return {
          ok: true,
          json: async () => ({ numFound: 0, docs: [] }),
        } as any;
      });

      await api.searchBooks('dostoevsky', 'recommended', 1, 'en', 'openlibrary');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Book Download and Conversion', () => {
    it('downloads and converts Gutenberg book, stripping header and footer disclaimers', async () => {
      const rawGutenbergText = `
The Project Gutenberg eBook of Alice in Wonderland
*** START OF THE PROJECT GUTENBERG EBOOK ALICE IN WONDERLAND ***

CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank,
and of having nothing to do.

*** END OF THE PROJECT GUTENBERG EBOOK ALICE IN WONDERLAND ***
End of text.
`;

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        text: async () => rawGutenbergText,
      } as any);

      const onlineBook: OnlineBook = {
        id: 'gutenberg-11',
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        language: 'en',
        source: 'gutenberg',
        downloadUrl: 'https://gutenberg.org/files/11/11-0.txt',
        subjects: ['Children', 'Fantasy', 'Literature'],
      };

      const result = await api.downloadAndImportBook(onlineBook);

      expect(result.book).toBeDefined();
      expect(result.book.id).toContain('downloaded-gutenberg-11');
      expect(result.book.title).toBe("Alice's Adventures in Wonderland");
      expect(result.book.author).toBe('Lewis Carroll');
      expect(result.book.format).toBe('txt');
      expect(result.pages.length).toBeGreaterThan(0);

      // Verify disclaimers stripped
      const fullText = result.pages.join(' ');
      expect(fullText).not.toContain('*** START OF THE PROJECT GUTENBERG');
      expect(fullText).not.toContain('*** END OF THE PROJECT GUTENBERG');
      expect(fullText).toContain('Down the Rabbit-Hole');

      // Verify book was saved to storageService
      const savedBooks = await storageService.getBooks();
      const found = savedBooks.find((b) => b.id === result.book.id);
      expect(found).toBeDefined();
    });

    it('falls back to book metadata summary when network fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const onlineBook: OnlineBook = {
        id: 'offline-book-id',
        title: 'Bí Mật Của Nước',
        author: 'Masaru Emoto',
        language: 'vi',
        source: 'archive',
        description: 'Tác phẩm nghiên cứu về tinh thể nước và năng lượng ý niệm.',
      };

      const result = await api.downloadAndImportBook(onlineBook);
      expect(result.book).toBeDefined();
      expect(result.pages.length).toBeGreaterThan(0);
      expect(result.pages[0]).toContain('Bí Mật Của Nước');
      expect(result.pages[0]).toContain('Masaru Emoto');
      expect(result.pages[0]).toContain('Tác phẩm nghiên cứu về tinh thể nước');
    });

    it('downloads and imports a comic book into CBZ format with comic pages', async () => {
      const comicOnlineBook: OnlineBook = {
        id: 'online-comic-doraemon',
        title: 'Doraemon Truyện Tranh Màu',
        author: 'Fujiko F. Fujio',
        language: 'vi',
        genre: 'Truyện tranh & Manga',
        format: 'cbz',
        isComic: true,
        source: 'curated',
        comicPages: [
          '<svg><text>Trang 1: Bìa</text></svg>',
          '<svg><text>Trang 2: Nobita gặp Doraemon</text></svg>',
        ],
      };

      const result = await api.downloadAndImportBook(comicOnlineBook);
      expect(result.book.format).toBe('cbz');
      expect(result.book.isComic).toBe(true);
      expect(result.book.genre).toBe('Truyện tranh & Manga');
      expect(result.pages.length).toBe(2);
      expect(result.pages[0]).toContain('Trang 1: Bìa');
    });

    it('searches comics category and prepends curated comic collection', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          response: {
            numFound: 1,
            start: 0,
            docs: [
              {
                identifier: 'flash-gordon-comic',
                title: 'Flash Gordon Comic',
                creator: 'Alex Raymond',
                year: 1934,
                downloads: 4500,
              },
            ],
          },
        }),
      } as any);

      const res = await api.searchBooks('', 'comic', 1, 'vi', 'all');
      expect(res.books.length).toBeGreaterThan(0);
      const hasCuratedComic = res.books.some((b) => b.genre === 'Truyện tranh & Manga' && b.isComic);
      expect(hasCuratedComic).toBe(true);
    });
  });
});
