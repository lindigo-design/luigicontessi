# Завдання 24 · Сторінка «Yachts» (продаж яхт)

Прочитай CLAUDE.md. Спершу має бути зроблене **завдання 21** (спільні елементи форм).
Кроки **A → F**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Yachts** — desktop `36:379`, mobile `37:479`. «Merci» — **États** `55:472` / `55:482`.
Адреса: `/{lang}/yachts/` (path є в `nav.ts`; додай у `builtPages`). Шапка — режим **overlay** (як на головній, завдання 16).
Сторінка «Fiche yacht» (`38:457`) — **окреме завдання**, тут не робимо.

Фото вже в проєкті, `src/assets/img/yachts/`: `hero.jpg` (2400 × 1340), `featured.jpg` (2400 × 1340), `yacht-1.jpg` … `yacht-3.jpg` (1200 × 670).
⚠️ Це **ілюстрації для презентації** (згенеровані). На живому сайті — лише справжні фото яхт від продавця. Див. «Демо-режим» нижче.

Кольори тексту вже оновлені в `tokens.css`: `--color-text: #efefef`, `--color-text-2: #d4d1cb` — нічого не міняй.

---

## A · Дані

1. Колекція **`yachts`** (`src/content/yachts/<slug>.json`, Zod + Keystatic «Яхти»), тексти трьома мовами всередині (як `products`):
   ```jsonc
   {
     "slug": "…",
     "name": "…", // назва яхти не перекладається
     "length": 45, // метри, число
     "year": 2019,
     "cabins": 5,
     "price": null, // null → «Sur demande» / «Prix sur demande»
     "featured": false, // одна яхта «À la une»
     "image": "../../assets/img/yachts/yacht-1.jpg",
     "imageAlt": { "fr": "", "en": "", "it": "" },
     "demo": true, // приклад для презентації
     "order": 1,
   }
   ```
   Фільтр за довжиною рахується з `length`: `< 30` / `30–50` / `> 50`.
2. **Демо-яхти** (4 шт., `demo: true`) з фото вище — для показу Luigi. Назви — нейтральні вигадані, без існуючих брендів:
   «Aurora» 45 м (featured, `featured.jpg`), «Maestrale» 24 м (`yacht-1`), «Calypso» 38 м (`yacht-2`), «Orizzonte» 70 м (`yacht-3`).
   Рік і каюти — **не вигадувати**: `year: null`, `cabins: null` → у картці «—».
3. **Демо-режим**: `settings.json` → `features.yachtDemo: true` (Zod + Keystatic).
   - `true` → демо-яхти показуються, на кожному фото маленька плашка «Illustration» (Body S, фон `rgb(14 14 14 / .6)`, padding 4 / 8, радіус 2, лівий верхній кут).
   - `false` → демо-яхти не потрапляють на сторінку. Якщо справжніх яхт немає — блок «Yachts disponibles» показує лише «Off-market».
   - Під час збірки з `PUBLIC_NOINDEX` ≠ `true` і `yachtDemo: true` — попередження «Демо-яхти на живому сайті!» (`LC_STRICT=1` — збірка падає).
4. **Продавець**: `settings.json` → `yachtPartner: { name: "", logo: "", url: "", about: {fr,en,it}, legal: "" }`.
   - `name` порожній → у текстах замість «[Société]» пишемо «mon partenaire» / «my partner» / «il mio partner»; секція «Le vendeur» і логотипи сховані;
     попередження під час збірки.
   - Пошта для заявок — `settings.emails.yachts` (додай поруч із `contact` / `press` / `partnerships`).

## B · 01 Hero

- Фото на весь блок (`hero.jpg`, `object-fit: cover`, `loading="eager"`, `fetchpriority="high"`). Висота: desktop `min(100svh, max(45rem, 52.8vw))`
  (1440 → 760 як у Figma), mobile `max(100svh, 40rem)`.
