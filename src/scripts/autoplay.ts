// Автопрокрутка каруселей: next() кожні delay мс (setTimeout, не setInterval).
// Пауза: курсор над блоком, фокус з клавіатури всередині, блок не видно (≈ 30 %), вкладка прихована,
// палець / кнопка миші натиснуті. Відпустили або людина сама погортала (restart) — відлік заново.
// prefers-reduced-motion: reduce — автопрокрутки немає зовсім. Читалці нічого не оголошуємо.
// timer: false — власного таймера немає (його роль грає CSS-анімація смужки прогресу, як у відгуках);
// модуль лише повідомляє onPause(true / false), щоб поставити анімацію на паузу.
export function createAutoplay(
  root: HTMLElement,
  next: () => void,
  {
    delay = 5000,
    enabled = () => true,
    timer: useTimer = true,
    onPause,
  }: {
    delay?: number;
    enabled?: () => boolean;
    timer?: boolean;
    onPause?: (paused: boolean) => void;
  } = {},
) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reasons = new Set<string>();
  let timer = 0;

  const restart = () => {
    window.clearTimeout(timer);
    const paused = reduce.matches || reasons.size > 0 || !enabled();
    onPause?.(paused);
    if (paused || !useTimer) return;
    timer = window.setTimeout(() => {
      next();
      restart();
    }, delay);
  };
  const pause = (reason: string, on: boolean) => {
    if (on) reasons.add(reason);
    else reasons.delete(reason);
    restart();
  };

  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') pause('hover', true);
  });
  root.addEventListener('pointerleave', () => pause('hover', false));
  root.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).matches(':focus-visible')) pause('focus', true);
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) pause('focus', false);
  });
  root.addEventListener('pointerdown', () => pause('press', true));
  root.addEventListener('touchstart', () => pause('press', true), { passive: true });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach((type) =>
    window.addEventListener(type, () => reasons.has('press') && pause('press', false), {
      passive: true,
    }),
  );
  new IntersectionObserver(([entry]) => pause('offscreen', !entry.isIntersecting), {
    threshold: 0.3,
  }).observe(root);
  document.addEventListener('visibilitychange', () => pause('tab', document.hidden));
  reduce.addEventListener('change', restart);

  return { restart, stop: () => window.clearTimeout(timer) };
}
