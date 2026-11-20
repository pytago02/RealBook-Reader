import { describe, it, expect } from 'vitest';
import { GENRE_LIST, inferGenre, type GenreDefinition } from '../src/utils/genre';

describe('genre utility & inference', () => {
  it('defines 10 unique genres with proper IDs and non-empty keywords', () => {
    expect(GENRE_LIST.length).toBe(10);
    const ids = new Set<string>();
    GENRE_LIST.forEach((g: GenreDefinition) => {
      expect(g.id).toBeTruthy();
      expect(g.label).toBeTruthy();
      expect(g.keywords.length).toBeGreaterThan(0);
      expect(ids.has(g.id)).toBe(false);
      ids.add(g.id);
    });
  });

  describe('inferGenre matching rules', () => {
    it('infers "Văn học & Tiểu thuyết" for literature keywords', () => {
      expect(inferGenre('Truyện Kiều')).toBe('Văn học & Tiểu thuyết');
      expect(inferGenre('Tuyển tập truyện ngắn Nam Cao')).toBe('Văn học & Tiểu thuyết');
      expect(inferGenre('The Great Novel', ['classic fiction'])).toBe('Văn học & Tiểu thuyết');
      expect(inferGenre('Truyện cổ tích Việt Nam')).toBe('Văn học & Tiểu thuyết');
    });

    it('infers "Triết học & Tư tưởng" for philosophy keywords', () => {
      expect(inferGenre('Luận về triết học phương Đông')).toBe('Triết học & Tư tưởng');
      expect(inferGenre('Đạo Đức Kinh - Lão Tử')).toBe('Triết học & Tư tưởng');
      expect(inferGenre('Tư tưởng Khổng Tử trong thời đại mới')).toBe('Triết học & Tư tưởng');
      expect(inferGenre('Ethics and Human Nature', ['philosophy'])).toBe('Triết học & Tư tưởng');
    });

    it('infers "Lịch sử & Nhân vật" for history keywords', () => {
      expect(inferGenre('Đại Việt Sử Ký Toàn Thư')).toBe('Lịch sử & Nhân vật');
      expect(inferGenre('Lịch sử các triều đại phong kiến')).toBe('Lịch sử & Nhân vật');
      expect(inferGenre('Chiến tranh thế giới thứ hai')).toBe('Lịch sử & Nhân vật');
      expect(inferGenre('World Chronicles', ['historical records'])).toBe('Lịch sử & Nhân vật');
    });

    it('infers "Khoa học & Công nghệ" for science keywords', () => {
      expect(inferGenre('Vũ trụ trong vỏ hạt dẻ')).toBe('Khoa học & Công nghệ');
      expect(inferGenre('Cơ học lượng tử và Vật lý hiện đại')).toBe('Khoa học & Công nghệ');
      expect(inferGenre('Đại số tuyến tính và Toán học cao cấp')).toBe('Khoa học & Công nghệ');
      expect(inferGenre('Introduction to Science and Technology')).toBe('Khoa học & Công nghệ');
    });

    it('infers "Tâm lý & Kỹ năng sống" for psychology and self-help', () => {
      expect(inferGenre('Đắc Nhân Tâm')).toBe('Tâm lý & Kỹ năng sống');
      expect(inferGenre('Tâm lý học đám đông')).toBe('Tâm lý & Kỹ năng sống');
      expect(inferGenre('Kỹ năng tự học và phát triển bản thân')).toBe('Tâm lý & Kỹ năng sống');
      expect(inferGenre('The Power of Habit', ['self-help'])).toBe('Tâm lý & Kỹ năng sống');
    });

    it('infers "Thơ ca & Ca dao" for poetry', () => {
      expect(inferGenre('Thi tập Hồ Xuân Hương')).toBe('Thơ ca & Ca dao');
      expect(inferGenre('Tuyển tập thơ ca lãng mạn')).toBe('Thơ ca & Ca dao');
      expect(inferGenre('Ca dao tục ngữ Việt Nam')).toBe('Thơ ca & Ca dao');
      expect(inferGenre('Selected Poems of Robert Frost', ['verse'])).toBe('Thơ ca & Ca dao');
    });

    it('infers "Phiêu lưu & Trinh thám" for adventure & mystery', () => {
      expect(inferGenre('Sherlock Holmes toàn tập')).toBe('Phiêu lưu & Trinh thám');
      expect(inferGenre('Thám tử lừng danh Conan')).toBe('Phiêu lưu & Trinh thám');
      expect(inferGenre('Những cuộc phiêu lưu của Tom Sawyer')).toBe('Phiêu lưu & Trinh thám');
      expect(inferGenre('Vụ án mạng trên chuyến tàu')).toBe('Phiêu lưu & Trinh thám');
    });

    it('infers "Truyện tranh & Manga" for comic and manga keywords', () => {
      expect(inferGenre('Doraemon tập 1')).toBe('Truyện tranh & Manga');
      expect(inferGenre('Tuyển tập truyện tranh One Piece')).toBe('Truyện tranh & Manga');
      expect(inferGenre('Dragon Ball Super', ['manga'])).toBe('Truyện tranh & Manga');
      expect(inferGenre('Amazing Webtoon Comics', ['comic'])).toBe('Truyện tranh & Manga');
      expect(inferGenre('Tập truyện tranh Doraemon & Những người bạn')).toBe('Truyện tranh & Manga');
    });

    it('infers "Kinh tế & Quản trị" for economics & business', () => {
      expect(inferGenre('Kinh tế học vi mô')).toBe('Kinh tế & Quản trị');
      expect(inferGenre('Nghệ thuật quản trị kinh doanh')).toBe('Kinh tế & Quản trị');
      expect(inferGenre('Thị trường tài chính và chứng khoán')).toBe('Kinh tế & Quản trị');
      expect(inferGenre('Global Business Markets', ['economics'])).toBe('Kinh tế & Quản trị');
    });

    it('infers "Tài liệu cá nhân" for personal docs & textbooks', () => {
      expect(inferGenre('Giáo trình giải tích đại cương')).toBe('Tài liệu cá nhân');
      expect(inferGenre('Tài liệu hướng dẫn sử dụng')).toBe('Tài liệu cá nhân');
      expect(inferGenre('Bài giảng chuyên đề')).toBe('Tài liệu cá nhân');
      expect(inferGenre('Ghi chép và tài liệu hội thảo')).toBe('Tài liệu cá nhân');
    });

    it('falls back to "Văn học & Tiểu thuyết" for unknown or empty input', () => {
      expect(inferGenre('')).toBe('Văn học & Tiểu thuyết');
      expect(inferGenre('XYZ123 random non-matching title')).toBe('Văn học & Tiểu thuyết');
      expect(inferGenre(undefined, undefined)).toBe('Văn học & Tiểu thuyết');
    });

    it('matches keywords case-insensitively and through subjects array', () => {
      expect(inferGenre('BOOK TITLE IN ALL CAPS', ['DETECTIVE', 'MYSTERY'])).toBe('Phiêu lưu & Trinh thám');
      expect(inferGenre('Untitled doc', ['PHYSICS', 'QUANTUM'])).toBe('Khoa học & Công nghệ');
    });
  });
});
