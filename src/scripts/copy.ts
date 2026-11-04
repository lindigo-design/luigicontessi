// Кнопки «Copier»: копіюють код партнера (атрибут data-copy) і на 2 секунди пишуть «Copié»
// (data-copied) або, якщо браузер не дав скопіювати, «Copie impossible» (data-copy-failed).
// Напис кнопки може складатися з кількох <span> (desktop / mobile) — після 2 с повертаємо їх як були.
// Початковий напис запамʼятовуємо один раз до першого кліку: повторний клік протягом 2 с
// не має «запамʼятати» вже показане «Copié» як початковий напис.
// Результат оголошуємо читалці через приховану область aria-live. Відкритий модальний <dialog>
// (меню, showModal) робить усе поза собою inert — область у <body> там мовчить. Тому область
// своя для кожного «дому» кнопки: найближчий <dialog> або <body>.
const SHOW_MS = 2000;

// Декоративні знаки в кінці напису («Code copié ✓») читалка вимовляє словом — їй без них.
const spoken = (text: string) => text.replace(/[\s✓✔]+$/u, '');

export function initCopy() {
  const buttons = [...document.querySelectorAll<HTMLElement>('[data-copy]')];
  if (!buttons.length) return;

  const regions = new Map<HTMLElement, HTMLElement>();
  const regionFor = (btn: HTMLElement) => {
    const home = btn.closest<HTMLElement>('dialog') ?? document.body;
    let region = regions.get(home);
    if (!region) {
      region = document.createElement('p');
      region.className = 'visually-hidden';
      region.setAttribute('aria-live', 'polite');
      home.append(region);
      regions.set(home, region);
    }
    return region;
  };

  buttons.forEach((btn) => {
    const label = btn.querySelector<HTMLElement>('.btn__label');
    const original = label ? [...label.childNodes] : [];
    // Область створюємо одразу, а не під час кліку: читалка стежить лише за тими,
    // що вже були на сторінці до зміни тексту.
    const status = regionFor(btn);
    let timer = 0;

    const show = (text: string) => {
      // Той самий текст двічі поспіль читалка не повторює — спершу очищаємо.
      status.textContent = '';
      window.setTimeout(() => (status.textContent = spoken(text)), 50);
      if (!label || !text) return;
      window.clearTimeout(timer);
      label.replaceChildren(text);
      timer = window.setTimeout(() => label.replaceChildren(...original), SHOW_MS);
    };

    btn.addEventListener('click', async () => {
      const code = btn.dataset.copy ?? '';
      try {
        if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(code);
      } catch {
        show(btn.dataset.copyFailed ?? '');
        return;
      }
      show(btn.dataset.copied ?? '');
    });
  });
}
