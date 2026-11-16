import type { Book } from '../types';
import { txtParser } from './parsers/txtParser';
import { storageService } from './storage';
import { CURATED_VIETNAMESE_BOOKS } from './curatedVietnameseBooks';
import { inferGenre } from '../utils/genre';

export { CURATED_VIETNAMESE_BOOKS };

export interface OnlineBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  language: string;
  downloadCount?: number;
  subjects?: string[];
  description?: string;
  source: 'archive' | 'gutenberg' | 'openlibrary';
  downloadUrl?: string;
  archiveId?: string;
  year?: number | string;
  genre?: string;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  translators?: { name: string }[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

export interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string | string[];
  description?: string | string[];
  year?: number | string;
  downloads?: number;
  mediatype?: string;
}

export interface ArchiveResponse {
  response: {
    numFound: number;
    start: number;
    docs: ArchiveDoc[];
  };
}

export class FreeBooksApiService {
  private cache = new Map<string, { books: OnlineBook[]; total: number; hasMore: boolean }>();

  /**
   * Search books dynamically across multiple online open APIs:
   * - Internet Archive Texts API (12,193+ Vietnamese books, millions worldwide)
   * - Project Gutenberg / Gutendex API (70,000+ public domain international books)
   * - Open Library API (global catalog)
   */
  async searchBooks(
    query = '',
    topic = 'recommended',
    page = 1,
    bookLanguage = 'vi',
    sourceFilter: 'all' | 'archive' | 'gutenberg' | 'openlibrary' = 'all'
  ): Promise<{ books: OnlineBook[]; total: number; hasMore: boolean }> {
    const cleanQuery = query.trim();
    const cacheKey = `${cleanQuery}_${topic}_${page}_${bookLanguage}_${sourceFilter}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const bookList: OnlineBook[] = [];
      let totalCount = 0;
      let hasMoreResults = false;

      // 1. SPECIFIC SOURCE SEARCH: User chose a specific repository filter
      if (sourceFilter === 'archive') {
        const iaResult = await this.fetchFromInternetArchive(cleanQuery, topic, page, bookLanguage);
        bookList.push(...iaResult.books);
        totalCount = iaResult.total;
        hasMoreResults = iaResult.hasMore;
      } else if (sourceFilter === 'gutenberg') {
        const gutenbergResult = await this.fetchFromGutenberg(cleanQuery, topic, page, bookLanguage);
        bookList.push(...gutenbergResult.books);
        totalCount = gutenbergResult.total;
        hasMoreResults = gutenbergResult.hasMore;
      } else if (sourceFilter === 'openlibrary') {
        const openLibResult = await this.fetchFromOpenLibrary(cleanQuery, page, bookLanguage, topic);
        bookList.push(...openLibResult.books);
        totalCount = openLibResult.total;
        hasMoreResults = openLibResult.hasMore;
      } else {
        // 2. GENERAL SEARCH (sourceFilter === 'all'):
        // When searching with keywords, query ALL 3 REPOSITORIES SIMULTANEOUSLY in parallel!
        if (cleanQuery) {
          const [iaRes, gutenbergRes, openLibRes] = await Promise.allSettled([
            this.fetchFromInternetArchive(cleanQuery, topic, page, bookLanguage),
            this.fetchFromGutenberg(cleanQuery, topic, page, bookLanguage),
            this.fetchFromOpenLibrary(cleanQuery, page, bookLanguage, topic),
          ]);

          if (iaRes.status === 'fulfilled') {
            bookList.push(...iaRes.value.books);
            totalCount += iaRes.value.total;
            hasMoreResults = hasMoreResults || iaRes.value.hasMore;
          } else {
            console.warn('Internet Archive search skipped:', iaRes.reason);
          }

          if (gutenbergRes.status === 'fulfilled') {
            bookList.push(...gutenbergRes.value.books);
            totalCount += gutenbergRes.value.total;
            hasMoreResults = hasMoreResults || gutenbergRes.value.hasMore;
          } else {
            console.warn('Project Gutenberg search skipped:', gutenbergRes.reason);
          }

          if (openLibRes.status === 'fulfilled') {
            bookList.push(...openLibRes.value.books);
            totalCount += openLibRes.value.total;
            hasMoreResults = hasMoreResults || openLibRes.value.hasMore;
          } else {
            console.warn('Open Library search skipped:', openLibRes.reason);
          }
        } else {
          // Browsing mode without search query
          if (bookLanguage === 'vi') {
            // Vietnamese browsing prioritizes Internet Archive's massive 12,000+ VN books collection
            const iaResult = await this.fetchFromInternetArchive(cleanQuery, topic, page, bookLanguage);
            bookList.push(...iaResult.books);
            totalCount += iaResult.total;
            hasMoreResults = hasMoreResults || iaResult.hasMore;
          } else if (bookLanguage === 'all') {
            // All languages: query both IA and Gutenberg in parallel
            const [iaRes, gutenbergRes] = await Promise.allSettled([
              this.fetchFromInternetArchive(cleanQuery, topic, page, bookLanguage),
              this.fetchFromGutenberg(cleanQuery, topic, page, bookLanguage),
            ]);
            if (iaRes.status === 'fulfilled') {
              bookList.push(...iaRes.value.books);
              totalCount += iaRes.value.total;
              hasMoreResults = hasMoreResults || iaRes.value.hasMore;
            }
            if (gutenbergRes.status === 'fulfilled') {
              bookList.push(...gutenbergRes.value.books);
              totalCount += gutenbergRes.value.total;
              hasMoreResults = hasMoreResults || gutenbergRes.value.hasMore;
            }
          } else {
            // Specific international language: query Gutenberg and Open Library
            const [gutenbergRes, openLibRes] = await Promise.allSettled([
              this.fetchFromGutenberg(cleanQuery, topic, page, bookLanguage),
              this.fetchFromOpenLibrary(cleanQuery, page, bookLanguage, topic),
            ]);
            if (gutenbergRes.status === 'fulfilled') {
              bookList.push(...gutenbergRes.value.books);
              totalCount += gutenbergRes.value.total;
              hasMoreResults = hasMoreResults || gutenbergRes.value.hasMore;
            }
            if (openLibRes.status === 'fulfilled') {
              bookList.push(...openLibRes.value.books);
              totalCount += openLibRes.value.total;
              hasMoreResults = hasMoreResults || openLibRes.value.hasMore;
            }
          }
        }
      }

      // Deduplicate books by id or trimmed lowercase title
      const seenTitles = new Set<string>();
      const deduplicated: OnlineBook[] = [];
      for (const b of bookList) {
        const key = b.title.trim().toLowerCase();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          deduplicated.push(b);
        }
      }

      const result = {
        books: deduplicated,
        total: Math.max(totalCount, deduplicated.length),
        hasMore: hasMoreResults,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('Dynamic online books API fetch failed:', err);
      return { books: [], total: 0, hasMore: false };
    }
  }

  /**
   * Fetch dynamically from Internet Archive Texts API (archive.org)
   * Connects to over 12,193+ Vietnamese books and millions of world texts
   */
  private async fetchFromInternetArchive(
    query: string,
    topic: string,
    page: number,
    bookLanguage: string
  ): Promise<{ books: OnlineBook[]; total: number; hasMore: boolean }> {
    try {
      // Map ISO language code to Internet Archive language query
    let langQuery = 'language:vie';
    if (bookLanguage === 'en') langQuery = 'language:eng';
    else if (bookLanguage === 'zh') langQuery = '(language:chi OR language:zho)';
    else if (bookLanguage === 'fr') langQuery = '(language:fra OR language:fre)';
    else if (bookLanguage === 'es') langQuery = 'language:spa';
    else if (bookLanguage === 'ja') langQuery = 'language:jpn';
    else if (bookLanguage === 'all') langQuery = '';

    let topicConstraint = '';
    if (bookLanguage === 'vi' || bookLanguage === 'all') {
      switch (topic) {
        case 'vietnamese':
          topicConstraint =
            '(title:("văn học" OR "tiểu thuyết" OR "truyện ngắn" OR "truyện kiều" OR "tác phẩm" OR "truyện cổ tích" OR "văn học việt nam" OR "tuyển tập văn") OR subject:("văn học" OR "tiểu thuyết")) AND NOT title:("hesman")';
          break;
        case 'world_classics':
          topicConstraint =
            '(title:("kinh điển" OR "thần khúc" OR "sherlock holmes" OR "đôn ki hô tê" OR "tam quốc" OR "những người khốn khổ" OR "dante" OR "shakespeare" OR "homer" OR "tây du ký" OR "thủy hử") OR description:("dịch" AND "kinh điển"))';
          break;
        case 'philosophy':
          topicConstraint =
            '(title:("triết học" OR "tư tưởng" OR "triết lý" OR "đạo đức" OR "nhân sinh" OR "luận đề") OR subject:("triết học" OR "philosophy"))';
          break;
        case 'history':
          topicConstraint =
            '(title:("lịch sử" OR "sử ký" OR "đại việt" OR "lịch sử việt nam" OR "sử học" OR "danh nhân" OR "khảo cổ") OR subject:("lịch sử" OR "history"))';
          break;
        case 'science':
          topicConstraint =
            '(title:("khoa học" OR "vật lý" OR "vật lí" OR "toán học" OR "hóa học" OR "thiên văn" OR "vũ trụ" OR "sinh học" OR "công nghệ") OR subject:("khoa học" OR "science"))';
          break;
        case 'adventure':
          topicConstraint =
            '(title:("phiêu lưu" OR "trinh thám" OR "thám tử" OR "kiếm hiệp" OR "vụ án" OR "ly kỳ") OR subject:("trinh thám" OR "phiêu lưu" OR "adventure"))';
          break;
        case 'psychology':
          topicConstraint =
            '(title:("tâm lý" OR "kỹ năng" OR "giao tiếp" OR "tự học" OR "tư duy" OR "phát triển bản thân" OR "tâm lý học") OR subject:("tâm lý" OR "psychology"))';
          break;
        case 'poetry':
          topicConstraint =
            '((title:("thơ" OR "thi tập" OR "tập thơ" OR "ca dao" OR "thơ ca" OR "lục bát") AND NOT title:("hơi thở" OR "thỏ")) OR subject:("thơ" OR "poetry"))';
          break;
        case 'recommended':
        case 'all':
        default:
          topicConstraint = '';
          break;
      }
    } else {
      // Multi-language topics for international books
      switch (topic) {
        case 'vietnamese':
          topicConstraint = '(title:(vietnam OR vietnamese OR 越南) OR subject:(vietnam))';
          break;
        case 'world_classics':
          topicConstraint = '(title:(classic OR classics OR masterpiece OR 名著 OR classique) OR subject:(classics))';
          break;
        case 'philosophy':
          topicConstraint = '(title:(philosophy OR thought OR ethics OR 哲学 OR philosophie OR filosofia) OR subject:(philosophy))';
          break;
        case 'history':
          topicConstraint = '(title:(history OR chronicle OR 历史 OR histoire OR historia) OR subject:(history))';
          break;
        case 'science':
          topicConstraint = '(title:(science OR physics OR mathematics OR 科学 OR science OR ciencia) OR subject:(science))';
          break;
        case 'adventure':
          topicConstraint = '(title:(adventure OR detective OR mystery OR 冒险 OR aventure OR aventura) OR subject:(adventure))';
          break;
        case 'psychology':
          topicConstraint = '(title:(psychology OR mind OR 心理 OR psychologie OR psicologia) OR subject:(psychology))';
          break;
        case 'poetry':
          topicConstraint = '(title:(poetry OR poems OR verse OR 诗 OR poesie OR poesia) OR subject:(poetry))';
          break;
        case 'recommended':
        case 'all':
        default:
          topicConstraint = '';
          break;
      }
    }

    let luceneQuery = '';
    const cleanQ = query.replace(/["':*?~]/g, ' ').trim();
    const searchClause = cleanQ
      ? `(title:("${cleanQ}") OR creator:("${cleanQ}") OR subject:("${cleanQ}") OR "${cleanQ}")`
      : '';

    // Support combined search: user can search by keywords WITHIN the selected category
    if (searchClause && topicConstraint) {
      luceneQuery = langQuery
        ? `${searchClause} AND (${topicConstraint}) AND ${langQuery} AND mediatype:texts`
        : `${searchClause} AND (${topicConstraint}) AND mediatype:texts`;
    } else if (searchClause) {
      luceneQuery = langQuery
        ? `${searchClause} AND ${langQuery} AND mediatype:texts`
        : `${searchClause} AND mediatype:texts`;
    } else if (topicConstraint) {
      luceneQuery = langQuery
        ? `${topicConstraint} AND ${langQuery} AND mediatype:texts`
        : `${topicConstraint} AND mediatype:texts`;
    } else {
      luceneQuery = langQuery ? `${langQuery} AND mediatype:texts` : 'mediatype:texts';
    }

    const rows = 18;
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      luceneQuery
    )}&fl[]=identifier,title,creator,description,year,downloads,mediatype&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Internet Archive HTTP ${res.status}`);

