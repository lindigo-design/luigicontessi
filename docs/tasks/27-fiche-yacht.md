# Завдання 27 · Сторінка однієї яхти «Fiche yacht»

Прочитай CLAUDE.md. Спершу мають бути зроблені **24** (сторінка Yachts, колекція `yachts`) і **21 / 26** (форми).
Кроки **A → G**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Fiche yacht** — desktop `38:457`, mobile `39:551`.
Адреса: `/{lang}/yachts/{slug}/` — `getStaticPaths` = мови × яхти. Після цього завдання `yachtHref()` (завдання 24)
веде вже сюди, а не на форму.

**Правило заглушок** (як у 23 / 24): `[X] m`, `[chantier]`, `[année]`, `[Société]` на сайті не показуємо.
Порожнє поле → рядок / картка / секція ховається + попередження під час збірки (`LC_STRICT=1` — збірка падає).
Демо-режим (`features.yachtDemo: true`) — порожні **фото** показуються як сірі заглушки `--color-image` з підписом із Figma
(«SALON», «CABINE PRINCIPALE»…) і плашкою «Illustration», щоб на презентації було видно всю сторінку. Без демо — ховаємо.

---

## A · Дані (розширити колекцію `yachts` із завдання 24)

```jsonc
{
  // … поля з завдання 24 (slug, name, length, year, cabins, price, featured, image, demo, order)
  "builder": null, "architect": null, "refit": null,          // chantier, architecte, рік переобладнання
  "beam": null, "draft": null,                                  // largeur, tirant d’eau (м)
  "guests": null, "crew": null, "cruiseSpeed": null,            // invités, équipage, vitesse (вузли)
  "engines": null, "flag": { "fr": "", "en": "", "it": "" },    // moteurs, pavillon
  "port": { "fr": "", "en": "", "it": "" },                     // порт базування
  "headline": { "fr": "Pensé pour vivre en mer, pas seulement pour naviguer", "en": "…", "it": "…" },
  "intro":    { "fr": "", "en": "", "it": "" },                 // «Trois ponts, cinq cabines…» ≤ 220
  "summaryTitle": { … },                                        // «Dix invités, huit membres d’équipage, et la Méditerranée»
  "gallery": [ { "image": "…", "label": { "fr": "Salon" } } ],  // 3 фото біля головного + обкладинка
  "interiors": [ { "image": "…", "title": {…}, "deck": {…} } ], // карусель «À bord»
  "decks": [ { "id": "main", "label": {…}, "plan": "…svg" } ],  // плани палуб
  "video": { "src": "", "poster": "", "teaser": "", "duration": null, "chapters": [ { "t": 0, "label": {…} } ], "captions": { "fr": "", "en": "", "it": "" } },
  "luigiWord": { "fr": "", "en": "", "it": "" },                // цитата
  "sheetPdf": "",                                               // fiche technique PDF
  "seo": { "title": {…}, "description": {…} }
}
```

Демо-яхта **Aurora** (з 24): заповни лише те, що видно на фото (назва, довжина, тексти з Figma як приклад). Цифри кают, гостей,
екіпажу з макета («5», «10», «8») — **не переносити**, це приклад дизайнера.

## B · Верх сторінки: Breadcrumbs → «Le yacht» → назва

**Desktop (Figma «01 Le yacht», «02 Nom»):**

- Breadcrumbs (padding 24 / 80): «Yachts / Aurora» — як на сторінці товару (`Breadcrumbs.astro` перевикористати).
- **01 Le yacht** (фон `--color-bg-alt`, padding 40 / 80 / 96, проміжок 48):
  - рядок-заголовок (проміжок 40): ліворуч «Le yacht» (H3 28, відступ зліва 96), праворуч `headline` (H2 48);
  - рядок фото (проміжок 24): **головне фото** 480 × 520 (радіус 4) з **плашкою «Vendu par [Société]»** у лівому нижньому куті
    (`--color-card`, padding 12 / 16, «Vendu par» Body S secondary + назва eyebrow) — без назви продавця плашки немає;
    праворуч колонка (проміжок 96): `intro` (Body M) → **3 фото** в ряд 243 × 300 (`gallery`, радіус 4).
