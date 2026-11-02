// Лічильник великих цифр: коли блок уперше видно на ≈ 40 %, числа рахують 0 → значення за 1.6 с.
// Рахується лише число з data-count (data-decimals знаків після коми); префікс і суфікс («M+», «%»)
// беремо з фінального тексту як є. Формат числа — як у мові сторінки (FR/IT «1,7», EN «1.7»).
// Один раз за відвідування. Зменшений рух — нічого не робимо: у HTML уже фінальні значення.
const DURATION = 1600;
const STAGGER = 120;
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function initCountUp() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fmt = (n: number, d: number) =>
    new Intl.NumberFormat(document.documentElement.lang || undefined, {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(n);

  const items = [...document.querySelectorAll<HTMLElement>('[data-count]')].flatMap((el) => {
    const live = el.querySelector<HTMLElement>('[data-count-live]');
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals) || 0;
    const text = live?.textContent?.trim() ?? '';
    const number = fmt(target, decimals);
    const at = text.indexOf(number);
    // Не знайшли число в тексті (інший формат) — краще без анімації, ніж з неправильним текстом.
    if (!live || !Number.isFinite(target) || at < 0) return [];
    const prefix = text.slice(0, at);
    const suffix = text.slice(at + number.length);
    const show = (n: number) => (live.textContent = `${prefix}${fmt(n, decimals)}${suffix}`);
    return [{ el, target, decimals, show }];
  });
  if (!items.length) return;

  const run = (item: (typeof items)[number], delay: number) => {
    item.show(0);
    let start = 0;
    const frame = (now: number) => {
      start ||= now;
      const t = Math.min(1, (now - start) / DURATION);
      item.show(item.target * easeOutExpo(t));
      if (t < 1) requestAnimationFrame(frame);
    };
    window.setTimeout(() => requestAnimationFrame(frame), delay);
  };

  // Скрипт працює — анімація точно буде, тож ще не показані цифри ставимо на 0 одразу
  // (інакше при появі на екрані фінальне число блимнуло б і скинулось у 0).
  items.forEach((item) => item.show(0));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const item = items.find((i) => i.el === entry.target);
        if (!item) return;
        // Затримка 0 / 120 / 240 мс — за порядком цифри в її блоці.
        const group = [
          ...(item.el.parentElement?.parentElement ?? document).querySelectorAll('[data-count]'),
        ];
        run(item, Math.max(0, group.indexOf(item.el)) * STAGGER);
      });
    },
    { threshold: 0.4 },
  );
  items.forEach((item) => io.observe(item.el));
}