- **Затемнення — двома шарами градієнта поверх фото, під текстом** (`::before` на обгортці фото, `z-index` нижче тексту), колір `--color-bg` (#0E0E0E):
  - desktop, згори вниз: 0 % → 35 %, 25 % → 0, 50 % → 25 %, 78 % → 80 %, 100 % → 95 %;
  - desktop, зліва направо: 0 % → 70 %, 60 % → 0;
  - mobile (лише згори вниз): 0 % → 40 %, 18 % → 0, 30 % → 15 %, 43 % → 75 %, 55 % → 92 %, 100 % → 97 %.
    Це дослівно як у Figma — текст має бути контрастним на будь-якому фото.
- Вміст притиснутий донизу (padding 40 / 80 / 80 / 80; mobile 20 / 16 / 32 / 16). Desktop — рядок: текст (макс. 760) ліворуч, блок «Partenaire» праворуч, обидва по нижньому краю.
- Текст, проміжок 24 (mobile 16): eyebrow «Yachts à vendre» (червоний) → **H1** «Du premier contact à la signature» (52 → 32) →
  «Je représente [Société] pour la vente de yachts. Je vous accompagne à chaque étape : visite, essai en mer, négociation, signature.» (18 → 16; на mobile — лише перше речення + «Je vous accompagne à chaque étape.») →
  кнопки **Voir les yachts** (Primary → `#disponibles`) + **Demander des informations** (Outline → `#demande`); mobile — стовпчиком на всю ширину.
- «Partenaire»: «En partenariat avec» (eyebrow, secondary) + логотип 180 × 56 (mobile — в рядок, 120 × 40). Без логотипа — блок схований.

## C · 02 Comment ça se passe + 04 Pourquoi passer par moi

- **02** (фон `--color-bg`): eyebrow → H2 «Quatre étapes, un seul interlocuteur» (48 → 30), 4 кроки в ряд (проміжок 24): лінія зверху, padding-top 24, проміжок 16:
  номер «01» (28, `--color-red-text`) → назва (18) → текст Body S. Тексти з Figma. Mobile: стовпчиком, рядок «номер (18) + назва й текст», padding 16 / 0, лінія між кроками.
  Той самий компонент, що «Méthode» на Partenariats (завдання 23) — **не дублювати**, винеси в `ui/Steps.astro`, якщо ще не винесено.
- **04** (фон `--color-bg`): H2 «Quelqu’un qui connaît les bateaux, et vous», 3 пункти в ряд (проміжок 40): назва H3 28 → текст Body M.
  Mobile: назва 18, коротші тексти з Figma mobile («Je visite les yachts que je propose.» тощо), проміжок 24.

## D · 03 Yachts disponibles (`id="disponibles"`, фон `--color-bg-alt`)

- Заголовок-рядок: ліворуч eyebrow «Disponibles» + H2 «Yachts à vendre»; праворуч фільтри-чипи **Tous** · Moins de 30 m · 30 – 50 m · Plus de 50 m
  (Chip / Filter, радіо-група, як `ChipGroup`). Mobile — чипи під заголовком, **горизонтальна прокрутка** (без переносу), без скролбару.
  Фільтр ховає картки без перезавантаження; вибраний фільтр — у адресі `?taille=30-50` (`replaceState`). Порожній результат — «Aucun yacht dans cette taille pour le moment. Demandez l’off-market.» + посилання на «Off-market».
- **À la une** (яхта з `featured: true`; ховається, якщо фільтр її виключає): картка на всю ширину 1280 × 620 (mobile 358 × 420), радіус 4, фото на весь фон
  - **градієнт знизу** (0 % → 0, 45 % → 0, 75 % → 70 %, 100 % → 92 %, колір `--color-bg`). Вміст знизу, padding 40 / 48 (mobile 16), рядок:
  * ліворуч: eyebrow «À la une» → назва H2 48 (mobile 28) → specs у рядок (проміжок 32): підпис 12 (eyebrow, secondary) + значення 18 — Longueur «45 m», Année, Cabines, Prix «Sur demande»;
  * праворуч: **Découvrir le yacht** (Primary). Mobile — specs 2 × 2, кнопка на всю ширину під ними.
- **Картки** (`Card / Yacht`, сітка 3 колонки, проміжок 40; 768–1023 — 2; mobile — 1, проміжок 40):
  фото 400 × 280 (`aspect-ratio: 10 / 7`, радіус 4, зум при наведенні — `zoom-card`) → назва H3 28 → specs (лінії зверху і знизу, padding 14 / 0, 3 колонки: Longueur / Année / Cabines) →
  рядок: «Prix sur demande» (Body S, secondary) ліворуч + **Voir le yacht** (Link Accent) праворуч. Уся картка клікабельна (одне посилання, без вкладених).
- **Куди ведуть кнопки**: сторінки «Fiche yacht» ще немає → «Découvrir le yacht» / «Voir le yacht» ведуть на форму `#demande` з вибраною яхтою (`?yacht=aurora#demande`).
  Коли зʼявиться Fiche yacht — поміняти в одному місці (`yachtHref()`).
- **Off-market** (картка `--color-card`, радіус 4, padding 48; mobile 24): ліворуч eyebrow «Off-market» → «Certains yachts ne sont pas publiés» (28) →
  «Les propriétaires préfèrent souvent la discrétion. Dites-moi ce que vous cherchez, je vous présente ce qui n’est pas en ligne.» (16; mobile 14);
  праворуч **Demander l’accès** (Outline → `#demande` з темою off-market). Mobile — кнопка на всю ширину під текстом.

## E · 05 Le vendeur (фон `--color-bg-alt`)

- Рядок, проміжок 64, по центру по висоті: логотип 240 × 96 (mobile 160 × 64, над текстом) + текст (проміжок 12):
  eyebrow «Le vendeur» → назва H3 28 → «about» (Body M) → юридичні дані (Body S, secondary: raison sociale · адреса · номер реєстрації) →
  Link Accent «Site de {name}» (нова вкладка, `rel="noopener"`).
- Секція показується лише коли `yachtPartner.name` заповнений.

## F · 06 Demande (`id="demande"`)

- Desktop: ліворуч текст 440 (eyebrow «Demande» → H2 «Parlons de votre projet» → «Je vous réponds personnellement. Toutes les informations restent confidentielles.»), праворуч форма, проміжок 96.
- Поля (компоненти із завдання 21), по 2 в рядку на desktop, стовпчиком на mobile (на mobile ті самі поля, включно з «Pays»):

| поле                  | тип                                                                                                                   | обовʼязкове |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- |
| Nom                   | text, `autocomplete="name"`                                                                                           | так         |
| E-mail                | email                                                                                                                 | так         |
| Téléphone (optionnel) | tel, `autocomplete="tel"`, placeholder «+33 …»                                                                        | ні          |
| Pays                  | text, `autocomplete="country-name"`, placeholder «France»                                                             | ні          |
| Taille recherchée     | select: Choisir · Moins de 30 m · 30 – 50 m · Plus de 50 m · Je ne sais pas encore                                    | ні          |
| Budget                | select: Choisir · Moins de 5 M€ · 5 – 15 M€ · 15 – 40 M€ · Plus de 40 M€ · Je préfère en parler                       | ні          |
| Message               | textarea, placeholder «Ce que vous cherchez, vos dates, vos questions…»                                               | так         |
| Consentement          | «J’accepte que mes informations soient transmises à [Société] pour traiter ma demande. Politique de confidentialité.» | так         |

⚠️ Діапазони бюджету — пропозиція, узгодити з Luigi (список у даних сторінки, Keystatic).

- Приховане поле `yacht` (з `?yacht=…`) і `topic` (`off-market`). Коли вибрана яхта — над формою рядок «Yacht : Aurora · 45 m» + «Changer» (прибирає вибір).
  `?taille=…` з фільтра → підставляється в «Taille recherchée».
- Кнопка **Envoyer la demande** (Primary; mobile — на всю ширину). Успіх → `FormThanks`: «Merci, c’est envoyé.» /
  «Je vous rappelle personnellement pour parler de votre projet. Vos informations ont été transmises à [Société].» / Link Accent «Voir les autres yachts» (→ `#disponibles`).

## SEO, тексти

- `<title>` «Yachts à vendre — Luigi Contessi»; description «Yachts à vendre avec Luigi Contessi : visite, essai en mer, off-market. Un seul interlocuteur du premier contact à la signature.»
- JSON-LD — не додаємо, поки немає справжніх яхт.
- Тексти — `src/content/pages/{fr,en,it}/yachts.json` (Zod + Keystatic), EN / IT — переклад тим самим простим стилем (EN «Yachts for sale», IT «Yacht in vendita»).

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920: як у Figma; текст hero читається поверх фото (і на hero.jpg, і якщо тимчасово підставити світле фото).
- Фільтри: кожен показує правильні яхти; «À la une» ховається, коли не підходить; `?taille=` працює після перезавантаження.
- «Voir le yacht» → форма з рядком «Yacht : …»; «Demander l’accès» → тема off-market.
- `yachtDemo: false` → демо-яхт немає, видно Off-market; `yachtPartner.name` порожній → немає «[Société]» ніде на сторінці.
- Немає помилок CSP, `npm run build` зелений.
