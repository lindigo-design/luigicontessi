// Сторінка товару: колір (галерея + підпис + ?couleur= в адресі й у перемикачі мов),
// галерея (мініатюри / свайп, крапки, «1 / 4»), розміри (підказка, «épuisé»), Guide des tailles,
// форми «Me prévenir» (поки чесне «bientôt», нічого не відправляють).
import { createAutoplay } from './autoplay';
import { enableDragScroll } from './drag-scroll';
import { add } from './cart';

export function initProduct() {
  const root = document.querySelector<HTMLElement>('[data-product]');
  if (!root) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Галереї (по одній на колір) ----
  // Desktop: мініатюри. Tablet / mobile (< 1024): свайп, перетягування мишкою, крапки, стрілки
  // й автопрокрутка кожні 5 с по колу (пауза — курсор / палець / фокус, src/scripts/autoplay.ts).
  const narrow = window.matchMedia('(max-width: 1023px)');
  root.querySelectorAll<HTMLElement>('[data-pgal]').forEach((gal) => {
    const track = gal.querySelector<HTMLElement>('[data-pgal-track]');
    const slides = [...gal.querySelectorAll<HTMLElement>('[data-pgal-slide]')];
    const thumbs = [...gal.querySelectorAll<HTMLButtonElement>('[data-pgal-thumb]')];
    const bars = [...gal.querySelectorAll<HTMLElement>('[data-pgal-bar]')];
    const count = gal.querySelector<HTMLElement>('[data-pgal-count]');
    if (!track || slides.length < 2) return;
    let active = 0;
    const mark = (i: number) => {
      active = i;
      thumbs.forEach((b, k) => {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', String(k === i));
      });
      // Нова активна смужка — її анімація (і відлік 5 с) починається заново.
      bars.forEach((b, k) => b.classList.toggle('is-active', k === i));
      const pad = (n: number) => String(n).padStart(2, '0');
      if (count) count.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
    };
    let target = -1; // куди їде стрічка після кліку / автопрокрутки
    const go = (i: number, smooth = true) => {
      const n = (i + slides.length) % slides.length;
      target = n;
      mark(n); // крапки й «2 / 4» — одразу, не чекаючи кінця плавної прокрутки
      track.scrollTo({
        left: n * track.clientWidth,
        behavior: smooth && !reduce ? 'smooth' : 'auto',
      });
    };
    const nearest = () => Math.round(track.scrollLeft / track.clientWidth);
    // Автопрокрутка як у відгуках: таймер — анімація смужки; пауза — animation-play-state.
    const autoplay = createAutoplay(gal, () => go(active + 1), {
      enabled: () => narrow.matches && !gal.hidden,
      timer: false,
      onPause: (paused) => gal.classList.toggle('is-paused', paused),
    });
    gal.addEventListener('animationend', (e) => {
      if ((e.target as HTMLElement).closest('[data-pgal-bar]')?.classList.contains('is-active')) {
        go(active + 1);
      }
    });
    const userGo = (i: number) => {
      go(i);
      autoplay.restart();
    };
    thumbs.forEach((b, k) => b.addEventListener('click', () => userGo(k)));
    gal.querySelector('[data-pgal-prev]')?.addEventListener('click', () => userGo(active - 1));
    gal.querySelector('[data-pgal-next]')?.addEventListener('click', () => userGo(active + 1));
    // Свайп пальцем або перетягування — далі веде людина, а не ціль кліку.
    track.addEventListener('pointerdown', () => (target = -1));
    track.addEventListener('touchstart', () => (target = -1), { passive: true });
    const drag = enableDragScroll(track, {
      enabled: () => narrow.matches,
      onEnd: () => userGo(nearest()),
    });
    let timer = 0;
    track.addEventListener('scroll', () => {
      window.clearTimeout(timer);
      if (drag.isDragging()) return;
      timer = window.setTimeout(() => {
        const n = nearest();
        if (target >= 0 && n !== target) return; // ще їдемо до цілі — не показуємо проміжні фото
        target = -1;
        mark(n);
      }, 60);
    });
    narrow.addEventListener('change', () => autoplay.restart());
    autoplay.restart();
    gal.addEventListener('product:reset', () => {
      go(0, false);
      mark(0);
      autoplay.restart(); // інший колір — своя галерея, відлік заново
    });
  });

  // ---- Колір ----
  const colorName = root.querySelector<HTMLElement>('[data-color-name]');
  const radios = [...root.querySelectorAll<HTMLInputElement>('input[name="color"]')];
  const langLinks = [...document.querySelectorAll<HTMLAnchorElement>('.langs a[hreflang]')];
  const defaultColor = root.dataset.defaultColor ?? '';
  const setColor = (id: string, updateUrl: boolean) => {
    const radio = radios.find((r) => r.value === id);
    if (!radio) return;
    radio.checked = true;
    if (colorName) colorName.textContent = radio.dataset.colorLabel ?? '';
    root.querySelectorAll<HTMLElement>('[data-pgal]').forEach((g) => {
      const on = g.dataset.pgal === id;
      g.hidden = !on;
      if (on) g.dispatchEvent(new Event('product:reset')); // нова галерея — з першого фото
    });
    // Адреса й перемикач мов зберігають колір (без параметра — колір за замовчуванням).
    const withColor = (href: string) => {
      const url = new URL(href, location.href);
      if (id === defaultColor) url.searchParams.delete('couleur');
      else url.searchParams.set('couleur', id);
      return url.pathname + url.search + url.hash;
    };
    langLinks.forEach((a) => a.setAttribute('href', withColor(a.getAttribute('href') ?? '')));
    if (updateUrl) history.replaceState(history.state, '', withColor(location.href));
  };
  radios.forEach((r) => r.addEventListener('change', () => setColor(r.value, true)));
  const fromUrl = new URLSearchParams(location.search).get('couleur');
  if (fromUrl && radios.some((r) => r.value === fromUrl)) setColor(fromUrl, false);

  // ---- Розмір ----
  const hint = root.querySelector<HTMLElement>('[data-size-hint]');
  const soldout = root.querySelector<HTMLElement>('[data-soldout]');
  const soldoutSize = root.querySelector<HTMLElement>('[data-soldout-size]');
  const sizes = [...root.querySelectorAll<HTMLInputElement>('input[name="size"]')];
  sizes.forEach((s) =>
    s.addEventListener('change', () => {
      if (hint) hint.hidden = true;
      const out = s.hasAttribute('data-sold-out');
      if (soldout) soldout.hidden = !out;
      if (soldoutSize) soldoutSize.textContent = s.value;
    }),
  );
  // «Ajouter au panier»: без розміру — підказка біля чипів (кнопку не блокуємо);
  // розпроданий розмір не додаємо (видно «épuisé» + e-mail). Додали — «Ajouté au panier · Voir le panier».
  const added = root.querySelector<HTMLElement>('[data-cart-added]');
  root.querySelector('[data-action="add-to-cart"]')?.addEventListener('click', () => {
    const size = sizes.find((s) => s.checked);
    if (sizes.length && !size) {
      if (hint) hint.hidden = false;
      sizes[0].focus();
      return;
    }
    if (size?.hasAttribute('data-sold-out')) {
      if (soldout) soldout.hidden = false;
      return;
    }
    const color = radios.find((r) => r.checked)?.value || defaultColor || 'default';
    add({ slug: root.dataset.product ?? '', color, size: size?.value ?? '' });
    if (added) added.hidden = false;
  });
  sizes.forEach((s) => s.addEventListener('change', () => added && (added.hidden = true)));
  radios.forEach((r) => r.addEventListener('change', () => added && (added.hidden = true)));

  // ---- Guide des tailles ----
  const guide = document.querySelector<HTMLDialogElement>('[data-sguide]');
  root.querySelector('[data-sguide-open]')?.addEventListener('click', () => guide?.showModal());
  guide?.querySelector('[data-sguide-close]')?.addEventListener('click', () => guide.close());
  guide?.addEventListener('click', (e) => {
    if (e.target === guide) guide.close(); // клік по фону
  });

  // ---- «Me prévenir» — форма ще не підключена: чесно кажемо «bientôt» ----
  root.querySelectorAll<HTMLFormElement>('[data-soon-form]').forEach((form) =>
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector<HTMLElement>('[data-soon]');
      if (status) status.textContent = status.dataset.soon ?? '';
    }),
  );
}