    const data: ArchiveResponse = await res.json();
    const docs = data.response?.docs || [];
    const numFound = data.response?.numFound || 0;

    const books: OnlineBook[] = docs.map((doc) => {
      let author = 'Khuyết danh';
      if (Array.isArray(doc.creator)) {
        author = doc.creator.filter(Boolean).join(', ') || 'Khuyết danh';
      } else if (typeof doc.creator === 'string' && doc.creator.trim()) {
        author = doc.creator.trim();
      }

      let description = '';
      if (Array.isArray(doc.description)) {
        description = doc.description.filter(Boolean).join(' ').trim();
      } else if (typeof doc.description === 'string') {
        description = doc.description.trim();
      }

      // High-quality dynamic cover from Internet Archive book imaging service
      const coverUrl = `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`;
      const genre = inferGenre(doc.title?.trim() || doc.identifier, ['Internet Archive']);

      return {
        id: `ia-${doc.identifier}`,
        archiveId: doc.identifier,
        title: doc.title?.trim() || doc.identifier,
        author,
        coverUrl,
        genre,
        language: bookLanguage === 'all' ? 'vi' : bookLanguage,
        downloadCount: doc.downloads || 0,
        subjects: ['Internet Archive', 'Kho sách mở'],
        source: 'archive',
        year: doc.year,
        description: description ? description.slice(0, 300) : `Ấn bản lưu trữ tại Internet Archive (${doc.year || 'Sưu tầm'})`,
      };
    });

