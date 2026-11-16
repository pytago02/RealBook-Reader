import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  BookOpen,
  Plus,
  Search,
  Upload,
  Clock,
  Sparkles,
  Trash2,
  FileText,
  Bookmark,
  Globe,
  Download,
  Loader2,
  Check,
  ChevronDown,
  Library as LibraryIcon,
  Tag,
  X,
} from "lucide-react";
import type { Book, AppLanguage } from "../types";
import { freeBooksApi, type OnlineBook } from "../services/freeBooksApi";
import { getTranslation, SUPPORTED_LANGUAGES } from "../i18n";
import { ConfirmModal } from "./ConfirmModal";
import { GENRE_LIST, inferGenre } from "../utils/genre";
import { AppLogo } from "./AppLogo";

interface LibraryProps {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onImportFile: (file: File) => void;
  onDeleteBook: (id: string) => void;
  onLoadSample: () => void;
  onDownloadOnlineBook?: (book: OnlineBook) => Promise<void>;
  currentLanguage?: AppLanguage;
  onSelectLanguage?: (lang: AppLanguage) => void;
  onUpdateBookGenre?: (bookId: string, genre: string) => void;
  showToast?: (toast: {
    type: "success" | "error" | "warning" | "info";
    title?: string;
    message: string;
  }) => void;
}

