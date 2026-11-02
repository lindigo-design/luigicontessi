// Меню при прокрутці: після 80 px — суцільний фон; вниз — ховається, вгору — повертається.
// prefers-reduced-motion: лише фон, без ховання.
const SOLID_AT = 80;
const MIN_DELTA = 4;

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const solid = y > SOLID_AT;
    header.classList.toggle('is-solid', solid);
    if (!solid || reduce.matches) {
      header.classList.remove('is-hidden');
    } else if (Math.abs(y - lastY) >= MIN_DELTA) {
      header.classList.toggle('is-hidden', y > lastY);
    }
    if (Math.abs(y - lastY) >= MIN_DELTA) lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
