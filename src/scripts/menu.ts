// Меню на весь екран (dialog #site-menu): відкриття / закриття, фото за наведеним пунктом,
// мʼяке світло за курсором. showModal() тримає фокус усередині; Esc закриває;
// фокус повертається на «Menu»; сторінка під меню не прокручується.
export function initMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !opener) return;
  const root = document.documentElement;

  opener.addEventListener('click', () => {
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    root.style.setProperty('overflow', 'hidden');
  });
  dialog.addEventListener('close', () => {
    opener.setAttribute('aria-expanded', 'false');
    root.style.removeProperty('overflow');
    opener.focus();
  });
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());
  // Перехід за посиланням (у т.ч. якір на тій самій сторінці) — закриваємо меню.
  dialog.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => dialog.close()));

  // Фото й підпис праворуч — за наведеним (або у фокусі) пунктом; пішли з пунктів — за замовчуванням.
  const imgs = [...dialog.querySelectorAll<HTMLElement>('[data-preview-img]')];
  const captions = [...dialog.querySelectorAll<HTMLElement>('[data-preview-caption]')];
  const initial = imgs.findIndex((i) => i.classList.contains('is-active'));
  const show = (n: number) => {
    imgs.forEach((el, k) => el.classList.toggle('is-active', k === n));
    captions.forEach((el, k) => el.classList.toggle('is-active', k === n));
  };
  const list = dialog.querySelector<HTMLElement>('[data-menu-primary]');
  list?.querySelectorAll<HTMLElement>('[data-preview]').forEach((a) => {
    const n = Number(a.dataset.preview);
    a.addEventListener('pointerenter', () => show(n));
    a.addEventListener('focus', () => show(n));
  });
  list?.addEventListener('pointerleave', () => show(initial));
  list?.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget as Node | null)) show(initial);
  });

  // Світло за курсором — лише з мишкою (CSSOM, дозволено CSP).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    dialog.addEventListener('pointermove', (e) => {
      dialog.style.setProperty('--mx', `${e.clientX}px`);
      dialog.style.setProperty('--my', `${e.clientY}px`);
    });
  }
}
