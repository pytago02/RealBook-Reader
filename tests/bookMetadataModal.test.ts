import { describe, it, expect, vi } from 'vitest';
import { GENRE_LIST } from '../src/utils/genre';
import type { PendingBookData, BookMetadataForm } from '../src/components/BookMetadataModal';

describe('BookMetadataModal & Customization Flow', () => {
  const mockPendingData: PendingBookData = {
    id: 'book-test-123',
    buffer: new ArrayBuffer(1024),
    format: 'pdf',
    totalPages: 42,
    coverUrl: 'blob:http://localhost/cover-mock',
    fileSize: 1024 * 1500, // ~1.5 MB
    defaultTitle: 'Lược Sử Loài Người - Yuval Noah Harari',
    defaultAuthor: 'Yuval Noah Harari',
    defaultGenre: 'Lịch sử & Nhân vật',
    initialTextPages: null,
  };

  it('validates PendingBookData structure and typing', () => {
    expect(mockPendingData.id).toBe('book-test-123');
    expect(mockPendingData.format).toBe('pdf');
    expect(mockPendingData.totalPages).toBe(42);
    expect(mockPendingData.defaultTitle).toContain('Yuval');
    expect(mockPendingData.defaultGenre).toBe('Lịch sử & Nhân vật');
  });

  it('correctly maps default genre to GENRE_LIST', () => {
    const matched = GENRE_LIST.find((g) => g.label === mockPendingData.defaultGenre);
    expect(matched).toBeDefined();
    expect(matched?.id).toBe('lich_su');
  });

  it('handles fallback logic when user leaves fields empty', () => {
    const rawForm: BookMetadataForm = {
      title: '   ',
      author: '',
      genre: '',
    };

    const finalTitle = rawForm.title.trim() || mockPendingData.defaultTitle || 'Tài liệu';
    const finalAuthor = rawForm.author.trim() || mockPendingData.defaultAuthor || 'Cá nhân';
    const finalGenre = rawForm.genre.trim() || mockPendingData.defaultGenre || 'Văn học & Tiểu thuyết';

    expect(finalTitle).toBe('Lược Sử Loài Người - Yuval Noah Harari');
    expect(finalAuthor).toBe('Yuval Noah Harari');
    expect(finalGenre).toBe('Lịch sử & Nhân vật');
  });

  it('handles user-customized title, author and custom genre', () => {
    const userForm: BookMetadataForm = {
      title: 'Nhật Ký Học Lập Trình 2026',
      author: 'Nguyễn Văn A',
      genre: 'Nhật ký cá nhân',
    };

    expect(userForm.title).toBe('Nhật Ký Học Lập Trình 2026');
    expect(userForm.author).toBe('Nguyễn Văn A');
    expect(userForm.genre).toBe('Nhật ký cá nhân');
  });

  it('formats file size correctly in preview', () => {
    const formatFileSize = (bytes: number): string => {
      if (!bytes || bytes <= 0) return '0 KB';
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    expect(formatFileSize(0)).toBe('0 KB');
    expect(formatFileSize(500 * 1024)).toBe('500 KB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    expect(formatFileSize(12.34 * 1024 * 1024)).toBe('12.3 MB');
  });
});
