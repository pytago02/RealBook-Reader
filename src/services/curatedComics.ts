import type { OnlineBook } from './freeBooksApi';
import { SAMPLE_COMIC_PAGES } from './sampleComic';

export const CURATED_ONLINE_COMICS: OnlineBook[] = [
  {
    id: 'comic-curated-vu-tru-1',
    title: 'Hành Tinh Bí Ẩn (Tập 1)',
    author: 'RealBook Studio',
    language: 'vi',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    downloadCount: 38900,
    subjects: ['Truyện tranh', 'Manga', 'Khoa học viễn tưởng', 'Màu sắc'],
    description:
      'Chuyến thám hiểm siêu không gian của phi thuyền Nova 1 đến hành tinh pha lê kỳ bí và cuộc gặp gỡ tiểu tinh linh Lumina.',
    source: 'curated',
    coverUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SAMPLE_COMIC_PAGES[0]),
    comicPages: SAMPLE_COMIC_PAGES,
  },
  {
    id: 'comic-curated-sam-max',
    title: "Sam & Max: Surfin' The Highway",
    author: 'Steve Purcell',
    language: 'en',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    archiveId: 'sammaxsurfinthehighway',
    downloadCount: 84200,
    subjects: ['Comics', 'Humor', 'Adventure', 'Internet Archive'],
    description:
      'Bộ truyện tranh hài hước và phiêu lưu kinh điển thế giới về cặp đôi thám tử cảnh sát tự do Sam & Max.',
    source: 'archive',
    coverUrl: 'https://archive.org/services/img/sammaxsurfinthehighway',
  },
  {
    id: 'comic-curated-invincible',
    title: 'Invincible: Khởi Đầu Siêu Anh Hùng',
    author: 'Robert Kirkman',
    language: 'en',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    archiveId: '20210523_20210523_0901',
    downloadCount: 716000,
    subjects: ['Comics', 'Superhero', 'Action', 'Internet Archive'],
    description:
      'Bộ truyện tranh siêu anh hùng kịch tính bậc nhất thế giới với những trận chiến bảo vệ Trái Đất ngoạn mục.',
    source: 'archive',
    coverUrl: 'https://archive.org/services/img/20210523_20210523_0901',
  },
  {
    id: 'comic-curated-doraemon',
    title: 'Doraemon: Chú Mèo Máy Đến Từ Tương Lai',
    author: 'Fujiko F. Fujio',
    language: 'vi',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    downloadCount: 154200,
    subjects: ['Truyện tranh', 'Manga', 'Thiếu nhi', 'Bảo bối'],
    description:
      'Bộ truyện tranh kinh điển gắn liền với tuổi thơ: Chú mèo máy thông minh Doraemon cùng Nobita và những bảo bối kỳ diệu.',
    source: 'curated',
    coverUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'comic-curated-conan',
    title: 'Thám Tử Lừng Danh Conan: Kỳ Án Tàu Lượn',
    author: 'Gosho Aoyama',
    language: 'vi',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    downloadCount: 128900,
    subjects: ['Truyện tranh', 'Manga', 'Trinh thám', 'Phá án'],
    description:
      'Vụ án đầu tiên mở ra huyền thoại thám tử học sinh Kudo Shinichi bị teo nhỏ thành Conan Edogawa.',
    source: 'curated',
    coverUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'comic-curated-onepiece',
    title: 'One Piece: Bình Minh Cuộc Phiêu Lưu',
    author: 'Eiichiro Oda',
    language: 'vi',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    downloadCount: 198000,
    subjects: ['Truyện tranh', 'Manga', 'Phiêu lưu', 'Hải tặc'],
    description:
      'Khởi đầu chuyến hải trình vĩ đại tìm kiếm kho báu One Piece của Monkey D. Luffy và đồng đội.',
    source: 'curated',
    coverUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'comic-curated-de-men',
    title: 'Dế Mèn Phiêu Lưu Ký (Truyện tranh màu)',
    author: 'Tô Hoài',
    language: 'vi',
    genre: 'Truyện tranh & Manga',
    format: 'cbz',
    isComic: true,
    downloadCount: 65400,
    subjects: ['Truyện tranh', 'Văn học Việt Nam', 'Thiếu nhi', 'Bài học đường đời'],
    description:
      'Kiệt tác văn học thiếu nhi Việt Nam được chuyển thể thành truyện tranh màu với bài học đường đời đầu tiên đầy ý nghĩa.',
    source: 'curated',
    coverUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
];
