import type { AppLanguage } from '../types';

export interface LanguageOption {
  code: AppLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'Tiếng Anh', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Tiếng Trung', nativeName: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Tiếng Pháp', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Tiếng Tây Ban Nha', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: 'Tiếng Nhật', nativeName: '日本語', flag: '🇯🇵' },
];

export interface TranslationDictionary {
  common: {
    appName: string;
    systemLanguage: string;
    close: string;
    confirm: string;
    cancel: string;
    delete: string;
    save: string;
    reset: string;
    loading: string;
  };
  header: {
    taglineShelf: string;
    taglineOnline: string;
    badgeShelf: string;
    badgeOnline: string;
    tabShelf: string;
    tabOnline: string;
    searchShelfPlaceholder: string;
    searchOnlinePlaceholder: string;
    openFile: string;
    searchButton: string;
  };
  shelf: {
    bannerTitle: string;
    bannerDesc: string;
    exploreOnline: string;
    demoSample: string;
    emptyTitle: string;
    emptyDesc: string;
    pagesCount: string;
    pageProgress: string;
    deleteConfirm: string;
    deleteTooltip: string;
    dragDropOverlay: string;
    dragDropSub: string;
    unknownAuthor: string;
  };
  online: {
    categoryHeading: string;
    totalBooksCount: string;
    languageFilterLabel: string;
    allLanguages: string;
    publicDomainNotice: string;
    fetchingTitle: string;
    fetchingSubtitle: string;
    noBooksTitle: string;
    noBooksSubtitle: string;
    readAndDownload: string;
    downloading: string;
    alreadyInShelf: string;
    freeEdition: string;
    loadingMore: string;
    endOfList: string;
    searchResultsFor: string;
    categories: {
      recommended: string;
      vietnamese: string;
      world_classics: string;
      all: string;
      philosophy: string;
      history: string;
      science: string;
      adventure: string;
      psychology: string;
      poetry: string;
    };
  };
  reader: {
    backToLibrary: string;
    prevPage: string;
    nextPage: string;
    pageIndicator: string;
    bookmarkPage: string;
    bookmarked: string;
    viewerMode3D: string;
    viewerModeScroll: string;
    spreadDouble: string;
    spreadSingle: string;
    pdfModeBook: string;
    pdfModeScan: string;
    themeComfort: string;
    typography: string;
    tocBookmarks: string;
    soundOn: string;
    soundOff: string;
    fullscreen: string;
    exitFullscreen: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
  };
  comfortModal: {
    title: string;
    toneHeading: string;
    sepia: string;
    warm: string;
    white: string;
    eink: string;
    dark: string;
    brightness: string;
    contrast: string;
    resetDefault: string;
  };
  typographyModal: {
    title: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    letterSpacing: string;
    alignment: string;
    alignJustify: string;
    alignLeft: string;
  };
  tocModal: {
    title: string;
    tabToc: string;
    tabBookmarks: string;
    noToc: string;
    noBookmarks: string;
    clickToJump: string;
    pagePrefix: string;
    deleteBookmark: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  vi: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: 'Ngôn ngữ hệ thống',
      close: 'Đóng',
      confirm: 'Xác nhận',
      cancel: 'Hủy',
      delete: 'Xóa',
      save: 'Lưu',
      reset: 'Mặc định',
      loading: 'Đang tải...',
    },
    header: {
      taglineShelf: 'Tủ sách của bạn • Đọc ngoại tuyến',
      taglineOnline: 'Kết nối 70.000+ tác phẩm',
      badgeShelf: 'Kệ Sách Cá Nhân',
      badgeOnline: 'Kho Sách Trực Tuyến',
      tabShelf: 'Sách của tôi ({count})',
      tabOnline: 'Kho sách Online',
      searchShelfPlaceholder: 'Tìm trong kệ sách...',
      searchOnlinePlaceholder: 'Tìm sách trong kho 70.000+ cuốn...',
      openFile: 'Mở file từ máy',
      searchButton: 'Tìm sách',
    },
    shelf: {
      bannerTitle: 'Kệ sách của bạn ({count} cuốn)',
      bannerDesc: 'Hỗ trợ đầy đủ định dạng PDF, DOCX, TXT. Lật trang 3D chân thực, tự động lưu tiến trình và bảo vệ mắt với 5 bộ theme ngả vàng, E-ink.',
      exploreOnline: 'Khám phá kho sách Online',
      demoSample: 'Sách mẫu demo',
      emptyTitle: 'Không tìm thấy sách phù hợp',
      emptyDesc: 'Hãy kéo thả file PDF hoặc bấm nút "Mở file từ máy", hoặc chuyển qua tab "Kho sách Online" để tải sách miễn phí nhé.',
      pagesCount: '{count} trang',
      pageProgress: 'Trang {current}/{total}',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa "{title}" khỏi thư viện?',
      deleteTooltip: 'Xóa sách này',
      dragDropOverlay: 'Thả file PDF, DOCX, TXT vào đây',
      dragDropSub: 'Hệ thống sẽ tự động thêm vào thư viện và lưu trữ ngoại tuyến',
      unknownAuthor: 'Tác giả không rõ',
    },
    online: {
      categoryHeading: 'Danh mục sách',
      totalBooksCount: '{count} cuốn',
      languageFilterLabel: 'Ngôn ngữ sách',
      allLanguages: 'Tất cả ngôn ngữ',
      publicDomainNotice: 'Nguồn sách thuộc phạm vi công cộng quốc tế (Public Domain) từ Project Gutenberg.',
      fetchingTitle: 'Đang truy vấn kho sách Project Gutenberg...',
      fetchingSubtitle: 'Đang tải danh sách tác phẩm chất lượng cao',
      noBooksTitle: 'Không tìm thấy tác phẩm',
      noBooksSubtitle: 'Hãy thử tìm từ khóa khác hoặc chuyển danh mục ở cột bên trái.',
      readAndDownload: 'Tải & Đọc miễn phí',
      downloading: 'Đang nạp sách...',
      alreadyInShelf: 'Đã có trên kệ - Mở đọc',
      freeEdition: 'Bản miễn phí',
      loadingMore: 'Đang tải thêm sách từ Project Gutenberg...',
      endOfList: '(Đã tải hết danh sách tác phẩm trong danh mục này)',
      searchResultsFor: 'Kết quả tìm kiếm: "{query}"',
      categories: {
        recommended: 'Đề cử cho bạn',
        vietnamese: 'Văn học Việt Nam',
        world_classics: 'Kinh điển thế giới',
        all: 'Phổ biến nhất',
        philosophy: 'Triết học & Tư tưởng',
        history: 'Lịch sử thế giới',
        science: 'Khoa học & Tự nhiên',
        adventure: 'Trinh thám & Phiêu lưu',
        psychology: 'Tâm lý & Xã hội',
        poetry: 'Thơ ca & Kịch nghệ',
      },
    },
    reader: {
      backToLibrary: 'Quay lại Thư viện',
      prevPage: 'Trang trước',
      nextPage: 'Trang sau',
      pageIndicator: 'Trang {current} / {total}',
      bookmarkPage: 'Đánh dấu trang này',
      bookmarked: 'Đã đánh dấu trang',
      viewerMode3D: 'Chuyển sang đọc cuộn dọc (Reflow)',
      viewerModeScroll: 'Chuyển sang lật trang 3D (Realistic)',
      spreadDouble: 'Xem trang đôi',
      spreadSingle: 'Xem trang đơn',
      pdfModeBook: 'Chế độ dàn trang sách đẹp',
      pdfModeScan: 'Chế độ trang quét gốc',
      themeComfort: 'Giao diện & Bảo vệ mắt',
      typography: 'Phông chữ & Định dạng',
      tocBookmarks: 'Mục lục & Dấu trang',
      soundOn: 'Tắt âm thanh lật sách',
      soundOff: 'Bật âm thanh lật sách',
      fullscreen: 'Toàn màn hình',
      exitFullscreen: 'Thoát toàn màn hình',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      resetZoom: 'Thu phóng mặc định',
    },
    comfortModal: {
      title: 'Giao diện & Bảo vệ mắt',
      toneHeading: 'Tông màu trang sách',
      sepia: 'Vàng Cổ Điển',
      warm: 'Vàng Dịu Mắt',
      white: 'Giấy Trắng',
      eink: 'Mực E-ink',
      dark: 'Ban Đêm',
      brightness: 'Độ sáng',
      contrast: 'Độ tương phản',
      resetDefault: 'Khôi phục mặc định',
    },
    typographyModal: {
      title: 'Phông chữ & Định dạng',
      fontFamily: 'Kiểu chữ',
      fontSize: 'Cỡ chữ',
      lineHeight: 'Khoảng cách dòng',
      letterSpacing: 'Khoảng cách chữ',
      alignment: 'Căn lề',
      alignJustify: 'Căn đều hai bên',
      alignLeft: 'Căn lề trái',
    },
    tocModal: {
      title: 'Mục lục & Dấu trang',
      tabToc: 'Mục lục',
      tabBookmarks: 'Dấu trang ({count})',
      noToc: 'Tác phẩm này không có mục lục tự động.',
      noBookmarks: 'Chưa có trang nào được đánh dấu.',
      clickToJump: 'Bấm để chuyển nhanh đến trang',
      pagePrefix: 'Trang',
      deleteBookmark: 'Xóa dấu trang',
    },
  },

  en: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: 'System Language',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      reset: 'Reset',
      loading: 'Loading...',
    },
    header: {
      taglineShelf: 'Your personal bookshelf ({count} books) • Offline reading ready',
      taglineOnline: 'Connected to 70,000+ Project Gutenberg & World Classics for free',
      badgeShelf: 'Personal Shelf',
      badgeOnline: 'Online Store',
      tabShelf: 'My Bookshelf ({count})',
      tabOnline: 'Free Online Library',
      searchShelfPlaceholder: 'Search bookshelf...',
      searchOnlinePlaceholder: 'Search 70,000+ books...',
      openFile: 'Open local file',
      searchButton: 'Search',
    },
    shelf: {
      bannerTitle: 'Your Bookshelf ({count} books)',
      bannerDesc: 'Supports PDF, DOCX, and TXT files. Realistic 3D page flip, progress auto-saving, and 5 eye-friendly reading themes.',
      exploreOnline: 'Explore Online Library',
      demoSample: 'Demo book',
      emptyTitle: 'No books found',
      emptyDesc: 'Drop PDF files here, click "Open local file", or browse the Online Library to download free masterpieces.',
      pagesCount: '{count} pages',
      pageProgress: 'Page {current}/{total}',
      deleteConfirm: 'Are you sure you want to delete "{title}" from your library?',
      deleteTooltip: 'Delete book',
      dragDropOverlay: 'Drop PDF, DOCX, TXT files here',
      dragDropSub: 'Files will be saved into your offline library',
      unknownAuthor: 'Unknown Author',
    },
    online: {
      categoryHeading: 'Categories',
      totalBooksCount: '{count} books',
      languageFilterLabel: 'Book Language',
      allLanguages: 'All Languages',
      publicDomainNotice: 'Public Domain classics powered by Project Gutenberg.',
      fetchingTitle: 'Fetching books from Project Gutenberg...',
      fetchingSubtitle: 'Loading high quality public domain editions',
      noBooksTitle: 'No books found',
      noBooksSubtitle: 'Try a different search query or select another category from the sidebar.',
      readAndDownload: 'Download & Read Free',
      downloading: 'Loading book...',
      alreadyInShelf: 'In Library - Open',
      freeEdition: 'Free Edition',
      loadingMore: 'Loading more books from Gutenberg...',
      endOfList: '(All books in this category loaded)',
      searchResultsFor: 'Search results for: "{query}"',
      categories: {
        recommended: 'Recommended for You',
        vietnamese: 'Vietnamese Literature',
        world_classics: 'World Classics',
        all: 'Most Popular',
        philosophy: 'Philosophy & Thought',
        history: 'World History',
        science: 'Science & Nature',
        adventure: 'Mystery & Adventure',
        psychology: 'Psychology & Society',
        poetry: 'Poetry & Drama',
      },
    },
    reader: {
      backToLibrary: 'Back to Library',
      prevPage: 'Previous Page',
      nextPage: 'Next Page',
      pageIndicator: 'Page {current} / {total}',
      bookmarkPage: 'Bookmark this page',
      bookmarked: 'Bookmarked',
      viewerMode3D: 'Switch to vertical scroll (Reflow)',
      viewerModeScroll: 'Switch to 3D page flip (Realistic)',
      spreadDouble: 'Double page spread',
      spreadSingle: 'Single page view',
      pdfModeBook: 'Book formatted view',
      pdfModeScan: 'Original scan view',
      themeComfort: 'Theme & Eye Comfort',
      typography: 'Typography & Layout',
      tocBookmarks: 'Contents & Bookmarks',
      soundOn: 'Mute page turning sound',
      soundOff: 'Enable page turning sound',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      resetZoom: 'Reset zoom',
    },
    comfortModal: {
      title: 'Theme & Eye Comfort',
      toneHeading: 'Page Paper Tone',
      sepia: 'Classic Sepia',
      warm: 'Soft Amber',
      white: 'Clean Paper',
      eink: 'E-ink Mono',
      dark: 'OLED Dark',
      brightness: 'Brightness',
      contrast: 'Contrast',
      resetDefault: 'Reset to Default',
    },
    typographyModal: {
      title: 'Typography & Layout',
      fontFamily: 'Font Family',
      fontSize: 'Font Size',
      lineHeight: 'Line Spacing',
      letterSpacing: 'Letter Spacing',
      alignment: 'Alignment',
      alignJustify: 'Justify',
      alignLeft: 'Align Left',
    },
    tocModal: {
      title: 'Table of Contents & Bookmarks',
      tabToc: 'Contents',
      tabBookmarks: 'Bookmarks ({count})',
      noToc: 'No table of contents detected for this book.',
      noBookmarks: 'No bookmarks added yet.',
      clickToJump: 'Click to navigate to page',
      pagePrefix: 'Page',
      deleteBookmark: 'Delete bookmark',
    },
  },

  zh: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: '系统语言',
      close: '关闭',
      confirm: '确认',
      cancel: '取消',
      delete: '删除',
      save: '保存',
      reset: '重置',
      loading: '加载中...',
    },
    header: {
      taglineShelf: '您的私人书架（{count} 本书）• 支持离线纯享阅读',
      taglineOnline: '接入 70,000+ 古登堡计划与全球经典公版巨著',
      badgeShelf: '个人书架',
      badgeOnline: '在线书库',
      tabShelf: '我的书架 ({count})',
      tabOnline: '免费在线书库',
      searchShelfPlaceholder: '在书架中搜索...',
      searchOnlinePlaceholder: '在7万余册公版书中搜索...',
      openFile: '打开本地文件',
      searchButton: '搜索图书',
    },
    shelf: {
      bannerTitle: '您的私人书架（{count} 本）',
      bannerDesc: '完美支持 PDF、DOCX、TXT 格式。逼真3D仿真翻页、自动记忆进度与5款专业护眼主题。',
      exploreOnline: '探索在线书库',
      demoSample: '示例典藏',
      emptyTitle: '未找到符合条件的图书',
      emptyDesc: '请拖拽文件至此，或点击“打开本地文件”，亦可前往“在线书库”免费下载传世名著。',
      pagesCount: '{count} 页',
      pageProgress: '第 {current}/{total} 页',
      deleteConfirm: '确定要从书架中移除《{title}》吗？',
      deleteTooltip: '删除本书',
      dragDropOverlay: '将 PDF、DOCX、TXT 文件拖放到此处',
      dragDropSub: '系统将自动收录并存入本地离线书库',
      unknownAuthor: '佚名',
    },
    online: {
      categoryHeading: '图书分类',
      totalBooksCount: '{count} 册',
      languageFilterLabel: '图书语言',
      allLanguages: '全部语言',
      publicDomainNotice: '书籍源自 Project Gutenberg 国际公版版权领域。',
      fetchingTitle: '正在检索 Project Gutenberg 书库...',
      fetchingSubtitle: '正在加载高质量典藏作品',
      noBooksTitle: '未检索到图书',
      noBooksSubtitle: '请尝试不同关键词，或在左侧切换分类浏览。',
      readAndDownload: '免费下载并阅读',
      downloading: '正在载入书籍...',
      alreadyInShelf: '已在书架 - 点击阅读',
      freeEdition: '公版免费',
      loadingMore: '正在加载更多公版图书...',
      endOfList: '(该分类下的作品已全部加载)',
      searchResultsFor: '搜索结果：“{query}”',
      categories: {
        recommended: '为您推荐',
        vietnamese: '越南文学精选',
        world_classics: '世界传世名著',
        all: '最受欢迎',
        philosophy: '哲学与思想',
        history: '世界历史',
        science: '科学与自然',
        adventure: '悬疑与冒险',
        psychology: '心理与社会',
        poetry: '诗歌与戏剧',
      },
    },
    reader: {
      backToLibrary: '返回书架',
      prevPage: '上一页',
      nextPage: '下一页',
      pageIndicator: '第 {current} / {total} 页',
      bookmarkPage: '书签标记',
      bookmarked: '已添加书签',
      viewerMode3D: '切换为垂直滚动模式',
      viewerModeScroll: '切换为3D翻页模式',
      spreadDouble: '双页并排',
      spreadSingle: '单页阅读',
      pdfModeBook: '精美排版重排模式',
      pdfModeScan: '原版扫描模式',
      themeComfort: '护眼与背景主题',
      typography: '字体与版式排版',
      tocBookmarks: '目录与书签',
      soundOn: '静音翻页声音',
      soundOff: '开启翻页声音',
      fullscreen: '进入全屏',
      exitFullscreen: '退出全屏',
      zoomIn: '放大页面',
      zoomOut: '缩小页面',
      resetZoom: '恢复默认缩放',
    },
    comfortModal: {
      title: '护眼配色与显示调节',
      toneHeading: '纸张底色',
      sepia: '古典羊皮纸',
      warm: '柔和暖黄',
      white: '纯净白纸',
      eink: '电纸墨水',
      dark: '极夜黑',
      brightness: '亮度调节',
      contrast: '对比度',
      resetDefault: '恢复默认值',
    },
    typographyModal: {
      title: '字体与阅读版式',
      fontFamily: '字体选择',
      fontSize: '字号大小',
      lineHeight: '行间距',
      letterSpacing: '字间距',
      alignment: '对齐方式',
      alignJustify: '两端对齐',
      alignLeft: '左对齐',
    },
    tocModal: {
      title: '目录与书签收藏',
      tabToc: '章节目录',
      tabBookmarks: '我的书签 ({count})',
      noToc: '此作品未检测到结构化目录。',
      noBookmarks: '暂未添加任何书签。',
      clickToJump: '点击快速跳转至对应页',
      pagePrefix: '第',
      deleteBookmark: '删除此书签',
    },
  },

  fr: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: 'Langue du système',
      close: 'Fermer',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      save: 'Enregistrer',
      reset: 'Réinitialiser',
      loading: 'Chargement...',
    },
    header: {
      taglineShelf: 'Votre bibliothèque personnelle ({count} livres) • Lecture hors-ligne',
      taglineOnline: 'Accès à plus de 70 000 chefs-d\'œuvre du Project Gutenberg',
      badgeShelf: 'Bibliothèque',
      badgeOnline: 'Librairie en ligne',
      tabShelf: 'Ma bibliothèque ({count})',
      tabOnline: 'Livres gratuits en ligne',
      searchShelfPlaceholder: 'Rechercher dans mes livres...',
      searchOnlinePlaceholder: 'Rechercher parmi 70 000+ livres...',
      openFile: 'Ouvrir un fichier',
      searchButton: 'Rechercher',
    },
    shelf: {
      bannerTitle: 'Votre bibliothèque ({count} livres)',
      bannerDesc: 'Prend en charge PDF, DOCX et TXT. Tourne-page 3D réaliste, sauvegarde automatique et 5 thèmes de lecture confortables.',
      exploreOnline: 'Explorer la bibliothèque en ligne',
      demoSample: 'Livre de démonstration',
      emptyTitle: 'Aucun livre trouvé',
      emptyDesc: 'Glissez-déposez des fichiers ici ou explorez notre bibliothèque en ligne gratuite.',
      pagesCount: '{count} pages',
      pageProgress: 'Page {current}/{total}',
      deleteConfirm: 'Voulez-vous vraiment supprimer "{title}" de votre bibliothèque ?',
      deleteTooltip: 'Supprimer ce livre',
      dragDropOverlay: 'Déposez les fichiers PDF, DOCX, TXT ici',
      dragDropSub: 'Le fichier sera enregistré hors-ligne dans votre bibliothèque',
      unknownAuthor: 'Auteur inconnu',
    },
    online: {
      categoryHeading: 'Catégories',
      totalBooksCount: '{count} livres',
      languageFilterLabel: 'Langue des livres',
      allLanguages: 'Toutes les langues',
      publicDomainNotice: 'Œuvres du domaine public mondial fournies par Project Gutenberg.',
      fetchingTitle: 'Connexion à Project Gutenberg...',
      fetchingSubtitle: 'Chargement des œuvres de grande qualité',
      noBooksTitle: 'Aucun livre trouvé',
      noBooksSubtitle: 'Essayez un autre mot-clé ou sélectionnez une catégorie à gauche.',
      readAndDownload: 'Télécharger et lire',
      downloading: 'Chargement du livre...',
      alreadyInShelf: 'Dans la bibliothèque - Ouvrir',
      freeEdition: 'Domaine public',
      loadingMore: 'Chargement de livres supplémentaires...',
      endOfList: '(Tous les livres de cette catégorie ont été chargés)',
      searchResultsFor: 'Résultats pour : "{query}"',
      categories: {
        recommended: 'Recommandé pour vous',
        vietnamese: 'Littérature vietnamienne',
        world_classics: 'Classiques mondiaux',
        all: 'Les plus populaires',
        philosophy: 'Philosophie & Pensée',
        history: 'Histoire universelle',
        science: 'Sciences & Nature',
        adventure: 'Mystère & Aventure',
        psychology: 'Psychologie & Société',
        poetry: 'Poésie & Théâtre',
      },
    },
    reader: {
      backToLibrary: 'Retour à la bibliothèque',
      prevPage: 'Page précédente',
      nextPage: 'Page suivante',
      pageIndicator: 'Page {current} / {total}',
      bookmarkPage: 'Marquer cette page',
      bookmarked: 'Page marquée',
      viewerMode3D: 'Passer en défilement vertical (Reflow)',
      viewerModeScroll: 'Passer en rotation 3D (Réaliste)',
      spreadDouble: 'Double page',
      spreadSingle: 'Page simple',
      pdfModeBook: 'Mise en page livre soignée',
      pdfModeScan: 'Scan original',
      themeComfort: 'Thème et confort visuel',
      typography: 'Typographie et mise en page',
      tocBookmarks: 'Sommaire et marque-pages',
      soundOn: 'Couper le son de page',
      soundOff: 'Activer le son de page',
      fullscreen: 'Plein écran',
      exitFullscreen: 'Quitter plein écran',
      zoomIn: 'Zoom avant',
      zoomOut: 'Zoom arrière',
      resetZoom: 'Zoom par défaut',
    },
    comfortModal: {
      title: 'Thème et confort visuel',
      toneHeading: 'Couleur du papier',
      sepia: 'Sépia classique',
      warm: 'Ambre doux',
      white: 'Papier blanc',
      eink: 'Encre E-ink',
      dark: 'Mode nuit OLED',
      brightness: 'Luminosité',
      contrast: 'Contraste',
      resetDefault: 'Valeurs par défaut',
    },
    typographyModal: {
      title: 'Typographie & Mise en page',
      fontFamily: 'Police de caractères',
      fontSize: 'Taille du texte',
      lineHeight: 'Hauteur de ligne',
      letterSpacing: 'Espacement des lettres',
      alignment: 'Alignement',
      alignJustify: 'Justifié',
      alignLeft: 'Aligné à gauche',
    },
    tocModal: {
      title: 'Table des matières & Marque-pages',
      tabToc: 'Sommaire',
      tabBookmarks: 'Marque-pages ({count})',
      noToc: 'Aucun sommaire automatique pour ce livre.',
      noBookmarks: 'Aucun marque-page ajouté.',
      clickToJump: 'Cliquer pour aller à la page',
      pagePrefix: 'Page',
      deleteBookmark: 'Supprimer ce marque-page',
    },
  },

  es: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: 'Idioma del sistema',
      close: 'Cerrar',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      save: 'Guardar',
      reset: 'Restablecer',
      loading: 'Cargando...',
    },
    header: {
      taglineShelf: 'Tu biblioteca personal ({count} libros) • Lectura sin conexión',
      taglineOnline: 'Más de 70.000 obras maestras gratis de Project Gutenberg',
      badgeShelf: 'Mi Estantería',
      badgeOnline: 'Tienda Online',
      tabShelf: 'Mi estantería ({count})',
      tabOnline: 'Biblioteca online gratis',
      searchShelfPlaceholder: 'Buscar en mi estantería...',
      searchOnlinePlaceholder: 'Buscar en más de 70.000 libros...',
      openFile: 'Abrir archivo local',
      searchButton: 'Buscar',
    },
    shelf: {
      bannerTitle: 'Tu estantería ({count} libros)',
      bannerDesc: 'Compatible con PDF, DOCX y TXT. Efecto de cambio de página en 3D, autoguardado y 5 temas agradables a la vista.',
      exploreOnline: 'Explorar biblioteca online',
      demoSample: 'Libro de prueba',
      emptyTitle: 'No se encontraron libros',
      emptyDesc: 'Arrastra y suelta libros aquí, haz clic en "Abrir archivo", o descarga clásicos desde la tienda online.',
      pagesCount: '{count} páginas',
      pageProgress: 'Página {current}/{total}',
      deleteConfirm: '¿Seguro que deseas eliminar "{title}" de la biblioteca?',
      deleteTooltip: 'Eliminar este libro',
      dragDropOverlay: 'Suelta archivos PDF, DOCX, TXT aquí',
      dragDropSub: 'Los archivos se guardarán localmente para lectura sin conexión',
      unknownAuthor: 'Autor desconocido',
    },
    online: {
      categoryHeading: 'Categorías',
      totalBooksCount: '{count} libros',
      languageFilterLabel: 'Idioma de los libros',
      allLanguages: 'Todos los idiomas',
      publicDomainNotice: 'Obras de dominio público internacional provistas por Project Gutenberg.',
      fetchingTitle: 'Consultando Project Gutenberg...',
      fetchingSubtitle: 'Cargando ediciones clásicas de alta calidad',
      noBooksTitle: 'No se encontraron libros',
      noBooksSubtitle: 'Prueba con otra palabra clave o selecciona otra categoría en la barra lateral.',
      readAndDownload: 'Descargar y leer gratis',
      downloading: 'Cargando libro...',
      alreadyInShelf: 'En la estantería - Abrir',
      freeEdition: 'Dominio público',
      loadingMore: 'Cargando más libros...',
      endOfList: '(Se han cargado todos los libros de esta categoría)',
      searchResultsFor: 'Resultados para: "{query}"',
      categories: {
        recommended: 'Recomendado para ti',
        vietnamese: 'Literatura vietnamita',
        world_classics: 'Clásicos mundiales',
        all: 'Más populares',
        philosophy: 'Filosofía y Pensamiento',
        history: 'Historia universal',
        science: 'Ciencia y Naturaleza',
        adventure: 'Misterio y Aventura',
        psychology: 'Psicología y Sociedad',
        poetry: 'Poesía y Teatro',
      },
    },
    reader: {
      backToLibrary: 'Volver a la biblioteca',
      prevPage: 'Página anterior',
      nextPage: 'Página siguiente',
      pageIndicator: 'Página {current} / {total}',
      bookmarkPage: 'Marcar esta página',
      bookmarked: 'Página marcada',
      viewerMode3D: 'Cambiar a modo desplazamiento vertical',
      viewerModeScroll: 'Cambiar a modo 3D realista',
      spreadDouble: 'Doble página',
      spreadSingle: 'Página única',
      pdfModeBook: 'Formato libro optimizado',
      pdfModeScan: 'Escaneo original',
      themeComfort: 'Tema y descanso visual',
      typography: 'Tipografía y diseño',
      tocBookmarks: 'Índice y marcadores',
      soundOn: 'Silenciar sonido de páginas',
      soundOff: 'Activar sonido de páginas',
      fullscreen: 'Pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      resetZoom: 'Zoom original',
    },
    comfortModal: {
      title: 'Tema y descanso visual',
      toneHeading: 'Color del papel',
      sepia: 'Sepia clásico',
      warm: 'Ámbar cálido',
      white: 'Papel blanco',
      eink: 'Tinta E-ink',
      dark: 'Oscuro OLED',
      brightness: 'Brillo',
      contrast: 'Contraste',
      resetDefault: 'Restablecer',
    },
    typographyModal: {
      title: 'Tipografía y diseño',
      fontFamily: 'Tipo de letra',
      fontSize: 'Tamaño de fuente',
      lineHeight: 'Espaciado entre líneas',
      letterSpacing: 'Espaciado entre letras',
      alignment: 'Alineación',
      alignJustify: 'Justificado',
      alignLeft: 'Alineado a la izquierda',
    },
    tocModal: {
      title: 'Índice y marcadores',
      tabToc: 'Índice',
      tabBookmarks: 'Marcadores ({count})',
      noToc: 'No se detectó índice para este libro.',
      noBookmarks: 'Aún no se han añadido marcadores.',
      clickToJump: 'Haz clic para ir a la página',
      pagePrefix: 'Página',
      deleteBookmark: 'Eliminar marcador',
    },
  },

  ja: {
    common: {
      appName: 'RealBook Reader',
      systemLanguage: 'システム言語',
      close: '閉じる',
      confirm: '確認',
      cancel: 'キャンセル',
      delete: '削除',
      save: '保存',
      reset: 'リセット',
      loading: '読み込み中...',
    },
    header: {
      taglineShelf: 'あなたの本棚（{count} 冊）• オフラインで快適に読書',
      taglineOnline: '70,000冊以上のグーテンベルク計画と世界の名著にアクセス',
      badgeShelf: 'マイ本棚',
      badgeOnline: 'オンライン書庫',
      tabShelf: 'マイトランク ({count})',
      tabOnline: '無料オンライン書庫',
      searchShelfPlaceholder: '本棚から探す...',
      searchOnlinePlaceholder: '7万冊以上の蔵書から検索...',
      openFile: 'ファイルを開く',
      searchButton: '検索',
    },
    shelf: {
      bannerTitle: 'あなたの本棚（{count} 冊）',
      bannerDesc: 'PDF、DOCX、TXTに対応。リアルな3Dページめくり、自動進捗保存、5種類の目に優しいテーマを搭載。',
      exploreOnline: 'オンライン書庫を見る',
      demoSample: 'サンプル書籍',
      emptyTitle: '本が見つかりませんでした',
      emptyDesc: 'ファイルをドラッグ＆ドロップするか、「ファイルを開く」をクリックして本を追加してください。',
      pagesCount: '{count} ページ',
      pageProgress: '{current}/{total} ページ',
      deleteConfirm: '「{title}」を本棚から削除してもよろしいですか？',
      deleteTooltip: 'この本を削除',
      dragDropOverlay: 'ここにPDF、DOCX、TXTファイルをドロップ',
      dragDropSub: '自動的に本棚に追加され、オフラインで読めるようになります',
      unknownAuthor: '作者不詳',
    },
    online: {
      categoryHeading: 'カテゴリー',
      totalBooksCount: '{count} 冊',
      languageFilterLabel: '書籍の言語',
      allLanguages: 'すべての言語',
      publicDomainNotice: 'Project Gutenberg によるパブリックドメインの世界名著です。',
      fetchingTitle: 'Project Gutenberg から取得中...',
      fetchingSubtitle: '高品質な名著データを読み込んでいます',
      noBooksTitle: '作品が見つかりませんでした',
      noBooksSubtitle: '別のキーワードで検索するか、左のカテゴリーを選んでください。',
      readAndDownload: '無料でダウンロードして読む',
      downloading: '本を読み込み中...',
      alreadyInShelf: '本棚にあります - 開く',
      freeEdition: 'パブリックドメイン',
      loadingMore: '書籍をさらに読み込み中...',
      endOfList: '(このカテゴリーの全作品を読み込みました)',
      searchResultsFor: '「{query}」の検索結果',
      categories: {
        recommended: 'あなたへのおすすめ',
        vietnamese: 'ベトナム文学',
        world_classics: '世界の名著',
        all: '人気作品',
        philosophy: '哲学と思想',
        history: '世界史',
        science: '科学・自然',
        adventure: '推理・冒険',
        psychology: '心理・社会',
        poetry: '詩歌・戯曲',
      },
    },
    reader: {
      backToLibrary: '本棚に戻る',
      prevPage: '前のページ',
      nextPage: '次のページ',
      pageIndicator: '{current} / {total} ページ',
      bookmarkPage: 'このページにしおりを挟む',
      bookmarked: 'しおりを挟みました',
      viewerMode3D: '縦スクロールモードに切り替え',
      viewerModeScroll: '3Dページめくりモードに切り替え',
      spreadDouble: '見開き表示',
      spreadSingle: '単一ページ表示',
      pdfModeBook: 'ブックレイアウトモード',
      pdfModeScan: 'オリジナルスキャンモード',
      themeComfort: 'テーマと目の保護',
      typography: 'フォントと文字組み',
      tocBookmarks: '目次としおり',
      soundOn: 'めくり音を消去',
      soundOff: 'めくり音を有効化',
      fullscreen: '全画面表示',
      exitFullscreen: '全画面表示を終了',
      zoomIn: '拡大',
      zoomOut: '縮小',
      resetZoom: '元の倍率に戻す',
    },
    comfortModal: {
      title: 'テーマと目の保護',
      toneHeading: '紙の色合い',
      sepia: 'クラシックセピア',
      warm: 'やさしい琥珀色',
      white: '白紙',
      eink: '電子ペーパー',
      dark: '夜間ダーク',
      brightness: '明るさ',
      contrast: 'コントラスト',
      resetDefault: '初期設定に戻す',
    },
    typographyModal: {
      title: 'フォントと文字組み',
      fontFamily: 'フォント選択',
      fontSize: '文字サイズ',
      lineHeight: '行間',
      letterSpacing: '字間',
      alignment: '揃え',
      alignJustify: '両端揃え',
      alignLeft: '左揃え',
    },
    tocModal: {
      title: '目次としおり',
      tabToc: '目次',
      tabBookmarks: 'しおり ({count})',
      noToc: 'この本には自動目次がありません。',
      noBookmarks: 'まだしおりがありません。',
      clickToJump: 'クリックしてページに移動',
      pagePrefix: 'ページ',
      deleteBookmark: 'しおりを削除',
    },
  },
};

export function getTranslation(lang: AppLanguage = 'vi'): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.vi;
}
