/**
 * Polyfills for modern ECMAScript features required by pdfjs-dist (v6+)
 * on Android WebView, iOS WebKit, and older browsers/environments.
 */

// 1. Promise.withResolvers polyfill (Chrome 119+, Safari 17.4+)
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 2. Promise.try polyfill (Chrome 128+)
if (typeof (Promise as any).try === 'undefined') {
  (Promise as any).try = function (fn: (...args: any[]) => any, ...args: any[]) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

// 3. Uint8Array.prototype.toHex polyfill (ECMAScript 2024 / Chrome 130+)
if (typeof (Uint8Array.prototype as any).toHex === 'undefined') {
  (Uint8Array.prototype as any).toHex = function () {
    let hex = '';
    const len = this.length;
    for (let i = 0; i < len; i++) {
      hex += this[i].toString(16).padStart(2, '0');
    }
    return hex;
  };
}

// 4. Uint8Array.fromHex polyfill
if (typeof (Uint8Array as any).fromHex === 'undefined') {
  (Uint8Array as any).fromHex = function (hexString: string) {
    const clean = hexString.replace(/[^0-9a-fA-F]/g, '');
    const len = Math.floor(clean.length / 2);
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }
    return u8;
  };
}

// 5. Uint8Array.prototype.setFromHex polyfill
if (typeof (Uint8Array.prototype as any).setFromHex === 'undefined') {
  (Uint8Array.prototype as any).setFromHex = function (hexString: string) {
    const clean = hexString.replace(/[^0-9a-fA-F]/g, '');
    const len = Math.min(this.length, Math.floor(clean.length / 2));
    for (let i = 0; i < len; i++) {
      (this as Uint8Array)[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }
    return { read: len * 2, written: len };
  };
}

// 6. Uint8Array.prototype.toBase64 polyfill
if (typeof (Uint8Array.prototype as any).toBase64 === 'undefined') {
  (Uint8Array.prototype as any).toBase64 = function () {
    let binary = '';
    const bytes = this as Uint8Array;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof btoa === 'function') {
      return btoa(binary);
    }
    const buf = (globalThis as any).Buffer;
    return buf ? buf.from(binary, 'binary').toString('base64') : '';
  };
}

// 7. Uint8Array.fromBase64 polyfill
if (typeof (Uint8Array as any).fromBase64 === 'undefined') {
  (Uint8Array as any).fromBase64 = function (base64String: string) {
    let binary = '';
    if (typeof atob === 'function') {
      binary = atob(base64String);
    } else {
      const buf = (globalThis as any).Buffer;
      binary = buf ? buf.from(base64String, 'base64').toString('binary') : '';
    }
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      u8[i] = binary.charCodeAt(i);
    }
    return u8;
  };
}

export const polyfillsApplied = true;
