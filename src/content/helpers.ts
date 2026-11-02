// Функції, які дістають тексти потрібною мовою.
import { getCollection, getEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { localizePath, t, type Locale } from '../i18n/utils';

export async function getHome(lang: Locale) {
  const entry = await getEntry('home', `${lang}/home`);
  if (!entry) throw new Error(`Немає текстів головної: src/content/pages/${lang}/home.json`);
  return entry.data;
}

export async function getPrivileges(lang: Locale) {
  const entry = await getEntry('privileges', `${lang}/privileges`);
  if (!entry) throw new Error(`Немає текстів: src/content/pages/${lang}/privileges.json`);
  return entry.data;
}

export async function getContact(lang: Locale) {
  const entry = await getEntry('contact', `${lang}/contact`);
  if (!entry) throw new Error(`Немає текстів: src/content/pages/${lang}/contact.json`);
  return entry.data;
}

export async function getPartenariats(lang: Locale) {
  const entry = await getEntry('partenariats', `${lang}/partenariats`);
  if (!entry) throw new Error(`Немає текстів: src/content/pages/${lang}/partenariats.json`);
  return entry.data;
}

/**
 * Нагадування: чого бракує на сторінці (заглушки з Figma на сайті не показуємо — блок ховається).
 * LC_STRICT=true / 1 — збірка зупиняється, щоб недороблена сторінка не потрапила на живий сайт.
 */
const warnedMissing = new Set<string>();
export function warnMissing(page: string, what: string) {
  const message = `${page}: не заповнено — ${what} (на сайті — без цього блоку або із запасним варіантом)`;
  if (process.env.LC_STRICT === 'true' || process.env.LC_STRICT === '1') {
    throw new Error(`${message} (LC_STRICT)`);
  }
  if (warnedMissing.has(message)) return;
  warnedMissing.add(message);
  console.warn(`⚠ ${message}`);
}

/** Цифри за id з settings.json → stats мовою сторінки. Невідомий id — збірка зупиниться з поясненням. */
export async function getStats(ids: string[], lang: Locale) {
  const { stats } = await getSettings();
  return ids.map((id) => {
    const s = stats.find((x) => x.id === id);
    if (!s) throw new Error(`Немає цифри «${id}» у settings.json → stats`);
    return {
      value: s.value[lang],
      label: s.label[lang],
      count: s.count ?? undefined,
      decimals: s.decimals ?? undefined,
    };
  });
}

/**
 * Яхти для сторінки Yachts: демо (ілюстрації) — лише з features.yachtDemo; за order, «À la une» — не більше однієї.
 * Демо на живому сайті (без PUBLIC_NOINDEX=true) — попередження; LC_STRICT=true / 1 — збірка зупиняється.
 */
export async function getYachts() {
  const entries = await getCollection('yachts');
  for (const e of entries) {
    if (e.data.slug !== e.id) {
      throw new Error(`Яхта ${e.id}.json: slug «${e.data.slug}» має збігатися з назвою файлу`);
    }
  }
  const { features } = await getSettings();
  const list = entries
    .map((e) => e.data)
    .filter((y) => !y.demo || features.yachtDemo)
    .sort((a, b) => a.order - b.order);
  const featured = list.filter((y) => y.featured);
  if (featured.length > 1) {
    throw new Error(
      `«À la une» може бути лише одна яхта, а зараз: ${featured.map((y) => y.slug).join(', ')}`,
    );
  }
  if (features.yachtDemo && list.some((y) => y.demo) && import.meta.env.PUBLIC_NOINDEX !== 'true') {
    const message =
      'Yachts: демо-яхти на живому сайті! (settings.json → features.yachtDemo: false)';
    if (process.env.LC_STRICT === 'true' || process.env.LC_STRICT === '1') throw new Error(message);
    if (!warnedYachtDemo) console.warn(`⚠ ${message}`);
    warnedYachtDemo = true;
  }
  return list;
}
let warnedYachtDemo = false;

/** Сторінка яхти «Fiche yacht»: /fr/yachts/aurora/. Одне місце для всіх посилань на яхту. */
export function yachtHref(slug: string, lang: Locale) {
  return localizePath(`yachts/${slug}`, lang);
}

/** Longueur / Année / Cabines для карток яхт; невідоме — «—» (нічого не вигадуємо). */
export function yachtSpecs(
  y: { length: number; year: number | null; cabins: number | null },
  lang: Locale,
) {
  const num = new Intl.NumberFormat(lang);
  return [
    { label: t('yachts.length', lang), value: `${num.format(y.length)} m` },
    { label: t('yachts.year', lang), value: y.year ? String(y.year) : '—' },
    { label: t('yachts.cabins', lang), value: y.cabins !== null ? String(y.cabins) : '—' },
  ];
}

/** Ціна яхти («12 500 000 €») або текст на кшталт «Sur demande». */
export function yachtPrice(y: { price: number | null }, lang: Locale, onRequest: string) {
  return y.price
    ? new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(y.price)
    : onRequest;
}

/** Назва продавця для текстів: «[Société]» → назва або «mon partenaire» (порожньо — попередження). */
export async function getYachtPartner(lang: Locale) {
  const { yachtPartner } = await getSettings();
  const name = yachtPartner.name.trim();
  if (!name)
    warnMissing('Yachts', 'settings.json → yachtPartner (назва, логотип, юридичні дані продавця)');
  const fallback = { fr: 'mon partenaire', en: 'my partner', it: 'il mio partner' }[lang];
  return { ...yachtPartner, name, label: name || fallback, about: yachtPartner.about[lang] };
}

export async function getYachtsPage(lang: Locale) {
  const entry = await getEntry('yachtsPage', `${lang}/yachts`);
  if (!entry) throw new Error(`Немає текстів: src/content/pages/${lang}/yachts.json`);
  return entry.data;
}

// Логотип продавця яхт: src/assets/img/yachts/partner/<файл із settings.json → yachtPartner.logo>.
const partnerLogos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/yachts/partner/*.{png,svg,jpg,jpeg,webp,avif}',
  { eager: true },
);
export function getYachtPartnerLogo(file: string): ImageMetadata | null {
  if (!file.trim()) return null;
  const img = partnerLogos[`../assets/img/yachts/partner/${file.trim()}`];
  if (!img) throw new Error(`Немає логотипа продавця: src/assets/img/yachts/partner/${file}`);
  return img.default;
}

/**
 * Перегляд (npm run dev або тестова збірка без індексації, PUBLIC_NOINDEX=true): там, де ще немає даних,
 * показуємо заглушки з Figma, щоб на презентації було видно всю сторінку. На живому сайті — ховаємо.
 */
export function isPreview() {
  return import.meta.env.DEV || import.meta.env.PUBLIC_NOINDEX === 'true';
}

export async function getSettings() {
  const entry = await getEntry('site', 'settings');
  if (!entry) throw new Error('Немає файлу src/content/site/settings.json');
  return entry.data;
}

/** Усі товари. Перевіряє, що slug = назва файлу, а «related» посилаються на наявні товари. */
export async function getProducts() {
  const entries = await getCollection('products');
  for (const e of entries) {
    if (e.data.slug !== e.id) {
      throw new Error(`Товар ${e.id}.json: slug «${e.data.slug}» має збігатися з назвою файлу`);
    }
  }
  const products = entries.map((e) => e.data);
  const slugs = new Set(products.map((p) => p.slug));
  for (const p of products) {
    const missing = p.related.filter((s) => !slugs.has(s));
    if (missing.length) {
      throw new Error(`Товар «${p.slug}»: у related немає таких товарів: ${missing.join(', ')}`);
    }
  }
  return products;
}

// Фото товарів: src/assets/img/products/<slug>/<файл>.
const productFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/products/*/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** Фото товару за назвою файлу з JSON. Немає файлу — збірка зупиниться з поясненням. */
export function getProductImage(slug: string, file: string): ImageMetadata {
  const img = productFiles[`../assets/img/products/${slug}/${file}`];
  if (!img) throw new Error(`Немає фото товару: src/assets/img/products/${slug}/${file}`);
  return img.default;
}

/** Адреса сторінки товару: /fr/collection/veste-contessi/ */
export function productPath(slug: string, lang: Locale) {
  return localizePath(`collection/${slug}`, lang);
}

/**
 * Нагадування перед запуском: коди без сайту марки (на сайті — заглушка «Lien bientôt disponible»).
 * LC_STRICT=true (продакшн-збірка) — збірка зупиняється, щоб заглушки не потрапили на живий сайт.
 */
let warnedBrandLinks = false;
function warnMissingBrandLinks(codes: { id: string; url?: string | null }[]) {
  const missing = codes.filter((c) => !c.url).map((c) => c.id);
  if (!missing.length) return;
  const message = `Privilèges: ${missing.length} codes sans lien marque — ${missing.join(', ')}`;
  if (process.env.LC_STRICT === 'true') throw new Error(`${message} (LC_STRICT=true)`);
  if (warnedBrandLinks) return;
  warnedBrandLinks = true;
  console.warn(`⚠ ${message}`);
}

/** Сьогоднішня дата РРРР-ММ-ДД (час збірки). */
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Коди партнерів без прострочених, від найновіших (addedAt), далі за полем order.
 * Перевіряє: id = назва файлу, «À la une» (featured) — не більше одного.
 */
export async function getCodes() {
  const entries = await getCollection('codes');
  for (const e of entries) {
    if (e.data.id !== e.id) {
      throw new Error(`Код ${e.id}.json: id «${e.data.id}» має збігатися з назвою файлу`);
    }
  }
  const featured = entries.filter((e) => e.data.featured).map((e) => e.id);
  if (featured.length > 1) {
    throw new Error(`«À la une» може бути лише один код, а зараз: ${featured.join(', ')}`);
  }
  warnMissingBrandLinks(entries.map((e) => e.data));
  const now = today();
  return entries
    .map((e) => e.data)
    .filter((c) => !c.expiresAt || c.expiresAt >= now)
    .sort(
      (a, b) =>
        (b.addedAt ?? '').localeCompare(a.addedAt ?? '') ||
        (a.order ?? Infinity) - (b.order ?? Infinity),
    );
}

// Фото «À la une» і логотипи марок: src/assets/img/codes/<шлях з JSON>.
const codeFiles = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/codes/**/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true },
);

