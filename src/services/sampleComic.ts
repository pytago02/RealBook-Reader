import type { Book, TocItem } from '../types';

export const SAMPLE_COMIC_TOC: TocItem[] = [
  { title: 'Trang bìa: Hành Tinh Bí Ẩn', page: 1 },
  { title: 'Trang 1: Khởi hành từ Trạm Aurora', page: 2 },
  { title: 'Trang 2: Dị thường ở Tinh vân Hổ Cáp', page: 3 },
  { title: 'Trang 3: Đổ bộ lên Hành tinh Pha Lê', page: 4 },
  { title: 'Trang 4: Gặp gỡ Tinh linh Lumina', page: 5 },
  { title: 'Trang 5: Bình minh rực rỡ & Hết tập 1', page: 6 },
];

export const SAMPLE_COMIC_PAGES: string[] = [
  // Page 1: COVER
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <defs>
      <linearGradient id="c-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="50%" stop-color="#1e1035" />
        <stop offset="100%" stop-color="#0b1b2b" />
      </linearGradient>
      <radialGradient id="c-nebula" cx="60%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.4" />
        <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="c-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <linearGradient id="c-warp" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#818cf8" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Outer Frame -->
    <rect width="800" height="1150" fill="url(#c-bg)" />
    <circle cx="480" cy="460" r="320" fill="url(#c-nebula)" />

    <!-- Stars -->
    <g fill="#ffffff" opacity="0.8">
      <circle cx="80" cy="120" r="1.5" /><circle cx="150" cy="300" r="1" /><circle cx="720" cy="180" r="2" />
      <circle cx="640" cy="420" r="1.5" /><circle cx="210" cy="650" r="2" /><circle cx="710" cy="820" r="1.5" />
      <circle cx="120" cy="940" r="1" /><circle cx="340" cy="220" r="2.5" /><circle cx="560" cy="150" r="1.2" />
      <circle cx="280" cy="480" r="1.8" /><circle cx="620" cy="690" r="1.5" /><circle cx="430" cy="890" r="2" />
    </g>

    <!-- Planet in background -->
    <circle cx="580" cy="360" r="140" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" opacity="0.85" />
    <ellipse cx="580" cy="360" rx="200" ry="24" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.6" transform="rotate(-20 580 360)" />

    <!-- Spaceship Artwork -->
    <g transform="translate(360, 520) rotate(-25)">
      <!-- Warp Trail -->
      <polygon points="-40,180 40,180 15,20 -15,20" fill="url(#c-warp)" />
      <!-- Ship Body -->
      <path d="M 0,-100 L 45,60 L 25,85 L 0,75 L -25,85 L -45,60 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="4" />
      <!-- Cockpit Glass -->
      <path d="M 0,-60 L 20,0 L -20,0 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
      <!-- Wings -->
      <polygon points="-45,40 -110,95 -50,85" fill="#f59e0b" stroke="#0f172a" stroke-width="3" />
      <polygon points="45,40 110,95 50,85" fill="#f59e0b" stroke="#0f172a" stroke-width="3" />
      <circle cx="0" cy="40" r="8" fill="#38bdf8" />
    </g>

    <!-- Top Comic Badge -->
    <rect x="50" y="50" width="700" height="42" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
    <text x="75" y="77" fill="#fbbf24" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="16" letter-spacing="3">REALBOOK COMICS</text>
    <text x="725" y="77" fill="#a1a1aa" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="14" text-anchor="end">SỐ ĐẶC BIỆT • TẬP 1</text>

    <!-- Main Title Card -->
    <g transform="translate(400, 850)">
      <rect x="-350" y="-80" width="700" height="150" rx="16" fill="#090d16" fill-opacity="0.9" stroke="#f59e0b" stroke-width="3" />
      <text x="0" y="-20" fill="url(#c-gold)" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="4">HÀNH TINH BÍ ẨN</text>
      <text x="0" y="24" fill="#38bdf8" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="20" text-anchor="middle" letter-spacing="6">CHUYẾN PHIÊU LƯU VÔ CỰC</text>
      <text x="0" y="55" fill="#94a3b8" font-family="'Be Vietnam Pro', sans-serif" font-weight="500" font-size="13" text-anchor="middle">Tác giả &amp; Minh họa: RealBook Studio</text>
    </g>

    <!-- Bottom border & footer -->
    <rect x="40" y="1060" width="720" height="40" rx="8" fill="#18181b" stroke="#27272a" stroke-width="1.5" />
    <text x="400" y="1085" fill="#e4e4e7" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="middle">★ CHẠM HOẶC VUỐT SANG PHẢI ĐỂ BẮT ĐẦU ĐỌC TRANG 1 ★</text>
  </svg>`,

  // Page 2: KHỞI HÀNH
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <defs>
      <linearGradient id="p1-space" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0e1a" /><stop offset="100%" stop-color="#141c2e" />
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="800" height="1150" fill="#0d1117" />
    
    <!-- Header -->
    <text x="40" y="45" fill="#f59e0b" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" letter-spacing="2">HÀNH TINH BÍ ẨN • TRANG 1</text>
    <text x="760" y="45" fill="#64748b" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="end">CHƯƠNG 1: KHỞI HÀNH</text>

    <!-- PANEL 1: Space Station Aurora (Top Panel) -->
    <g transform="translate(40, 65)">
      <rect width="720" height="340" rx="10" fill="url(#p1-space)" stroke="#334155" stroke-width="3" />
      <!-- Station Graphic -->
      <circle cx="360" cy="170" r="60" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
      <rect x="180" y="155" width="360" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
      <!-- Solar Panels -->
      <rect x="120" y="110" width="80" height="120" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2" opacity="0.85" />
      <rect x="520" y="110" width="80" height="120" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="2" opacity="0.85" />
      <!-- Earth limb -->
      <path d="M 0,340 Q 360,240 720,340 Z" fill="#065f46" opacity="0.6" />

      <!-- Caption Box -->
      <rect x="15" y="15" width="310" height="32" rx="4" fill="#f59e0b" stroke="#000" stroke-width="1.5" />
      <text x="25" y="36" fill="#000" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="13">TRẠM KHÔNG GIAN AURORA - NĂM 2180</text>

      <!-- Speech Bubble Station -->
      <g transform="translate(380, 240)">
        <path d="M 0,0 L 310,0 A 10 10 0 0 1 320,10 L 320,65 A 10 10 0 0 1 310,75 L 40,75 L 10,95 L 20,75 L 0,75 A 10 10 0 0 1 -10,65 L -10,10 A 10 10 0 0 1 0,0 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <text x="155" y="32" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">"Trạm Aurora gọi Tàu Thám Hiểm Nova!"</text>
        <text x="155" y="54" fill="#0284c7" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle">"Cửa phóng siêu không gian đã mở. Chúc may mắn!"</text>
      </g>
    </g>

    <!-- PANEL 2: Cockpit Leo & Linh (Bottom Left) -->
    <g transform="translate(40, 425)">
      <rect width="350" height="420" rx="10" fill="#0f172a" stroke="#334155" stroke-width="3" />
      <!-- HUD screens -->
      <rect x="25" y="30" width="300" height="140" rx="8" fill="#022c22" stroke="#10b981" stroke-width="2" />
      <path d="M 40,100 L 90,70 L 140,110 L 200,60 L 260,90" fill="none" stroke="#34d399" stroke-width="3" />
      <text x="40" y="60" fill="#34d399" font-family="monospace" font-size="12">STATUS: HYPERDRIVE READY 100%</text>
      <!-- Astronauts silhouettes -->
      <circle cx="120" cy="280" r="50" fill="#334155" stroke="#f8fafc" stroke-width="3" />
      <circle cx="120" cy="275" r="32" fill="#38bdf8" />
      <circle cx="240" cy="290" r="45" fill="#334155" stroke="#f8fafc" stroke-width="3" />
      <circle cx="240" cy="285" r="28" fill="#f59e0b" />

      <!-- Dialogue Bubble -->
      <g transform="translate(30, 200)">
        <rect width="290" height="55" rx="8" fill="#ffffff" stroke="#000" stroke-width="2" />
        <polygon points="100,55 90,75 120,55" fill="#ffffff" stroke="#000" stroke-width="2" />
        <rect x="98" y="53" width="24" height="4" fill="#ffffff" />
        <text x="145" y="24" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="12" text-anchor="middle">Leo: "Nhận lệnh! Khởi động động cơ warp."</text>
        <text x="145" y="42" fill="#d97706" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="12" text-anchor="middle">Linh: "Đếm ngược: 3... 2... 1!"</text>
      </g>
    </g>

    <!-- PANEL 3: Ship Warp Blast (Bottom Right) -->
    <g transform="translate(410, 425)">
      <rect width="350" height="420" rx="10" fill="#020617" stroke="#334155" stroke-width="3" />
      <!-- Speed lines -->
      <g stroke="#38bdf8" stroke-width="2.5" opacity="0.7">
        <line x1="20" y1="210" x2="330" y2="210" stroke-width="6" stroke="#ffffff" />
        <line x1="40" y1="120" x2="310" y2="150" />
        <line x1="30" y1="280" x2="320" y2="250" />
        <line x1="50" y1="70" x2="280" y2="110" />
        <line x1="60" y1="350" x2="290" y2="300" />
      </g>
      <!-- Warp sound effect -->
      <text x="175" y="190" fill="#facc15" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="44" text-anchor="middle" transform="rotate(-8 175 190)">*VÙÙÙ... VÚT!*</text>
      <circle cx="175" cy="210" r="25" fill="#ffffff" />
    </g>

    <!-- Bottom Action Stripe -->
    <g transform="translate(40, 865)">
      <rect width="720" height="230" rx="10" fill="#1e1b4b" stroke="#4338ca" stroke-width="3" />
      <!-- Hyperspace Portal -->
      <ellipse cx="360" cy="115" rx="280" ry="80" fill="none" stroke="#818cf8" stroke-width="6" />
      <ellipse cx="360" cy="115" rx="180" ry="50" fill="none" stroke="#a78bfa" stroke-width="4" />
      <ellipse cx="360" cy="115" rx="80" ry="25" fill="#ffffff" />
      <text x="360" y="125" fill="#1e1b4b" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="18" text-anchor="middle">BƯỚC VÀO KHÔNG GIAN ĐA CHIỀU</text>
    </g>
  </svg>`,

  // Page 3: DỊ THƯỜNG Ở TINH VÂN
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <rect width="800" height="1150" fill="#090d16" />
    <!-- Header -->
    <text x="40" y="45" fill="#f59e0b" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" letter-spacing="2">HÀNH TINH BÍ ẨN • TRANG 2</text>
    <text x="760" y="45" fill="#64748b" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="end">CHƯƠNG 2: DỊ THƯỜNG TINH VÂN</text>

    <!-- Full Width Top Panel: Pink & Violet Nebula -->
    <g transform="translate(40, 65)">
      <rect width="720" height="420" rx="10" fill="#180b2b" stroke="#475569" stroke-width="3" />
      <!-- Nebula Clouds -->
      <path d="M 50,180 Q 220,50 420,130 T 700,220 L 720,420 L 0,420 Z" fill="#831843" opacity="0.5" />
      <circle cx="520" cy="180" r="120" fill="#c026d3" opacity="0.3" />
      <!-- Floating Asteroids -->
      <polygon points="120,90 160,80 180,110 140,130" fill="#475569" stroke="#94a3b8" stroke-width="2" />
      <polygon points="280,240 330,220 350,270 300,290" fill="#334155" stroke="#64748b" stroke-width="2" />
      <polygon points="620,120 660,100 680,140 640,160" fill="#475569" stroke="#94a3b8" stroke-width="2" />

      <!-- Nova 1 ship cruising -->
      <g transform="translate(240, 160) scale(0.65)">
        <polygon points="0,-60 30,40 -30,40" fill="#ffffff" stroke="#000" stroke-width="3" />
        <polygon points="-30,30 -70,50 -30,45" fill="#f59e0b" />
        <polygon points="30,30 70,50 30,45" fill="#f59e0b" />
      </g>

      <!-- SFX BEEP -->
      <rect x="440" y="40" width="250" height="40" rx="8" fill="#b91c1c" stroke="#fca5a5" stroke-width="2" />
      <text x="565" y="66" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="16" text-anchor="middle">🚨 *TÍT... TÍT... TÍT!*</text>
    </g>

    <!-- Bottom Left Panel: Robo-8 Alert -->
    <g transform="translate(40, 505)">
      <rect width="345" height="595" rx="10" fill="#0f172a" stroke="#475569" stroke-width="3" />
      <!-- Robot Face Art -->
      <rect x="60" y="80" width="220" height="200" rx="24" fill="#334155" stroke="#0ea5e9" stroke-width="4" />
      <circle cx="120" cy="160" r="30" fill="#38bdf8" />
      <circle cx="220" cy="160" r="30" fill="#38bdf8" />
      <rect x="100" y="220" width="140" height="16" rx="8" fill="#0284c7" />
      <!-- Antenna -->
      <line x1="170" y1="80" x2="170" y2="40" stroke="#0ea5e9" stroke-width="5" />
      <circle cx="170" cy="35" r="12" fill="#ef4444" />

      <!-- Robot Dialogue -->
      <g transform="translate(20, 320)">
        <rect width="305" height="130" rx="10" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <polygon points="150,0 140,-25 170,0" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" />
        <rect x="145" y="-3" width="25" height="5" fill="#ffffff" />
        <text x="152" y="30" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" text-anchor="middle">ROBO-8 CẢNH BÁO:</text>
        <text x="152" y="58" fill="#b91c1c" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">"Phát hiện trường lượng tử dị thường!"</text>
        <text x="152" y="85" fill="#475569" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle">"Nguồn gốc phát ra từ tinh cầu bí ẩn</text>
        <text x="152" y="105" fill="#475569" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle">ngay phía sau vành đai thiên thạch!"</text>
      </g>
    </g>

    <!-- Bottom Right Panel: The Discovery -->
    <g transform="translate(405, 505)">
      <rect width="355" height="595" rx="10" fill="#06121e" stroke="#475569" stroke-width="3" />
      <!-- Glowing Crystal Planet reveal -->
      <circle cx="180" cy="240" r="140" fill="#065f46" stroke="#10b981" stroke-width="4" />
      <!-- Crystal spikes on surface -->
      <polygon points="180,90 195,140 165,140" fill="#6ee7b7" />
      <polygon points="80,180 120,200 100,220" fill="#a7f3d0" />
      <polygon points="260,160 300,190 270,210" fill="#34d399" />
      <polygon points="120,310 160,320 140,350" fill="#6ee7b7" />

      <!-- Dialogue Bubble Linh -->
      <g transform="translate(25, 420)">
        <rect width="305" height="110" rx="10" fill="#ffffff" stroke="#000" stroke-width="2.5" />
        <polygon points="60,0 45,-25 80,0" fill="#ffffff" stroke="#000" stroke-width="2.5" />
        <rect x="50" y="-3" width="28" height="5" fill="#ffffff" />
        <text x="152" y="32" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" text-anchor="middle">Linh reo lên:</text>
        <text x="152" y="60" fill="#047857" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">"Ôi nhìn kìa! Toàn bộ bề mặt</text>
        <text x="152" y="84" fill="#047857" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">đều lấp lánh như tinh thể pha lê!"</text>
      </g>
    </g>
  </svg>`,

  // Page 4: ĐỔ BỘ LÊN HÀNH TINH PHA LÊ
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <rect width="800" height="1150" fill="#06101e" />
    <text x="40" y="45" fill="#f59e0b" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" letter-spacing="2">HÀNH TINH BÍ ẨN • TRANG 3</text>
    <text x="760" y="45" fill="#64748b" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="end">CHƯƠNG 3: ĐỔ BỘ</text>

    <!-- Top Big Cinematic Panel: Landing -->
    <g transform="translate(40, 65)">
      <rect width="720" height="520" rx="10" fill="#042f2e" stroke="#14b8a6" stroke-width="3" />
      <!-- Sky Gradient of Crystal Planet -->
      <path d="M 0,0 L 720,0 L 720,300 L 0,300 Z" fill="#0f172a" opacity="0.8" />
      <!-- Dual Moons -->
      <circle cx="140" cy="110" r="35" fill="#a7f3d0" />
      <circle cx="220" cy="80" r="18" fill="#fde047" opacity="0.9" />

      <!-- Giant Crystal Spires Landscape -->
      <polygon points="60,480 120,180 180,480" fill="#2dd4bf" stroke="#042f2e" stroke-width="3" />
      <polygon points="160,500 240,240 300,500" fill="#5eead4" stroke="#042f2e" stroke-width="3" />
      <polygon points="450,510 540,160 620,510" fill="#14b8a6" stroke="#042f2e" stroke-width="3" />
      <polygon points="580,500 650,220 710,500" fill="#99f6e4" stroke="#042f2e" stroke-width="3" />

      <!-- Landed Spaceship -->
      <g transform="translate(340, 360)">
        <polygon points="0,-80 50,40 -50,40" fill="#f8fafc" stroke="#0f172a" stroke-width="3" />
        <rect x="-40" y="38" width="80" height="15" fill="#f59e0b" />
        <line x1="-30" y1="53" x2="-45" y2="85" stroke="#64748b" stroke-width="5" />
        <line x1="30" y1="53" x2="45" y2="85" stroke="#64748b" stroke-width="5" />
      </g>

      <!-- SFX Landing -->
      <text x="360" y="475" fill="#fef08a" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="28" text-anchor="middle">*RẦM... XÈO XÈO...*</text>
    </g>

    <!-- Bottom Left Panel: Stepping Out -->
    <g transform="translate(40, 605)">
      <rect width="350" height="495" rx="10" fill="#0f172a" stroke="#334155" stroke-width="3" />
      <!-- Astronaut stepping on crystal flower -->
      <circle cx="160" cy="180" r="45" fill="#e2e8f0" stroke="#0f172a" stroke-width="3" />
      <circle cx="160" cy="175" r="28" fill="#38bdf8" />
      <rect x="130" y="225" width="60" height="90" rx="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="3" />

      <!-- Crystal Blossom on ground -->
      <g transform="translate(160, 380)">
        <circle cx="0" cy="0" r="20" fill="#f43f5e" />
        <polygon points="0,-40 15,-15 -15,-15" fill="#fb7185" />
        <polygon points="0,40 15,15 -15,15" fill="#fb7185" />
        <polygon points="-40,0 -15,15 -15,-15" fill="#fb7185" />
        <polygon points="40,0 15,15 15,-15" fill="#fb7185" />
      </g>

      <g transform="translate(25, 410)">
        <rect width="300" height="65" rx="8" fill="#ffffff" stroke="#000" stroke-width="2" />
        <text x="150" y="28" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="12" text-anchor="middle">Leo: "Không khí ở đây trong vắt!"</text>
        <text x="150" y="48" fill="#0284c7" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle">"Các bông hoa pha lê phát ra tiếng nhạc..."</text>
      </g>
    </g>

    <!-- Bottom Right Panel: Mystery Eyes in Quartz -->
    <g transform="translate(410, 605)">
      <rect width="350" height="495" rx="10" fill="#1e1035" stroke="#7e22ce" stroke-width="3" />
      <!-- Quartz Prism -->
      <polygon points="175,70 290,380 60,380" fill="#a855f7" stroke="#e9d5ff" stroke-width="3" opacity="0.8" />
      <!-- Glowing cute eyes blinking -->
      <g transform="translate(175, 240)">
        <ellipse cx="-35" cy="0" rx="18" ry="24" fill="#fef08a" />
        <circle cx="-35" cy="0" r="10" fill="#0f172a" />
        <ellipse cx="35" cy="0" rx="18" ry="24" fill="#fef08a" />
        <circle cx="35" cy="0" r="10" fill="#0f172a" />
      </g>
      <text x="175" y="320" fill="#e9d5ff" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="20" text-anchor="middle">✨ *CHỚP MẮT...* ✨</text>

      <g transform="translate(25, 410)">
        <rect width="300" height="65" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
        <text x="150" y="28" fill="#713f12" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="13" text-anchor="middle">"CÓ AI ĐÓ ĐANG QUAN SÁT..."</text>
        <text x="150" y="48" fill="#854d0e" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle">Một ánh mắt ấm áp và tò mò!</text>
      </g>
    </g>
  </svg>`,

  // Page 5: GẶP GỠ TINH LINH LUMINA
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <rect width="800" height="1150" fill="#080c14" />
    <text x="40" y="45" fill="#f59e0b" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" letter-spacing="2">HÀNH TINH BÍ ẨN • TRANG 4</text>
    <text x="760" y="45" fill="#64748b" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="end">CHƯƠNG 4: BẠN MỚI LUMINA</text>

    <!-- Top Character Spotlight Panel: Lumina Appears! -->
    <g transform="translate(40, 65)">
      <rect width="720" height="580" rx="10" fill="#131127" stroke="#ec4899" stroke-width="3" />
      <!-- Glowing aura -->
      <circle cx="360" cy="260" r="160" fill="#ec4899" opacity="0.25" />
      <circle cx="360" cy="260" r="100" fill="#f472b6" opacity="0.35" />

      <!-- Cute Sprite Lumina -->
      <g transform="translate(360, 250)">
        <!-- Fairy Wings -->
        <ellipse cx="-55" cy="-20" rx="45" ry="70" fill="#a5f3fc" stroke="#67e8f9" stroke-width="2" opacity="0.8" transform="rotate(-25 -55 -20)" />
        <ellipse cx="55" cy="-20" rx="45" ry="70" fill="#a5f3fc" stroke="#67e8f9" stroke-width="2" opacity="0.8" transform="rotate(25 55 -20)" />
        <!-- Head / Body -->
        <circle cx="0" cy="0" r="45" fill="#fef08a" stroke="#f59e0b" stroke-width="3" />
        <!-- Big Anime Eyes -->
        <ellipse cx="-16" cy="-5" rx="10" ry="14" fill="#0f172a" />
        <circle cx="-13" cy="-9" r="4" fill="#ffffff" />
        <ellipse cx="16" cy="-5" rx="10" ry="14" fill="#0f172a" />
        <circle cx="19" cy="-9" r="4" fill="#ffffff" />
        <!-- Cute Smile & Cheeks -->
        <path d="M -8,12 Q 0,20 8,12" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" />
        <circle cx="-25" cy="8" r="6" fill="#f43f5e" opacity="0.6" />
        <circle cx="25" cy="8" r="6" fill="#f43f5e" opacity="0.6" />
        <!-- Magic Crown -->
        <polygon points="0,-55 12,-38 -12,-38" fill="#ec4899" />
      </g>

      <!-- Sparkles -->
      <text x="210" y="160" fill="#fef08a" font-size="28">✦</text>
      <text x="500" y="180" fill="#a5f3fc" font-size="32">✦</text>
      <text x="220" y="380" fill="#f472b6" font-size="24">✦</text>

      <!-- Lumina Dialogue -->
      <g transform="translate(110, 440)">
        <rect width="500" height="110" rx="14" fill="#ffffff" stroke="#ec4899" stroke-width="3" />
        <polygon points="250,0 240,-25 270,0" fill="#ffffff" stroke="#ec4899" stroke-width="3" />
        <rect x="245" y="-3" width="25" height="5" fill="#ffffff" />
        <text x="250" y="34" fill="#be185d" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="16" text-anchor="middle">Lumina: "Chào mừng các bạn đến với Hành Tinh Pha Lê!"</text>
        <text x="250" y="62" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">"Các bạn đến đúng lúc lắm... Trái Tim Pha Lê của chúng tôi"</text>
        <text x="250" y="86" fill="#0f172a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="middle">"đang cạn kiệt năng lượng và bầu trời sắp mất đi ánh sáng!"</text>
      </g>
    </g>

    <!-- Bottom Collaboration Panel -->
    <g transform="translate(40, 665)">
      <rect width="720" height="435" rx="10" fill="#0f172a" stroke="#334155" stroke-width="3" />
      <!-- Energy Core from Nova ship -->
      <circle cx="360" cy="180" r="80" fill="#0284c7" stroke="#38bdf8" stroke-width="5" />
      <polygon points="360,120 410,180 360,240 310,180" fill="#38bdf8" />
      <text x="360" y="186" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="18" text-anchor="middle">CORE-X</text>

      <!-- Dialogue Leo & Linh -->
      <g transform="translate(60, 290)">
        <rect width="600" height="110" rx="12" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5" />
        <text x="300" y="35" fill="#fef08a" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="15" text-anchor="middle">Leo &amp; Linh vui vẻ nhận lời:</text>
        <text x="300" y="65" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="14" text-anchor="middle">"Đừng lo Lumina! Tàu Nova có Pin Lượng Tử Mặt Trời dự phòng."</text>
        <text x="300" y="90" fill="#e0f2fe" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="middle">"Chúng tôi sẽ cùng bạn thắp sáng lại toàn bộ tinh cầu này!"</text>
      </g>
    </g>
  </svg>`,

  // Page 6: BÌNH MINH RỰC RỠ & KẾT THÚC TẬP 1
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1150" width="100%" height="100%">
    <defs>
      <linearGradient id="p5-dawn" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#3b0764" />
        <stop offset="35%" stop-color="#be185d" />
        <stop offset="70%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
    </defs>

    <rect width="800" height="1150" fill="url(#p5-dawn)" />

    <!-- Grand Climax Page Header -->
    <text x="40" y="45" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="14" letter-spacing="2">HÀNH TINH BÍ ẨN • TRANG 5</text>
    <text x="760" y="45" fill="#fef08a" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="13" text-anchor="end">ĐỈNH ĐIỂM TẬP 1</text>

    <!-- Beams of Light shooting into the cosmos -->
    <g stroke="#ffffff" stroke-width="4" opacity="0.6">
      <line x1="400" y1="650" x2="100" y2="50" stroke-width="6" />
      <line x1="400" y1="650" x2="250" y2="40" stroke-width="8" />
      <line x1="400" y1="650" x2="400" y2="30" stroke-width="12" stroke="#fef08a" />
      <line x1="400" y1="650" x2="550" y2="40" stroke-width="8" />
      <line x1="400" y1="650" x2="700" y2="50" stroke-width="6" />
    </g>

    <!-- Sacred Crystal Altar Centerpiece -->
    <g transform="translate(400, 650)">
      <polygon points="0,-160 120,40 -120,40" fill="#a7f3d0" stroke="#059669" stroke-width="4" />
      <polygon points="0,-160 60,40 -60,40" fill="#ffffff" opacity="0.8" />
      <circle cx="0" cy="-60" r="40" fill="#38bdf8" />

      <!-- Characters celebrating around the altar -->
      <!-- Lumina flying above -->
      <g transform="translate(0, -220)">
        <circle cx="0" cy="0" r="28" fill="#fef08a" stroke="#f59e0b" stroke-width="2" />
        <ellipse cx="-35" cy="0" rx="20" ry="35" fill="#a5f3fc" opacity="0.8" />
        <ellipse cx="35" cy="0" rx="20" ry="35" fill="#a5f3fc" opacity="0.8" />
      </g>
      <!-- Leo Left -->
      <circle cx="-160" cy="30" r="28" fill="#e2e8f0" />
      <!-- Linh Right -->
      <circle cx="160" cy="30" r="28" fill="#fef08a" />
      <!-- Robo-8 -->
      <rect x="-240" y="0" width="40" height="40" rx="6" fill="#38bdf8" />
    </g>

    <!-- Giant Sound Effect -->
    <text x="400" y="360" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="46" text-anchor="middle" letter-spacing="3" stroke="#be185d" stroke-width="2">★ BỪNG SÁNG THIÊN HÀ! ★</text>

    <!-- Climax Narrative Banner -->
    <g transform="translate(100, 770)">
      <rect width="600" height="130" rx="14" fill="#090d16" fill-opacity="0.92" stroke="#f59e0b" stroke-width="3" />
      <text x="300" y="38" fill="#fbbf24" font-family="'Be Vietnam Pro', sans-serif" font-weight="800" font-size="16" text-anchor="middle">HÀNH TINH PHA LÊ ĐÃ HỒI SINH!</text>
      <text x="300" y="68" fill="#e2e8f0" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="middle">Ánh sáng thuần khiết lan tỏa khắp các vì sao xa xôi,</text>
      <text x="300" y="92" fill="#e2e8f0" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="13" text-anchor="middle">mở ra cánh cổng dẫn đến những thế giới chưa từng được khám phá...</text>
    </g>

    <!-- Closing Comic Stamp -->
    <g transform="translate(400, 990)">
      <rect x="-260" y="-35" width="520" height="70" rx="10" fill="#18181b" stroke="#ffffff" stroke-width="2" />
      <text x="0" y="-3" fill="#f43f5e" font-family="'Be Vietnam Pro', sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="2">HẾT TẬP 1</text>
      <text x="0" y="24" fill="#94a3b8" font-family="'Be Vietnam Pro', sans-serif" font-weight="700" font-size="12" text-anchor="middle">ĐÓN ĐỌC TẬP 2: BÍ MẬT CỦA CÁC VÌ SAO TRÊN REALBOOK READER</text>
    </g>

    <!-- Footer Bar -->
    <text x="400" y="1105" fill="#ffffff" font-family="'Be Vietnam Pro', sans-serif" font-weight="600" font-size="12" text-anchor="middle" opacity="0.8">Cảm ơn bạn đã đọc truyện tranh trên RealBook Reader • Nhấn nút quay lại để về Thư viện</text>
  </svg>`,
];

export const SAMPLE_COMIC_BOOK: Book = {
  id: 'sample-comic-vu-tru',
  title: 'Hành Tinh Bí Ẩn (Tập 1)',
  author: 'RealBook Studio',
  genre: 'Truyện tranh & Manga',
  format: 'cbz',
  totalPages: 6,
  currentPage: 1,
  coverUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SAMPLE_COMIC_PAGES[0]),
  fileSize: 52400,
  addedAt: Date.now(),
  lastReadAt: Date.now(),
  bookmarks: [{ id: 'bm-comic-1', page: 1, label: 'Trang bìa', createdAt: Date.now() }],
  highlights: [],
  readingTimeSeconds: 60,
  tags: ['Manga', 'Truyện tranh', 'Khoa học viễn tưởng', 'Màu sắc'],
  isComic: true,
};
