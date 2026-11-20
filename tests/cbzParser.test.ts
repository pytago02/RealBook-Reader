import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { cbzParser } from '../src/services/parsers/cbzParser';

describe('CbzParser', () => {
  it('detects comic zip files accurately with isComicZip', async () => {
    // 1. Create a zip with images
    const zipWithImages = new JSZip();
    zipWithImages.file('page01.jpg', 'fake-image-bytes-1');
    zipWithImages.file('page02.png', 'fake-image-bytes-2');
    const comicBuffer = await zipWithImages.generateAsync({ type: 'arraybuffer' });

    expect(await cbzParser.isComicZip(comicBuffer)).toBe(true);

    // 2. Create a zip with non-image files
    const zipWithoutImages = new JSZip();
    zipWithoutImages.file('notes.txt', 'some text');
    zipWithoutImages.file('data.json', '{}');
    const nonComicBuffer = await zipWithoutImages.generateAsync({ type: 'arraybuffer' });

    expect(await cbzParser.isComicZip(nonComicBuffer)).toBe(false);

    // 3. Corrupt buffer
    const corruptBuffer = new ArrayBuffer(10);
    expect(await cbzParser.isComicZip(corruptBuffer)).toBe(false);
  });

  it('parses comic zip, orders pages with natural alphanumeric sort and generates data URLs', async () => {
    const zip = new JSZip();
    // Intentionally add out-of-order filenames
    zip.file('page10.jpg', 'img10');
    zip.file('page1.jpg', 'img1');
    zip.file('page2.jpg', 'img2');
    zip.file('__MACOSX/._page1.jpg', 'apple-junk'); // should be ignored

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await cbzParser.parseCbz(buffer, 'Doraemon_Tap_1.cbz');

    expect(result.title).toBe('Doraemon_Tap_1');
    expect(result.totalPages).toBe(3);
    expect(result.pages.length).toBe(3);
    // Page 1 should be first, then page 2, then page 10
    expect(result.pages[0]).toContain('data:image/jpeg;base64,');
    expect(result.coverUrl).toBe(result.pages[0]);
  });

  it('extracts ComicInfo.xml metadata if present', async () => {
    const zip = new JSZip();
    zip.file('001.png', 'img-data');
    zip.file(
      'ComicInfo.xml',
      `<?xml version="1.0"?>
      <ComicInfo>
        <Title>One Piece Tập 100</Title>
        <Writer>Eiichiro Oda</Writer>
      </ComicInfo>`
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const result = await cbzParser.parseCbz(buffer, 'op100.cbz');

    expect(result.title).toBe('One Piece Tập 100');
    expect(result.author).toBe('Eiichiro Oda');
    expect(result.totalPages).toBe(1);
  });

  it('throws an error if zip contains no images', async () => {
    const zip = new JSZip();
    zip.file('document.txt', 'hello');
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    await expect(cbzParser.parseCbz(buffer, 'empty.cbz')).rejects.toThrow(
      'Tệp không chứa bất kỳ hình ảnh truyện tranh nào'
    );
  });
});
