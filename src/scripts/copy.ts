// Кнопки «Copier»: копіюють код партнера (атрибут data-copy) і на 2 секунди пишуть «Copié».
// Напис кнопки може складатися з кількох <span> (desktop / mobile) — після 2 с повертаємо їх як були.
export function initCopy() {
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.dataset.copy ?? '';
      const label = btn.querySelector<HTMLElement>('.btn__label');
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        return;
      }
      if (!label) return;
      const before = [...label.childNodes];
      label.replaceChildren(btn.dataset.copied ?? '');
      window.setTimeout(() => label.replaceChildren(...before), 2000);
    });
  });
}
