// Сторінка кошика: малює рядки з localStorage (src/scripts/cart.ts) за даними з #products-data,
// рахує суми, промокод (поки локально: settings.json → shopCodes), «Complétez le look» без товарів із кошика.
// TODO: Shopify — ціни, знижки й оплата (окремий етап).
import {
  getCart,
  keepOnly,
  MAX_QTY,
  MIN_QTY,
  remove,
  setQty,
  type CartData,
  type CartItem,
} from './cart';

const CODE_KEY = 'lc-cart-code';
const readCode = () => {
  try {
    return sessionStorage.getItem(CODE_KEY) ?? '';
  } catch {
    return '';
  }
};
const writeCode = (code: string) => {
  try {
    if (code) sessionStorage.setItem(CODE_KEY, code);
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    // сховище недоступне — код діє до перезавантаження
  }
};

export function initCartPage() {
  const root = document.querySelector<HTMLElement>('[data-cart-page]');
  const dataEl = document.getElementById('products-data');
  const tpl = document.querySelector<HTMLTemplateElement>('#cart-row-tpl');
  if (!root || !dataEl || !tpl) return;
  const data = JSON.parse(dataEl.textContent ?? '{}') as CartData;
  const m = root.dataset;
  const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const list = $('[data-cart-list]');
  const filled = $('[data-cart-filled]');
  const empty = $('[data-cart-empty]');
  const fmt = new Intl.NumberFormat(m.lang, { style: 'currency', currency: 'EUR' });
  const money = (v: number | null, placeholder: string) =>
    v === null ? placeholder : fmt.format(v);
  const bySlug = new Map(data.products.map((p) => [p.slug, p]));
  const colorOf = (item: CartItem) => {
    const p = bySlug.get(item.slug);
    return p?.colors.find((c) => c.id === item.color);
  };

  // Товар, якого вже немає в колекції (або такого кольору), — тихо прибираємо.
  keepOnly((i) => !!colorOf(i));

  // ---- Нижня панель (mobile < 1024): видно, коли кнопки «Passer au paiement» в картці не видно ----
  const bar = $('[data-cart-bar]');
  const mobile = window.matchMedia('(max-width: 1023px)');
  let payVisible = true;
  const syncBar = () => {
    const show = mobile.matches && !payVisible && !filled.hidden;
    bar.hidden = !show;
    document.documentElement.classList.toggle('has-cart-bar', show);
    if (show) document.documentElement.style.setProperty('--cart-bar-h', `${bar.offsetHeight}px`);
  };
  new IntersectionObserver(([entry]) => {
    payVisible = entry.isIntersecting;
    syncBar();
  }).observe($('[data-checkout]'));
  mobile.addEventListener('change', syncBar);

  let code = '';
  const percent = () => data.codes.find((c) => c.code === code)?.percent ?? 0;

  const key = (i: CartItem) => `${i.slug}|${i.color}|${i.size}`;

  const row = (item: CartItem) => {
    const p = bySlug.get(item.slug)!;
    const c = colorOf(item)!;
    const li = tpl.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
    li.dataset.key = key(item);
    const href = c.id === p.defaultColor ? p.url : `${p.url}?couleur=${encodeURIComponent(c.id)}`;
    li.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((a) => (a.href = href));
    const title = c.label ? `${p.name} ${c.label}` : p.name;
    li.querySelector<HTMLImageElement>('[data-img]')!.src = c.image;
    li.querySelector('[data-name]')!.textContent = title;
    // Desktop: «Couleur : Navy · Taille : M»; mobile — коротко «Navy · M».
    li.querySelector('[data-meta-long]')!.textContent = [
      c.label && `${m.msgColor} ${c.label}`,
      item.size && `${m.msgSize} : ${item.size}`,
    ]
      .filter(Boolean)
      .join(' · ');
    li.querySelector('[data-meta-short]')!.textContent = [c.label, item.size]
      .filter(Boolean)
      .join(' · ');
    li.querySelector('[data-qty-group]')!.setAttribute('aria-label', `${m.msgQty} — ${title}`);
    li.querySelector('[data-dec]')!.setAttribute('aria-label', `${m.msgDecrease} — ${title}`);
    li.querySelector('[data-inc]')!.setAttribute('aria-label', `${m.msgIncrease} — ${title}`);
    const rm = li.querySelector<HTMLButtonElement>('[data-remove]')!;
    rm.textContent = m.msgRemove ?? '';
    rm.setAttribute('aria-label', `${m.msgRemove} — ${title}`);
    return li;
  };

  // Оновлює числа в рядку (без перемальовування — фокус на +/− лишається на місці).
  const fill = (li: HTMLElement, item: CartItem) => {
    const p = bySlug.get(item.slug)!;
    li.querySelector('[data-qty]')!.textContent = String(item.qty);
    li.querySelector('[data-price]')!.textContent = money(
      p.price === null ? null : p.price * item.qty,
      m.msgPrice ?? '',
    );
    // Межі 1…10: кнопка лишається у Tab, але позначена неактивною.
    const limit = (el: Element, off: boolean) =>
      off ? el.setAttribute('aria-disabled', 'true') : el.removeAttribute('aria-disabled');
    limit(li.querySelector('[data-dec]')!, item.qty <= MIN_QTY);
    limit(li.querySelector('[data-inc]')!, item.qty >= MAX_QTY);
  };

  const render = () => {
    const items = getCart();
    const count = items.reduce((s, i) => s + i.qty, 0);
    $('[data-cart-items]').textContent = count
      ? (count === 1 ? m.msgItemsOne : m.msgItemsMany)!.replace('{n}', String(count))
      : '';
    filled.hidden = !items.length;
    empty.hidden = !!items.length;
    root.classList.toggle('is-empty', !items.length);

    // Рядки: додаємо нові, прибираємо зниклі, оновлюємо числа.
    const keys = new Set(items.map(key));
    list.querySelectorAll<HTMLElement>('[data-key]').forEach((li) => {
      if (!keys.has(li.dataset.key!)) li.remove();
    });
    items.forEach((item) => {
      let li = list.querySelector<HTMLElement>(`[data-key="${CSS.escape(key(item))}"]`);
      if (!li) list.append((li = row(item)));
      fill(li, item);
    });

    // Суми: якщо хоч одна ціна невідома — заглушки «[Prix] €» / «[Total] €».
    const known = items.every((i) => bySlug.get(i.slug)?.price != null);
    const subtotal = known
      ? items.reduce((s, i) => s + (bySlug.get(i.slug)!.price ?? 0) * i.qty, 0)
      : null;
    const pct = percent();
    const discount = subtotal === null ? null : Math.round(subtotal * pct) / 100;
    $('[data-cart-subtotal]').textContent = money(subtotal, m.msgPrice ?? '');
    $('[data-cart-discount-row]').hidden = !pct;
    $('[data-cart-discount]').textContent =
      discount === null ? (m.msgDiscount ?? '') : `− ${fmt.format(discount)}`;
    const total = money(
      subtotal === null || discount === null ? null : subtotal - discount,
      m.msgTotal ?? '',
    );
    $('[data-cart-total]').textContent = total;
    $('[data-cart-bar-total]').textContent = total;
    $('[data-cart-bar-count]').textContent = (m.msgBarTotal ?? '').replace(
      '{items}',
      $('[data-cart-items]').textContent ?? '',
    );
    syncBar();

    // «Complétez le look»: без товарів, які вже в кошику, не більше limit карток.
    const look = document.querySelector<HTMLElement>('[data-look-limit]');
    if (look) {
      const limit = Number(look.dataset.lookLimit) || Infinity;
      const inCart = new Set(items.map((i) => i.slug));
      let shown = 0;
      look.querySelectorAll<HTMLElement>('[data-look-item]').forEach((card) => {
        const show = !inCart.has(card.dataset.lookItem!) && shown < limit;
        card.hidden = !show;
        if (show) shown++;
      });
      look.hidden = shown === 0;
    }
  };

  // Кількість і «Retirer» — делегування на список.
  list.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-dec], [data-inc], [data-remove]',
    );
    const li = btn?.closest<HTMLElement>('[data-key]');
    if (!btn || !li) return;
    const [slug, color, size] = li.dataset.key!.split('|');
    const item = getCart().find((i) => key(i) === li.dataset.key);
    if (!item) return;
    if (btn.hasAttribute('data-remove')) {
      // Фокус — на наступний рядок (або попередній), щоб не загубився; кошик порожній — на заголовок.
      const next = (li.nextElementSibling ?? li.previousElementSibling) as HTMLElement | null;
      remove(slug, color, size);
      (next?.querySelector<HTMLElement>('[data-remove]') ?? $('[data-cart-empty-title]')).focus();
      return;
    }
    if (btn.getAttribute('aria-disabled') === 'true') return;
    setQty(slug, color, size, item.qty + (btn.hasAttribute('data-dec') ? -1 : 1));
  });

  // ---- Code promo ----
  const form = $<HTMLFormElement>('[data-promo-form]');
  const input = form.querySelector<HTMLInputElement>('input')!;
  const error = $('[data-promo-error]');
  const applied = $('[data-promo-applied]');
  const showCode = () => {
    const pct = percent();
    form.hidden = !!pct;
    applied.hidden = !pct;
    if (pct) {
      $('[data-promo-name]').textContent = code;
      $('[data-promo-percent]').textContent = `−${pct} %`;
    }
    render();
  };
  const apply = (value: string, moveFocus = true) => {
    const v = value.trim().toUpperCase().replace(/\s+/g, '');
    if (!v) return;
    if (data.codes.some((c) => c.code === v)) {
      code = v;
      writeCode(v);
      error.hidden = true;
      input.removeAttribute('aria-invalid');
      input.value = '';
      showCode();
      if (moveFocus) $('[data-promo-remove]').focus();
    } else {
      input.value = v;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      if (moveFocus) input.focus();
    }
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply(input.value);
  });
  input.addEventListener('input', () => {
    error.hidden = true;
    input.removeAttribute('aria-invalid');
  });
  $('[data-promo-remove]').addEventListener('click', () => {
    code = '';
    writeCode('');
    showCode();
    input.focus();
  });

  // ---- «Passer au paiement» — поки «bientôt» ----
  const pay = $('[data-checkout]');
  pay.addEventListener('click', (e) => {
    e.preventDefault();
    $('[data-checkout-soon]').hidden = false;
  });
  // Кнопка панелі веде до кнопки в картці (там і «bientôt», і способи оплати).
  $('[data-checkout-bar]').addEventListener('click', (e) => {
    e.preventDefault();
    pay.scrollIntoView({ block: 'center', behavior: 'smooth' });
    $('[data-checkout-soon]').hidden = false;
    pay.focus({ preventScroll: true });
  });

  // Код із адреси (?code=LUIGI10 з промо-смуги) або збережений у цій вкладці.
  const fromUrl = new URLSearchParams(location.search).get('code');
  code = data.codes.some((c) => c.code === readCode()) ? readCode() : '';
  if (fromUrl) apply(fromUrl, false);
  else showCode();
  window.addEventListener('lc:cart', render);
  window.addEventListener('storage', (e) => e.key === 'lc-cart' && render());
}
