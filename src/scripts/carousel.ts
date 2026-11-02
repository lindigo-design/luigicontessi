// Карусель «Nouveautés»: стрілки, свайп, крапки і клавіші ← →. Активна — картка в центрі.
export function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-track]');
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    const dots = [...root.querySelectorAll<HTMLElement>('[data-dot]')];
    if (!track || !slides.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = slides.findIndex((s) => s.classList.contains('is-active'));

    // Куди прокрутити, щоб картка i стала по центру. Ширини карток анімуються, тому рахуємо
    // кінцеве положення: перед активною — лише малі картки, а відступ треку = (ширина − активна) / 2.
    const target = (i: number, prev: number) => {
      const still = slides.find((_, k) => k !== i && k !== prev);
      if (!still) {
        const s = slides[i];
        return s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
      }
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return i * (still.offsetWidth + gap);
    };

    const setActive = (i: number, scroll = true) => {
      const prev = active;
      active = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, k) => s.classList.toggle('is-active', k === active));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === active));
      if (scroll) {
        track.scrollTo({ left: target(active, prev), behavior: reduce ? 'auto' : 'smooth' });
      }
    };

    root.querySelector('[data-prev]')?.addEventListener('click', () => setActive(active - 1));
    root.querySelector('[data-next]')?.addEventListener('click', () => setActive(active + 1));

    // Клавіатура: ← → на фокусі всередині каруселі.
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      setActive(active + (e.key === 'ArrowRight' ? 1 : -1));
    });

    // Після свайпу активною стає картка, найближча до центру.
    let timer = 0;
    track.addEventListener('scroll', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let dist = Infinity;
        slides.forEach((s, k) => {
          const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
          if (d < dist) [best, dist] = [k, d];
        });
        if (best !== active) setActive(best, false);
      }, 120);
    });

    // Зміна ширини вікна — активна картка лишається по центру.
    const recenter = () => {
      track.scrollLeft = target(active, active);
    };
    setActive(active, false);
    requestAnimationFrame(recenter);
    new ResizeObserver(recenter).observe(track);
  });
}
