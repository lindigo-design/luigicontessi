// Текстові картки-посилання (.hover-card): мʼяке світло під курсором.
// Координати курсора відносно картки — у --mx / --my (CSSOM дозволено нашою CSP).
// Без плавного «доганяння»: на картці світло просто під курсором. Лише з мишкою.
export function initHoverCards() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('.hover-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      // Картка під час наведення трохи збільшена — переводимо координати в її власний масштаб.
      const sx = card.offsetWidth / r.width || 1;
      const sy = card.offsetHeight / r.height || 1;
      card.style.setProperty('--mx', `${(e.clientX - r.left) * sx}px`);
      card.style.setProperty('--my', `${(e.clientY - r.top) * sy}px`);
    });
    // Мишка пішла — пляма знову в центрі (для фокусу з клавіатури).
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}
