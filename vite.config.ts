import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        banner: `/* Polyfills for Android WebView */
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function() {
    var res, rej;
    var p = new Promise(function(resolve, reject) { res = resolve; rej = reject; });
    return { promise: p, resolve: res, reject: rej };
  };
}
if (typeof Promise.try === 'undefined') {
  Promise.try = function(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new Promise(function(resolve) { resolve(fn.apply(null, args)); });
  };
}
if (typeof Uint8Array.prototype.toHex === 'undefined') {
  Uint8Array.prototype.toHex = function() {
    var str = '';
    for (var i = 0; i < this.length; i++) {
      str += this[i].toString(16).padStart(2, '0');
    }
    return str;
  };
}
if (typeof Uint8Array.fromHex === 'undefined') {
  Uint8Array.fromHex = function(hex) {
    var clean = hex.replace(/[^0-9a-fA-F]/g, '');
    var len = Math.floor(clean.length / 2);
    var u8 = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      u8[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }
    return u8;
  };
}
if (typeof Uint8Array.prototype.setFromHex === 'undefined') {
  Uint8Array.prototype.setFromHex = function(hex) {
    var clean = hex.replace(/[^0-9a-fA-F]/g, '');
    var len = Math.min(this.length, Math.floor(clean.length / 2));
    for (var i = 0; i < len; i++) {
      this[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }
    return { read: len * 2, written: len };
  };
}
if (typeof Uint8Array.prototype.toBase64 === 'undefined') {
  Uint8Array.prototype.toBase64 = function() {
    var bin = '';
    for (var i = 0; i < this.length; i++) bin += String.fromCharCode(this[i]);
    return typeof btoa === 'function' ? btoa(bin) : '';
  };
}
if (typeof Uint8Array.fromBase64 === 'undefined') {
  Uint8Array.fromBase64 = function(b64) {
    var bin = typeof atob === 'function' ? atob(b64) : '';
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  };
}
`,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
