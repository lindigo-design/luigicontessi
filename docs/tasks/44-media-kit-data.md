# 44 · Дані з media kit Luigi (2026) → сайт

Прочитай CLAUDE.md. Лише контент (JSON) + одна зміна схеми. Після кроку `npm run format` + `npm run build`, короткий звіт і стоп.

Джерело: media kit Luigi (Canva, серпень 2026). Файли вже в проєкті:

- `public/media-kit/media-kit-luigi-contessi-2026.pdf` — стиснута копія (4,2 МБ, 6 сторінок);
- `src/assets/img/logos/*.png` — 18 логотипів, вирізані з media kit: світлі (#EFEFEF) на прозорому фоні, обрізані по краях.

Тексти — FR / EN / IT. Французькі нерозривні пробіли перед «: ; ? ! %», апостроф `’`. Нічого понад написане тут не вигадувати.

---

## 1. Цифри — `src/content/site/settings.json → stats`

- `followers`: `count: 1.8`, value `1,8 M+` / `1.8M+` / `1,8 M+` (у media kit: «1.8 MILLIONS+»).
- Інші показники (`engagement` 4,8 %, `impressions` 50 M+, `collaborations` 500+, `countries` 30+) у media kit **не підтверджені** — не чіпати,
  але в звіті нагадати, що їх треба звірити з Luigi.

## 2. Media kit для завантаження — `settings.json → mediaKit`

`{ "file": "media-kit-luigi-contessi-2026.pdf", "year": "2026", "pages": 6 }`.
Кнопки «Télécharger le media kit» (Partenariats Intro і Presse / Media kit) мають стати активними; «Media kit 2026», «PDF, 6 pages».

## 3. Partenariats → Audience — `pages/{fr,en,it}/partenariats.json → audience`

4 рядки, як у Figma. Відсотки цілі (округлено з media kit).

| countries | FR     | EN          | IT       | percent |
| --------- | ------ | ----------- | -------- | ------- |
| 1         | Italie | Italy       | Italia   | 35      |
| 2         | France | France      | Francia  | 34      |
| 3         | Suisse | Switzerland | Svizzera | 6       |
| 4         | Autres | Other       | Altri    | 25      |

| ages | label (усі мови) | percent |
| ---- | ---------------- | ------- |
| 1    | 18–24            | 35      |
| 2    | 25–34            | 29      |
| 3    | 35–44            | 22      |
| 4    | 45+              | 10      |

(13–17 — 3 %, не показуємо; тому сума 96 — це нормально.)

- `date`: «août 2026» / «August 2026» / «agosto 2026». `source` не змінювати.
- Після цього заглушки «[X] %» / «[date]» у перегляді зникають, на живому сайті блок Pays / Âge з’являється.

## 4. Partenariats → Références — логотипи

- Схема `content.config.ts → referencesItems.logos`: `.max(12)` → **`.max(20)`** (задача 30 дозволяє до 20).
- `pages/{fr,en,it}/partenariats.json → referencesItems.logos` (однаково в усіх мовах), шлях `../../../assets/img/logos/<file>.png`, у такому порядку:

Lamborghini `lamborghini` · Maserati `maserati` · Porsche `porsche` · McLaren `mclaren` · GAC Group `gac-group` · Shokz `shokz` ·
Rokid `rokid` · Prime Video `prime-video` · Waldorf Astoria `waldorf-astoria` · Hilton `hilton` · Sofitel `sofitel` ·
Rocco Forte Hotels `rocco-forte-hotels` · Relais & Châteaux `relais-chateaux` · Sunreef Yachts `sunreef-yachts` ·
Frédéric Jouvenot `frederic-jouvenot` · Golden Concept `golden-concept` · Microlino `microlino` · Nike Golf `nike-golf`

- Логотипи вже світлі: `filter: grayscale(1) brightness(1.6)` не шкодить; `opacity .6`, hover 1 — як у задачі 30.
  Різні пропорції (Porsche/McLaren — довгі й низькі, Maserati/Relais & Châteaux — високі): вписувати у висоту 32 (mobile 24),
  але ширину обмежити `max-width: 9rem`, щоб довгі не домінували. Перевір візуально, звіт — зі скриншотом стрічки.
- Якщо задача 30 (стрічка) ще не зроблена — зробити її зараз за тим описом, із цими файлами.

## 5. À propos → Intro — `pages/{fr,en,it}/a-propos.json`

`jobTitle`: «Influenceur luxe et voyage» / «Luxury and travel influencer» / «Influencer di lusso e viaggi».

`intro.lead`:

- FR: «Italien, installé à Paris. Ancien pilote, entrepreneur, influenceur luxe et voyage.»
- EN: «Italian, based in Paris. Former pilot, entrepreneur, luxury and travel influencer.»
- IT: «Italiano, vivo a Parigi. Ex pilota, imprenditore, influencer di lusso e viaggi.»

`intro.body`:

- FR: «J’ai fondé et je dirige une compagnie de jets privés : le voyage de luxe, je le vis de l’intérieur. Je joue aussi dans la saison 2 de la série Creatives, sur Amazon Prime Video, et je suis ambassadeur mondial de Shokz et Rokid. Sur Instagram, plus de 1,8 million de personnes suivent ce que j’essaie : voitures, montres, hôtels, destinations.»
- EN: «I founded and run a private jet company, so I live luxury travel from the inside. I also co-star in season 2 of the series Creatives, on Amazon Prime Video, and I am Global Brand Ambassador for Shokz and Rokid. On Instagram, more than 1.8 million people follow what I try: cars, watches, hotels, destinations.»
- IT: «Ho fondato e dirigo una compagnia di jet privati: il viaggio di lusso lo vivo dall’interno. Sono anche nel cast della seconda stagione della serie Creatives, su Amazon Prime Video, e sono Global Brand Ambassador di Shokz e Rokid. Su Instagram oltre 1,8 milioni di persone seguono ciò che provo: auto, orologi, hotel, destinazioni.»

## 6. À propos → Parcours, пункт 2024 — `parcours.items[3]`

- FR: «La reconnaissance» — «Élu Best Italian Influencer Luxury Lifestyle 2024/25. Ambassadeur du tourisme de la Chine et de l’Égypte.»
- EN: «Recognition» — «Named Best Italian Influencer, Luxury Lifestyle 2024/25. Tourism ambassador for China and Egypt.»
- IT: «Il riconoscimento» — «Eletto Best Italian Influencer Luxury Lifestyle 2024/25. Ambasciatore del turismo di Cina ed Egitto.»

## 7. Головна → «À propos» — `pages/{fr,en,it}/home.json → about.body`

- FR: «Italien, installé à Paris. Ancien pilote et fondateur d’une compagnie de jets privés. Je partage ce que j’essaie moi-même : des voitures, des montres, des lieux. Quand une marque me plaît, je le dis. Quand non, je n’en parle pas.»
- EN: «Italian, based in Paris. Former pilot and founder of a private jet company. I share what I try myself: cars, watches, places. When I like a brand, I say so. When I don’t, I don’t talk about it.»
- IT: «Italiano, vivo a Parigi. Ex pilota e fondatore di una compagnia di jet privati. Condivido ciò che provo io stesso: auto, orologi, luoghi. Quando un marchio mi piace, lo dico. Quando no, non ne parlo.»

## 8. Пошта — `settings.json → emails`

`contact`, `press`, `partnerships` → `luigi.contessi@gmail.com` (адреса з media kit). `yachts` — не чіпати (буде пошта компанії).

---

## Не робити (чекає підтвердження Luigi)

- Телефон із media kit на сайт **не** додавати.
- Кейси GAC / Golden Concept (тип, назва, результати) — даних у media kit немає.
- Presse: «Creatives» (Prime Video) — серіал, а не стаття; картку преси поки не заповнювати.
- Рейтинги 2024 (5ᵉ luxe, 9ᵉ voyage, 10ᵉ mode в Італії, джерело influenceritalia.it) і стать аудиторії (69 % чоловіки) — можливі доповнення, поки не додавати.

## Перевірка

- Partenariats: Audience з реальними відсотками й датою; стрічка з 18 логотипів; обидві кнопки media kit завантажують PDF.
- À propos: новий текст Intro, 2024 — премія. Головна: новий текст «À propos», 1,8 M+.
- Жодної заглушки «[…]» у цих блоках; FR / EN / IT; `npm run build` зелений.
