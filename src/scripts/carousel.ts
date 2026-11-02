// Карусель «Nouveautés»: безкінечна стрічка, активна картка — завжди по центру екрана.
// По краях стоять копії (data-clone) 2 останніх і 2 перших карток. Коли після прокрутки активною
// стає копія, стрічка без анімації перескакує на таку саму справжню картку — на око різниці немає.
// Керування: стрілки, свайп, перетягування мишкою (< 1024), крапки, клавіші ← → Home End.
// Автопрокрутка кожні 5 с вперед по колу (src/scripts/autoplay.ts); будь-яка дія людини — відлік заново.
import { createAutoplay } from './autoplay';
import { enableDragScroll } from './drag-scroll';

export function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-track]');
    const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
    const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-dot]')];
    if (!track || !slides.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = root.hasAttribute('data-loop');
    const realIndex = (pos: number) => Number(slides[pos].dataset.index);
    const isClone = (pos: number) => slides[pos].hasAttribute('data-clone');
    // Позиція справжньої картки з індексом i (0…N-1) серед усіх слайдів.
    const realPos = (i: number) => slides.findIndex((_, k) => !isClone(k) && realIndex(k) === i);
    const count = dots.length || slides.filter((_, k) => !isClone(k)).length;
    let active = slides.findIndex((s) => s.classList.contains('is-active'));
    let programmatic = false;
    let settleAt = 0; // коли закінчиться анімація ширин карток
    const WIDTH_MS = 550; // transition: flex-basis 500ms + запас

    // Куди прокрутити, щоб картка pos стала по центру. Ширини анімуються, тому рахуємо кінцеве
    // положення: перед активною — лише малі картки, а відступ треку = (ширина − активна) / 2.
    const target = (pos: number, prev: number) => {
      const still = slides.find((_, k) => k !== pos && k !== prev);
      if (!still) {
        const s = slides[pos];
        return s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
      }
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return pos * (still.offsetWidth + gap);
    };

    const mark = (pos: number) => {
      active = pos;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === pos));
      dots.forEach((d, k) => {
        const on = k === realIndex(pos);
        d.classList.toggle('is-active', on);
        if (on) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };

    const setActive = (pos: number) => {
      const prev = active;
      mark(Math.max(0, Math.min(slides.length - 1, pos)));
      programmatic = true;
      settleAt = performance.now() + (reduce ? 0 : WIDTH_MS);
      track.classList.add('is-moving');
      track.scrollTo({ left: target(active, prev), behavior: reduce ? 'auto' : 'smooth' });
    };

    // Тихий перескок з копії на справжню: без прилипання і без анімації ширини, потім повертаємо.
    const jumpToReal = () => {
      if (!isClone(active)) return;
      const prev = active;
      track.classList.add('is-jumping');
      mark(realPos(realIndex(active)));
      track.scrollLeft = target(active, prev);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => track.classList.remove('is-jumping')),
      );
    };

    const step = (dir: 1 | -1) => {
      if (!loop) return setActive(active + dir);
      jumpToReal(); // кілька швидких кліків поспіль — спершу стаємо на справжню
      setActive(active + dir);
    };

    const autoplay = createAutoplay(root, () => step(1));
    root.querySelector('[data-prev]')?.addEventListener('click', () => {
      step(-1);
      autoplay.restart();
    });
    root.querySelector('[data-next]')?.addEventListener('click', () => {
      step(1);
      autoplay.restart();
    });
    // Крапки — справжні картки (не копії).
    dots.forEach((d, k) =>
      d.addEventListener('click', () => {
        jumpToReal();
        setActive(realPos(k));
        autoplay.restart();
      }),
    );

    // Клавіатура: ← → — сусідні, Home / End — перша / остання справжня.
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') step(e.key === 'ArrowRight' ? 1 : -1);
      else if (e.key === 'Home') setActive(realPos(0));
      else if (e.key === 'End') setActive(realPos(count - 1));
      else return;
      e.preventDefault();
      autoplay.restart();
    });

    // Перетягування мишкою на tablet / mobile (< 1024); на desktop — стрілки.
    const narrow = window.matchMedia('(max-width: 1023px)');
    const drag = enableDragScroll(track, {
      enabled: () => narrow.matches,
      onStart: () => {
        programmatic = false;
        track.classList.remove('is-moving');
      },
      onEnd: () => {
        settle();
        autoplay.restart();
      },
    });

    // Кінець прокрутки. Після свайпу / перетягування активною стає картка, найближча до центру;
    // якщо це копія — перескакуємо на справжню.
    let timer = 0;
    const settle = () => {
      if (!programmatic) {
        track.classList.remove('is-moving');
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = active;
        let dist = Infinity;
        slides.forEach((s, k) => {
          const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
          if (d < dist) [best, dist] = [k, d];
        });
        if (best !== active) return setActive(best);
      }
      // Наша прокрутка: чекаємо кінця анімації ширин, тоді вмикаємо прилипання назад.
      programmatic = false;
      window.setTimeout(
        () => {
          if (programmatic) return; // уже почалась наступна
          track.classList.remove('is-moving');
          if (loop) jumpToReal();
        },
        Math.max(0, settleAt - performance.now()),
      );
    };
    track.addEventListener('scroll', () => {
      window.clearTimeout(timer);
      if (drag.isDragging()) return; // поки тягнуть — чекаємо, коли відпустять
      timer = window.setTimeout(settle, 120);
    });
    // Свайп пальцем або колесом — це вже не наша прокрутка.
    ['pointerdown', 'wheel', 'touchstart'].forEach((type) =>
      track.addEventListener(type, () => (programmatic = false), { passive: true }),
    );

    // Зміна ширини вікна — активна картка лишається по центру.
    const recenter = () => {
      track.scrollLeft = target(active, active);
    };
    mark(active);
    autoplay.restart();
    requestAnimationFrame(recenter);
    new ResizeObserver(recenter).observe(track);
  });
}
