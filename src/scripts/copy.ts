// Кнопки «Copier»: копіюють код партнера (атрибут data-copy) і на 2 секунди пишуть «Copié»
// (data-copied) або, якщо браузер не дав скопіювати, «Copie impossible» (data-copy-failed).
// Напис кнопки може складатися з кількох <span> (desktop / mobile) — після 2 с повертаємо їх як були.
// Початковий напис запамʼятовуємо один раз до першого кліку: повторний клік протягом 2 с
// не має «запамʼятати» вже показане «Copié» як початковий напис.
// Результат оголошуємо читалці через одну спільну приховану область aria-live.
const SHOW_MS = 2000;

export function initCopy() {
  const buttons = [...document.querySelectorAll<HTMLElement>('[data-copy]')];
  if (!buttons.length) return;

  const status = document.createElement('p');
  status.className = 'visually-hidden';
  status.setAttribute('aria-live', 'polite');
  document.body.append(status);

  buttons.forEach((btn) => {
    const label = btn.querySelector<HTMLElement>('.btn__label');
    const original = label ? [...label.childNodes] : [];
    let timer = 0;

    const show = (text: string) => {
      // Той самий текст двічі поспіль читалка не повторює — спершу очищаємо.
      status.textContent = '';
      window.setTimeout(() => (status.textContent = text), 50);
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
