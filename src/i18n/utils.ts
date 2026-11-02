// Дрібні написи інтерфейсу і робота з адресами різними мовами.
import { locales, defaultLocale } from './locales.js';
import fr from './ui/fr.json';
import en from './ui/en.json';
import it from './ui/it.json';

export type Locale = (typeof locales)[number];
export { locales, defaultLocale };

const dictionaries = { fr, en, it } as const;
export type UiKey = keyof typeof fr;

/** Напис інтерфейсу за ключем: t('nav.journal', 'fr'). */
export function t(key: UiKey, lang: Locale): string {
  return dictionaries[lang][key] ?? dictionaries[defaultLocale][key] ?? key;
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Адреса сторінки потрібною мовою: localizePath('contact', 'fr') → /fr/contact/ */
export function localizePath(path: string, lang: Locale): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const [p, hash] = clean.split('#');
  const tail = p ? `${p}/` : '';
  return `${base}/${lang}/${tail}${hash ? `#${hash}` : ''}`;
}

/** Та сама сторінка іншою мовою (для перемикача мов). */
export function switchLocale(pathname: string, to: Locale): string {
  const rest = pathname.replace(base, '').split('/').filter(Boolean);
  if (isLocale(rest[0])) rest.shift();
  return localizePath(rest.join('/'), to);
}
