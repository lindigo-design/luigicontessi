// Lightbox: одна галерея на сторінку — усі [data-lb] у порядку на сторінці.
// ← / → — сусіднє фото (по колу), Esc — закрити (рідне для <dialog>), клік по фону — закрити,
// свайп на тачскріні; desktop — клік по фото ×2 у точці кліку, рух мишки — переміщення.
// Фокус: при відкритті — хрестик, після закриття — кнопка, з якої відкрили. Сторінка під ним не прокручується.
const SWIPE = 50;

export function initLightbox() {
  const dlg = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-lb]')];
  if (!dlg || !triggers.length) return;
  const img = dlg.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const stage = dlg.querySelector<HTMLElement>('[data-lb-stage]')!;
  const counter = dlg.querySelector<HTMLElement>('[data-lb-counter]')!;
  const title = dlg.querySelector<HTMLElement>('[data-lb-title]')!;
  const sub = dlg.querySelector<HTMLElement>('[data-lb-sub]')!;
  const close = dlg.querySelector<HTMLButtonElement>('[data-lb-close]')!;
  const n = triggers.length;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let index = 0;
  let opener: HTMLElement | null = null;
  let timer = 0;

  dlg.toggleAttribute('data-single', n < 2);

  const wrap = (i: number) => (i + n) % n;
  const preload = (i: number) => {
    const src = triggers[wrap(i)].dataset.full;
    if (src) new Image().src = src;
  };
  const unzoom = () => {
    img.classList.remove('is-zoomed');
    img.style.removeProperty('transform-origin');
  };
  const fill = () => {
    const t = triggers[index];
    img.src = t.dataset.full ?? '';
    img.alt = [t.dataset.title, t.dataset.sub].filter(Boolean).join(' — ');
    title.textContent = t.dataset.title ?? '';
    sub.textContent = t.dataset.sub ?? '';
    counter.textContent = `${index + 1} / ${n}`;
  };
  const show = (i: number, animate: boolean) => {
    index = wrap(i);
    unzoom();
    window.clearTimeout(timer);
    if (!animate || reduce.matches) {
      img.classList.remove('is-fading');
      fill();
    } else {
      // Зміна фото: згасає 200 мс → нове фото → проявляється.
      img.classList.add('is-fading');
      timer = window.setTimeout(() => {
        fill();
        img
          .decode()
          .catch(() => {})
          .finally(() => img.classList.remove('is-fading'));
      }, 200);
    }
    if (n > 1) {
      preload(index + 1);
      preload(index - 1);
    }
  };

  triggers.forEach((t, i) =>
    t.addEventListener('click', () => {
      opener = t;
      show(i, false);
      document.documentElement.classList.add('lb-open');
      dlg.showModal();
      close.focus();
    }),
  );
  dlg.addEventListener('close', () => {
    window.clearTimeout(timer);
    unzoom();
    document.documentElement.classList.remove('lb-open');
    opener?.focus();
  });
  close.addEventListener('click', () => dlg.close());
  dlg.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(index - 1, true));
  dlg.querySelector('[data-lb-next]')?.addEventListener('click', () => show(index + 1, true));
  dlg.addEventListener('keydown', (e) => {
    // Tab — лише по видимих кнопках лайтбокса (по колу).
    if (e.key === 'Tab') {
      const items = [...dlg.querySelectorAll<HTMLElement>('button')].filter(
        (b) => b.offsetParent && getComputedStyle(b).visibility !== 'hidden',
      );
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i + 1) % items.length;
      e.preventDefault();
      items[next]?.focus();
      return;
    }
    if (n < 2) return;
    if (e.key === 'ArrowRight') show(index + 1, true);
    else if (e.key === 'ArrowLeft') show(index - 1, true);
  });

  // Клік по фону (не по фото й не по кнопках) — закрити.
  dlg.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === img || target.closest('button')) return;
    dlg.close();
  });

  // Desktop: ×2 у точці кліку, рух мишки — переміщення.
  const origin = (e: MouseEvent) => {
    const r = img.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    img.style.setProperty(
      'transform-origin',
      `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`,
    );
  };
  img.addEventListener('click', (e) => {
    if (!fine.matches) return;
    if (img.classList.contains('is-zoomed')) unzoom();
    else {
      origin(e);
      img.classList.add('is-zoomed');
    }
  });
  img.addEventListener('mousemove', (e) => {
    if (img.classList.contains('is-zoomed')) origin(e);
  });

  // Свайп одним пальцем; коли сторінку збільшено пальцями — не гортаємо.
  let sx = 0;
  let sy = 0;
  let tracking = false;
  stage.addEventListener(
    'touchstart',
    (e) => {
      tracking = e.touches.length === 1 && (window.visualViewport?.scale ?? 1) <= 1.01;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true },
  );
  stage.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) tracking = false;
    },
    { passive: true },
  );
  stage.addEventListener(
    'touchend',
    (e) => {
      if (!tracking || n < 2) return;
      tracking = false;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy))
        show(index + (dx < 0 ? 1 : -1), true);
    },
    { passive: true },
  );
}
