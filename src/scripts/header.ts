// Меню при прокрутці: завжди закріплене зверху (не ховається); після 80 px — суцільний фон.
const SOLID_AT = 80;

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let ticking = false;

  const update = () => {
    ticking = false;
    header.classList.toggle('is-solid', window.scrollY > SOLID_AT);
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
