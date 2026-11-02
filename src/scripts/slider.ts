// Слайдер відгуків: один відгук, автоперемикання по колу, стрілки, клавіші ← →, свайп.
// Таймер — це CSS-анімація смужки прогресу: кінець анімації = наступний відгук,
// пауза = animation-play-state (клас .is-paused). Зменшений рух — анімації немає, отже й автоперемикання.
const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;

export function initSliders() {
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((root) => {
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    const bars = [...root.querySelectorAll<HTMLElement>('[data-bar]')];
    const card = root.querySelector<HTMLElement>('[data-slider-card]');
    const count = root.querySelector<HTMLElement>('[data-count]');
    const current = root.querySelector<HTMLElement>('[data-current]');
    if (slides.length < 2 || !card) return;
    root.style.setProperty('--autoplay', `${AUTOPLAY_MS}ms`);
    let active = 0;

    const go = (i: number, byUser: boolean) => {
      active = (i + slides.length) % slides.length;
      // Читалка оголошує «2 / 3» лише коли людина перемкнула сама.
      count?.setAttribute('aria-live', byUser ? 'polite' : 'off');
      slides.forEach((s, k) => (s.hidden = k !== active));
      // Нова активна смужка — анімація (і відлік 6 с) починається заново.
      bars.forEach((b, k) => b.classList.toggle('is-active', k === active));
      if (current) current.textContent = String(active + 1).padStart(2, '0');
    };

    root.querySelector('[data-prev]')?.addEventListener('click', () => go(active - 1, true));
    root.querySelector('[data-next]')?.addEventListener('click', () => go(active + 1, true));
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      go(active + (e.key === 'ArrowRight' ? 1 : -1), true);
    });

    // Автоперемикання: смужка заповнилась — наступний відгук.
    root.addEventListener('animationend', (e) => {
      if ((e.target as HTMLElement).closest('[data-bar]')?.classList.contains('is-active')) {
        go(active + 1, false);
      }
    });

    // Свайп: горизонтальний рух від 40 px. Вертикальну прокрутку не блокуємо (touch-action: pan-y).
    let startX = 0;
    let startY = 0;
    card.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    card.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        go(active + (dx < 0 ? 1 : -1), true);
      }
    });

    // Пауза: мишка на картці, фокус з клавіатури всередині, вкладка неактивна, секція поза екраном.
    const reasons = new Set<string>();
    const pause = (reason: string, on: boolean) => {
      if (on) reasons.add(reason);
      else reasons.delete(reason);
      root.classList.toggle('is-paused', reasons.size > 0);
    };
    card.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') pause('hover', true);
    });
    card.addEventListener('pointerleave', () => pause('hover', false));
    root.addEventListener('focusin', (e) => {
      if ((e.target as HTMLElement).matches(':focus-visible')) pause('focus', true);
    });
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget as Node | null)) pause('focus', false);
    });
    const syncVisibility = () => pause('tab', document.hidden);
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();
    new IntersectionObserver(([entry]) => pause('offscreen', !entry.isIntersecting)).observe(root);
  });
}
