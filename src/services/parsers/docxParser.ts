import mammoth from 'mammoth';

export class DocxParser {
  /**
   * Convert docx arrayBuffer to clean HTML and text
   */
  async parseDocx(data: ArrayBuffer): Promise<{ html: string; text: string; pages: string[] }> {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: data });
      const rawText = await mammoth.extractRawText({ arrayBuffer: data });
      
      const html = result.value;
      const text = rawText.value;

      // Split into logical pages (~400 words per page for comfortable book layout)
      const paragraphs = text.split(/\n\s*\n/);
      const pages: string[] = [];
      let currentPage = '';
      let currentWordCount = 0;

      for (const p of paragraphs) {
        const words = p.trim().split(/\s+/).length;
        if (currentWordCount + words > 350 && currentPage.length > 0) {
          pages.push(currentPage.trim());
          currentPage = p + '\n\n';
          currentWordCount = words;
        } else {
          currentPage += p + '\n\n';
          currentWordCount += words;
        }
      }

      if (currentPage.trim().length > 0) {
        pages.push(currentPage.trim());
      }

      return {
        html,
        text,
        pages: pages.length > 0 ? pages : [text],
      };
    } catch (e) {
      console.error('Error parsing docx:', e);
      throw e;
    }
  }
}

export const docxParser = new DocxParser();
