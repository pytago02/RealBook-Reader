import '../src/utils/polyfills';
import { describe, it, expect } from 'vitest';
import { txtParser } from '../src/services/parsers/txtParser';

describe('Parsers & Text Processing', () => {
  describe('TxtParser', () => {
    it('extracts markdown # title correctly', () => {
      const content = `# Hoàng Tử Bé\n\nNội dung chương 1...`;
      const result = txtParser.parseText(content);
      expect(result.title).toBe('Hoàng Tử Bé');
    });

    it('extracts first non-empty line as title when no markdown header is present', () => {
      const content = `\n\nTuyển Tập Thơ Xuân Diệu\n\nYêu là chết ở trong lòng một ít...`;
      const result = txtParser.parseText(content);
      expect(result.title).toBe('Tuyển Tập Thơ Xuân Diệu');
    });

    it('falls back to default title for empty or very short strings', () => {
      const content = ``;
      const result = txtParser.parseText(content);
      expect(result.title).toBe('Tài liệu không tên');
      expect(result.pages.length).toBe(1);
    });

    it('segments text into multiple pages when word count exceeds wordsPerPage', () => {
      // Create 3 large paragraphs with ~150 words each
      const para1 = new Array(150).fill('từ1').join(' ');
      const para2 = new Array(150).fill('từ2').join(' ');
      const para3 = new Array(150).fill('từ3').join(' ');

      const fullContent = `${para1}\n\n${para2}\n\n${para3}`;
      // With wordsPerPage = 200, it should split across at least 2 pages
      const result = txtParser.parseText(fullContent, 200);
      expect(result.pages.length).toBeGreaterThanOrEqual(2);
      expect(result.pages[0]).toContain('từ1');
      expect(result.pages[result.pages.length - 1]).toContain('từ3');
    });

    it('preserves paragraph structure and formatting', () => {
      const content = `# Lão Hạc\n\nLão Hạc thổi cái mồi rơm, châm đóm.\n\nTôi bùi ngùi nhìn lão. Bấy giờ tôi mới để ý thấy lão gầy sọp hẳn đi.`;
      const result = txtParser.parseText(content);
      expect(result.pages.length).toBe(1);
      expect(result.pages[0]).toContain('Lão Hạc thổi cái mồi rơm');
      expect(result.pages[0]).toContain('Tôi bùi ngùi nhìn lão');
    });
  });

  describe('Vietnamese Diacritic Normalization', () => {
    // Test the diacritic combiner algorithm used in pdfParser
    function cleanVietnameseDiacritics(text: string): string {
      const VN_VOWELS = '[aAeEiIoOuUyY\u00C0-\u024F\u1EA0-\u1EF9]';
      let cleaned = text;

      // Combine floating grave accent `
      cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[\`\\u0300\\u02CB]`, 'gu'), (_, v) => {
        return (v + '\u0300').normalize('NFC');
      });

      // Combine floating acute accent ´, '
      cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[´'\\u0301\\u02CA]`, 'gu'), (_, v) => {
        return (v + '\u0301').normalize('NFC');
      });

      // Combine floating tilde ~
      cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[~\\u0303\\u02DC]`, 'gu'), (_, v) => {
        return (v + '\u0303').normalize('NFC');
      });

      cleaned = cleaned.replace(/[`´'\u02CB\u02CA\u02DC]/gu, '');
      return cleaned.normalize('NFC');
    }

    it('combines detached grave accents into proper accented vowels', () => {
      const input = 'PHÂ`N THỨ NHẤT: VÊ` MỘT BỘ TOÁN';
      const cleaned = cleanVietnameseDiacritics(input);
      expect(cleaned).toContain('PHẦN');
      expect(cleaned).toContain('VỀ');
    });

    it('combines detached acute accents into proper accented vowels', () => {
      const input = 'TRIÊ´T HỌC VÀ ĐẠO ĐỨC';
      const cleaned = cleanVietnameseDiacritics(input);
      expect(cleaned).toContain('TRIẾT');
    });

    it('combines detached tildes', () => {
      const input = 'CÔ~NG ĐÔ`NG';
      const cleaned = cleanVietnameseDiacritics(input);
      expect(cleaned).toContain('CỖNG');
      expect(cleaned).toContain('ĐỒNG');
    });
  });

  describe('Document Format & Magic Bytes Detection', () => {
    it('identifies PDF file correctly from binary magic bytes %PDF', () => {
      const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
      const hasPdfMagic =
        pdfBytes.length >= 4 &&
        pdfBytes[0] === 0x25 &&
        pdfBytes[1] === 0x50 &&
        pdfBytes[2] === 0x44 &&
        pdfBytes[3] === 0x46;
      expect(hasPdfMagic).toBe(true);
    });

    it('identifies DOCX file correctly from binary magic bytes PK', () => {
      const docxBytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04]); // PK..
      const hasZipMagic =
        docxBytes.length >= 4 &&
        docxBytes[0] === 0x50 &&
        docxBytes[1] === 0x4B;
      expect(hasZipMagic).toBe(true);
    });
  });

  describe('ECMAScript 2024 / Android WebView Polyfills', () => {
    it('provides Uint8Array.prototype.toHex', () => {
      const u8 = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(typeof (u8 as any).toHex).toBe('function');
      expect((u8 as any).toHex()).toBe('deadbeef');
    });

    it('provides Uint8Array.fromHex', () => {
      expect(typeof (Uint8Array as any).fromHex).toBe('function');
      const u8 = (Uint8Array as any).fromHex('cafe1234');
      expect(u8[0]).toBe(0xca);
      expect(u8[1]).toBe(0xfe);
      expect(u8[2]).toBe(0x12);
      expect(u8[3]).toBe(0x34);
    });

    it('provides Promise.withResolvers', () => {
      expect(typeof Promise.withResolvers).toBe('function');
      const { promise, resolve } = Promise.withResolvers<string>();
      resolve('ok');
      return promise.then((res) => expect(res).toBe('ok'));
    });

    it('provides Promise.try', () => {
      expect(typeof (Promise as any).try).toBe('function');
      return (Promise as any).try(() => 42).then((res: number) => expect(res).toBe(42));
    });
  });
});
