// Перетягування стрічки мишкою (на дотик працює рідний свайп). Під час — без прилипання
// (клас is-dragging) і курсор «grabbing»; відпустили — onEnd() стає на найближчий слайд.
// Зрушили більше ніж на 6 px — клік по посиланню в стрічці не спрацьовує.
const THRESHOLD = 6;

export function enableDragScroll(
  track: HTMLElement,
  {
    onStart,
    onEnd,
    enabled = () => true,
  }: { onStart?: () => void; onEnd?: () => void; enabled?: () => boolean } = {},
) {
  let startX = 0;
  let startLeft = 0;
  let pressed = false;
  let moved = false;

  // Курсор «рука» — лише коли тягнути можна (на цій ширині і з мишкою).
  track.addEventListener('pointerenter', (e) => {
    track.classList.toggle('can-drag', e.pointerType === 'mouse' && enabled());
  });
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !enabled()) return;
    pressed = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!pressed) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > THRESHOLD) {
      moved = true;
      track.classList.add('is-dragging');
      onStart?.();
    }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!pressed) return;
    pressed = false;
    if (!moved) return;
    track.classList.remove('is-dragging');
    onEnd?.();
  });
  // Після перетягування клік по посиланню картки ігноруємо (один раз).
  track.addEventListener(
    'click',
    (e) => {
      if (!moved) return;
      moved = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
  // Рідне перетягування картинок і посилань заважає — вимикаємо.
  track.addEventListener('dragstart', (e) => e.preventDefault());

  return { isDragging: () => pressed && moved };
}
