import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, getTranslation, type TranslationDictionary } from '../src/i18n';
import type { AppLanguage } from '../src/types';

describe('i18n translations system', () => {
  const expectedLanguages: AppLanguage[] = ['vi', 'en', 'zh', 'fr', 'es', 'ja'];

  it('supports all 6 required languages', () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual(expectedLanguages);
    expectedLanguages.forEach((code) => {
      expect(TRANSLATIONS[code]).toBeDefined();
    });
  });

  it('fallback returns Vietnamese when language is undefined or invalid', () => {
    expect(getTranslation()).toBe(TRANSLATIONS.vi);
    expect(getTranslation('vi')).toBe(TRANSLATIONS.vi);
    // @ts-expect-error test fallback on invalid language
    expect(getTranslation('nonexistent')).toBe(TRANSLATIONS.vi);
  });

  // Verify completeness of every translation dictionary
  const expectedKeys = (dict: TranslationDictionary) => {
    return {
      common: Object.keys(dict.common),
      header: Object.keys(dict.header),
      shelf: Object.keys(dict.shelf),
      online: Object.keys(dict.online),
      onlineCategories: Object.keys(dict.online.categories),
      reader: Object.keys(dict.reader),
      comfortModal: Object.keys(dict.comfortModal),
      typographyModal: Object.keys(dict.typographyModal),
      tocModal: Object.keys(dict.tocModal),
    };
  };

  const viKeys = expectedKeys(TRANSLATIONS.vi);

  expectedLanguages.forEach((lang) => {
    describe(`Language: ${lang}`, () => {
      const dict = TRANSLATIONS[lang];
      const langKeys = expectedKeys(dict);

      it('has all matching common keys', () => {
        expect(langKeys.common.sort()).toEqual(viKeys.common.sort());
      });

      it('has all matching header keys', () => {
        expect(langKeys.header.sort()).toEqual(viKeys.header.sort());
      });

      it('has all matching shelf keys', () => {
        expect(langKeys.shelf.sort()).toEqual(viKeys.shelf.sort());
      });

      it('has all matching online keys and categories', () => {
        expect(langKeys.online.sort()).toEqual(viKeys.online.sort());
        expect(langKeys.onlineCategories.sort()).toEqual(viKeys.onlineCategories.sort());
      });

      it('has all 10 categories translated', () => {
        const requiredCategories = [
          'recommended',
          'vietnamese',
          'world_classics',
          'all',
          'philosophy',
          'history',
          'science',
          'adventure',
          'psychology',
          'poetry',
        ];
        requiredCategories.forEach((cat) => {
          expect(dict.online.categories[cat as keyof typeof dict.online.categories]).toBeTruthy();
        });
      });

      it('has all matching reader keys', () => {
        expect(langKeys.reader.sort()).toEqual(viKeys.reader.sort());
      });

      it('has all matching modal keys', () => {
        expect(langKeys.comfortModal.sort()).toEqual(viKeys.comfortModal.sort());
        expect(langKeys.typographyModal.sort()).toEqual(viKeys.typographyModal.sort());
        expect(langKeys.tocModal.sort()).toEqual(viKeys.tocModal.sort());
      });

      it('no translation string is empty or undefined', () => {
        const checkObject = (obj: any, path: string) => {
          for (const key in obj) {
            const val = obj[key];
            const currentPath = `${path}.${key}`;
            if (typeof val === 'string') {
              expect(val.trim().length, `String at ${currentPath} should not be empty`).toBeGreaterThan(0);
            } else if (typeof val === 'object' && val !== null) {
              checkObject(val, currentPath);
            }
          }
        };
        checkObject(dict, lang);
      });

      it('contains expected placeholders where needed', () => {
        // Shelf pageProgress contains {current} and {total}
        expect(dict.shelf.pageProgress).toContain('{current}');
        expect(dict.shelf.pageProgress).toContain('{total}');
        // Shelf pagesCount contains {count}
        expect(dict.shelf.pagesCount).toContain('{count}');
        // Header tabShelf contains {count}
        expect(dict.header.tabShelf).toContain('{count}');
        // Online totalBooksCount contains {count}
        expect(dict.online.totalBooksCount).toContain('{count}');
        // Online searchResultsFor contains {query}
        expect(dict.online.searchResultsFor).toContain('{query}');
        // TocModal tabBookmarks contains {count}
        expect(dict.tocModal.tabBookmarks).toContain('{count}');
      });
    });
  });
});
