import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type { TocItem } from '../../types';

// Set up worker safely with both workerSrc and fallback to in-memory fake worker
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }
} catch (err) {
  console.warn('Worker source initialization warning:', err);
}

/**
 * Clean and normalize Vietnamese diacritics, combining detached tone marks (` or ´ or ~)
 * into legitimate accented Vietnamese vowels (e.g. PHÂ`N -> PHẦN, VÊ` -> VỀ, TRIÊ´T -> TRIẾT)
 * and fixing accidental spaces inside words caused by tone kerning in PDFs.
 */
function cleanVietnameseDiacritics(text: string): string {
  const VN_VOWELS = '[aAeEiIoOuUyY\u00C0-\u024F\u1EA0-\u1EF9]';

  let cleaned = text;

  // 1. Combine floating grave accent `, \u0300, \u02CB with preceding vowel (e.g. PHÂ`N -> PHẦN, VÊ` -> VỀ)
  cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[\`\\u0300\\u02CB]`, 'gu'), (_, v) => {
    return (v + '\u0300').normalize('NFC');
  });

  // 2. Combine floating acute accent ´, ', \u0301, \u02CA with preceding vowel (e.g. TRIÊ´T -> TRIẾT)
  cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[´'\\u0301\\u02CA]`, 'gu'), (_, v) => {
    return (v + '\u0301').normalize('NFC');
  });

  // 3. Combine floating tilde ~, \u0303, \u02DC with preceding vowel
  cleaned = cleaned.replace(new RegExp(`(${VN_VOWELS})\\s*[~\\u0303\\u02DC]`, 'gu'), (_, v) => {
    return (v + '\u0303').normalize('NFC');
  });

  // 4. Remove any remaining isolated backticks or acute glyphs
  cleaned = cleaned.replace(/[`´'\u02CB\u02CA\u02DC]/gu, '');

  return cleaned.normalize('NFC');
}

let isInMemoryFallbackActive = false;

export class PdfParser {
  /**
   * Load PDF Document from ArrayBuffer or Uint8Array safely across Web, Electron, and Android Capacitor
   */
  async loadDocument(data: ArrayBuffer | Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
    // Clone data to avoid detaching original buffer from caller
    const copy = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));

    // If in-memory fallback was already triggered in this session, parse directly in-memory
    if (isInMemoryFallbackActive) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerPort = null;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      } catch {}
      const directTask = pdfjsLib.getDocument({
        data: copy,
        useSystemFonts: true,
        cMapPacked: true,
      });
      return await directTask.promise;
    }

    try {
      const loadingTask = pdfjsLib.getDocument({
        data: copy,
        useSystemFonts: true,
        cMapPacked: true,
      });

      // Race with 3500ms timeout in case Web Worker hangs in Android WebView
      return await Promise.race([
        loadingTask.promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => {
            try {
              loadingTask.destroy();
            } catch {}
            reject(new Error('PDF Worker initialization timeout'));
          }, 3500)
        ),
      ]);
    } catch (err) {
      console.warn('PDF load attempt 1 failed or timed out, switching to safe in-memory mode:', err);
      isInMemoryFallbackActive = true;
      try {
        pdfjsLib.GlobalWorkerOptions.workerPort = null;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      } catch {}

      const copy2 = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0));
      const fallbackTask = pdfjsLib.getDocument({
        data: copy2,
        useSystemFonts: true,
        cMapPacked: true,
      });
      return await fallbackTask.promise;
    }
  }

  /**
   * Render page directly onto a HTML canvas element safely
   */
  async renderPageToCanvas(
    doc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale = 1.5
  ): Promise<void> {
    if (pageNum < 1 || pageNum > doc.numPages) return;

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      });

      await renderTask.promise;
    } catch (err) {
      if ((err as { name?: string })?.name === 'RenderingCancelledException') {
        return;
      }
      console.warn(`Render page ${pageNum} warning:`, err);
    }
  }

  /**
   * Render a page to high-res data URL (JPEG/PNG)
   */
  async renderPageToDataUrl(
    doc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    scale = 1.6
  ): Promise<string> {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  /**
   * Generate cover thumbnail from Page 1
   */
  async generateCoverThumbnail(doc: pdfjsLib.PDFDocumentProxy): Promise<string> {
    try {
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.6 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      await page.render({
        canvasContext: ctx,
        viewport,
        canvas: canvas,
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      return '';
    }
  }

  /**
   * Extract structured, formatted book text from page for Demo-style reading
   */
  async extractPageText(doc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> {
    try {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();
      if (!textContent || !textContent.items || textContent.items.length === 0) {
        return '';
      }

      interface LineItem {
        str: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }

      const rawItems: LineItem[] = [];
      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          const trans = item.transform;
          const x = trans[4];
          const y = trans[5];
          const itemH = ('height' in item && typeof item.height === 'number' && item.height > 0)
            ? item.height
            : Math.abs(trans[0]) || Math.abs(trans[3]) || 12;
          const itemW = ('width' in item && typeof item.width === 'number') ? item.width : 0;
          rawItems.push({
            str: item.str,
            x,
            y,
            width: itemW,
            height: itemH,
          });
        }
      }

      if (rawItems.length === 0) return '';

      // Group into lines based on Y coordinate tolerance
      const lines: { y: number; height: number; items: LineItem[] }[] = [];
      // Sort roughly by Y descending (top to bottom)
      rawItems.sort((a, b) => b.y - a.y);

      for (const item of rawItems) {
        const matchingLine = lines.find((l) => Math.abs(l.y - item.y) <= Math.max(4, item.height * 0.45));
        if (matchingLine) {
          matchingLine.items.push(item);
          matchingLine.height = Math.max(matchingLine.height, item.height);
        } else {
          lines.push({
            y: item.y,
            height: item.height,
            items: [item],
          });
        }
      }

      // Sort lines top to bottom
      lines.sort((a, b) => b.y - a.y);

      // Estimate average body font height
      const medianHeight = lines.length > 0 ? lines[Math.floor(lines.length / 2)].height : 12;

      let formattedText = '';
      let prevY: number | null = null;
      let prevHeight = medianHeight;

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        // Sort items in this line left to right
        line.items.sort((a, b) => a.x - b.x);
        
        let lineText = '';
        for (let i = 0; i < line.items.length; i++) {
          const cur = line.items[i];
          if (i > 0) {
            const prev = line.items[i - 1];
            const prevRight = prev.x + (prev.width || 0);
            const actualGap = cur.x - prevRight;

            // Space between words: in PDF.js, word spacing can be narrow (1.5px) or advance-width adjusted
            const minSpaceGap = Math.max(1.8, (prev.height || 12) * 0.18);

            // Special check: Never insert a space if the previous or current item is a diacritic/tone mark
            const isToneOrAccent = /^[`´'~^\u02CB\u02CA\u02DC]$/.test(cur.str.trim()) || /^[`´'~^\u02CB\u02CA\u02DC]$/.test(prev.str.trim());

            if (!isToneOrAccent && !lineText.endsWith(' ') && !cur.str.startsWith(' ') && actualGap >= minSpaceGap) {
              lineText += ' ';
            }
          }
          lineText += cur.str;
        }

        // Clean up Vietnamese diacritics, detached tone marks, and spacing
        lineText = cleanVietnameseDiacritics(lineText)
          .replace(/[ \t]+/g, ' ')
          .replace(/\s+([.,;:!?%])/g, '$1')
          .replace(/([([{“‘])\s+/g, '$1')
          .replace(/\s+([)\]}”’])/g, '$1')
          .trim();

        if (!lineText) continue;

        // Filter out lone header/footer page numbers that repeat in the PDF body
        const isLonePageNum =
          /^(trang\s*)?\d+$/i.test(lineText) || /^-\s*\d+\s*-$/.test(lineText);
        if (isLonePageNum && (lineIndex === 0 || lineIndex >= lines.length - 2)) {
          continue;
        }

        // Check if this line looks like a title/heading (significantly larger font or short uppercase line)
        const isHeading =
          line.height > medianHeight * 1.25 ||
          (lineText.length < 75 && /^(chương|phần|bài|mục|chapter|part)($|\s+|[:.])/iu.test(lineText));

        if (prevY !== null) {
          const gap = prevY - line.y;
          if (gap > prevHeight * 1.5 || isHeading) {
            formattedText += '\n\n';
          } else {
            formattedText += '\n';
          }
        }

        if (isHeading && !lineText.startsWith('#')) {
          formattedText += '## ' + lineText;
        } else {
          formattedText += lineText;
        }

        prevY = line.y;
        prevHeight = line.height;
      }

      return formattedText.trim();
    } catch (e) {
      console.warn(`[pdfParser] extractPageText warning on page ${pageNum}:`, e);
      return '';
    }
  }

  /**
   * Extract Table of Contents / Outline safely without hanging
   */
  async extractOutline(doc: pdfjsLib.PDFDocumentProxy): Promise<TocItem[]> {
    try {
      const outline = await Promise.race([
        doc.getOutline(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      if (!outline || outline.length === 0) return [];

      const result: TocItem[] = [];

      // Helper to process items recursively (up to 2 levels)
      const processItems = async (items: any[], depth = 0) => {
        if (depth > 2 || result.length >= 80) return;
        for (const item of items) {
          if (!item || !item.title) continue;
          let pageNum = 1;
          try {
            if (typeof item.dest === 'string') {
              const dest = await Promise.race([
                doc.getDestination(item.dest),
                new Promise<null>((r) => setTimeout(() => r(null), 500)),
              ]);
              if (dest && dest[0]) {
                const pageIndex = await Promise.race([
                  doc.getPageIndex(dest[0]),
                  new Promise<number>((r) => setTimeout(() => r(0), 500)),
                ]);
                pageNum = pageIndex + 1;
              }
            } else if (Array.isArray(item.dest) && item.dest[0]) {
              const pageIndex = await Promise.race([
                doc.getPageIndex(item.dest[0]),
                new Promise<number>((r) => setTimeout(() => r(0), 500)),
              ]);
              pageNum = pageIndex + 1;
            }
          } catch {
            // fallback to default page
          }

          result.push({
            title: `${'  '.repeat(depth)}${item.title}`,
            page: pageNum,
          });

          if (item.items && Array.isArray(item.items) && item.items.length > 0) {
            await processItems(item.items, depth + 1);
          }
        }
      };

      await processItems(outline, 0);
      return result;
    } catch {
      return [];
    }
  }
}

export const pdfParser = new PdfParser();
