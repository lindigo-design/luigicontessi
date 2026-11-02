// Галерея «3 фото» на Privilèges: на mobile (< 768) — карусель зі свайпом, крапками
// й автопрокруткою кожні 5 с по колу (після 3-го — знову 1-ше). На ширших екранах каруселі немає.
import { createAutoplay } from './autoplay';
import { enableDragScroll } from './drag-scroll';

export function initGallery() {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-gallery-track]');
    const slides = [...root.querySelectorAll<HTMLElement>('[data-gallery-slide]')];
    const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-gallery-dot]')];
    if (!track || slides.length < 2) return;
    const mobile = window.matchMedia('(max-width: 767px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0;

    const mark = (i: number) => {
      active = i;
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === i);
        if (k === i) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };
    const go = (i: number) => {
      const slide = slides[(i + slides.length) % slides.length];
      const left = slide.offsetLeft - slides[0].offsetLeft;
      track.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
    };

    // Найближче до лівого краю фото (після свайпу, перетягування, крапки, автопрокрутки).
    const nearest = () => {
      const x = track.scrollLeft;
      let best = 0;
      slides.forEach((s, k) => {
        const d = Math.abs(s.offsetLeft - slides[0].offsetLeft - x);
        if (d < Math.abs(slides[best].offsetLeft - slides[0].offsetLeft - x)) best = k;
      });
      return best;
    };

    const autoplay = createAutoplay(root, () => go(active + 1), { enabled: () => mobile.matches });
    // Перетягування мишкою (mobile-ширина у звичайному браузері).
    const drag = enableDragScroll(track, {
      enabled: () => mobile.matches,
      onEnd: () => {
        go(nearest());
        autoplay.restart();
      },
    });
    let timer = 0;
    track.addEventListener('scroll', () => {
      window.clearTimeout(timer);
      if (drag.isDragging()) return;
      timer = window.setTimeout(() => mark(nearest()), 80);
    });
    dots.forEach((d, k) =>
      d.addEventListener('click', () => {
        go(k);
        autoplay.restart();
      }),
    );
    // Крапки — лише для mobile: на ширших екранах прибираємо їх з порядку Tab (вони сховані).
    const syncDots = () => dots.forEach((d) => (d.tabIndex = mobile.matches ? 0 : -1));
    syncDots();
    mobile.addEventListener('change', () => {
      syncDots();
      autoplay.restart();
    });
    autoplay.restart();
  });
}
