# Завдання 07 · Сторінка товару «Fiche produit» (Contessi Collection)

Прочитай CLAUDE.md. Великий етап — роби **по кроках A → F**, після кожного кроку
`npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Fiche produit** — desktop `28:379`, mobile `29:418` (оновлено: куртка чорна).
Компоненти: Button (Type × State), Chip / Filter (Default / Active), Card / Product (Medium / Compact),
Image Placeholder. Шапка і футер — спільні, вже є.

---

## Важливо: магазин поки вимкнений

Сайт запускається **без продажу** (`src/content/site/settings.json → features.shop: false`).
Сторінка має працювати в обох режимах — перемикач уже є, нічого вигадувати не треба:

|                                                     | `shop: true` (пізніше, Shopify)        | `shop: false` (зараз)                                                                                                                                               |
| --------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ціна                                                | `[Prix] €` + «TVA incluse»             | так само показуємо                                                                                                                                                  |
| Головна кнопка                                      | «Ajouter au panier — [Prix] €»         | «Me prévenir du lancement» → під кнопкою поле e-mail; після надсилання чесний текст «Inscription bientôt disponible» (як розсилка у футері, форма ще не підключена) |
| Рядок «Code LUIGI10…»                               | показуємо                              | **ховаємо** (коду ще нікуди вводити)                                                                                                                                |
| Блок «Réassurance» (Livraison / Retours / Paiement) | показуємо                              | **ховаємо**                                                                                                                                                         |
| «Épuisé — Me prévenir» на розмірі                   | так                                    | так                                                                                                                                                                 |
| Хлібні крихти                                       | Boutique / Collection / Veste Contessi | Collection / Veste Contessi                                                                                                                                         |

Кнопку «Ajouter au panier» поки **не підключати** до кошика: `data-action="add-to-cart"` і TODO-коментар
«Shopify Storefront API — окремий етап».

---

## Крок A · Дані товарів

1. Нова колекція `products` у `src/content.config.ts` (Zod) + Keystatic `collection` «Товари».
   Файли: `src/content/products/<slug>.json` — **один файл на товар**, тексти трьома мовами всередині:
   ```jsonc
   {
     "slug": "veste-contessi",
     "line": "Contessi Collection",            // eyebrow, не перекладається
     "name": { "fr": "Veste Contessi", "en": "Contessi jacket", "it": "Giacca Contessi" },
     "price": null,                              // число в EUR або null → показати «[Prix]»
     "summary": { "fr": "…", "en": "…", "it": "…" },        // ≤ 200 знаків
     "defaultColor": "noir",
     "colors": [
       { "id": "noir",  "label": { "fr": "Noir",  "en": "Black", "it": "Nero" },  "swatch": ["#2B2B2B", "#0F0F0F"], "images": ["noir-1.jpg", "noir-2.jpg", "noir-3.jpg", "noir-4.jpg"] },
       { "id": "navy",  "label": { "fr": "Navy",  "en": "Navy",  "it": "Blu navy" }, "swatch": ["#333D5C", "#172140"], "images": [ … ] },
       { "id": "creme", "label": { "fr": "Crème", "en": "Cream", "it": "Crema" }, "swatch": ["#EDE3D1", "#D1C7B5"], "images": [ … ] }
     ],
     "sizes": [ { "id": "S" }, { "id": "M" }, { "id": "L" }, { "id": "XL" }, { "id": "XXL", "soldOut": true } ],
     "details": [ { "title": {…}, "body": {…} } ],          // акордеони
     "luigi": { "quote": {…}, "text": {…}, "image": "luigi-wears.jpg" },
     "related": ["chemise-blanche", "chemise-noire", "polo-contessi", "veste-lin"],
     "seo": { "title": {…}, "description": {…} }            // ≤ 70 / ≤ 170
   }
   ```
   **Назва товару — без кольору** («Veste Contessi»): колір обирається нижче, і назва не має суперечити вибору.
2. Заповни **один** товар з Figma (FR — з макета, EN/IT — переклад тим самим простим стилем):
   - name «Veste Contessi»; summary «Laine légère, coupe ajustée, logo Contessi brodé sur la poitrine. Une veste qui se porte sur une chemise comme sur un t-shirt.» (на mobile в Figma — лише перше речення; показуй увесь текст, CSS не обрізає);
   - кольори в порядку з Figma: **Noir** (за замовчуванням — у ній Luigi на фото), Navy, Crème; градієнт кружка 0 % → 100 % (кольори вище);
   - розміри S M L XL, XXL — `soldOut: true`; вибраний за замовчуванням — **M** (як у Figma);
   - акордеони: «Description» — «Veste droite, deux poches, doublure légère. Le logo est brodé ton sur ton.», «Composition & entretien», «Taille et coupe» — тексти `[à compléter]`;
   - «Le mot de Luigi»: цитата «Je voulais une veste que je peux porter en avion, puis au dîner, sans me changer.» + `[Texte de Luigi : pourquoi cette pièce, où il la porte, avec quoi.]`.
3. Ще 4 короткі товари-заглушки для «Complétez le look»: Chemise Blanche, Chemise Noire, Polo Contessi, Veste Lin
   (лише name, price: null, 1 фото-заглушка).
4. Фото: `src/assets/img/products/<slug>/…` — поки сірі заглушки з підписом. Для чорного кольору перше фото —
   «Luigi в чорній куртці» (заглушка з таким підписом). Жодних вигаданих цін, складу, розмірних сіток.

## Крок B · Маршрут

- `src/pages/[lang]/collection/[slug].astro`, `getStaticPaths` = мови × товари → `/fr/collection/veste-contessi/`.
- Колір у адресі не потрібен; вибраний колір можна зберігати в `?couleur=navy` (через `history.replaceState`),
  щоб посиланням можна було поділитися конкретним кольором. Без параметра — `defaultColor`.
- Сторінка = лише порядок секцій: Breadcrumbs → ProductMain → LuigiWord → CompleteLook.
- Картки на головній (La collection, Nouveautés з тегом «Collection») ведуть на цю адресу — через `localizePath`.
- SEO: `seo.title/description`; JSON-LD `Product` (name, image, brand «Contessi», `color` для кожного варіанта;
  `offers` **лише коли** `shop: true` і є ціна).

## Крок C · ProductMain (`src/components/sections/product/`)

**Desktop (≥ 1024), Figma «01 Produit»:** рядок, проміжок 80 px, відступ знизу 120.

- **Галерея** (ліва колонка, ~ 760 / 1280 → `minmax(0, 1.73fr)`):
  велике фото 760×940 (`aspect-ratio: 760/940`), під ним 4 мініатюри в ряд, проміжок 16, `aspect-ratio: 172/214`;
  активна — рамка 1 px `--color-text` з внутрішнім відступом 3 px; неактивні — `opacity: .55`, hover → 1.
  Мініатюри — `<button aria-label="Photo 2 sur 4" aria-pressed>`; клік міняє велике фото.
- **Інфо** (права колонка 440 px, `position: sticky; top: calc(var(--header-h) + 32px)`), проміжки 32:
  1. eyebrow «Contessi Collection» (червоний), H1 «Veste Contessi» (на цій сторінці назва = **h1**, стиль Desktop/H2 48 → Mobile/H1 32),
     ціна Desktop/H3 28 + «TVA incluse» (Body S, secondary) — у Франції це обовʼязково;
  2. опис (Body M, secondary);
  3. **Couleur**: «Couleur : Noir» (підпис secondary, назва кольору primary) + кружки 28 px (mobile 32) з відступом 3 px;
     вибраний — кільце 1 px `--color-text` навколо (у Figma — на чорному);
     технічно — `<fieldset><legend>` + `input type="radio"` (візуально приховані), клавіатура ←/→;
     зміна кольору → міняє фото галереї (повертається на перше фото) і назву кольору в підписі.
  4. **Taille**: підпис + справа «Guide des tailles» (Button Link → відкриває `<dialog>` з таблицею `[à compléter]`);
     чипи 64×38 (mobile 66×46 — зручніше пальцем), проміжок 8, Chip / Filter Default/Active; теж radio-група;
     розпроданий — `opacity: .35`, `aria-disabled`; клік → під чипами «XXL épuisé — on vous prévient dès son retour.» + поле e-mail (поки «bientôt»).
  5. **CTA**: див. таблицю режимів вище; кнопка на всю ширину колонки; без вибраного розміру → підказка «Choisissez une taille» біля чипів, кнопка не блокується.
  6. **Réassurance** (лише `shop: true`): 3 рядки з лінією зверху, ліворуч назва (primary), праворуч текст (secondary).
  7. **Акордеони**: `<details>`, перший відкритий, «+» / «−» (Text/Title 18), лінія між пунктами, як FAQ на головній.

**Mobile (390), Figma 29:418:**

- Галерея на всю ширину без відступів 390×488, свайп (scroll-snap), під фото крапки 6 px + лічильник «1 / 4»; мініатюр немає.
- Інфо одним стовпчиком, відступи 24 / 16 / 56, проміжок 28; не sticky.

## Крок D · «Le mot de Luigi» (Figma «02»)

- Фон `--color-bg-alt`. Desktop: фото 480×560 зліва («Luigi porte la veste» — у чорній), текст справа
  (eyebrow → цитата Desktop/Quote 36/46 → текст Body M → підпис «— Luigi Contessi»), проміжок 80, текст по центру висоти.
- Mobile: **без фото** (так у Figma), лише текст, відступи 56 / 16.

## Крок E · «Complétez le look» (Figma «03»)

- Заголовок: eyebrow «Collection» + H2 «Complétez le look»; «Voir la boutique» (Link Accent) — desktop справа в рядку заголовка, mobile під заголовком (як домовились для всіх секцій).
  Коли `shop: false` — посилання веде на `/collection/`.
- 4 картки Card / Product Medium (302×318) у сітці `repeat(4, minmax(0,1fr))`, проміжок 24; mobile — свайп-стрічка Compact 171×282, проміжок 12.
- Зум фото при наведенні — спільний клас `zoom-card` (завдання 03).

## Крок F · Перевірка

- Ширини 390 / 768 / 1024 / 1440 / 1920: без горизонтальної прокрутки, sticky-колонка не налазить на футер.
- За замовчуванням вибрано **Noir** і **M**; перемикання кольору міняє фото і підпис «Couleur : …».
- Клавіатура: Tab по мініатюрах, кольорах, розмірах, кнопці, акордеонах; Esc закриває «Guide des tailles».
- Три мови: `/fr/…`, `/en/…`, `/it/…` — перемикач мов веде на той самий товар (і той самий колір).
- `shop: false` і `shop: true` (тимчасово перемкнути) — обидва режими виглядають правильно.
- Немає помилок CSP у консолі, `npm run build` зелений.

## Що НЕ чіпати

Шапку, футер, головну (крім посилань карток на товар), токени і шрифти.
