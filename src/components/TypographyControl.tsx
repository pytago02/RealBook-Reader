import React from 'react';
import { X, Type, AlignJustify, AlignLeft } from 'lucide-react';
import type { ReaderSettings, TypographySettings } from '../types';
import { getTranslation } from '../i18n';

interface TypographyControlProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateTypography: (typography: Partial<TypographySettings>) => void;
}

export const TypographyControl: React.FC<TypographyControlProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateTypography,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(settings.language || 'vi');
  const typo = settings.typography;

  const fonts: { id: TypographySettings['fontFamily']; label: string; preview: string; class: string }[] = [
    { id: 'Be Vietnam Pro', label: 'Be Vietnam Pro', preview: 'Font Sans hiện đại tối ưu chuyên biệt cho tiếng Việt', class: 'font-bevietnampro' },
    { id: 'Literata', label: 'Literata', preview: 'Font sách Google Play Books tối ưu bảo vệ mắt', class: 'font-literata' },
    { id: 'Lora', label: 'Lora', preview: 'Serif thanh lịch, hiện đại và sâu lắng', class: 'font-lora' },
    { id: 'Merriweather', label: 'Merriweather', preview: 'Serif tiêu chuẩn cho tiểu thuyết và giáo trình', class: 'font-merriweather' },
    { id: 'EB Garamond', label: 'EB Garamond', preview: 'Serif cổ điển phong cách văn học kinh điển', class: 'font-ebgaramond' },
    { id: 'Playfair Display', label: 'Playfair Display', preview: 'Cổ điển sang trọng và trang nhã', class: 'font-playfair' },
    { id: 'Inter', label: 'Inter', preview: 'Sans-serif công nghệ sạch sẽ, rõ nét', class: 'font-inter' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#202127] text-gray-100 rounded-2xl shadow-2xl border border-gray-700/60 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">{t.typographyModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Font Family Selection */}
        <div className="mt-5 space-y-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            {t.typographyModal.fontFamily}
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => onUpdateTypography({ fontFamily: f.id })}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  typo.fontFamily === f.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-gray-700 hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div>
                  <div className={`text-base font-medium ${f.class}`}>{f.label}</div>
                  <div className="text-xs opacity-60">{f.preview}</div>
                </div>
                {typo.fontFamily === f.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mt-5 space-y-4 pt-4 border-t border-gray-700/50">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t.typographyModal.fontSize}</span>
              <span className="font-mono">{typo.fontSize}px</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">A</span>
              <input
                type="range"
                min={13}
                max={32}
                value={typo.fontSize}
                onChange={(e) => onUpdateTypography({ fontSize: Number(e.target.value) })}
                className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-lg text-gray-300 font-bold">A</span>
            </div>
          </div>

          {/* Line Spacing */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t.typographyModal.lineHeight}</span>
              <span className="font-mono">{typo.lineHeight}x</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={2.4}
              step={0.1}
              value={typo.lineHeight}
              onChange={(e) => onUpdateTypography({ lineHeight: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Text Alignment & Margins */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">{t.typographyModal.alignment}</label>
              <div className="grid grid-cols-2 gap-1 bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => onUpdateTypography({ textAlign: 'justify' })}
                  className={`py-1.5 flex justify-center items-center rounded-lg text-xs font-medium transition-colors ${
                    typo.textAlign === 'justify' ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                  title={t.typographyModal.alignJustify}
                >
                  <AlignJustify className="w-4 h-4 mr-1" /> {t.typographyModal.alignJustify}
                </button>
                <button
                  onClick={() => onUpdateTypography({ textAlign: 'left' })}
                  className={`py-1.5 flex justify-center items-center rounded-lg text-xs font-medium transition-colors ${
                    typo.textAlign === 'left' ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                  title={t.typographyModal.alignLeft}
                >
                  <AlignLeft className="w-4 h-4 mr-1" /> {t.typographyModal.alignLeft}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Lề trang (Margins)</label>
              <div className="grid grid-cols-3 gap-1 bg-gray-800 p-1 rounded-xl">
                {(['narrow', 'normal', 'wide'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => onUpdateTypography({ margin: m })}
                    className={`py-1.5 capitalize text-xs font-medium rounded-lg transition-colors ${
                      typo.margin === m ? 'bg-amber-500 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m === 'narrow' ? 'Hẹp' : m === 'normal' ? 'Vừa' : 'Rộng'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
