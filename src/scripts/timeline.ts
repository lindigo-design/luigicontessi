// À propos → Parcours: червона лінія «проходить» шлях від першого року до кінця (сьогодні),
// коли таймлайн з'являється на екрані (один раз). Кожен відрізок малюється по черзі:
// пункт i отримує --i (затримка = i × крок), а клас is-in на списку запускає CSS-переходи
// (лише transform і колір). Крапка й рік пункту червоніють у момент, коли до них дійшла лінія.
// Без JS і зі зменшеним рухом скрипт нічого не вмикає — увесь шлях червоний одразу.
export function initTimeline() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-timeline]').forEach((list) => {
    const items = [...list.querySelectorAll<HTMLElement>('[data-timeline-item]')];
    if (!items.length) return;
    items.forEach((el, i) => el.style.setProperty('--i', String(i)));
    list.classList.add('is-live');

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // кадр затримки — щоб початковий стан (сіре) встиг відмалюватись і перехід спрацював
        requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add('is-in')));
      },
      { threshold: 0.4 },
    );
    io.observe(list);
  });
}
