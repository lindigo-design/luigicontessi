# Завдання 31 · Сторінка «Journal» (список статей)

Прочитай CLAUDE.md. Кроки **A → E**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Journal** — desktop `33:380`, mobile `34:447` (обкладинки вже заповнені фото).
Адреса: `/{lang}/journal/` (path є в `nav.ts`; додай у `builtPages` — тоді 404 сам поверне кнопку «Lire le Journal»).
Сторінка окремої статті (Figma «Article» `57:450`) — **окреме завдання**, тут лише список.

Фото вже в проєкті, `src/assets/img/journal/`:
`gac-mondial.jpg`, `yachts.jpg`, `horlogerie.jpg`, `voyages.jpg`, `jets.jpg`, `art-de-vivre.jpg`, `microlino.jpg`.

---

## A · Дані: колекція `articles`

`src/content/articles/<slug>.json` (Zod + Keystatic «Статті»), тексти трьома мовами всередині (як `products`):

```jsonc
{
  "slug": "gac-mondial-auto-2026",
  "category": "automobiles",          // automobiles | horlogerie | voyages | yachts | jets | art-de-vivre
  "title":   { "fr": "", "en": "", "it": "" },
  "excerpt": { "fr": "", "en": "", "it": "" },   // ≤ 110 знаків, 1–2 рядки
  "readingTime": 5,                   // хвилини
  "date": "2026-10-12",
  "partnership": true,                // «· Partenariat» — закон Франції про інфлюенсерів (2023), показуємо завжди, коли true
  "featured": false,                  // одна стаття «À la une»
  "cover": "../../assets/img/journal/gac-mondial.jpg", "coverAlt": { … }, "coverPosition": "50% 30%",
  "demo": false,                      // приклад для презентації
  "draft": true                       // текст статті ще не готовий
}
```

Категорії (назви для чипів і мета-рядка) — у `ui/*.json`: Automobiles / Horlogerie / Voyages & Hôtels / Yachts / Jets privés / Art de vivre (EN / IT — переклад).

**Показ на сайті:**

- `demo: true` або `draft: true` → показуються **лише в перегляді** (dev / `PUBLIC_NOINDEX=true`), як демо-яхти і заглушки на Partenariats.
  На живому сайті — ні; якщо там нема жодної статті, секції «À la une» і «Articles» замінює рядок «Les premiers articles arrivent bientôt.» (без обіцянки дат).
- Сортування: `date` від нових до старих.

### Статті (заповни)

1. **GAC — справжня подія, фото Luigi зі стенду** (`draft: true` — текст статті ще пише Luigi):
   - FR: «GAC au Mondial de l’Auto : ce que j’ai vu» / «La nouvelle AION UT Cross, et pourquoi une marque chinoise mise sur l’Europe.»
   - EN: «GAC at the Paris Motor Show: what I saw» / «The new AION UT Cross, and why a Chinese brand is betting on Europe.»
   - IT: «GAC al Salone di Parigi: cosa ho visto» / «La nuova AION UT Cross, e perché un marchio cinese punta sull’Europa.»
   - `category: automobiles`, `readingTime: 5`, `date: 2026-10-12`, `partnership: true` (⚠️ підтвердити з Luigi), `cover: gac-mondial.jpg`, `coverPosition: "50% 22%"`.
   - Факти для майбутнього тексту (з офіційних релізів GAC): Mondial de l’Auto 2026, Paris Expo Porte de Versailles, 12–18 жовтня, зал 5.1;
     світова премʼєра **AION UT Cross**; бренди HYPTEC, GAC Motor, AION; гасло «en Europe, pour l’Europe»; партнерство з Chelsea FC. Не вигадувати те, чого Luigi не робив (тест-драйв тощо).
