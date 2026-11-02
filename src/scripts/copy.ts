// Кнопки «Copier»: копіюють код партнера (атрибут data-copy) і на 2 секунди пишуть «Copié».
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
      const before = label.textContent;
      label.textContent = btn.dataset.copied ?? before;
      window.setTimeout(() => (label.textContent = before), 2000);
    });
  });
}
