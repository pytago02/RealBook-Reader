import React from 'react';
import { X, Sun, Moon, Sparkles, Eye, Volume2 } from 'lucide-react';
import type { ReaderSettings, ReaderTheme } from '../types';
import { getTranslation } from '../i18n';

interface EyeComfortControlProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const EyeComfortControl: React.FC<EyeComfortControlProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const t = getTranslation(settings.language || 'vi');

  const themes: { id: ReaderTheme; name: string; desc: string; bg: string; text: string; icon: React.ReactNode }[] = [
    {
      id: 'sepia',
      name: t.comfortModal.sepia,
      desc: 'Màu giấy ngà vàng ấm áp, quen thuộc như sách giấy',
      bg: '#f4ecd8',
      text: '#433422',
      icon: <Sparkles className="w-4 h-4 text-amber-700" />,
    },
    {
      id: 'warm',
      name: t.comfortModal.warm,
      desc: 'Lọc ánh sáng xanh, chống mỏi mắt khi đọc đêm',
      bg: '#faeed7',
      text: '#3e3223',
      icon: <Sun className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'white',
      name: t.comfortModal.white,
      desc: 'Độ sáng tiêu chuẩn ban ngày, rõ nét từng câu chữ',
      bg: '#fbfbfc',
      text: '#1a1a1c',
      icon: <Sun className="w-4 h-4 text-gray-700" />,
    },
    {
      id: 'eink',
      name: t.comfortModal.eink,
      desc: 'Mô phỏng màn hình mực điện tử đơn sắc dịu mắt',
      bg: '#e5e5e5',
      text: '#111111',
      icon: <Eye className="w-4 h-4 text-gray-800" />,
    },
    {
      id: 'dark',
      name: t.comfortModal.dark,
      desc: 'Nền tối tiết kiệm pin, êm dịu trong phòng tối',
      bg: '#1a1b1e',
      text: '#d1d5db',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#202127] text-gray-100 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-700/60 p-5 sm:p-6 pb-safe sm:pb-6 overflow-hidden max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">{t.comfortModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List */}
        <div className="mt-5 space-y-2.5">
          <label className="text-xs uppercase tracking-wider font-semibold text-gray-400">
            {t.comfortModal.toneHeading}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {themes.map((item) => (
              <button
                key={item.id}
                onClick={() => onUpdateSettings({ theme: item.id })}
                style={{ backgroundColor: item.bg, color: item.text }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  settings.theme === item.id
                    ? 'border-amber-500 scale-[1.02] shadow-md ring-2 ring-amber-500/30'
                    : 'border-transparent opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="p-1.5 rounded-lg bg-black/5">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-sm leading-tight">{item.name}</div>
                    <div className="text-xs opacity-75">{item.desc}</div>
                  </div>
                </div>
                {settings.theme === item.id && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Brightness & Contrast Sliders */}
        <div className="mt-6 space-y-4 pt-4 border-t border-gray-700/50">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t.comfortModal.brightness}</span>
              <span className="font-mono">{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={120}
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ brightness: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{t.comfortModal.contrast}</span>
              <span className="font-mono">{settings.contrast}%</span>
            </div>
            <input
              type="range"
              min={80}
              max={120}
              value={settings.contrast}
              onChange={(e) => onUpdateSettings({ contrast: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Sound Volume Slider */}
          <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> {t.reader.soundOff}
              </span>
              <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({
                  soundVolume: Number(e.target.value),
                  soundEnabled: Number(e.target.value) > 0,
                })
              }
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
