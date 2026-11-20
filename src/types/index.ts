export type FileFormat = 'pdf' | 'docx' | 'epub' | 'txt' | 'cbz';

export type ReaderTheme = 'sepia' | 'warm' | 'white' | 'eink' | 'dark';

export type ViewerMode = 'realistic' | 'reflow' | 'single';

export interface Bookmark {
  id: string;
  page: number;
  label?: string;
  createdAt: number;
}

export interface Highlight {
  id: string;
  page: number;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  createdAt: number;
}

export interface TocItem {
  title: string;
  page: number;
  level?: number;
  children?: TocItem[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  format: FileFormat;
  totalPages: number;
  currentPage: number; // 1-indexed
  coverUrl?: string; // base64 or object URL
  fileSize: number; // in bytes
  lastReadAt: number;
  addedAt: number;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  readingTimeSeconds: number;
  genre?: string;
  tags?: string[];
  isComic?: boolean;
}

export interface TypographySettings {
  fontFamily: 'Be Vietnam Pro' | 'Literata' | 'Lora' | 'Merriweather' | 'EB Garamond' | 'Playfair Display' | 'Inter' | 'system-ui';
  fontSize: number; // e.g. 14 to 32px
  lineHeight: number; // 1.2 to 2.4
  letterSpacing: number; // 0 to 2px
  margin: 'narrow' | 'normal' | 'wide';
  textAlign: 'justify' | 'left';
}

export type AppLanguage = 'vi' | 'en' | 'zh' | 'fr' | 'es' | 'ja';

export interface ReaderSettings {
  language: AppLanguage;
  theme: ReaderTheme;
  brightness: number; // 50 to 120 (%)
  contrast: number; // 80 to 120 (%)
  pageSpread: 'double' | 'single';
  soundEnabled: boolean;
  soundVolume: number;
  zoom: number; // 0.8 to 1.8 (default 1.0)
  pdfDisplayMode: 'book' | 'scan'; // 'book' (default: formatted like demo book) | 'scan' (original canvas)
  typography: TypographySettings;
  viewerMode: ViewerMode;
}
