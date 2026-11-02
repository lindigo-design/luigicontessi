# Завдання 29 · Partenariats: відео яхти замість фото в паузі «08 Yachts»

Прочитай CLAUDE.md. Виконувати **після 28** (там створюється спільний `PhotoBreak.astro`).
Після кроку `npm run format` + `npm run build`, короткий звіт і стоп.

Figma: Partenariats desktop, фрейм «08 Yachts» `168:3077` — тепер там відео: яхта повільно пливе, ніс і борт близько, вечірнє світло.

## Файли (вже готові)

| файл                                         | що                                                            |
| -------------------------------------------- | ------------------------------------------------------------- |
| `public/video/partenariats/yacht-1920.mp4`   | H.264, 1920 × 1080, 11 с, без звуку, ~5,6 МБ — для ≥ 768      |
| `public/video/partenariats/yacht-960.mp4`    | H.264, 960 × 540, ~1,4 МБ — для < 768                         |
| `public/video/partenariats/yacht-poster.jpg` | перший кадр — постер (поки відео вантажиться / зменшений рух) |

Оригінал (`src/assets/video/…`, HEVC 43 МБ) у сайт **не підключати**: Chrome і Firefox на багатьох компʼютерах HEVC не відтворюють.
Папка `src/assets/video/` уже в `.gitignore`.

## Що зробити

1. `PhotoBreak.astro` (із завдання 28) — додай режим **відео**: пропс `video?: { src: string; srcMobile?: string; poster: string }`.
   Якщо `video` є — замість `<Image>` рендеримо:
   ```html
   <video
     class="pbreak__media"
     muted
     loop
     playsinline
     preload="none"
     poster="…/yacht-poster.jpg"
     aria-hidden="true"
     data-autoplay-video
   >
     <source src="…/yacht-960.mp4" type="video/mp4" media="(max-width: 767px)" />
     <source src="…/yacht-1920.mp4" type="video/mp4" />
   </video>
   ```
   Шляхи — з `import.meta.env.BASE_URL` (сайт на GitHub Pages живе в `/luigicontessi/`).
   Без `controls`, без звуку (звукової доріжки у файлах немає). Декоративне → `aria-hidden`, текст читалці не потрібен.
2. Розміри, кадр і **градієнт — ті самі, що для фото** (`object-fit: cover`, desktop `object-position: 50% 33%`, mobile `70% 50%` — ніс яхти в кадрі,
   висота за правилом CLAUDE.md: 516 при 1440 → `min(100svh, max(32.25rem, 35.8vw))`).
   Градієнт згори / знизу лежить **поверх відео** (`::after`), як на фото.
3. Скрипт `src/scripts/autoplay-video.ts` (без inline — CSP):
   - відео стартує, лише коли блок **видно на екрані** (`IntersectionObserver`, threshold 0.25): тоді `preload` → `auto`, `play()`;
     вийшов з екрана — `pause()` (економимо батарею й трафік);
   - `prefers-reduced-motion: reduce` або `navigator.connection.saveData` → **не запускати**, лишається постер;
   - `play()` повертає Promise — помилку (браузер заборонив автозапуск) ловимо тихо, лишається постер.
4. На сторінці Partenariats: `<PhotoBreak video={…} …/>` замість фото яхти. На **Contact** лишається фото (не міняти).
5. CSP: для `<video>` з власного домену нічого додавати не треба; переконайся, що `media-src 'self'` (або дефолт) дозволяє.

## Перевірка

- Chrome, Safari, Firefox; iPhone (Safari) і Android: відео грає по колу без звуку, без чорного кадру на старті (є постер), без кнопки «play».
- На 390 вантажиться `yacht-960.mp4` (вкладка Network), на 1440 — `yacht-1920.mp4`; поки блок не видно — відео не вантажиться.
- Увімкнений «зменшений рух» → лише постер.
- Шву зверху / знизу не видно, градієнт поверх відео.
- `npm run build` зелений, у `dist/` відео копіюються з `public/video/partenariats/`.
