# Сайт Luigi Contessi

Статичний сайт на Astro. Мови: французька (основна), англійська, італійська.
Побудований за інструкцією «Як побудувати сайт за зразком DataTixx».

## Перший запуск

Потрібно: Node.js 22.12 або новіше, Git, VS Code (розширення Astro, Prettier, EditorConfig).

```bash
npm install
npm run dev
```

- Сайт: http://127.0.0.1:4321/fr/
- Адмінка текстів (лише на вашому компʼютері): http://127.0.0.1:4321/keystatic

## Команди

| Команда           | Що робить                               |
| ----------------- | --------------------------------------- |
| `npm run dev`     | сайт і адмінка на компʼютері            |
| `npm run build`   | перевірка коду + збірка в папку `dist/` |
| `npm run preview` | показує зібраний сайт, як на хостингу   |
| `npm run format`  | вирівнює оформлення коду                |

## Де що лежить

- Тексти головної: `src/content/pages/<fr|en|it>/home.json` (або Keystatic)
- Загальні дані (Instagram, соцмережі, магазин увімк./вимк.): `src/content/site/settings.json`
- Дрібні написи (меню, кнопки): `src/i18n/ui/<мова>.json`
- Пункти меню і футера: `src/i18n/nav.ts`
- Кольори, шрифти, відступи: `src/styles/tokens.css`
- Секції головної: `src/components/sections/home/`
- Порядок секцій: `src/pages/[lang]/index.astro`

## Фото

Зараз у `src/assets/img/home/` лежать сірі заглушки з підписом назви і розміру.
Замініть кожну своїм фото **з тією самою назвою файлу** (JPG). Розмір — не менше вказаного
на заглушці; Astro сам зробить WebP і потрібні розміри.

| Файл                   | Де на сторінці                                   |
| ---------------------- | ------------------------------------------------ |
| `hero.jpg`             | перший екран (фон)                               |
| `hero-card-1/2.jpg`    | дві маленькі картки в hero                       |
| `about.jpg`            | портрет у «À propos»                             |
| `quote.jpg`            | фон під цитатою                                  |
| `news-1…5.jpg`         | карусель «Nouveautés» (по порядку)               |
| `univers-1…6.jpg`      | мініатюри «Univers» (Automobiles → Art de vivre) |
| `collection-1/2/3.jpg` | костюм (велике), сорочка, взуття                 |
| `yachts.jpg`           | фон секції «Yachts»                              |
| `instagram-1…6.jpg`    | стрічка Instagram                                |
| `faq.jpg`              | фото біля FAQ (desktop)                          |
| `brands.jpg`           | фон «Pour les marques»                           |

Також додайте `public/og-image.png` (1200×630) — картинка для посилань у соцмережах.

## Що далі (наступні етапи)

1. Інші сторінки: Journal, Yachts, Coups de cœur, Privilèges, Partenariats, À propos, Contact, FAQ, Presse.
2. Банер cookies (CNIL: «Tout refuser» / «Tout accepter» однаково помітні) і юридичні сторінки.
3. Форми (контакт, партнерства, розсилка) — PHP + SMTP або сервіс розсилок.
4. Жива стрічка Instagram.
5. Хостинг, домен, GitHub Actions деплой.
