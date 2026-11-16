export interface GenreDefinition {
  id: string;
  label: string;
  keywords: string[];
}

export const GENRE_LIST: GenreDefinition[] = [
  {
    id: 'van_hoc',
    label: 'Văn học & Tiểu thuyết',
    keywords: ['văn học', 'tiểu thuyết', 'truyện', 'tác phẩm', 'truyện ngắn', 'literature', 'novel', 'fiction', 'cổ tích'],
  },
  {
    id: 'triet_hoc',
    label: 'Triết học & Tư tưởng',
    keywords: ['triết học', 'triết lý', 'tư tưởng', 'đạo đức', 'nhân sinh', 'luận đề', 'philosophy', 'ethics', 'khổng tử', 'lão tử'],
  },
  {
    id: 'lich_su',
    label: 'Lịch sử & Nhân vật',
    keywords: ['lịch sử', 'sử ký', 'đại việt', 'chiến tranh', 'sử học', 'danh nhân', 'history', 'chronicle', 'historical'],
  },
  {
    id: 'khoa_hoc',
    label: 'Khoa học & Công nghệ',
    keywords: ['khoa học', 'vật lý', 'vật lí', 'toán học', 'hóa học', 'thiên văn', 'vũ trụ', 'sinh học', 'công nghệ', 'science', 'physics'],
  },
  {
    id: 'tam_ly',
    label: 'Tâm lý & Kỹ năng sống',
    keywords: ['tâm lý', 'kỹ năng', 'tự học', 'giao tiếp', 'tư duy', 'phát triển bản thân', 'đắc nhân tâm', 'psychology', 'self-help'],
  },
  {
    id: 'tho_ca',
    label: 'Thơ ca & Ca dao',
    keywords: ['thơ', 'thi tập', 'tập thơ', 'ca dao', 'lục bát', 'thơ ca', 'poetry', 'poem', 'verse'],
  },
  {
    id: 'phieu_luu',
    label: 'Phiêu lưu & Trinh thám',
    keywords: ['phiêu lưu', 'trinh thám', 'thám tử', 'kiếm hiệp', 'vụ án', 'ly kỳ', 'sherlock', 'adventure', 'detective', 'mystery'],
  },
  {
    id: 'kinh_te',
    label: 'Kinh tế & Quản trị',
    keywords: ['kinh tế', 'kinh doanh', 'tài chính', 'quản trị', 'đầu tư', 'marketing', 'economics', 'business'],
  },
  {
    id: 'khac',
    label: 'Tài liệu cá nhân',
    keywords: ['tài liệu', 'giáo trình', 'bài giảng', 'ghi chép', 'personal', 'document'],
  },
];

/**
 * Infer book genre based on title and subjects
 */
export function inferGenre(title = '', subjects: string[] = []): string {
  const text = `${title} ${subjects.join(' ')}`.toLowerCase();

  for (const genre of GENRE_LIST) {
    if (genre.keywords.some((kw) => text.includes(kw))) {
      return genre.label;
    }
  }

  return 'Văn học & Tiểu thuyết';
}
