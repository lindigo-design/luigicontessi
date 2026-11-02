// «Прожектор» над CONTESSI у футері: світла пляма плавно їде за курсором.
// Лише для пристроїв з курсором; на телефонах пляма статична (CSS). Зменшений рух — без запізнення.
const EASE = 0.12;
const STOP = 0.5;

export function initSpotlight() {
  const el = document.querySelector<HTMLElement>('[data-spotlight]');
  const footer = el?.closest('footer');
  if (!el || !footer || !window.matchMedia('(hover: hover)').matches) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Стартова точка плями — з CSS (--mx / --my на .ghost), до того як скрипт перепише їх у px.
  // Відсотки — від розміру шару з маскою.
  const layer = el.querySelector<HTMLElement>('.ghost__light') ?? el;
  const css = getComputedStyle(el);
  const restX = css.getPropertyValue('--mx').trim();
  const restY = css.getPropertyValue('--my').trim();
  const toPx = (value: string, size: number) =>
    value.endsWith('%') ? (parseFloat(value) / 100) * size : parseFloat(value) || 0;
  const rest = () => ({ x: toPx(restX, layer.offsetWidth), y: toPx(restY, layer.offsetHeight) });
  const current = rest();
  const target = { ...current };
  let raf = 0;

  const apply = () => {
    el.style.setProperty('--mx', `${current.x}px`);
    el.style.setProperty('--my', `${current.y}px`);
  };

  const tick = () => {
    current.x += (target.x - current.x) * EASE;
    current.y += (target.y - current.y) * EASE;
    const done = Math.abs(target.x - current.x) < STOP && Math.abs(target.y - current.y) < STOP;
    if (done) Object.assign(current, target);
    apply();
    raf = done ? 0 : requestAnimationFrame(tick);
  };

  const moveTo = (x: number, y: number) => {
    target.x = x;
    target.y = y;
    if (reduce.matches) {
      Object.assign(current, target);
      apply();
    } else if (!raf) {
      raf = requestAnimationFrame(tick);
    }
  };

  const onMove = (e: PointerEvent) => {
    const r = layer.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
  };
  // Мишка пішла — пляма плавно повертається у стартову точку.
  const onLeave = () => {
    const { x, y } = rest();
    moveTo(x, y);
  };

  // Слухаємо мишку лише коли футер у вікні.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      footer.addEventListener('pointermove', onMove);
      footer.addEventListener('pointerleave', onLeave);
    } else {
      footer.removeEventListener('pointermove', onMove);
      footer.removeEventListener('pointerleave', onLeave);
    }
  }).observe(footer);
}
