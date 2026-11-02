// Fiche yacht → «À bord»: стрілки (на одну картку), перетягування мишкою (drag-scroll.ts), ←/→ на стрічці.
// Стрілки неактивні на краях (фокус тоді переходить на другу стрілку, а не губиться). Без автопрокрутки.
// Рамка навколо стрічки — лише коли фокус прийшов з клавіатури (клас is-kbd-focus).
import { enableDragScroll } from './drag-scroll';

export function initYachtInteriors() {
  document.querySelectorAll<HTMLElement>('[data-yacht-interiors]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-int-track]');
    const slides = [...root.querySelectorAll<HTMLElement>('[data-int-slide]')];
    const prev = root.querySelector<HTMLButtonElement>('[data-int-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-int-next]');
    if (!track || slides.length < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const start = () => slides[0].offsetLeft;
    const current = () => {
      const x = track.scrollLeft + start();
      let best = 0;
      slides.forEach((s, i) => {
        if (Math.abs(s.offsetLeft - x) < Math.abs(slides[best].offsetLeft - x)) best = i;
      });
      return best;
    };
    const go = (i: number) => {
      const k = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({
        left: slides[k].offsetLeft - start(),
        behavior: reduce.matches ? 'auto' : 'smooth',
      });
    };
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      const focused = document.activeElement;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (focused === prev && prev?.disabled) next?.focus();
      else if (focused === next && next?.disabled) prev?.focus();
    };

    prev?.addEventListener('click', () => go(current() - 1));
    next?.addEventListener('click', () => go(current() + 1));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(current() + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(current() - 1);
      }
    });
    let keyboard = false;
    document.addEventListener('keydown', () => (keyboard = true), true);
    document.addEventListener('pointerdown', () => (keyboard = false), true);
    track.addEventListener('focus', () => track.classList.toggle('is-kbd-focus', keyboard));
    track.addEventListener('blur', () => track.classList.remove('is-kbd-focus'));
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    enableDragScroll(track, { onEnd: () => go(current()) });
    sync();
  });
}
