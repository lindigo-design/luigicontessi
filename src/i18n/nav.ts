// Пункти меню і футера. Тексти — ключі з i18n/ui/<мова>.json.
import type { ImageMetadata } from 'astro';
import type { UiKey } from './utils';
import univers1 from '../assets/img/home/univers-1.jpg';
import yachts from '../assets/img/home/yachts.jpg';
import news2 from '../assets/img/home/news-2.jpg';
import privileges from '../assets/img/privileges/gallery-1.jpg';
import collection1 from '../assets/img/home/collection-1.jpg';

export interface NavItem {
  key: UiKey;
  path: string;
  /** Показувати лише коли увімкнено магазин (site/settings.json → features.shop). */
  shop?: boolean;
}

/** Великий пункт меню: фото й підпис праворуч змінюються при наведенні. */
export interface MenuItem extends NavItem {
  preview: ImageMetadata;
  caption: UiKey;
}

/** Великі пункти меню. Collection — поки магазин вимкнено; з магазином на її місці Boutique. */
export const menuPrimary = (shop: boolean): MenuItem[] => [
  { key: 'nav.journal', path: 'journal', preview: univers1, caption: 'menu.caption.journal' },
  { key: 'nav.yachts', path: 'yachts', preview: yachts, caption: 'menu.caption.yachts' },
  {
    key: 'nav.favorites',
    path: 'coups-de-coeur',
    preview: news2,
    caption: 'menu.caption.favorites',
  },
  {
    key: 'nav.privileges',
    path: 'privileges',
    preview: privileges,
    caption: 'menu.caption.privileges',
  },
  {
    ...(shop
      ? { key: 'nav.shop', path: 'boutique' }
      : { key: 'nav.collection', path: 'collection' }),
    preview: collection1,
    caption: 'menu.caption.collection',
  } as MenuItem,
];

/** Дрібні пункти меню (в один рядок під великими). */
export const menuSecondary: NavItem[] = [
  { key: 'nav.about', path: 'a-propos' },
  { key: 'nav.partnerships', path: 'partenariats' },
  { key: 'nav.press', path: 'presse' },
  { key: 'nav.contact', path: 'contact' },
];

/** Посилання, видимі в шапці (desktop / tablet). */
export const headerLinks: NavItem[] = [{ key: 'nav.privileges', path: 'privileges' }];

export const footerNav: { title: UiKey; items: NavItem[] }[] = [
  {
    title: 'footer.explore',
    items: [
      { key: 'nav.journal', path: 'journal' },
      { key: 'nav.yachts', path: 'yachts' },
      { key: 'footer.universes', path: '#univers' },
    ],
  },
  {
    title: 'footer.shop',
    items: [
      { key: 'footer.collection', path: 'collection' },
      { key: 'nav.favorites', path: 'coups-de-coeur' },
      { key: 'nav.privileges', path: 'privileges' },
    ],
  },
  {
    title: 'footer.luigi',
    items: [
      { key: 'footer.about', path: 'a-propos' },
      { key: 'nav.partnerships', path: 'partenariats' },
      { key: 'footer.mediaKit', path: 'partenariats#media-kit' },
    ],
  },
  {
    title: 'footer.help',
    items: [
      { key: 'footer.contact', path: 'contact' },
      { key: 'footer.faq', path: 'faq' },
      { key: 'footer.shipping', path: 'livraison-retours', shop: true },
    ],
  },
];

export const legalNav: NavItem[] = [
  { key: 'legal.notice', path: 'mentions-legales' },
  { key: 'legal.terms', path: 'cgv', shop: true },
  { key: 'legal.privacy', path: 'confidentialite' },
  { key: 'legal.cookies', path: 'cookies' },
];

/**
 * Сторінки, які вже зроблені. Посилання на ще не готову сторінку (напр. Journal на 404)
 * перевіряють цей список і ведуть на запасну. Зробили сторінку — додай сюди її path.
 */
export const builtPages = new Set<string>(['', 'privileges', 'contact', 'partenariats']);
export const isBuilt = (path: string) => builtPages.has(path.split('#')[0]);
