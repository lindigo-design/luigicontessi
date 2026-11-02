# Завдання 42 · Сторінка «À propos»

Прочитай CLAUDE.md. Кроки **A → E**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: **À propos** — desktop `50:380`, mobile `50:523`.
Адреса: `/{lang}/a-propos/` (path є в `nav.ts`; додай у `builtPages` — тоді «Mon histoire» на головній, меню і футер ведуть сюди).
Тексти — `src/content/pages/{fr,en,it}/a-propos.json` (Zod + Keystatic). EN / IT — переклад тим самим простим стилем.

Фото вже в проєкті, `src/assets/img/about/`: `portrait.jpg` (1600 × 2400, портрет Luigi), `citation.jpg` (2560 × 1429, фон цитати).

**Правило заглушок** (як скрізь): `[Année]`, `[Ce qui s’est passé]`, `[Histoire du tatouage…]` — лише в перегляді (`isPreview()`); на живому сайті порожні блоки сховані + попередження збірки.

---

## A · 01 Intro (фон `--color-bg`)

- Desktop: рядок, проміжок 96, padding 80 / 80 / 120. Ліворуч **портрет** 560 × 700 (`aspect-ratio: 4 / 5`, радіус 4, `object-position: 50% 30%`),
  росте з екраном як About на головній (≈ 44 % контейнера). Праворуч текст по центру висоти (макс. 624), проміжок 28:
  eyebrow «À propos» → **H1** «Luigi Contessi» (52 → 32) →
  «Entrepreneur, créateur de contenu, spécialiste des jets d’affaires et des yachts. Je partage ce que j’essaie moi-même : des voitures, des montres, des lieux.» (Body L 18) →
  «J’ai travaillé avec plus de 500 marques, dans plus de 30 pays : événements à Monaco, voyages en jet privé, campagnes de mode. Mon rôle est simple : raconter une marque de façon vraie, pour qu’on ait envie de la découvrir.» (Body M, secondary) →
  **цифри** в рядок (проміжок 56): 1,7 M+ abonnés · 500+ collaborations · 30+ pays — `StatValue` 64 + count-up, **дані з `settings.json → stats`** (ті самі, що на головній, не дублювати).
- Mobile: фото зверху на всю ширину (358 × 448), далі текст, цифри — 3 в ряд, 40 px; padding 32 / 16 / 56.
- `<Image widths={[480, 800, 1200, 1600]} sizes="(min-width: 1024px) 44vw, 100vw" loading="eager" fetchpriority="high">`.

## B · 02 Parcours (фон `--color-bg-alt`)

- eyebrow «Parcours» → H2 «Quelques dates» (48 → 30) → **таймлайн**: 4 пункти в ряд (проміжок 24; mobile — стовпчиком, проміжок 0),
  кожен: лінія зверху `--color-border`, padding-top 24, проміжок 8: рік (H3 28, `--color-red-text`) → назва (Text/Title 18) → опис (Body S, secondary).
- Дані — масив `timeline[]`: `{ year, title, text }` (fr/en/it). З Figma: «Premiers pas», «Aviation d’affaires», «La communauté grandit», «[Prix / distinction — à confirmer]».
  Роки й описи — **не вигадувати**, поки Luigi не надішле: у перегляді «[Année]» / «[Ce qui s’est passé]», на живому — пункт без року схований, а без жодного пункту — уся секція.
- Анімація при прокрутці: лінії зверху «промальовуються» зліва направо по черзі (300 ms, затримка 100 ms), зменшений рух — одразу.

## C · 03 Le roi de cœur (фон `--color-bg`)

Історія символу — тут звʼязок із логотипом і loader-ом (завдання 41).

- Desktop: рядок, проміжок 96: ліворуч картка 360 × 480 (`--color-card`, рамка 1 px `--color-border`, радіус 8) з **монограмою K♥** по центру
  (SVG `corner-k-tall.svg`, висота 247, `--color-red`); праворуч текст (макс. 824, по центру висоти), проміжок 20:
  eyebrow «Le roi de cœur» → H2 «Le symbole que je porte» → текст Body L.
- Текст — **лише від Luigi** (історія тату, що означають «roi de cœur» і «K», чому він поставив їх на колекцію). Поки немає — заглушка з Figma у перегляді, на живому сайті секція схована.
- При появі на екрані монограма промальовується так само, як у loader-і (K лінією → заповнення → серце, один удар). Перевикористай код анімації з `loader.ts` (винеси в спільну функцію `drawMonogram(svg)`).
- Mobile: картка зверху 358 × 300 (монограма 180), далі текст.

## D · 04 Mes règles + 05 Citation

**Mes règles** (фон `--color-bg-alt`): eyebrow → H2 «Ce que vous pouvez attendre de moi» → 3 картки в ряд (проміжок 24; mobile — стовпчиком, 12),
картка `--color-card`, радіус 4, padding 32 (mobile 24), проміжок 12: номер «01» (18, `--color-red-text`) → назва H3 28 → текст Body S secondary:
01 «Je teste avant de parler» — «Je ne recommande rien que je n’ai pas utilisé.»;
02 «Je dis aussi ce qui ne va pas» — «Un avis sans défaut n’est pas un avis.»;
03 «Je signale chaque partenariat» — «Quand une marque me paie, c’est écrit.».
Картки однакової висоти. Hover — як текстові картки (світло за курсором, завдання 13). Не посилання.

**Citation**: фото `citation.jpg` на всю ширину (правило CLAUDE.md для повноширинних фото; висота 572 при 1440 → `min(100svh, max(35.75rem, 39.7vw))`),
поверх — **затемнення градієнтом** (не скло) і картка по центру 880 (`--color-bg`, радіус 4, padding 64; mobile 358, padding 32):
цитата Desktop/Quote 36 (mobile 24) «« Chaque contenu doit émouvoir, inspirer, laisser une trace. »» → «— Luigi Contessi» (eyebrow).
⚠️ Цитату з Figma підтвердити з Luigi (це його слова? якщо ні — замінити його реальною фразою).

## E · 06 Travailler ensemble + SEO

- Рядок (padding 96 / 80; mobile 56 / 16, стовпчиком): ліворуч H2 «Vous êtes une marque ?» + «Voyons ce qu’on peut faire ensemble.»,
  праворуч кнопки: **Partenariats** (Primary → `partenariats`) + **Me suivre sur Instagram** (Link Accent → `settings.instagramUrl`, нова вкладка).
- `<title>` «À propos — Luigi Contessi»; description: «Luigi Contessi : entrepreneur et créateur de contenu. Voitures, montres, yachts, voyages — ce qu’il essaie lui-même.»
- JSON-LD `Person` (name, url, image = portrait, sameAs = соцмережі з settings, jobTitle «Créateur de contenu»).

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920 — як у Figma; портрет і цитата не обрізають обличчя / текст.
- Живий сайт без даних: немає жодного «[…]»; Parcours і «Le roi de cœur» сховані, сторінка не ламається.
- Цифри рахуються при прокрутці; монограма промальовується; зменшений рух — усе статично.
- Немає помилок CSP, `npm run build` зелений.
