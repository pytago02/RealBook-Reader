import JSZip from 'jszip';

export interface CbzParseResult {
  title: string;
  author: string;
  totalPages: number;
  pages: string[];
  coverUrl?: string;
}

export class CbzParser {
  private static readonly IMAGE_REGEX = /\.(jpe?g|png|webp|avif|gif|svg|bmp)$/i;

  /**
   * Check if an ArrayBuffer contains a valid zip/cbz archive with images
   */
  async isComicZip(buffer: ArrayBuffer): Promise<boolean> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      for (const relativePath of Object.keys(zip.files)) {
        if (relativePath.includes('__MACOSX') || relativePath.startsWith('.')) continue;
        if (CbzParser.IMAGE_REGEX.test(relativePath)) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Parse a CBZ or ZIP archive into an ordered array of page images
   */
  async parseCbz(buffer: ArrayBuffer, fileName = ''): Promise<CbzParseResult> {
    const zip = await JSZip.loadAsync(buffer);
    const imageEntries: { name: string; file: JSZip.JSZipObject }[] = [];
    let comicInfoXml: string | null = null;

    for (const [relativePath, file] of Object.entries(zip.files)) {
      if (file.dir) continue;
      // Skip system and hidden files
      if (
        relativePath.includes('__MACOSX') ||
        relativePath.includes('.DS_Store') ||
        relativePath.includes('Thumbs.db') ||
        relativePath.split('/').some((part) => part.startsWith('.'))
      ) {
        continue;
      }

      if (CbzParser.IMAGE_REGEX.test(relativePath)) {
        imageEntries.push({ name: relativePath, file });
      } else if (relativePath.toLowerCase().endsWith('comicinfo.xml')) {
        try {
          comicInfoXml = await file.async('text');
        } catch {}
      }
    }

    if (imageEntries.length === 0) {
      throw new Error('Tệp không chứa bất kỳ hình ảnh truyện tranh nào (.jpg, .png, .webp, v.v.).');
    }

    // Natural alphanumeric sort so "page1.jpg, page2.jpg, ... page10.jpg" are in natural sequence
    imageEntries.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    // Extract pages as Base64 data URLs
    const pages: string[] = [];
    for (const entry of imageEntries) {
      const ext = entry.name.split('.').pop()?.toLowerCase() || 'jpg';
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'avif') mimeType = 'image/avif';
      else if (ext === 'gif') mimeType = 'image/gif';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      else if (ext === 'bmp') mimeType = 'image/bmp';

      const base64 = await entry.file.async('base64');
      pages.push(`data:${mimeType};base64,${base64}`);
    }

    // Metadata extraction
    let title = fileName.replace(/\.[^/.]+$/, '').trim() || 'Truyện tranh';
    let author = 'Truyện tranh';

    if (comicInfoXml) {
      try {
        const titleMatch = comicInfoXml.match(/<Title>(.*?)<\/Title>/i);
        if (titleMatch && titleMatch[1].trim()) {
          title = titleMatch[1].trim();
        }
        const writerMatch = comicInfoXml.match(/<Writer>(.*?)<\/Writer>/i);
        if (writerMatch && writerMatch[1].trim()) {
          author = writerMatch[1].trim();
        }
      } catch {}
    }

    const coverUrl = pages.length > 0 ? pages[0] : undefined;

    return {
      title,
      author,
      totalPages: pages.length,
      pages,
      coverUrl,
    };
  }
}

export const cbzParser = new CbzParser();