export const Library: React.FC<LibraryProps> = ({
  books,
  onOpenBook,
  onImportFile,
  onDeleteBook,
  onLoadSample,
  onDownloadOnlineBook,
  currentLanguage = "vi",
  onSelectLanguage,
  onUpdateBookGenre,
  showToast,
}) => {
  const t = getTranslation(currentLanguage);

  // Tabs: 'my-shelf' | 'online-library'
  const [activeTab, setActiveTab] = useState<"my-shelf" | "online-library">(
    "my-shelf",
  );

  // Scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Language selector menu dropdown state
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  // Genre filter for personal shelf
  const [shelfGenreFilter, setShelfGenreFilter] = useState<string>("all");
  const [editingGenreBookId, setEditingGenreBookId] = useState<string | null>(
    null,
  );

  // Delete confirmation modal state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search & drag states
  const [shelfSearchTerm, setShelfSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Online library states: language filter syncs with system language by default
  const [onlineBookLang, setOnlineBookLang] = useState<string>(currentLanguage);
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "archive" | "gutenberg" | "openlibrary"
  >("all");
  const [onlineTopic, setOnlineTopic] = useState<string>(
    currentLanguage === "vi" ? "vietnamese" : "recommended",
  );
  // Header search input: searches across all categories and all repositories ("Tìm tất cả")
  const [headerOnlineSearchInput, setHeaderOnlineSearchInput] = useState<string>("");
  // In-tab search input: searches strictly within the currently selected category ("Tìm trong thể loại này")
  const [tabCategorySearchInput, setTabCategorySearchInput] = useState<string>("");
  const [activeSearchScope, setActiveSearchScope] = useState<"all" | "category">("category");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [onlineBooks, setOnlineBooks] = useState<OnlineBook[]>([]);
  const [isFetchingOnline, setIsFetchingOnline] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [onlineTotalCount, setOnlineTotalCount] = useState<number>(0);

  // Pagination & Lazy loading states
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const isFetchingMoreRef = useRef<boolean>(false);
  const activeReqIdRef = useRef<number>(0);

  // Track previous language to sync recommendations when language changes
  const prevLangRef = useRef<AppLanguage>(currentLanguage);
  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      activeReqIdRef.current++;
      setOnlineBooks([]);
      setOnlineBookLang(currentLanguage);
      setOnlineTopic(currentLanguage === "vi" ? "vietnamese" : "recommended");
      setActiveSearchQuery("");
      setHeaderOnlineSearchInput("");
      setTabCategorySearchInput("");
      setActiveSearchScope("category");
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [currentLanguage]);

  // File input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImportFile(e.dataTransfer.files[0]);
    }
  };

  // Compute counts for each genre on personal shelf
  const shelfGenresWithCounts = useMemo(() => {
    const counts: Record<string, number> = { all: books.length };
    books.forEach((b) => {
      const g = b.genre || inferGenre(b.title);
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }, [books]);

  // Filter personal books by search term and genre
  const filteredPersonalBooks = useMemo(() => {
    const term = shelfSearchTerm.trim().toLowerCase();
    return books.filter((b) => {
      const bGenre = b.genre || inferGenre(b.title);

      // 1. Filter by selected genre pill
      if (shelfGenreFilter !== "all" && bGenre !== shelfGenreFilter) {
        return false;
      }

      // 2. Filter by search term (searches title, author, genre, tags)
      if (!term) return true;
      return (
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        bGenre.toLowerCase().includes(term) ||
        (b.tags && b.tags.some((tg) => tg.toLowerCase().includes(term)))
      );
    });
  }, [books, shelfSearchTerm, shelfGenreFilter]);

  // Fetch online books from free API (first page)
  const fetchOnlineBooks = useCallback(
    async (
      query: string,
      topic: string,
      langFilter: string,
      source: "all" | "archive" | "gutenberg" | "openlibrary",
    ) => {
      const reqId = ++activeReqIdRef.current;
      setIsFetchingOnline(true);
      setOnlineBooks([]); // Clean slate immediately so books from previous categories never linger
      setPage(1);
      setHasMore(false);
      setIsLoadingMore(false);
      isFetchingMoreRef.current = false;

      try {
        const {
          books: results,
          total,
          hasMore: more,
        } = await freeBooksApi.searchBooks(query, topic, 1, langFilter, source);

        // Strict guard: Discard response if user has already triggered another filter/category change
        if (reqId !== activeReqIdRef.current) return;

        setOnlineBooks(results);
        setOnlineTotalCount(total);
        setHasMore(more);
      } catch (err) {
        if (reqId === activeReqIdRef.current) {
          console.warn("Could not fetch online books:", err);
          setOnlineBooks([]);
          setOnlineTotalCount(0);
          setHasMore(false);
        }
      } finally {
        if (reqId === activeReqIdRef.current) {
          setIsFetchingOnline(false);
        }
      }
    },
    [],
  );

  // Trigger online fetch when switching topics, search query, language filter, or source
  useEffect(() => {
    if (activeTab === "online-library") {
      fetchOnlineBooks(
        activeSearchQuery,
        onlineTopic,
        onlineBookLang,
        sourceFilter,
      );
    }
  }, [
    activeTab,
    onlineTopic,
    activeSearchQuery,
    onlineBookLang,
    sourceFilter,
    fetchOnlineBooks,
  ]);

  // Lazy load next page
  const loadMoreBooks = useCallback(async () => {
    if (isFetchingMoreRef.current || !hasMore || isFetchingOnline) return;

    isFetchingMoreRef.current = true;
    setIsLoadingMore(true);

    const reqId = activeReqIdRef.current;
    const nextPage = page + 1;
    try {
      const { books: newBooks, hasMore: more } = await freeBooksApi.searchBooks(
        activeSearchQuery,
        onlineTopic,
        nextPage,
        onlineBookLang,
        sourceFilter,
      );

      // Discard if user switched category or filters while request was in-flight
      if (reqId !== activeReqIdRef.current) return;

      setOnlineBooks((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));
        const filteredNew = newBooks.filter((b) => !existingIds.has(b.id));
        return [...prev, ...filteredNew];
      });
      setPage(nextPage);
      setHasMore(more);
    } catch (err) {
      console.warn("Lazy load failed:", err);
    } finally {
      if (reqId === activeReqIdRef.current) {
        setIsLoadingMore(false);
        isFetchingMoreRef.current = false;
      }
    }
  }, [
    hasMore,
    onlineTopic,
    onlineBookLang,
    sourceFilter,
    isFetchingOnline,
    page,
    activeSearchQuery,
  ]);

  // Handle scroll for lazy loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (
      activeTab !== "online-library" ||
      !hasMore ||
      isLoadingMore ||
      isFetchingOnline
    )
      return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 350) {
      loadMoreBooks();
    }
  };

  // Dynamic category list (No icons, text only)
  const categoryList = [
    {
      id: "vietnamese",
      label:
        currentLanguage === "vi"
          ? "Văn học & Tinh hoa Việt Nam"
          : t.online.categories.vietnamese,
    },
    { id: "recommended", label: t.online.categories.recommended },
    { id: "world_classics", label: t.online.categories.world_classics },
    { id: "all", label: t.online.categories.all },
    { id: "philosophy", label: t.online.categories.philosophy },
    { id: "history", label: t.online.categories.history },
    { id: "science", label: t.online.categories.science },
    { id: "adventure", label: t.online.categories.adventure },
    { id: "psychology", label: t.online.categories.psychology },
    { id: "poetry", label: t.online.categories.poetry },
  ];

  // Dynamic label of currently selected category
  const currentCatLabel =
    onlineTopic === "all"
      ? "Toàn bộ thể loại"
      : categoryList.find((c) => c.id === onlineTopic)?.label ||
        t.online.categoryHeading;

  // 1. Header Global Search: searches across ALL repositories and ALL categories ("Tìm tất cả")
  const handleGlobalSearch = (queryToSearch?: string) => {
    const q = (
      queryToSearch !== undefined ? queryToSearch : headerOnlineSearchInput
    ).trim();
    activeReqIdRef.current++;
    setOnlineBooks([]);
    setSourceFilter("all");
    setOnlineTopic("all");
    setActiveSearchScope("all");
    setActiveSearchQuery(q);
    setHeaderOnlineSearchInput(q);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    if (showToast && q) {
      showToast({
        type: "info",
        title: "Tìm kiếm tất cả kho sách",
        message: `Đang tìm "${q}" trên toàn bộ các thể loại và 3 kho sách mở...`,
      });
    }
  };

  // 2. Specific Source Search Button: searches in a specific repository
  const handleSourceSearch = (
    src: "all" | "archive" | "gutenberg" | "openlibrary",
    queryToSearch?: string,
  ) => {
    const q = (
      queryToSearch !== undefined
        ? queryToSearch
        : tabCategorySearchInput || headerOnlineSearchInput
    ).trim();
    const srcNames: Record<string, string> = {
      all: "Tất cả kho sách",
      archive: "Internet Archive",
      gutenberg: "Project Gutenberg",
      openlibrary: "Open Library",
    };
    activeReqIdRef.current++;
    setOnlineBooks([]);
    setSourceFilter(src);
    setActiveSearchQuery(q);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    if (showToast && q) {
      showToast({
        type: "info",
        title: `Tìm trong ${srcNames[src]}`,
        message: `Đang tìm "${q}" trong kho ${srcNames[src]}...`,
      });
    }
  };

  // 3. In-Tab Category Search: searches strictly within a specific category ("Tìm trong thể loại này")
  const handleCategorySearch = (catId: string, queryToSearch?: string) => {
    const q = (
      queryToSearch !== undefined ? queryToSearch : tabCategorySearchInput
    ).trim();
    const catObj = categoryList.find((c) => c.id === catId);
    const catName = catObj ? catObj.label : catId;
    activeReqIdRef.current++;
    setOnlineBooks([]);
    setOnlineTopic(catId);
    setActiveSearchScope("category");
    setActiveSearchQuery(q);
    setTabCategorySearchInput(q);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    if (showToast && q) {
      showToast({
        type: "info",
        title: "Tìm trong thể loại",
        message: `Đang tìm "${q}" trong thể loại "${catName}"...`,
      });
    }
  };

  // 4. Clear Search: resets search query back to normal category browsing
  const handleClearSearch = () => {
    activeReqIdRef.current++;
    setOnlineBooks([]);
    setActiveSearchQuery("");
    setHeaderOnlineSearchInput("");
    setTabCategorySearchInput("");
    setActiveSearchScope("category");
    if (onlineTopic === "all") {
      setOnlineTopic(onlineBookLang === "vi" ? "vietnamese" : "recommended");
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  // Header Search Form Submit: Searches across all repositories & categories ("Tìm tất cả")
  const handleHeaderOnlineSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGlobalSearch(headerOnlineSearchInput);
  };

  // In-Tab Category Search Form Submit: Searches strictly within the selected category ("Tìm trong thể loại này")
  const handleInTabCategorySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCategorySearch(onlineTopic, tabCategorySearchInput);
  };

  // Check if book already downloaded
  const isBookAlreadyInLibrary = (onlineBook: OnlineBook) => {
    return books.some(
      (b) =>
        b.title.toLowerCase().trim() ===
          onlineBook.title.toLowerCase().trim() ||
        (onlineBook.id && b.id.includes(onlineBook.id)),
    );
  };

  // Download and read
  const handleReadOnlineBook = async (onlineBook: OnlineBook) => {
    const existing = books.find(
      (b) =>
        b.title.toLowerCase().trim() ===
          onlineBook.title.toLowerCase().trim() ||
        (onlineBook.id && b.id.includes(onlineBook.id)),
    );
    if (existing) {
      onOpenBook(existing);
      return;
    }

    if (!onDownloadOnlineBook) return;
    setDownloadingId(onlineBook.id);
    try {
      await onDownloadOnlineBook(onlineBook);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative h-screen w-full bg-[#141518] text-[#e5e5eb] overflow-y-auto selection:bg-amber-500/30"
    >
      {/* Drag Over Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-amber-500/20 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <Upload className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">
            {t.shelf.dragDropOverlay}
          </h2>
          <p className="text-amber-200 text-sm mt-1">{t.shelf.dragDropSub}</p>
        </div>
      )}

      {/* Fixed-Dimension Dynamic Header - Zero Layout Shift Across Tabs */}
      <header className="sticky top-0 z-20 bg-[#141518]/95 backdrop-blur-md border-b border-gray-800/80 px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* 1. Left: Logo & Brand Text - Fixed 320px width */}
          <div className="w-[320px] flex-shrink-0 flex items-center space-x-3">
            <div
              className="relative w-10 h-10 flex-shrink-0 group cursor-pointer"
              onClick={() => setActiveTab("my-shelf")}
              title="RealBook Reader"
            >
              <AppLogo
                className="w-10 h-10 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105 object-contain"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#121316] transition-colors ${
                  activeTab === "online-library"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                }`}
                title={
                  activeTab === "online-library"
                    ? t.header.tabOnline
                    : t.header.tabShelf.replace("{count}", String(books.length))
                }
              />
            </div>
            <div className="w-[260px] min-w-0">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <h1 className="text-base font-bold tracking-tight text-white">
                  RealBook Reader
                </h1>
                {activeTab === "online-library" ? (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    {t.header.badgeOnline}
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                    {t.header.badgeShelf}
                  </span>
                )}
              </div>
              <p
                className="text-xs text-gray-400 truncate block w-full mt-0.5"
                title={
                  activeTab === "online-library"
                    ? t.header.taglineOnline
                    : t.header.taglineShelf.replace(
                        "{count}",
                        String(books.length),
                      )
                }
              >
                {activeTab === "online-library"
                  ? t.header.taglineOnline
                  : t.header.taglineShelf.replace(
                      "{count}",
                      String(books.length),
                    )}
              </p>
            </div>
          </div>

          {/* 2. Center: Navigation Tabs - Fixed styling & whitespace-nowrap */}
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="flex items-center bg-[#1e1f26] p-1 rounded-xl border border-gray-800 shadow-inner">
              <button
                onClick={() => setActiveTab("my-shelf")}
                className={`flex items-center justify-center gap-2 w-[140px] py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                  activeTab === "my-shelf"
                    ? "bg-amber-500 text-black shadow-md font-bold"
                    : "text-gray-400 hover:text-white font-medium"
                }`}
              >
                <LibraryIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {t.header.tabShelf.replace("{count}", String(books.length))}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("online-library")}
                className={`flex items-center justify-center gap-2 w-[140px] py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
                  activeTab === "online-library"
                    ? "bg-emerald-500 text-black shadow-md font-bold"
                    : "text-gray-400 hover:text-white font-medium"
                }`}
              >
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{t.header.tabOnline}</span>
              </button>
            </div>
          </div>

          {/* 3. Right: Language + Search + Action - Fixed 440px width in both tabs */}
          <div className="w-[440px] flex-shrink-0 flex items-center justify-end space-x-2">
            {/* Global System Language Switcher (Fixed 74px with uppercase abbreviation) */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="w-[74px] h-9 flex-shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-[#1e1f26] hover:bg-[#282933] text-gray-200 border border-gray-700/60 text-xs font-semibold transition-all shadow-sm active:scale-95"
                title={t.common.systemLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-mono font-bold text-xs tracking-wider uppercase">
                  {currentLanguage}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e1f26] border border-gray-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in backdrop-blur-md">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-700/50 mb-1">
                    {t.common.systemLanguage}
                  </div>
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        if (onSelectLanguage) onSelectLanguage(item.code);
                        activeReqIdRef.current++;
                        setOnlineBooks([]);
                        setOnlineBookLang(item.code);
                        setOnlineTopic(
                          item.code === "vi" ? "vietnamese" : "recommended",
                        );
                        setActiveSearchQuery("");
                        setHeaderOnlineSearchInput("");
                        setTabCategorySearchInput("");
                        setActiveSearchScope("category");
                        setIsLangMenuOpen(false);
                        if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                        item.code === currentLanguage
                          ? "bg-amber-500/15 text-amber-400 font-bold"
                          : "text-gray-300 hover:bg-[#2b2c37] hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                        {item.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeTab === "my-shelf" ? (
              <>
                {/* Search in personal shelf (Fixed 220px) */}
                <div className="relative w-[220px] flex-shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t.header.searchShelfPlaceholder}
                    value={shelfSearchTerm}
                    onChange={(e) => setShelfSearchTerm(e.target.value)}
                    className="w-full h-9 bg-[#1f2026] text-xs text-gray-200 pl-9 pr-3 rounded-xl border border-gray-700/60 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-500"
                  />
                </div>

                {/* Import file button (Fixed 130px) */}
                <input
                  type="file"
                  id="book-upload-input"
                  accept=".pdf,.docx,.txt,.epub,.md"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <label
                  htmlFor="book-upload-input"
                  className="w-[130px] h-9 flex-shrink-0 flex items-center justify-center gap-1.5 px-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#141518] font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t.header.openFile}</span>
                </label>
              </>
            ) : (
              /* Search in Online Library: Global Search across ALL repositories & ALL categories ("Tìm tất cả") */
              <form
                onSubmit={handleHeaderOnlineSearchSubmit}
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <div className="relative w-[220px] flex-shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm tất cả sách (70.000+)..."
                    value={headerOnlineSearchInput}
                    onChange={(e) => setHeaderOnlineSearchInput(e.target.value)}
                    className="w-full h-9 bg-[#1f2026] text-xs text-gray-200 pl-9 pr-7 rounded-xl border border-gray-700/60 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-500 truncate"
                  />
                  {headerOnlineSearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderOnlineSearchInput("");
                        if (activeSearchQuery && activeSearchScope === "all") handleClearSearch();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-0.5"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  title="Tìm kiếm từ khóa trên toàn bộ các kho sách và tất cả thể loại"
                  className="w-[130px] h-9 flex-shrink-0 flex items-center justify-center gap-1.5 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Tìm tất cả</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* TAB 1: MY BOOKSHELF */}
        {activeTab === "my-shelf" && (
          <div>
            {/* Banner Quick Actions */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#1c1d24] to-[#252630] border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />{" "}
                  {t.shelf.bannerTitle.replace("{count}", String(books.length))}
                </h2>
                <p className="text-sm text-gray-400 max-w-xl">
                  {t.shelf.bannerDesc}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("online-library")}
                  className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-300 transition-all flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  {t.shelf.exploreOnline}
                </button>
                <button
                  onClick={onLoadSample}
                  className="px-4 py-2 rounded-xl border border-gray-700 bg-[#2b2c37] hover:bg-[#343542] text-xs font-semibold text-gray-200 transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  {t.shelf.demoSample}
                </button>
              </div>
            </div>

            {/* Shelf Genre Filter & In-Tab Search Bar */}
            <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#1a1b22] border border-gray-800/80 rounded-2xl p-3 shadow-md">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
                <button
                  onClick={() => setShelfGenreFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    shelfGenreFilter === "all"
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "bg-[#22232c] text-gray-400 hover:text-white hover:bg-[#2b2c37] border border-gray-700/50"
                  }`}
                >
                  <span>Tất cả thể loại</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
                    {books.length}
                  </span>
                </button>

                {GENRE_LIST.map((genreItem) => {
                  const count = shelfGenresWithCounts[genreItem.label] || 0;
                  const isActive = shelfGenreFilter === genreItem.label;

                  return (
                    <button
                      key={genreItem.id}
                      onClick={() => setShelfGenreFilter(genreItem.label)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                          : count > 0
                            ? "bg-[#22232c] text-gray-200 hover:text-white hover:bg-[#2b2c37] border border-gray-700/50"
                            : "bg-[#181920] text-gray-500 hover:text-gray-300 border border-gray-800/60 opacity-60"
                      }`}
                    >
                      <span>{genreItem.label}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive
                              ? "bg-black/30 text-black font-bold"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dedicated In-Tab Search Input for personal shelf */}
              <div className="relative w-full md:w-[260px] flex-shrink-0">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    shelfGenreFilter === "all"
                      ? "Lọc sách trên kệ..."
                      : `Tìm trong "${shelfGenreFilter}"...`
                  }
                  value={shelfSearchTerm}
                  onChange={(e) => setShelfSearchTerm(e.target.value)}
                  className="w-full h-9 bg-[#141518] text-xs text-gray-200 pl-9 pr-7 rounded-xl border border-gray-700/60 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-gray-500"
                />
                {shelfSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setShelfSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Books Grid */}
            {filteredPersonalBooks.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#1e1f26] border border-gray-800 flex items-center justify-center mb-4 text-gray-500">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-300">
                  {shelfGenreFilter !== "all"
                    ? `Chưa có sách thuộc thể loại "${shelfGenreFilter}"`
                    : t.shelf.emptyTitle}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">
                  {shelfGenreFilter !== "all"
                    ? "Bạn có thể mở thêm file từ máy hoặc đổi thể loại cho sách đã có."
                    : t.shelf.emptyDesc}
                </p>
                {shelfGenreFilter !== "all" && (
                  <button
                    onClick={() => setShelfGenreFilter("all")}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/25 transition-all"
                  >
                    Xem tất cả sách ({books.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPersonalBooks.map((book) => {
                  const percent =
                    book.totalPages > 0
                      ? Math.round((book.currentPage / book.totalPages) * 100)
                      : 0;
                  const currentGenre = book.genre || inferGenre(book.title);

                  return (
                    <div
                      key={book.id}
                      onClick={() => onOpenBook(book)}
                      className="group relative bg-[#1c1d23] hover:bg-[#22232b] border border-gray-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 cursor-pointer flex flex-col justify-between"
                    >
                      {/* Book Cover Container */}
                      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#2a2b36] to-[#1e1f27] border border-gray-700/50 shadow-md flex flex-col justify-between p-4 group-hover:scale-[1.02] transition-transform duration-300">
                        {/* Realistic Book Spine Effect */}
                        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />

                        {book.coverUrl ? (
                          <>
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Badges Overlay for Cover */}
                            <div className="relative z-10 flex justify-between items-start gap-1 w-full pointer-events-none">
                              <span className="uppercase text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-black/60 text-amber-400 border border-amber-500/20 backdrop-blur-sm">
                                {book.format}
                              </span>
                              <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-black/60 text-amber-300 border border-amber-500/20 truncate max-w-[120px] backdrop-blur-sm">
                                {currentGenre}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col justify-between z-10">
                            {/* Format & Genre Badges */}
                            <div className="flex justify-between items-start gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="uppercase text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-black/40 text-amber-400 border border-amber-500/20">
                                  {book.format}
                                </span>
                                <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 truncate max-w-[110px]">
                                  {currentGenre}
                                </span>
                              </div>
                              {book.bookmarks && book.bookmarks.length > 0 && (
                                <span className="text-amber-400 p-1 bg-black/40 rounded-md">
                                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                                </span>
                              )}
                            </div>

                            {/* Typographic Title */}
                            <div className="my-auto text-center px-2">
                              <h4 className="font-serif font-bold text-white text-base leading-snug line-clamp-3">
                                {book.title}
                              </h4>
                              <p className="text-xs text-amber-200/70 mt-2 font-serif italic truncate">
                                {book.author || t.shelf.unknownAuthor}
                              </p>
                            </div>

                            <div className="text-[10px] text-gray-400 font-mono text-center">
                              {t.shelf.pagesCount.replace(
                                "{count}",
                                String(book.totalPages),
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Metadata & Progress */}
                      <div>
                        <h3 className="font-semibold text-sm text-gray-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                          {book.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400 mt-0.5">
                          <span className="truncate">
                            {book.author || t.shelf.unknownAuthor}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#252632] text-gray-400 flex-shrink-0">
                            {currentGenre}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                            <span>
                              {t.shelf.pageProgress
                                .replace("{current}", String(book.currentPage))
                                .replace("{total}", String(book.totalPages))}
                            </span>
                            <span className="text-amber-400 font-semibold">
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Bottom action row */}
                        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(book.lastReadAt).toLocaleDateString(
                              currentLanguage === "vi" ? "vi-VN" : "en-US",
                            )}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Genre Changer Dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGenreBookId(
                                    editingGenreBookId === book.id
                                      ? null
                                      : book.id,
                                  );
                                }}
                                className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Đổi thể loại sách"
                              >
                                <Tag className="w-3.5 h-3.5" />
                              </button>

                              {editingGenreBookId === book.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute bottom-full right-0 mb-2 w-52 bg-[#1e1f26] border border-gray-700/80 rounded-xl shadow-2xl py-1.5 z-40 animate-fade-in backdrop-blur-md"
                                >
                                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-700/50 mb-1">
                                    Đổi thể loại sách
                                  </div>
                                  {GENRE_LIST.map((g) => {
                                    const isCurrent = currentGenre === g.label;
                                    return (
                                      <button
                                        key={g.id}
                                        onClick={() => {
                                          if (onUpdateBookGenre)
                                            onUpdateBookGenre(book.id, g.label);
                                          setEditingGenreBookId(null);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#2b2c37] ${
                                          isCurrent
                                            ? "text-amber-400 font-bold bg-amber-500/10"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {g.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Delete Button - Triggers Synchronized ConfirmModal */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookToDelete(book);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title={t.shelf.deleteTooltip}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FREE ONLINE BOOK STORE (2-COLUMN LAYOUT WITH VERTICAL FILTERS & LAZY LOADING) */}
        {activeTab === "online-library" && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column: Vertical Category Filter & Language Strip (Text-only categories, NO ICONS) */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-[#1a1b22] border border-gray-800/90 rounded-2xl p-4 md:sticky md:top-24 shadow-lg">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                  {t.online.categoryHeading}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {t.online.totalBooksCount.replace(
                    "{count}",
                    onlineTotalCount.toLocaleString(),
                  )}
                </span>
              </div>

              {/* Book Language Quick Filter Strip */}
              <div className="mb-4 px-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1.5">
                  {t.online.languageFilterLabel}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {SUPPORTED_LANGUAGES.map((langItem) => {
                    const isLangActive = onlineBookLang === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        onClick={() => {
                          if (onlineBookLang === langItem.code) return;
                          activeReqIdRef.current++;
                          setOnlineBooks([]);
                          setOnlineBookLang(langItem.code);
                          if (langItem.code === "vi") {
                            setOnlineTopic("vietnamese");
                          } else {
                            setOnlineTopic("recommended");
                          }
                          setActiveSearchQuery("");
                          setHeaderOnlineSearchInput("");
                          setTabCategorySearchInput("");
                          setActiveSearchScope("category");
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1 ${
                          isLangActive
                            ? "bg-emerald-500 text-black font-bold shadow-sm"
                            : "bg-[#23242e] text-gray-400 hover:text-white hover:bg-[#2b2c37]"
                        }`}
                      >
                        <span>{langItem.flag}</span>
                        <span>{langItem.code.toUpperCase()}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      if (onlineBookLang === "all") return;
                      activeReqIdRef.current++;
                      setOnlineBooks([]);
                      setOnlineBookLang("all");
                      setOnlineTopic("all");
                      setActiveSearchQuery("");
                      setHeaderOnlineSearchInput("");
                      setTabCategorySearchInput("");
                      setActiveSearchScope("category");
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({
                          top: 0,
                          behavior: "instant",
                        });
                      }
                    }}
                    className={`col-span-3 mt-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center ${
                      onlineBookLang === "all"
                        ? "bg-emerald-500 text-black font-bold shadow-sm"
                        : "bg-[#23242e] text-gray-400 hover:text-white hover:bg-[#2b2c37]"
                    }`}
                  >
                    {t.online.allLanguages}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-800/80 my-3" />

              {/* Book Source Filter */}
              <div className="mb-4 px-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                    Nguồn thư viện trực tuyến
                  </label>
                  <span className="text-[10px] text-amber-400/90 font-medium font-mono">
                    3 kho mở
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  {[
                    {
                      id: "all" as const,
                      label: "Tất cả kho mở",
                      badge: "Toàn bộ",
                      desc: "Tìm trên cả 3 kho sách mở",
                    },
                    {
                      id: "archive" as const,
                      label: "Internet Archive",
                      badge: "12K+ VN",
                      desc: "12.000+ Sách tiếng Việt & tài liệu số",
                    },
                    {
                      id: "gutenberg" as const,
                      label: "Project Gutenberg",
                      badge: "70K+",
                      desc: "70.000+ Tác phẩm kinh điển quốc tế",
                    },
                    {
                      id: "openlibrary" as const,
                      label: "Open Library",
                      badge: "Mở",
                      desc: "Thư viện mở toàn cầu",
                    },
                  ].map((src) => {
                    const isSrcActive = sourceFilter === src.id;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => {
                          if (sourceFilter === src.id && !activeSearchQuery)
                            return;
                          handleSourceSearch(src.id, activeSearchQuery);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                          isSrcActive
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold shadow-sm"
                            : "text-gray-400 hover:text-gray-200 hover:bg-[#23242e] border border-transparent"
                        }`}
                        title={src.desc}
                      >
                        <span className="truncate">{src.label}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-gray-400 ml-1 flex-shrink-0">
                          {src.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-800/80 my-3" />

              {/* Vertical Category Filter (Pure text, NO ICONS, NO SEARCH BUTTONS) */}
              <div className="mb-2 px-2 flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                  Thể loại sách
                </label>
                <span className="text-[10px] text-emerald-400/90 font-medium font-mono">
                  10 thể loại
                </span>
              </div>
              <nav className="flex flex-col space-y-1">
                {categoryList.map((cat) => {
                  const isActive = onlineTopic === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (onlineTopic === cat.id && !activeSearchQuery)
                          return;
                        activeReqIdRef.current++;
                        setOnlineBooks([]);
                        setOnlineTopic(cat.id);
                        setActiveSearchQuery("");
                        setTabCategorySearchInput("");
                        setActiveSearchScope("category");
                        if (scrollContainerRef.current) {
                          scrollContainerRef.current.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                      className={`w-full text-left truncate px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm"
                          : "text-gray-400 hover:text-gray-100 hover:bg-[#23242e] border border-transparent"
                      }`}
                      title={cat.label}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-800/80 px-2 text-[11px] text-gray-500 leading-relaxed">
                {t.online.publicDomainNotice}
              </div>
            </aside>

            {/* Right Column: Book Grid + Lazy Loading */}
            <section className="flex-1 w-full min-w-0">
              {/* Online In-Tab Dedicated Category Search Deck */}
              <div className="mb-6 bg-[#1a1b22] border border-gray-800/80 rounded-2xl p-4 shadow-lg space-y-3">
                {/* Row 1: Active Category Header + Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                    <div>
                      <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                        {currentCatLabel}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {onlineBooks.length} /{" "}
                        {onlineTotalCount.toLocaleString()}{" "}
                        {t.online.categoryHeading.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                      Kho đang lọc:
                    </span>
                    <span className="font-semibold text-amber-300">
                      {sourceFilter === "all"
                        ? "Tất cả 3 kho mở"
                        : sourceFilter === "archive"
                          ? "Internet Archive"
                          : sourceFilter === "gutenberg"
                            ? "Project Gutenberg"
                            : "Open Library"}
                    </span>
                  </div>
                </div>

                {/* Row 2: Ô nhập tìm kiếm riêng cho phép tìm trong thể loại này */}
                <form
                  onSubmit={handleInTabCategorySearchSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gray-800/60"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={`Tìm kiếm trong thể loại "${currentCatLabel}"...`}
                      value={tabCategorySearchInput}
                      onChange={(e) => setTabCategorySearchInput(e.target.value)}
                      className="w-full h-10 bg-[#141518] text-xs text-gray-100 pl-10 pr-8 rounded-xl border border-gray-700/60 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-500"
                    />
                    {tabCategorySearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setTabCategorySearchInput("");
                          if (activeSearchQuery && activeSearchScope === "category") {
                            handleClearSearch();
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-0.5"
                        title="Xóa chữ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Nút tìm trong thể loại này */}
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
                    title={`Tìm kiếm từ khóa trong thể loại "${currentCatLabel}"`}
                  >
                    <Search className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Tìm trong thể loại này</span>
                  </button>
                </form>

                {/* Row 4: Active Search State Banner (khi đang tìm kiếm) */}
                {activeSearchQuery && (
                  <div className="flex items-center justify-between bg-[#15161c] border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Đang tìm: &ldquo;{activeSearchQuery}&rdquo;
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-300">
                        Phạm vi:{" "}
                        <span className="font-semibold text-emerald-300">
                          {activeSearchScope === "all"
                            ? "Toàn bộ kho sách (Tất cả thể loại)"
                            : `Thể loại: ${currentCatLabel}`}
                        </span>
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="font-mono text-gray-400 font-bold">
                        {onlineBooks.length} /{" "}
                        {onlineTotalCount.toLocaleString()} kết quả
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="ml-3 px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap"
                      title="Hủy tìm kiếm để quay lại xem toàn bộ sách trong thể loại"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hủy tìm kiếm</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Initial Loading Spinner */}
              {isFetchingOnline ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
                  <p className="text-sm font-medium text-gray-200">
                    {t.online.fetchingTitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.online.fetchingSubtitle}
                  </p>
                </div>
              ) : onlineBooks.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center bg-[#1a1b22] border border-gray-800/80 rounded-2xl">
                  <FileText className="w-12 h-12 text-gray-600 mb-3" />
                  <h3 className="text-base font-semibold text-gray-300">
                    {t.online.noBooksTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    {t.online.noBooksSubtitle}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {onlineBooks.map((onlineBook) => {
                      const alreadySaved = isBookAlreadyInLibrary(onlineBook);
                      const isDownloading = downloadingId === onlineBook.id;

                      return (
                        <div
                          key={onlineBook.id}
                          className="group relative bg-[#1c1d23] hover:bg-[#22232b] border border-gray-800/80 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between"
                        >
                          {/* Book Cover Container */}
                          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-[#2a2b36] to-[#1e1f27] border border-gray-700/50 shadow-md flex flex-col justify-between p-4 group-hover:scale-[1.02] transition-transform duration-300">
                            {/* Book Spine Effect */}
                            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none z-10" />

                            {onlineBook.coverUrl ? (
                              <img
                                src={onlineBook.coverUrl}
                                alt={onlineBook.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full flex flex-col justify-between z-10">
                                <span className="uppercase text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-md bg-black/50 text-emerald-400 self-start">
                                  {onlineBook.language.toUpperCase()}
                                </span>
                                <div className="my-auto text-center px-1">
                                  <h4 className="font-serif font-bold text-white text-sm leading-snug line-clamp-3">
                                    {onlineBook.title}
                                  </h4>
                                  <p className="text-xs text-emerald-200/70 mt-1 font-serif italic truncate">
                                    {onlineBook.author}
                                  </p>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono text-center">
                                  {t.online.freeEdition}
                                </span>
                              </div>
                            )}

                            {/* Top Badges: Source & Language */}
                            <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 pointer-events-none">
                              <span
                                className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm border shadow-sm ${
                                  onlineBook.source === "archive"
                                    ? "bg-emerald-600/90 text-white border-emerald-400 font-extrabold"
                                    : onlineBook.source === "openlibrary"
                                      ? "bg-blue-600/90 text-white border-blue-400"
                                      : "bg-amber-600/90 text-black border-amber-400 font-extrabold"
                                }`}
                              >
                                {onlineBook.source === "archive"
                                  ? "Archive.org"
                                  : onlineBook.source === "openlibrary"
                                    ? "Open Library"
                                    : "Gutenberg"}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-black/75 text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                                {onlineBook.language === "vi"
                                  ? "Tiếng Việt"
                                  : onlineBook.language.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-sm text-gray-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                                {onlineBook.title}
                              </h3>
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {onlineBook.author}
                              </p>
                              {onlineBook.description && (
                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                                  {onlineBook.description}
                                </p>
                              )}
                            </div>

                            {/* Download / Open Action Button */}
                            <div className="mt-4 pt-3 border-t border-gray-800/80">
                              <button
                                onClick={() => handleReadOnlineBook(onlineBook)}
                                disabled={isDownloading}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                                  alreadySaved
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black"
                                }`}
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>{t.online.downloading}</span>
                                  </>
                                ) : alreadySaved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{t.online.alreadyInShelf}</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{t.online.readAndDownload}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lazy Loading Bottom Spinner */}
                  {isLoadingMore && (
                    <div className="py-8 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.online.loadingMore}</span>
                    </div>
                  )}

                  {/* End of list indicator */}
                  {!hasMore && onlineBooks.length > 0 && (
                    <div className="py-8 text-center text-xs text-gray-500 font-mono">
                      {t.online.endOfList}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Synchronized Theme-Matching Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!bookToDelete}
        title="Xác nhận xóa sách"
        message="Bạn có chắc chắn muốn xóa cuốn sách này khỏi kệ sách? Hành động này sẽ xóa tệp sách và toàn bộ ghi chú đọc sách."
        itemTitle={bookToDelete?.title}
        itemSubtitle={`${bookToDelete?.author || "Tác giả cá nhân"} • ${bookToDelete?.genre || inferGenre(bookToDelete?.title || "")} • ${bookToDelete?.totalPages || 0} trang`}
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        variant="danger"
        onCancel={() => setBookToDelete(null)}
        onConfirm={() => {
          if (bookToDelete) {
            onDeleteBook(bookToDelete.id);
            if (showToast) {
              showToast({
                type: "info",
                title: "Đã xóa sách",
                message: `Đã xóa cuốn "${bookToDelete.title}" khỏi kệ sách.`,
              });
            }
            setBookToDelete(null);
          }
        }}
      />
    </div>
  );
};
