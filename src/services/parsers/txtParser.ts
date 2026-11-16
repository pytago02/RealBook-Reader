export class TxtParser {
  /**
   * Split plain text / markdown into book-sized pages
   */
  parseText(content: string, wordsPerPage = 320): { title: string; pages: string[] } {
    const lines = content.split('\n');
    let title = 'Tài liệu không tên';

    // Try finding title from first few lines
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim().replace(/^#+\s*/, '');
      if (trimmed.length > 2 && trimmed.length < 80) {
        title = trimmed;
        break;
      }
    }

    const paragraphs = content.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPage = '';
    let currentWords = 0;

    for (const para of paragraphs) {
      const cleanPara = para.trim();
      if (!cleanPara) continue;

      const words = cleanPara.split(/\s+/).length;
      if (currentWords + words > wordsPerPage && currentPage.length > 0) {
        pages.push(currentPage.trim());
        currentPage = cleanPara + '\n\n';
        currentWords = words;
      } else {
        currentPage += cleanPara + '\n\n';
        currentWords += words;
      }
    }

    if (currentPage.trim().length > 0) {
      pages.push(currentPage.trim());
    }

    return {
      title,
      pages: pages.length > 0 ? pages : [content],
    };
  }
}

export const txtParser = new TxtParser();
