// Loader K♥ (src/components/ui/Loader.astro). Звичайний async-скрипт (не модуль): стартує, поки HTML ще вантажиться.
// Лише перше відкриття в сесії (sessionStorage lc-loaded), лише якщо через 400 ms сторінка не готова; ≤ 4 с.
// K промальовується (0–0,8 с) → K заповнюється, серце промальовується (–1,3 с) → серце заповнюється, один удар (–1,8 с).
// Смужка: шрифти + фото першого екрана; без подій — повзе до 30 %. Зменшений рух — без анімації.
// Також дає window.lcMonogram(svg) — ту саму промальовку для інших місць сайту.
(() => {
  const d = document;
  const now = () => performance.now();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // Спільна промальовка монограми K♥ (loader і «Le roi de cœur» на À propos): window.lcMonogram(svg).
  // Оголошена до перевірок нижче, щоб була на кожній сторінці, навіть коли loader-а немає.
  const drawMonogram = (svg) => {
    const [k, h] = svg.querySelectorAll('path');
    const s = svg.getBoundingClientRect().height / svg.viewBox.baseVal.height || 1;
    const f = { fill: 'forwards' };
    [k, h].forEach((el, i) => {
      const len = el.getTotalLength();
      const st = el.style;
      st.setProperty('stroke', 'currentColor');
      st.setProperty('stroke-width', String(1.5 / s));
      st.setProperty('stroke-dasharray', String(len));
      st.setProperty('stroke-dashoffset', String(len));
      st.setProperty('fill-opacity', '0');
      el.animate(
        { strokeDashoffset: [len, 0] },
        { duration: i ? 500 : 800, delay: i ? 800 : 0, easing: 'ease-in-out', ...f },
      );
      el.animate({ fillOpacity: [0, 1] }, { duration: 300, delay: i ? 1300 : 800, ...f });
    });
    h.style.setProperty('transform-box', 'fill-box');
    h.style.setProperty('transform-origin', 'center');
    h.animate(
      { transform: ['scale(1)', 'scale(1.08)', 'scale(1)'] },
      { duration: 500, delay: 1300, easing: 'ease-in-out' },
    );
  };
  window.lcMonogram = drawMonogram;

  try {
    if (sessionStorage.getItem('lc-loaded')) return;
    sessionStorage.setItem('lc-loaded', '1');
  } catch {
    return;
  }
  const tpl = d.getElementById('lc-loader');
  if (!tpl || d.readyState === 'complete') return;

  let p = 0;
  let fill = null;
  const set = (v) => {
    p = Math.max(p, Math.min(1, v));
    if (fill) fill.style.setProperty('transform', `scaleX(${p})`);
  };
  let ok = false;
  const loaded = new Promise((r) => addEventListener('load', r, { once: true }));
  const parsed = new Promise((r) =>
    d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', r, { once: true }) : r(),
  );
  // Фото першого екрана відомі лише після розбору HTML.
  const assets = parsed.then(() => {
    const imgs = [...d.querySelectorAll('img[loading="eager"],img[fetchpriority="high"]')];
    const tasks = [d.fonts.ready, ...imgs.map((i) => i.decode())];
    let n = 0;
    return Promise.all(
      tasks.map((t) => t.catch(() => {}).then(() => set(0.3 + (0.6 * ++n) / tasks.length))),
    );
  });
  const ready = Promise.race([loaded, assets]).then(() => (ok = true));

  setTimeout(
    async () => {
      if (ok || !d.body) return; // швидкий інтернет — loader-а не видно
      const node = tpl.content.firstElementChild.cloneNode(true);
      d.body.append(node);
      d.documentElement.classList.add('is-loading');
      fill = node.querySelector('[data-loader-fill]');
      // Перший кадр малюється лише після стилів сайту: анімацію й 4 с рахуємо від нього (rAF — перед кадром).
      await new Promise((r) => requestAnimationFrame(r));
      if (ok) {
        // сторінка встигла раніше за перший кадр — loader так і не зʼявився
        node.remove();
        d.documentElement.classList.remove('is-loading');
        return;
      }
      const t0 = now();
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) drawMonogram(node.querySelector('svg'));
      set(p);
      const crawl = setInterval(() => p < 0.3 && set(p + 0.02), 300);
      // ≤ 4 с разом із зникненням (900 ms); промальовку (1,8 с) не обриваємо.
      await Promise.race([ready, wait(3100)]);
      const left = Math.min((reduce ? 0 : 1800) - (now() - t0), 3100 - (now() - t0));
      if (left > 0) await wait(left);
      clearInterval(crawl);
      set(1);
      await wait(500); // смужка до 100 % (300) + пауза (200)
      node.classList.add('is-leaving');
      await wait(400);
      node.remove();
      d.documentElement.classList.remove('is-loading');
    },
    Math.max(0, 400 - now()),
  );
})();