- **02 Nom** (padding 48 / 80 / 96): eyebrow «Yacht à vendre» → **назва яхти великими літерами** (h1, Boldonse як CONTESSI у футері,
  fluid **88 → 200 px**, верхній регістр, `line-height: 1`, не переноситься — `white-space: nowrap`, якщо не вміщається — менший кегль через `clamp` / `cqi`)
  → підзаголовок eyebrow «42 m · 2019 · Benetti» (порожні частини пропускаємо разом із «·»).

**Mobile:** спершу **02 Nom** (h1 88 px, padding 40 / 16 / 32), потім відео, потім «Résumé», де заголовок і `intro` йдуть першими,
а 3 фото — **свайп-стрічка** (як у галереї Privilèges, 80 % ширини, крапки). Головне фото на mobile — перше у стрічці.
Порядок секцій у HTML = порядок desktop; на mobile міняємо `order` у гріді сторінки, а не дублюємо розмітку.

## C · 02b Film — відеовізит

- Блок на всю ширину, 16 : 9 (`aspect-ratio`), фон `--color-bg-alt`. Без відео (`video.src` порожній) — секції немає.
- Спершу — **тизер**: беззвучний короткий цикл (`<video muted loop playsinline autoplay>`, `video.teaser`) поверх постера.
  `prefers-reduced-motion` або `Save-Data` → лише постер, без автозапуску.
- По центру — кнопка: коло 120 px (`Button / Arrow`, Next) + «Regarder la visite» (18). Знизу ліворуч «Visite avec Luigi · 4 min», праворуч «Son · Sous-titres FR / EN / IT» (Body S).
  Затемнення під текстом — градієнт знизу (правило CLAUDE.md).
- Клік → тизер ховається, вмикається **повне відео з контролами і звуком** у тому ж блоці (`<video controls preload="none">`, `video.src`),
  субтитри `<track kind="subtitles">` трьома мовами, мова за замовчуванням = мова сторінки.
- **Розділи** під відео (рядок, проміжок 24, padding 0 / 80; mobile — горизонтальна прокрутка): лінія зверху, час (Body S, secondary) + назва.
  Клік → `video.currentTime = t` і відтворення. Активний розділ (за часом відтворення) — лінія і текст `--color-text`.
- Відео — **власний файл** (MP4 H.264 + постер), не YouTube: без сторонніх скриптів (CSP), розділи працюють, Luigi не показує чужу рекламу.
  Файли — у `public/video/yachts/{slug}/`, великі — поза git (TODO: хостинг / CDN, окремо).

## D · 03 Résumé + 04 Caractéristiques

**Résumé** (padding 48 / 80 / 120, рядок, проміжок 80):

- ліворуч (700, відступ зліва 96, проміжок 32): рядок `summaryTitle` (H3 28) + «Il est basé à {port}. Visite à quai et essai en mer sur rendez-vous.» (Body S);
  **Prix** — підпис 12 + «Sur demande» (H3 28) або ціна; кнопка **Demander des informations** (Primary → `#demande`);
  унизу (притиснуто) «Représenté par Luigi Contessi pour [Société]» (eyebrow).
- праворуч фото 500 × 620 (`image`, вертикальне, радіус 4).
- Mobile: стовпчиком, padding 32 / 16 / 56, кнопка на всю ширину.

**Caractéristiques** (padding 96 / 80, фон `--color-bg`): eyebrow → H2 «Fiche technique» →
сітка 4 колонки (mobile 2), кожна клітинка: лінія зверху, padding 20 / 0, підпис eyebrow 12 + значення 18.
Порядок: Longueur, Largeur, Tirant d’eau, Année (+ «refit 2022», якщо є), Chantier, Architecte, Cabines, Invités, Équipage,
Vitesse de croisière («14 nœuds»), Moteurs, Pavillon. Порожні — **не показуємо**, сітка стискається без дірок.
Одиниці: метри з комою по-французьки (`Intl.NumberFormat(lang)`), «nœuds / knots / nodi».
Унизу Link Accent **Télécharger la fiche (PDF)** — лише якщо є `sheetPdf` (`download`, розмір файлу в дужках «PDF, 1,2 Mo»).

## E · 05 Intérieurs + 06 Plan de pont

