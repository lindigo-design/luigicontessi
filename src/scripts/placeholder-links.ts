// Заглушки посилань ([data-placeholder]): клік нікуди не веде, під кнопкою на 2 с —
// «Lien bientôt disponible» (елемент [data-placeholder-note] поруч, role="status" — читалка теж почує).
// Картка статті: нотатка в межах найближчого [data-placeholder-scope].
export function initPlaceholderLinks() {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>('[data-placeholder]');
    if (!link) return;
    e.preventDefault();
    const scope = link.closest<HTMLElement>('[data-placeholder-scope]') ?? link.parentElement;
    const note = scope?.querySelector<HTMLElement>('[data-placeholder-note]');
    if (!note) return;
    note.hidden = false;
    window.clearTimeout(Number(note.dataset.timer));
    note.dataset.timer = String(window.setTimeout(() => (note.hidden = true), 2000));
  });
}
