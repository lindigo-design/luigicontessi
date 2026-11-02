// Декоративні відео без звуку ([data-autoplay-video], ui/PhotoBreak): вантажимо й граємо, лише коли
// блок видно (≥ 25 %), вийшов з екрана — пауза (батарея й трафік). Зменшений рух або «економія трафіку» —
// не запускаємо, лишається постер. Браузер заборонив автозапуск — тихо лишаємо постер.
export function initAutoplayVideos() {
  const videos = [...document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-video]')];
  if (!videos.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  if (reduced || saveData || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const video = target as HTMLVideoElement;
        if (isIntersecting) {
          video.preload = 'auto';
          video.play().catch(() => {
            // автозапуск заборонено (напр. режим енергозбереження) — лишається постер
          });
        } else if (!video.paused) {
          video.pause();
        }
      });
    },
    { threshold: 0.25 },
  );
  videos.forEach((v) => observer.observe(v));
}
