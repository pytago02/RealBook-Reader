import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const triggerHaptic = async (type: 'light' | 'medium' | 'selection' = 'light') => {
  try {
    if (!Capacitor.isNativePlatform()) return;
    if (type === 'selection') {
      await Haptics.selectionChanged();
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // Gracefully ignore if haptics not supported or permission denied
  }
};

export const setupNativeStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#141518' });
  } catch {
    // Ignore in web/electron environments
  }
};

export const registerBackButtonHandler = (
  onBack: () => boolean
): (() => void) => {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  let cleanup: (() => void) | undefined;

  CapacitorApp.addListener('backButton', () => {
    const handled = onBack();
    if (!handled) {
      CapacitorApp.exitApp();
    }
  }).then((handle) => {
    cleanup = () => handle.remove();
  });

  return () => {
    cleanup?.();
  };
};
