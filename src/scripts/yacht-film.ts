// Fiche yacht → Film: тизер без звуку (лише коли блок видно; зменшений рух / «економія трафіку» —
// тільки постер) → «Regarder la visite» вмикає повне відео з контролами в тому ж блоці.
// Розділи: клік — перемотування й відтворення; активний розділ — за часом відтворення.
export function initYachtFilm() {
  document.querySelectorAll<HTMLElement>('[data-yacht-film]').forEach((root) => {
    const teaser = root.querySelector<HTMLVideoElement>('[data-film-teaser]');
    const full = root.querySelector<HTMLVideoElement>('[data-film-full]');
    const overlay = root.querySelector<HTMLElement>('[data-film-overlay]');
    const play = root.querySelector<HTMLButtonElement>('[data-film-play]');
    const chapters = [...root.querySelectorAll<HTMLButtonElement>('[data-film-chapter]')];
    if (!full || !play) return;

    // ---- Тизер: грає лише видимим, без руху для тих, хто його вимкнув
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (teaser && teaser.querySelector('source') && !reduced && !saveData) {
      new IntersectionObserver(
        ([e]) => {
          if (!teaser.isConnected || teaser.hidden) return;
          if (e.isIntersecting) {
            teaser.preload = 'auto';
            teaser.play().catch(() => {});
          } else teaser.pause();
        },
        { threshold: 0.25 },
      ).observe(teaser);
    }

    // ---- Повне відео
    const start = (at?: number) => {
      if (full.hidden) {
        teaser?.pause();
        if (teaser) teaser.hidden = true;
        if (overlay) overlay.hidden = true;
        full.hidden = false;
        full.preload = 'auto';
      }
      if (at !== undefined) full.currentTime = at;
      full.play().catch(() => {});
    };
    play.addEventListener('click', () => {
      start();
      full.focus();
    });

    // ---- Розділи
    const times = chapters.map((c) => Number(c.dataset.filmChapter) || 0);
    chapters.forEach((c, i) => c.addEventListener('click', () => start(times[i])));
    full.addEventListener('timeupdate', () => {
      let active = 0;
      times.forEach((t, i) => {
        if (full.currentTime >= t) active = i;
      });
      chapters.forEach((c, i) => {
        c.classList.toggle('is-active', i === active);
        if (i === active) c.setAttribute('aria-current', 'true');
        else c.removeAttribute('aria-current');
      });
    });
  });
}