    const hasMore = page * rows < numFound;
    return { books, total: numFound, hasMore };
  } catch (err) {
    console.warn('Internet Archive fetch notice:', err);
    return { books: [], total: 0, hasMore: false };
  }
}

  /**
   * Fetch dynamically from Project Gutenberg API (gutendex.com)
   * 70,000+ public domain world classics
   */
  private async fetchFromGutenberg(
    query: string,
    topic: string,
    page: number,
    bookLanguage: string
  ): Promise<{ books: OnlineBook[]; total: number; hasMore: boolean }> {
    try {
      let url = 'https://gutendex.com/books/';
      const params: string[] = [];

      const topicMap: Record<string, string> = {
        vietnamese: 'vietnam',
        world_classics: 'classic',
        philosophy: 'philosophy',
        history: 'history',
        science: 'science',
        adventure: 'adventure',
        psychology: 'psychology',
        poetry: 'poetry',
      };

      if (query) {
        params.push(`search=${encodeURIComponent(query)}`);
        // Enforce category filter when searching within a specific category
        if (topic && topicMap[topic]) {
          params.push(`topic=${encodeURIComponent(topicMap[topic])}`);
        }
      } else {
        if (topic && topicMap[topic]) {
          params.push(`topic=${encodeURIComponent(topicMap[topic])}`);
        }
      }

      if (bookLanguage && bookLanguage !== 'all') {
        params.push(`languages=${bookLanguage}`);
      }

      if (page > 1) {
        params.push(`page=${page}`);
      }

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Gutendex HTTP ${res.status}`);

      const data: GutendexResponse = await res.json();

      const books: OnlineBook[] = (data.results || []).map((item) => {
        const author =
          item.authors && item.authors[0]
            ? item.authors[0].name.replace(/,\s*/, ' ')
            : 'Khuyết danh';
        const coverUrl =
          item.formats['image/jpeg'] ||
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
        const downloadUrl =
          item.formats['text/plain; charset=utf-8'] ||
          item.formats['text/plain; charset=us-ascii'] ||
          item.formats['text/plain'] ||
          item.formats['text/html'];

        return {
          id: `gutenberg-${item.id}`,
          title: item.title,
          author,
          coverUrl,
          language: item.languages[0] || 'en',
          downloadCount: item.download_count,
          subjects: item.subjects ? item.subjects.slice(0, 3) : [],
          source: 'gutenberg',
          downloadUrl,
        };
      });

      return { books, total: data.count || books.length, hasMore: !!data.next };
    } catch (err) {
      console.warn('Gutendex fetch notice:', err);
      return { books: [], total: 0, hasMore: false };
    }
  }

  /**
   * Fetch dynamically from Open Library API (openlibrary.org)
   */
  private async fetchFromOpenLibrary(
    query: string,
    page: number,
    bookLanguage: string,
    topic = ''
  ): Promise<{ books: OnlineBook[]; total: number; hasMore: boolean }> {
    try {
      const topicMap: Record<string, string> = {
        vietnamese: 'vietnam',
        world_classics: 'classics',
        philosophy: 'philosophy',
        history: 'history',
        science: 'science',
        adventure: 'adventure',
        psychology: 'psychology',
        poetry: 'poetry',
      };

      const params: string[] = [];
      if (query) {
        params.push(`q=${encodeURIComponent(query)}`);
        if (topic && topicMap[topic]) {
          params.push(`subject=${encodeURIComponent(topicMap[topic])}`);
        }
      } else {
        if (topic && topicMap[topic]) {
          params.push(`subject=${encodeURIComponent(topicMap[topic])}`);
        } else {
          params.push(`q=${encodeURIComponent(bookLanguage === 'vi' ? 'vietnamese literature' : 'classic literature')}`);
        }
      }

      if (bookLanguage && bookLanguage !== 'all' && bookLanguage === 'vi') {
        params.push('language=vie');
      }

      params.push(`page=${page}`);
      params.push('limit=18');

      const url = `https://openlibrary.org/search.json?${params.join('&')}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`OpenLibrary HTTP ${res.status}`);

      const data = await res.json();
      const docs = data.docs || [];
      const numFound = data.numFound || 0;

      const books: OnlineBook[] = docs.map((doc: any) => {
        const author = doc.author_name ? doc.author_name[0] : 'Khuyết danh';
        const coverUrl = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : doc.ia && doc.ia[0]
          ? `https://archive.org/services/img/${doc.ia[0]}`
          : undefined;

        const iaId = doc.ia && doc.ia[0] ? doc.ia[0] : undefined;

        return {
          id: `openlib-${doc.key.replace('/works/', '')}`,
          archiveId: iaId,
          title: doc.title,
          author,
          coverUrl,
          language: doc.language ? doc.language[0] : bookLanguage,
          downloadCount: doc.readinglog_count || 10,
          subjects: doc.subject ? doc.subject.slice(0, 3) : [],
          source: 'openlibrary' as const,
          description: doc.first_sentence
            ? doc.first_sentence[0]
            : `Ấn bản Open Library (${doc.first_publish_year || 'Sưu tầm'})`,
        };
      });

      const hasMore = page * 18 < numFound;
      return { books, total: numFound, hasMore };
    } catch (err) {
      console.warn('Open Library fetch notice:', err);
      return { books: [], total: 0, hasMore: false };
    }
  }

  /**
   * Download online book dynamically from the internet API and convert into offline RealBook format
   */
  async downloadAndImportBook(onlineBook: OnlineBook): Promise<{ book: Book; pages: string[] }> {
    let rawText = '';

    // 1. If book is from Internet Archive (or Open Library backed by IA)
    const archiveId = onlineBook.archiveId || (onlineBook.source === 'archive' ? onlineBook.id.replace('ia-', '') : null);

    if (archiveId) {
      try {
        // Query Internet Archive file metadata to find the plain text / DjVu OCR text file
        const metaRes = await fetch(`https://archive.org/metadata/${encodeURIComponent(archiveId)}/files`);
        if (metaRes.ok) {
          const meta = await metaRes.json();
          const files = (meta.result || []) as { name: string; format?: string; size?: string }[];

          // Prefer DjVuTXT (_djvu.txt) or plain text (.txt)
          const textFile =
            files.find((f) => f.name && f.name.toLowerCase().endsWith('_djvu.txt')) ||
            files.find((f) => f.name && f.name.toLowerCase().endsWith('.txt') && !f.name.toLowerCase().endsWith('_meta.txt'));

          if (textFile) {
            const dlUrl = `https://archive.org/download/${encodeURIComponent(archiveId)}/${encodeURIComponent(textFile.name)}`;
            const textRes = await fetch(dlUrl, {
              headers: { Range: 'bytes=0-3000000' }, // Stream up to 3MB text for instant responsive reading
            });
            if (textRes.ok || textRes.status === 206) {
              rawText = await textRes.text();
            }
          }
        }
      } catch (iaErr) {
        console.warn('Direct Internet Archive text download attempt notice:', iaErr);
      }
    }

    // 2. If book is from Gutenberg or has direct downloadUrl
    if (!rawText && onlineBook.downloadUrl) {
      try {
        const res = await fetch(onlineBook.downloadUrl);
        if (res.ok) {
          rawText = await res.text();

          // Strip Gutenberg disclaimer headers and footers
          if (rawText.includes('*** START OF THE PROJECT GUTENBERG') || rawText.includes('*** START OF THIS PROJECT GUTENBERG')) {
            const startMatch = rawText.match(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\*\*\*/i);
            if (startMatch && startMatch.index !== undefined) {
              rawText = rawText.slice(startMatch.index + startMatch[0].length);
            }
          }
          if (rawText.includes('*** END OF THE PROJECT GUTENBERG') || rawText.includes('*** END OF THIS PROJECT GUTENBERG')) {
            const endMatch = rawText.match(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG[^\n]*\*\*\*/i);
            if (endMatch && endMatch.index !== undefined) {
              rawText = rawText.slice(0, endMatch.index);
            }
          }
        }
      } catch (dlErr) {
        console.warn('Gutenberg direct download notice:', dlErr);
      }
    }

    // 3. Fallback if no full text could be fetched from network
    if (!rawText || rawText.trim().length === 0) {
      rawText = `# ${onlineBook.title}\n## Tác giả: ${onlineBook.author}\n\n${
        onlineBook.description ||
        'Tác phẩm đã được thêm vào kệ sách từ kho trực tuyến. Đang kết nối máy chủ để cập nhật thêm các chương đầy đủ...'
      }`;
    }

    rawText = rawText.trim();

    // Parse into segmented pages
    const parsed = await txtParser.parseText(rawText);

    const now = Date.now();
    const genre = onlineBook.genre || inferGenre(onlineBook.title, onlineBook.subjects);
    const newBook: Book = {
      id: `downloaded-${onlineBook.id}-${now}`,
      title: onlineBook.title,
      author: onlineBook.author,
      genre,
      format: 'txt',
      totalPages: parsed.pages.length,
      currentPage: 1,
      coverUrl: onlineBook.coverUrl,
      fileSize: rawText.length,
      lastReadAt: now,
      addedAt: now,
      bookmarks: [],
      highlights: [],
      readingTimeSeconds: 0,
      tags: onlineBook.subjects || [genre],
    };

    // Save metadata and file content to offline storage
    await storageService.saveBookMeta(newBook);
    await storageService.saveBookData(newBook.id, rawText);

    return { book: newBook, pages: parsed.pages };
  }
}

export const freeBooksApi = new FreeBooksApiService();
