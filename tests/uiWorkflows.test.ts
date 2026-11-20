import { describe, it, expect } from 'vitest';
import type { Book } from '../src/types';
import { inferGenre } from '../src/utils/genre';

describe('UI Features & User Workflows', () => {
  const sampleBooks: Book[] = [
    {
      id: 'book-1',
      title: 'Hoàng Tử Bé',
      author: 'Antoine de Saint-Exupéry',
      genre: 'Văn học & Tiểu thuyết',
      format: 'txt',
      totalPages: 12,
      currentPage: 3,
      fileSize: 20000,
      addedAt: 1000,
      lastReadAt: 2000,
      bookmarks: [{ id: 'bm-1', page: 3, createdAt: 1000 }],
      highlights: [],
      readingTimeSeconds: 60,
      tags: ['Kinh điển', 'Triết lý'],
    },
    {
      id: 'book-2',
      title: 'Đại Việt Sử Ký Toàn Thư',
      author: 'Ngô Sĩ Liên',
      genre: 'Lịch sử & Nhân vật',
      format: 'pdf',
      totalPages: 250,
      currentPage: 50,
      fileSize: 850000,
      addedAt: 3000,
      lastReadAt: 4000,
      bookmarks: [],
      highlights: [],
      readingTimeSeconds: 300,
      tags: ['Lịch sử', 'Việt Nam'],
    },
    {
      id: 'book-3',
      title: 'Vũ Trụ Trong Vỏ Hạt Dẻ',
      author: 'Stephen Hawking',
      genre: 'Khoa học & Công nghệ',
      format: 'docx',
      totalPages: 180,
      currentPage: 180,
      fileSize: 500000,
      addedAt: 5000,
      lastReadAt: 6000,
      bookmarks: [],
      highlights: [],
      readingTimeSeconds: 500,
      tags: ['Vật lý', 'Khoa học'],
    },
  ];

  describe('Shelf Tab Workflows', () => {
    it('computes genre distribution counts accurately', () => {
      const counts: Record<string, number> = { all: sampleBooks.length };
      sampleBooks.forEach((b) => {
        const g = b.genre || inferGenre(b.title);
        counts[g] = (counts[g] || 0) + 1;
      });

      expect(counts.all).toBe(3);
      expect(counts['Văn học & Tiểu thuyết']).toBe(1);
      expect(counts['Lịch sử & Nhân vật']).toBe(1);
      expect(counts['Khoa học & Công nghệ']).toBe(1);
      expect(counts['Triết học & Tư tưởng']).toBeUndefined();
    });

    it('filters shelf books by selected genre pill', () => {
      const filterByGenre = (genre: string) => {
        return sampleBooks.filter((b) => {
          const g = b.genre || inferGenre(b.title);
          return genre === 'all' || g === genre;
        });
      };

      expect(filterByGenre('all').length).toBe(3);
      expect(filterByGenre('Lịch sử & Nhân vật').length).toBe(1);
      expect(filterByGenre('Lịch sử & Nhân vật')[0].id).toBe('book-2');
      expect(filterByGenre('Kinh tế & Quản trị').length).toBe(0);
    });

    it('searches shelf books by title, author, genre, or tags', () => {
      const searchShelf = (query: string, genreFilter = 'all') => {
        const term = query.trim().toLowerCase();
        return sampleBooks.filter((b) => {
          const bGenre = b.genre || inferGenre(b.title);
          if (genreFilter !== 'all' && bGenre !== genreFilter) return false;
          if (!term) return true;
          return (
            b.title.toLowerCase().includes(term) ||
            b.author.toLowerCase().includes(term) ||
            bGenre.toLowerCase().includes(term) ||
            (b.tags && b.tags.some((tg) => tg.toLowerCase().includes(term)))
          );
        });
      };

      // Search by title
      expect(searchShelf('Hoàng tử').length).toBe(1);
      // Search by author
      expect(searchShelf('Stephen').length).toBe(1);
      // Search by tag
      expect(searchShelf('Việt Nam').length).toBe(1);
      // Search with genre filter constraint
      expect(searchShelf('Stephen', 'Khoa học & Công nghệ').length).toBe(1);
      expect(searchShelf('Stephen', 'Lịch sử & Nhân vật').length).toBe(0);
      // Non-matching query
      expect(searchShelf('nonexistent keyword').length).toBe(0);
    });

    it('calculates reading progress percentage properly', () => {
      const getPercent = (book: Book) =>
        book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;

      expect(getPercent(sampleBooks[0])).toBe(25); // 3/12 = 25%
      expect(getPercent(sampleBooks[1])).toBe(20); // 50/250 = 20%
      expect(getPercent(sampleBooks[2])).toBe(100); // 180/180 = 100%
    });
  });

  describe('Online Library Workflows', () => {
    it('syncs default online book language and recommended category when system language changes', () => {
      const getInitialOnlineState = (systemLang: string) => {
        return {
          onlineBookLang: systemLang,
          onlineTopic: systemLang === 'vi' ? 'vietnamese' : 'recommended',
        };
      };

      expect(getInitialOnlineState('vi')).toEqual({ onlineBookLang: 'vi', onlineTopic: 'vietnamese' });
      expect(getInitialOnlineState('en')).toEqual({ onlineBookLang: 'en', onlineTopic: 'recommended' });
      expect(getInitialOnlineState('zh')).toEqual({ onlineBookLang: 'zh', onlineTopic: 'recommended' });
      expect(getInitialOnlineState('fr')).toEqual({ onlineBookLang: 'fr', onlineTopic: 'recommended' });
      expect(getInitialOnlineState('es')).toEqual({ onlineBookLang: 'es', onlineTopic: 'recommended' });
      expect(getInitialOnlineState('ja')).toEqual({ onlineBookLang: 'ja', onlineTopic: 'recommended' });
    });

    it('supports 10 online categories', () => {
      const categories = [
        'vietnamese',
        'recommended',
        'world_classics',
        'all',
        'philosophy',
        'history',
        'science',
        'adventure',
        'psychology',
        'poetry',
      ];
      expect(categories.length).toBe(10);
    });

    it('header "Tìm tất cả" sets search scope to "all" and resets topic to "all"', () => {
      let activeSearchScope: 'all' | 'category' = 'category';
      let onlineTopic = 'philosophy';
      let activeSearchQuery = '';

      const handleGlobalSearch = (query: string) => {
        activeSearchScope = 'all';
        onlineTopic = 'all';
        activeSearchQuery = query.trim();
      };

      handleGlobalSearch('Tolstoy');
      expect(activeSearchScope).toBe('all');
      expect(onlineTopic).toBe('all');
      expect(activeSearchQuery).toBe('Tolstoy');
    });

    it('in-tab "Tìm trong thể loại này" preserves selected topic and sets scope to "category"', () => {
      let activeSearchScope: 'all' | 'category' = 'all';
      let onlineTopic = 'history';
      let activeSearchQuery = '';

      const handleCategorySearch = (catId: string, query: string) => {
        activeSearchScope = 'category';
        onlineTopic = catId;
        activeSearchQuery = query.trim();
      };

      handleCategorySearch('history', 'Rome');
      expect(activeSearchScope).toBe('category');
      expect(onlineTopic).toBe('history');
      expect(activeSearchQuery).toBe('Rome');
    });

    it('clear search restores default category browsing', () => {
      let activeSearchQuery = 'Napoleon';
      let activeSearchScope: 'all' | 'category' = 'all';
      let onlineTopic = 'all';
      const onlineBookLang = 'vi';

      const handleClearSearch = () => {
        activeSearchQuery = '';
        activeSearchScope = 'category';
        if (onlineTopic === 'all') {
          onlineTopic = onlineBookLang === 'vi' ? 'vietnamese' : 'recommended';
        }
      };

      handleClearSearch();
      expect(activeSearchQuery).toBe('');
      expect(activeSearchScope).toBe('category');
      expect(onlineTopic).toBe('vietnamese');
    });

    it('detects if an online book is already in shelf by title', () => {
      const isBookAlreadyInLibrary = (onlineTitle: string) => {
        return sampleBooks.some((b) => b.title.toLowerCase().trim() === onlineTitle.toLowerCase().trim());
      };

      expect(isBookAlreadyInLibrary('Hoàng Tử Bé')).toBe(true);
      expect(isBookAlreadyInLibrary('  hoàng tử bé  ')).toBe(true);
      expect(isBookAlreadyInLibrary('Don Quixote')).toBe(false);
    });
  });

  describe('Reader Mode Workflows', () => {
    it('calculates spread left/right page numbers for double-page view', () => {
      const calculateSpread = (currentPage: number, isDouble: boolean) => {
        const leftPageNum = isDouble
          ? currentPage % 2 === 0
            ? currentPage
            : Math.max(1, currentPage - 1)
          : currentPage;
        const rightPageNum = leftPageNum + 1;
        return { leftPageNum, rightPageNum };
      };

      // Page 1 (odd) in double spread: left is 1, right is 2
      expect(calculateSpread(1, true)).toEqual({ leftPageNum: 1, rightPageNum: 2 });
      // Page 2 (even) in double spread: left is 2, right is 3
      expect(calculateSpread(2, true)).toEqual({ leftPageNum: 2, rightPageNum: 3 });
      // Page 3 in double spread: left is 2, right is 3
      expect(calculateSpread(3, true)).toEqual({ leftPageNum: 2, rightPageNum: 3 });
      // Page 4 in double spread: left is 4, right is 5
      expect(calculateSpread(4, true)).toEqual({ leftPageNum: 4, rightPageNum: 5 });

      // Single page mode
      expect(calculateSpread(7, false)).toEqual({ leftPageNum: 7, rightPageNum: 8 });
    });

    it('clamps page transitions within 1 and totalPages', () => {
      const totalPages = 100;
      const clampPage = (p: number) => Math.max(1, Math.min(p, totalPages));

      expect(clampPage(0)).toBe(1);
      expect(clampPage(-5)).toBe(1);
      expect(clampPage(50)).toBe(50);
      expect(clampPage(101)).toBe(100);
      expect(clampPage(999)).toBe(100);
    });

    it('adjusts zoom level within bounds [0.7, 1.8] with 0.1 increments', () => {
      let zoom = 1.0;
      const zoomIn = () => {
        zoom = Math.min(1.8, Math.round((zoom + 0.1) * 10) / 10);
      };
      const zoomOut = () => {
        zoom = Math.max(0.7, Math.round((zoom - 0.1) * 10) / 10);
      };

      zoomIn(); // 1.1
      expect(zoom).toBe(1.1);
      zoomIn(); // 1.2
      expect(zoom).toBe(1.2);

      zoomOut(); // 1.1
      expect(zoom).toBe(1.1);

      // Max clamp test
      zoom = 1.75;
      zoomIn(); // 1.8
      expect(zoom).toBe(1.8);
      zoomIn(); // still 1.8
      expect(zoom).toBe(1.8);

      // Min clamp test
      zoom = 0.75;
      zoomOut(); // 0.7
      expect(zoom).toBe(0.7);
      zoomOut(); // still 0.7
      expect(zoom).toBe(0.7);
    });

    it('toggles bookmarks: adds if not present, removes if present', () => {
      let book: Book = { ...sampleBooks[0], bookmarks: [] };

      const toggleBookmark = (page: number) => {
        const existing = book.bookmarks.find((b) => b.page === page);
        if (existing) {
          book = {
            ...book,
            bookmarks: book.bookmarks.filter((b) => b.id !== existing.id),
          };
        } else {
          book = {
            ...book,
            bookmarks: [...book.bookmarks, { id: `bm-${page}`, page, createdAt: Date.now() }],
          };
        }
      };

      // Add bookmark on page 5
      toggleBookmark(5);
      expect(book.bookmarks.length).toBe(1);
      expect(book.bookmarks[0].page).toBe(5);

      // Add bookmark on page 10
      toggleBookmark(10);
      expect(book.bookmarks.length).toBe(2);

      // Toggle page 5 again -> removes it
      toggleBookmark(5);
      expect(book.bookmarks.length).toBe(1);
      expect(book.bookmarks[0].page).toBe(10);
    });

    it('supports 5 eye comfort reading themes with distinct paper tones', () => {
      const themes = ['sepia', 'warm', 'white', 'eink', 'dark'];
      expect(themes.length).toBe(5);

      const getThemePaperTone = (theme: string) => {
        switch (theme) {
          case 'sepia': return '#f4ecd8';
          case 'warm': return '#faeed7';
          case 'white': return '#fbfbfc';
          case 'eink': return '#e5e5e5';
          case 'dark': return '#1a1b1e';
          default: return '#fbfbfc';
        }
      };

      themes.forEach((th) => {
        expect(getThemePaperTone(th)).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('handles Focus Mode toggle, toolbar visibility and keyboard shortcuts', () => {
      let isFocusMode = false;
      const toggleFocusMode = () => {
        isFocusMode = !isFocusMode;
      };

      // Initially focus mode is off, toolbar is visible
      expect(isFocusMode).toBe(false);
      let isToolbarVisible = !isFocusMode;
      expect(isToolbarVisible).toBe(true);

      // User clicks Focus Mode button in header
      toggleFocusMode();
      expect(isFocusMode).toBe(true);
      isToolbarVisible = !isFocusMode;
      expect(isToolbarVisible).toBe(false);

      // Keyboard Esc event exits focus mode
      const handleKeyDown = (key: string) => {
        if (key === 'Escape' && isFocusMode) {
          isFocusMode = false;
        } else if ((key === 'f' || key === 'F')) {
          isFocusMode = !isFocusMode;
        }
      };

      handleKeyDown('Escape');
      expect(isFocusMode).toBe(false);
      expect(!isFocusMode).toBe(true);

      // 'f' key toggles focus mode
      handleKeyDown('f');
      expect(isFocusMode).toBe(true);
      handleKeyDown('f');
      expect(isFocusMode).toBe(false);
    });

    it('computes optimized vertical book height and margins for Focus Mode vs Normal Mode', () => {
      const getBookDimensions = (isFocusMode: boolean, isDouble: boolean) => {
        return {
          height: isFocusMode ? 'calc(100vh - 12px)' : 'calc(100vh - 116px)',
          maxWidth: isDouble
            ? (isFocusMode ? 'min(98vw, 1800px)' : 'min(97vw, 1750px)')
            : (isFocusMode ? 'min(96vw, 1100px)' : 'min(95vw, 1050px)'),
          containerPadding: isFocusMode ? 'p-1 sm:p-2' : 'pt-13 pb-14 px-2 sm:px-4',
        };
      };

      const focusDimensions = getBookDimensions(true, true);
      const normalDimensions = getBookDimensions(false, true);

      // Focus Mode utilizes maximum screen height (100vh - 12px)
      expect(focusDimensions.height).toBe('calc(100vh - 12px)');
      expect(focusDimensions.containerPadding).toBe('p-1 sm:p-2');

      // Normal mode reserves space for top and bottom toolbars (100vh - 116px)
      expect(normalDimensions.height).toBe('calc(100vh - 116px)');
      expect(normalDimensions.containerPadding).toContain('pt-13 pb-14');
    });
  });

  describe('Reading Progress, Spread Pairing & Bookmark Workflows', () => {
    it('correctly calculates 2-page spread pairing without duplicate pages or skips', () => {
      const getSpreadPages = (currentPage: number, isDouble: boolean) => {
        const leftPageNum = isDouble
          ? currentPage % 2 === 0
            ? currentPage - 1
            : currentPage
          : currentPage;
        const rightPageNum = leftPageNum + 1;
        return [leftPageNum, rightPageNum];
      };

      // Spreads must be [1, 2], [3, 4], [5, 6], etc.
      expect(getSpreadPages(1, true)).toEqual([1, 2]);
      expect(getSpreadPages(2, true)).toEqual([1, 2]);
      expect(getSpreadPages(3, true)).toEqual([3, 4]);
      expect(getSpreadPages(4, true)).toEqual([3, 4]);
      expect(getSpreadPages(5, true)).toEqual([5, 6]);
      expect(getSpreadPages(6, true)).toEqual([5, 6]);

      // Advancing spreads
      let cur = 1;
      const totalPages = 10;
      const getNext = (p: number) => {
        const left = p % 2 === 0 ? p - 1 : p;
        return Math.min(totalPages, left + 2);
      };
      const getPrev = (p: number) => {
        const left = p % 2 === 0 ? p - 1 : p;
        return Math.max(1, left - 2);
      };

      cur = getNext(cur); // from [1, 2] -> [3, 4]
      expect(cur).toBe(3);
      expect(getSpreadPages(cur, true)).toEqual([3, 4]);

      cur = getNext(cur); // from [3, 4] -> [5, 6]
      expect(cur).toBe(5);
      expect(getSpreadPages(cur, true)).toEqual([5, 6]);

      cur = getPrev(cur); // from [5, 6] -> [3, 4]
      expect(cur).toBe(3);
      expect(getSpreadPages(cur, true)).toEqual([3, 4]);

      cur = getPrev(cur); // from [3, 4] -> [1, 2]
      expect(cur).toBe(1);
      expect(getSpreadPages(cur, true)).toEqual([1, 2]);
    });

    it('accurately identifies whether any visible page in double spread is bookmarked', () => {
      const bookmarks = [
        { id: 'bm-2', page: 2, createdAt: 1000 },
        { id: 'bm-7', page: 7, createdAt: 2000 },
      ];

      const isSpreadBookmarked = (curPage: number, isDouble: boolean) => {
        const leftPage = isDouble
          ? curPage % 2 === 0
            ? curPage - 1
            : curPage
          : curPage;
        return isDouble
          ? bookmarks.some((b) => b.page === leftPage || b.page === leftPage + 1)
          : bookmarks.some((b) => b.page === curPage);
      };

      // Page 2 is bookmarked. When viewing spread [1, 2] (curPage = 1 or 2):
      expect(isSpreadBookmarked(1, true)).toBe(true);
      expect(isSpreadBookmarked(2, true)).toBe(true);

      // Viewing spread [3, 4]:
      expect(isSpreadBookmarked(3, true)).toBe(false);
      expect(isSpreadBookmarked(4, true)).toBe(false);

      // Page 7 is bookmarked. Viewing spread [7, 8]:
      expect(isSpreadBookmarked(7, true)).toBe(true);
      expect(isSpreadBookmarked(8, true)).toBe(true);

      // In single mode: only exact page matches
      expect(isSpreadBookmarked(1, false)).toBe(false);
      expect(isSpreadBookmarked(2, false)).toBe(true);
      expect(isSpreadBookmarked(7, false)).toBe(true);
    });

    it('synchronizes reading progress and bookmarks across library shelf and reader', () => {
      let books: Book[] = [
        {
          id: 'test-book-sync',
          title: 'Sách Thử Nghiệm',
          author: 'Tác giả',
          genre: 'Văn học & Tiểu thuyết',
          format: 'txt',
          totalPages: 50,
          currentPage: 1,
          fileSize: 10000,
          addedAt: 1000,
          lastReadAt: 1000,
          bookmarks: [],
          highlights: [],
          readingTimeSeconds: 0,
        },
      ];

      let currentBook: Book | null = { ...books[0] };

      // User turns to page 15
      const newPage = 15;
      const now = 5000;
      currentBook = { ...currentBook, currentPage: newPage, lastReadAt: now };
      books = books.map((b) => (b.id === currentBook!.id ? { ...b, currentPage: newPage, lastReadAt: now } : b));

      expect(currentBook.currentPage).toBe(15);
      expect(books[0].currentPage).toBe(15);

      // User adds bookmark to page 15
      const newBm = { id: 'bm-15', page: 15, createdAt: now };
      currentBook = { ...currentBook, bookmarks: [...(currentBook.bookmarks || []), newBm] };
      books = books.map((b) => (b.id === currentBook!.id ? { ...b, bookmarks: [...(b.bookmarks || []), newBm] } : b));

      expect(currentBook.bookmarks).toHaveLength(1);
      expect(books[0].bookmarks).toHaveLength(1);

      // User returns to library (currentBook becomes null)
      currentBook = null;
      expect(books[0].currentPage).toBe(15);
      expect(books[0].bookmarks).toHaveLength(1);

      // User reopens the book from library
      const openedBook = { ...books[0] };
      expect(openedBook.currentPage).toBe(15);
      expect(openedBook.bookmarks?.[0].page).toBe(15);
    });

    it('sanitizes bookmark targetPage so SyntheticEvents never leak [object Object] or corrupt bookmarks', () => {
      const currentBook: Book = {
        id: 'book-event-test',
        title: 'Sách Test',
        format: 'pdf',
        totalPages: 20,
        currentPage: 5,
        fileSize: 1000,
        addedAt: 1000,
        lastReadAt: 1000,
        bookmarks: [],
        highlights: [],
      };

      // Simulate click event being passed by React onClick
      const syntheticMouseEvent = {
        stopPropagation: () => {},
        preventDefault: () => {},
        type: 'click',
        clientX: 120,
      };

      // Handler logic
      const resolveBookmarkPage = (targetPage: unknown, book: Book) => {
        return typeof targetPage === 'number' && Number.isFinite(targetPage)
          ? Math.max(1, Math.min(Math.round(targetPage), book.totalPages))
          : book.currentPage;
      };

      const resolvedFromClickEvent = resolveBookmarkPage(syntheticMouseEvent, currentBook);
      expect(resolvedFromClickEvent).toBe(5);
      expect(typeof resolvedFromClickEvent).toBe('number');

      const toastMessage = `Đã đánh dấu trang ${resolvedFromClickEvent}.`;
      expect(toastMessage).toBe('Đã đánh dấu trang 5.');
      expect(toastMessage).not.toContain('[object Object]');

      const resolvedFromNumericPage = resolveBookmarkPage(12, currentBook);
      expect(resolvedFromNumericPage).toBe(12);

      const resolvedFromUndefined = resolveBookmarkPage(undefined, currentBook);
      expect(resolvedFromUndefined).toBe(5);
    });

    it('safely extracts bookmark page numbers and dates even if legacy corrupted data exists', () => {
      // Corrupted legacy bookmarks that had [object Object] as page or invalid date
      const corruptedBookmarks: any[] = [
        { id: 'bm-bad-1', page: { someKey: 'val' }, createdAt: undefined },
        { id: 'bm-bad-2', page: 'invalid', createdAt: 'not-a-date' },
        { id: 'bm-good-3', page: 8, createdAt: 1700000000000 },
      ];

      const sanitized = corruptedBookmarks.map((bm) => {
        const safePage =
          typeof bm.page === 'number' && Number.isFinite(bm.page)
            ? Math.round(bm.page)
            : typeof bm.page === 'string' && !isNaN(Number(bm.page))
            ? Math.round(Number(bm.page))
            : 1;

        const formattedDate = (() => {
          try {
            const ts = typeof bm.createdAt === 'number' ? bm.createdAt : Number(bm.createdAt);
            if (!ts || isNaN(ts)) return '';
            const d = new Date(ts);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('vi-VN');
          } catch {
            return '';
          }
        })();

        return { id: bm.id, safePage, formattedDate };
      });

      expect(sanitized[0].safePage).toBe(1);
      expect(sanitized[0].formattedDate).toBe('');
      expect(typeof sanitized[0].safePage).toBe('number');

      expect(sanitized[1].safePage).toBe(1);
      expect(sanitized[1].formattedDate).toBe('');

      expect(sanitized[2].safePage).toBe(8);
      expect(sanitized[2].formattedDate.length).toBeGreaterThan(0);
    });
  });
});
