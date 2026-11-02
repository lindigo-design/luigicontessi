// Кошик у браузері (поки магазин без Shopify): localStorage['lc-cart'] = { v: 1, items: [...] }.
// Після кожної зміни — подія `lc:cart` (лічильник у шапці, сторінка кошика).
// TODO: Shopify Storefront API — окремий етап; тоді міняється лише «джерело даних» тут.
export interface CartItem {
  slug: string;
  color: string;
  size: string;
  qty: number;
}
/** Дані для сторінки кошика (вбудований JSON #products-data, src/pages/[lang]/panier.astro). */
export interface CartData {
  products: {
    slug: string;
    name: string;
    price: number | null;
    url: string;
    defaultColor: string;
    colors: { id: string; label: string; image: string }[];
  }[];
  codes: { code: string; percent: number }[];
}
interface Stored {
  v: number;
  items: CartItem[];
}

const KEY = 'lc-cart';
const VERSION = 1;
export const MIN_QTY = 1;
export const MAX_QTY = 10;

const clamp = (n: number) => Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(n) || MIN_QTY));
const same = (a: Omit<CartItem, 'qty'>, b: Omit<CartItem, 'qty'>) =>
  a.slug === b.slug && a.color === b.color && a.size === b.size;

export function getCart(): CartItem[] {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Stored | null;
    if (!s || s.v !== VERSION || !Array.isArray(s.items)) return [];
    return s.items
      .filter((i) => i && typeof i.slug === 'string' && typeof i.color === 'string')
      .map((i) => ({
        slug: i.slug,
        color: i.color,
        size: String(i.size ?? ''),
        qty: clamp(i.qty),
      }));
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, items }));
  } catch {
    // Приватний режим / заблоковане сховище — кошик живе до перезавантаження сторінки.
  }
  window.dispatchEvent(new CustomEvent('lc:cart', { detail: items }));
}

/** Додає товар; такий самий (товар + колір + розмір) — збільшує кількість, а не новий рядок. */
export function add(item: Omit<CartItem, 'qty'> & { qty?: number }) {
  const items = getCart();
  const found = items.find((i) => same(i, item));
  if (found) found.qty = clamp(found.qty + (item.qty ?? 1));
  else items.push({ ...item, qty: clamp(item.qty ?? 1) });
  save(items);
}

export function setQty(slug: string, color: string, size: string, qty: number) {
  const items = getCart();
  const found = items.find((i) => same(i, { slug, color, size }));
  if (!found) return;
  found.qty = clamp(qty);
  save(items);
}

export function remove(slug: string, color: string, size: string) {
  save(getCart().filter((i) => !same(i, { slug, color, size })));
}

/** Прибирає товари, яких уже немає (напр. зник із колекції). */
export function keepOnly(test: (item: CartItem) => boolean) {
  const items = getCart();
  const kept = items.filter(test);
  if (kept.length !== items.length) save(kept);
}

/** Скільки речей у кошику (з урахуванням кількості). */
export function count() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

/** Лічильник «Panier (2)» у шапці — на всіх сторінках, оновлюється одразу (і з інших вкладок). */
export function initCartCount() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-cart-count]')];
  if (!els.length) return;
  const render = () => {
    const n = String(count());
    els.forEach((el) => (el.textContent = n));
  };
  render();
  window.addEventListener('lc:cart', render);
  window.addEventListener('storage', (e) => e.key === KEY && render());
}