2. **Демо-статті** (`demo: true`, тексти з Figma): «Trois jours à bord d’un 40 mètres entre Monaco et Portofino» (yachts, 9 min, **featured**, `yachts.jpg`),
   «Trois montres que je porte vraiment» (horlogerie, 4, `horlogerie.jpg`), «Le Cheval Blanc Randheli, sans filtre» (voyages, 7, partnership, `voyages.jpg`),
   «Louer un jet : combien et comment» (jets, 5, `jets.jpg`), «Ma valise pour 48 h à Milan» (art-de-vivre, 3, `art-de-vivre.jpg`),
   «Microlino : la petite qui fait sourire» (automobiles, 6, partnership, `microlino.jpg`). Дати — від новіших до старших за порядком у Figma.
   Статті «Bugatti Tourbillon» більше **немає** — її місце зайняла GAC.

## B · 01 Intro + фільтри

- Intro (padding 96 / 80 / 48; mobile 40 / 16 / 24): eyebrow «Journal» → H1 «Ce que j’essaie, et ce que j’en pense» (52 → 32) →
  «Voitures, montres, hôtels, yachts. Des essais honnêtes, avec mes photos. Quand un article est fait avec une marque, c’est écrit dessus.» (18 → 16, макс. 760).
- **Фільтри** (ChipGroup, радіо): Tout · Automobiles · Horlogerie · Voyages & Hôtels · Yachts · Jets privés · Art de vivre.
  Desktop — рядок, проміжок 8; mobile — горизонтальна прокрутка без скролбару (як фільтри яхт).
  Показуємо лише категорії, в яких є статті (на живому сайті — менше чипів).
- Фільтр ховає картки без перезавантаження, вибір у адресі `?categorie=horlogerie` (`replaceState`); при фільтрі ≠ Tout блок «À la une» ховається,
  якщо його стаття не з цієї категорії. Порожньо — «Pas encore d’article dans cette rubrique.»

## C · 02 À la une

- Стаття з `featured: true` (немає — найновіша). Desktop: рядок, проміжок 64, padding 0 / 80 / 96: фото 760 × 520 (радіус 4, `zoom-card`) +
  текст 456 по центру висоти: eyebrow «À la une» → мета «Yachts · 9 min» (+ «· Partenariat») → H2 48 → excerpt Body M → Link Accent «Lire l’article».
- Mobile: фото 358 × 268 зверху, далі текст, padding 0 / 16 / 56, проміжок 16.
- Уся картка — одне посилання (заголовок — посилання, фото — `tabindex="-1" aria-hidden`).

## D · 03 Articles

- Фон `--color-bg-alt`, padding 96 / 80 (mobile 56 / 16). Сітка 3 колонки, проміжок 56 × 40; 768–1023 — 2; mobile — 1, проміжок 40.
- Картка `Card / Article` (компонент із Figma): фото `aspect-ratio: 4 / 3` (радіус 4, `zoom-card`, `coverPosition`) → мета eyebrow «Automobiles · 5 min · Partenariat» →
  заголовок H3 28 (до 3 рядків) → excerpt Body S secondary (до 2 рядків, обрізати `line-clamp`). Hover — як текстові картки (завдання 13).
- `À la une` у сітці не дублюється.
- **Plus d’articles** (Outline, по центру; mobile — на всю ширину): спершу 6 карток, клік — ще 6 (без перезавантаження, фокус на першу нову картку). Більше немає — кнопка ховається.
  Без JS — видно всі.
- **Куди веде картка**: сторінки статей ще немає → заглушка як у завданні 17 (`aria-disabled`, «Article bientôt disponible»), одна функція `articleHref()` у `helpers.ts`,
  щоб потім поміняти в одному місці на `/{lang}/journal/{slug}/`.

## E · SEO і звʼязки

- `<title>` «Journal — Luigi Contessi», description з intro.
- Головна «Univers»: пункт Journal / категорії ведуть на `journal/?categorie=…` (якщо там зараз інша адреса — поправ).
- Меню і футер «Journal» — тепер справжня сторінка (поточна підсвічується червоним).

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920 — як у Figma; обкладинки не обрізають головне (GAC — Luigi і логотип стенду в кадрі).
- Фільтри + `?categorie=` після перезавантаження; «Plus d’articles».
- Живий сайт (`PUBLIC_NOINDEX` ≠ `true`): демо- і чернетки не видно; GAC зʼявиться, коли `draft: false`.
- Позначка «Partenariat» видна скрізь, де `partnership: true`.
- Немає помилок CSP, `npm run build` зелений.
