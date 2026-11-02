// Пункти меню і футера. Тексти — ключі з i18n/ui/<мова>.json.
import type { UiKey } from './utils';

export interface NavItem {
  key: UiKey;
  path: string;
  /** Показувати лише коли увімкнено магазин (site/settings.json → features.shop). */
  shop?: boolean;
}

export const mainNav: NavItem[] = [
  { key: 'nav.journal', path: 'journal' },
  { key: 'nav.yachts', path: 'yachts' },
  { key: 'nav.shop', path: 'boutique', shop: true },
  { key: 'nav.favorites', path: 'coups-de-coeur' },
  { key: 'nav.privileges', path: 'privileges' },
];

export const utilityNav: NavItem[] = [{ key: 'nav.partnerships', path: 'partenariats' }];

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
