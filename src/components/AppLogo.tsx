import React, { useState } from "react";
import appLogoUrl from "../assets/logo.svg";

interface AppLogoProps {
  className?: string;
  alt?: string;
  onClick?: () => void;
}

/**
 * Universal AppLogo component.
 * Uses Vite-resolved relative asset URL (bundled into dist/assets/) with
 * automatic inline SVG vector fallback, ensuring 100% reliable rendering
 * across web browsers, Electron desktop app, and offline environments.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = "w-10 h-10 object-contain",
  alt = "RealBook Reader Logo",
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Vector fallback ensuring zero broken image icons anywhere
    return (
      <svg
        viewBox="0 0 512 512"
        className={className}
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={alt}
      >
        <defs>
          <linearGradient id="fallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0e1118" />
            <stop offset="50%" stopColor="#141824" />
            <stop offset="100%" stopColor="#1a1f2e" />
          </linearGradient>
          <linearGradient id="fallbackTurn" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="464" height="464" rx="104" fill="url(#fallbackBg)" stroke="#f59e0b" strokeWidth="3" />
        <path d="M 256 368 C 198 353 140 350 96 338 L 102 188 C 144 200 202 204 256 218 Z" fill="#ffffff" />
        <path d="M 256 368 C 314 353 372 350 416 338 L 410 188 C 368 200 310 204 256 218 Z" fill="#e2e8f0" />
        <path d="M 256 218 C 285 228 322 232 355 210 C 388 188 406 156 414 144 C 400 126 370 123 340 138 C 290 162 264 198 256 218 Z" fill="url(#fallbackTurn)" />
        <path d="M 248 188 L 248 398 L 256 388 L 264 398 L 264 188 Z" fill="#10b981" />
      </svg>
    );
  }

  return (
    <img
      src={appLogoUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setHasError(true)}
    />
  );
};

export default AppLogo;
