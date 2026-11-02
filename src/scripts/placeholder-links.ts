// Заглушки посилань ([data-placeholder]): клік нікуди не веде, під кнопкою на 2 с —
// «Lien bientôt disponible» (елемент [data-placeholder-note] поруч, role="status" — читалка теж почує).
export function initPlaceholderLinks() {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>('[data-placeholder]');
    if (!link) return;
    e.preventDefault();
    const note = link.parentElement?.querySelector<HTMLElement>('[data-placeholder-note]');
    if (!note) return;
    note.hidden = false;
    window.clearTimeout(Number(note.dataset.timer));
    note.dataset.timer = String(window.setTimeout(() => (note.hidden = true), 2000));
  });
}