/** Фото або логотип коду. Немає файлу — збірка зупиниться з поясненням. */
export function getCodeImage(file: string): ImageMetadata {
  const img = codeFiles[`../assets/img/codes/${file}`];
  if (!img) throw new Error(`Немає файлу коду: src/assets/img/codes/${file}`);
  return img.default;
}

/** Категорії cookies, яким потрібна згода (settings.json → consent). Порожньо — без банера. */
export function consentCategories(settings: {
  consent: Record<'analytics' | 'affiliates', boolean>;
}) {
  return (['analytics', 'affiliates'] as const).filter((c) => settings.consent[c]);
}

/**
 * Адреса пошти з settings.json → emails. Порожня — '' (на сайті «[e-mail]») і попередження під час збірки;
 * LC_STRICT=true — збірка зупиняється, щоб заглушка не потрапила на живий сайт.
 */
const warnedEmails = new Set<string>();
export function getEmail(
  settings: { emails: Record<'contact' | 'press' | 'partnerships' | 'yachts', string> },
  kind: 'contact' | 'press' | 'partnerships' | 'yachts',
) {
  const email = settings.emails[kind].trim();
  if (email) return email;
  const message = `settings.json → emails.${kind} порожній (на сайті — «[e-mail]»)`;
  if (process.env.LC_STRICT === 'true' || process.env.LC_STRICT === '1') {
    throw new Error(`${message} (LC_STRICT)`);
  }
  if (!warnedEmails.has(kind)) {
    warnedEmails.add(kind);
    console.warn(`⚠ ${message}`);
  }
  return '';
}