**Intérieurs «À bord»** (padding 120 / 0, фон `--color-bg-alt`):

- Заголовок-рядок (padding 0 / 80): eyebrow «Intérieurs» + H2 «À bord»; праворуч стрілки 88 × 88 (`Button / Arrow`), mobile — без стрілок.
- Стрічка від лівого відступу до правого краю екрана (обрізається праворуч), проміжок 24:
  **перша** картка велика 620 × 440, інші 380 × 300, усі притиснуті до верху; під фото підпис: назва (Body S) ліворуч, «Pont principal» (Body S, secondary) праворуч.
- Свайп + перетягування мишкою + стрілки + клавіші (перевикористай `drag-scroll.ts` / логіку з «Nouveautés», без автопрокрутки).
- Mobile: картки 280 × 220, проміжок 12. Немає фото інтерʼєрів → секції немає.

**Plan de pont** (padding 96 / 80): H2 «Trois ponts, pièce par pièce» (текст «Trois ponts» — з кількості `decks`: «Deux ponts», «Quatre ponts»…).

- План — **SVG** на всю ширину контейнера (1280 × 400; mobile 358 × 240, горизонтальна прокрутка, якщо дрібно), фон `--color-card`, радіус 4.
  SVG вставляється як `<img>` (CSP), колір ліній — світлий у самому файлі.
- Під планом чипи палуб (ChipGroup): «Pont principal» · «Pont inférieur» · «Flybridge» — перемикають план без перезавантаження, плавна зміна (opacity 200 ms).
- Mobile — чипи з горизонтальною прокруткою. Немає планів → секції немає; одна палуба → без чипів.

## F · 07 Le mot de Luigi + Le vendeur + Demande

- **Le mot de Luigi** (padding 120 / 80, фон `--color-bg-alt`): eyebrow → цитата Desktop/Quote 36 (mobile 24), макс. 980 → «— Luigi Contessi» (eyebrow).
  Порожня цитата → секції немає (жодного «[mois]» на сайті).
- **Le vendeur** — той самий компонент, що на сторінці Yachts (завдання 24, крок E).
- **Demande** — та сама форма, що на Yachts (`id="demande"`), але:
  - над формою рядок «Yacht : Aurora · 42 m» (без «Changer» — ми на сторінці цієї яхти), приховане поле `yacht = slug`;
  - «Taille recherchée» **прибрати** на цій сторінці (розмір уже відомий), «Budget» лишити;
  - «Merci» → кнопка «Voir les autres yachts» → `yachts/#disponibles`.

## G · 10 Autres yachts + SEO

- **Autres yachts** (padding 96 / 80): eyebrow «À voir aussi» + H2 «Autres yachts», праворуч Link Accent «Tous les yachts» → `yachts`.
  3 картки `Card / Yacht` (той самий компонент) — інші яхти, найближчі за довжиною. Mobile — свайп-стрічка, «Tous les yachts» під заголовком.
  Менше ніж 1 інша яхта → секції немає.
- **Повноширинні фото** — правило CLAUDE.md (висота росте з шириною, `widths` до 2560). Тут це відео-блок і головні фото.
- SEO: `<title>` «Aurora — 42 m à vendre — Luigi Contessi» (з `seo` або зібрати з назви й довжини), description з `intro`.
  JSON-LD `Product` (name, image, brand = builder, `offers` лише з реальною ціною) — **лише для не-демо яхт**. Демо-яхти — `noindex`.
- Перемикач мов веде на ту саму яхту.

## Перевірка

- Демо Aurora на 390 / 768 / 1024 / 1440 / 1920: усі секції на місці, сірі заглушки фото з плашкою «Illustration», жодного `[X]` у тексті.
- Вимкнути демо → сторінки демо-яхт не генеруються.
- Яхта без відео / інтерʼєрів / планів / цитати → відповідних секцій немає, сторінка не ламається.
- Відео: тизер без звуку; «Regarder la visite» → повне з контролами; клік по розділу → перемотування; зменшений рух → без автозапуску.
- Назва AURORA на 390 не виходить за екран. Розділи й чипи гортаються пальцем.
- Немає помилок CSP, `npm run build` зелений.
