# Завдання 02 · Футер: «прожектор» на написі CONTESSI (як у Bugatti)

Прочитай CLAUDE.md. Один етап: зроби лише це, потім звіт і стоп.
Виконувати ПІСЛЯ завдання 01 (там CONTESSI вже розтягнутий на всю ширину).

## Як це зроблено на bugatti.com (перевірено в браузері)

- Великий BUGATTI внизу футера — це SVG-напис з прозорістю 40 % і «зерном»
  (SVG-фільтр `feTurbulence` — шум усередині літер, як плівкова фактура).
- Обгортка напису має `mask-image: radial-gradient(circle at X Y, #000 0%, transparent 60%)`.
- JS під час руху мишки змінює X і Y — центр «світлої плями» плавно, з невеликим запізненням,
  їде за курсором. Де мишка — літери проявляються, далі — згасають у темряву.
- Посилання у футері Bugatti без особливого hover — ефект тримається саме на написі.

## Що зробити в нас

### 1. Розмітка (src/components/sections/Footer.astro)

Напис CONTESSI — два шари один над одним (обидва `aria-hidden="true"`, без виділення):

```astro
<div class="ghost" data-spotlight aria-hidden="true">
  <p class="ghost__base">CONTESSI</p>
  <!-- завжди видно, як у Figma (#1A1A1A) -->
  <p class="ghost__light">CONTESSI</p>
  <!-- світлий шар із зерном, видно лише під «прожектором» -->
</div>
```

Базовий шар лишає дизайн з Figma без змін (CONTESSI ледь видно навіть без мишки).
Світлий шар — це і є ефект Bugatti.

### 2. Стилі (у тому ж файлі, без inline style — у нас сувора CSP)

- `.ghost` — `position: relative`, шари накладаються через `grid-area: 1 / 1`.
- `.ghost__base` — колір `var(--color-ghost)`.
- `.ghost__light`:
  - колір `var(--color-text)`, `opacity: 0.4`;
  - зерно: `background-image: url('/textures/noise.svg')`, `background-clip: text`,
    `-webkit-background-clip: text`, `color: transparent` (фон-шум видно лише в літерах);
  - маска: `mask-image: radial-gradient(circle var(--spot-r) at var(--mx) var(--my), #000 0%, transparent 60%)`
    (+ `-webkit-mask-image` з тим самим значенням);
  - стартові значення змінних: `--mx: 50%; --my: -200%; --spot-r: 45vw;` — пляма «за кадром», світлий шар не видно.
- Нові токени в tokens.css: `--spot-r: 45vw` (радіус), `--ghost-light-opacity: 0.4`.

### 3. Текстура шуму (public/textures/noise.svg)

Окремий файл (не data: URL і не inline), щоб не порушувати CSP:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.9"/>
</svg>
```

Перевір, що зерно ледь помітне: літери мають виглядати як матовий метал, а не як «телевізійний шум».
Якщо зерно занадто грубе — зменш `opacity` прямокутника до 0.6.

### 4. Скрипт (src/scripts/spotlight.ts, підключити в Footer.astro через <script>)

- Слухати `pointermove` на `<footer>` (не на window).
- Рахувати координати курсора відносно `.ghost` (через `getBoundingClientRect`).
- Плавність як у Bugatti: у `requestAnimationFrame` наближати поточну точку до цілі
  `current += (target - current) * 0.12`; зупиняти цикл, коли різниця < 0.5 px.
- Записувати значення через `el.style.setProperty('--mx', x + 'px')` / `--my`
  (CSSOM дозволений нашою CSP, атрибут style в HTML — ні).
- `pointerleave` з футера → плавно повернути пляму вгору за кадр (`--my` = -2 × висота напису).
- Слухач вмикати лише коли футер у вікні (IntersectionObserver), щоб не навантажувати сторінку.

### 5. Телефони, планшети, доступність

- `@media (hover: none)`: курсора немає → скрипт не запускати. Замість цього
  світлий шар показати статично з плямою в центрі (`--mx: 50%; --my: 60%`), без руху.
- `prefers-reduced-motion: reduce`: без плавного «запізнення» — пляма одразу там, де курсор
  (або статично, як на телефоні).
- Напис декоративний: `aria-hidden`, `user-select: none`, `pointer-events: none` на шарах
  (щоб не заважав кліку по посиланнях над ним).

## Що НЕ чіпати

- Колонки, посилання, розсилку, мови, соцмережі футера — без змін.
- Розмір і обрізання CONTESSI — як після завдання 01.
- Кольори і шрифти — лише через токени.

## Перевірка

1. `npm run format`, `npm run build` — без помилок, у консолі немає помилок CSP.
2. Desktop 1440 і 1920: ведеш мишкою над футером — під курсором літери проявляються з зерном,
   пляма плавно «доганяє» курсор; мишка пішла з футера — пляма згасає.
3. Mobile 390 (емуляція touch): світлий шар статичний, нічого не рухається, прокрутка не гальмує.
4. З увімкненим «зменшити рух» — без анімації.
5. Звіт: що зроблено + список файлів. Стоп.
