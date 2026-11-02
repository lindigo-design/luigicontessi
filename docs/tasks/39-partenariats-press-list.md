# Завдання 39 · Partenariats → «Dans la presse»: показати список статей

Прочитай CLAUDE.md. Після кроку `npm run format` + `npm run build`, короткий звіт і стоп.

Figma: Partenariats desktop «06 Presse» `47:590` — ліворуч список «Dans la presse» (3 рядки), праворуч картка Media kit.
Зараз на сайті лівої частини **немає**: статті беруться з `home.json → press.items`, а там поки заглушки «[Titre de l’article]» → сторінка їх відфільтровує
(`partenariats.astro`, regex `placeholder`) → лишається одна картка Media kit, притиснута ліворуч.

## A · Перегляд — як у Figma

Як Audience, кейси і «Le vendeur» (функція `isPreview()`):

- `partenariats.astro`: у перегляді **не відфільтровувати** заглушки — передати 3 перші пункти `press.items` як є.
- Рядок (Figma `47:596`): лінія зверху `--color-border`, padding 20 / 0, рядок із проміжком 24, по центру по висоті:
  1. **логотип медіа** 120 × 40 — нове необовʼязкове поле `press.items[].logo` (image). Немає файлу → у перегляді плашка `--color-image`, радіус 4, напис «LOGO MÉDIA» (eyebrow, `--color-text-2`, `aria-hidden`); на живому сайті — без плашки;
  2. текст: назва (Text/Title 18) → «[Média] · [date]» (Body S, secondary) — з `meta`;
  3. праворуч Link Accent **«Lire»** (коротко, як у Figma; ключ `press.read` у `ui/*.json`: Lire / Read / Leggi) → посилання статті (поле `url`, поки немає — заглушка `aria-disabled`, «Lien bientôt disponible»).
- Mobile (Figma `48:569`): без логотипа, текст + «Lire» в рядок, padding 14 / 0.

## B · Живий сайт без статей — не «висяча» картка

Коли статей немає (живий сайт, заглушки відфільтровані), зараз Media kit стоїть одна ліворуч шириною 440 і порожнеча праворуч.
`presskit--solo` на desktop: картка — **на всю ширину контейнера в горизонтальному форматі**: прев'ю ліворуч (360 × 240), праворуч заголовок, текст і кнопка,
проміжок 40, по центру по висоті. Mobile — як зараз.

## C · Заголовок картки

«Media kit [année]» у перегляді, коли `settings.mediaKit.year` порожній (як у Figma); на живому — просто «Media kit». Те саме для «PDF, [X] pages.».

## Перевірка

- `npm run dev` / GitHub Pages: ліворуч 3 рядки «[Titre de l’article] · LOGO MÉDIA · Lire», праворуч Media kit — як у Figma.
- Збірка без `PUBLIC_NOINDEX`: статей немає → Media kit горизонтальна на всю ширину, без порожнечі.
- Додати одну справжню статтю в `home.json` → вона з'являється і на живому сайті.
- `npm run build` зелений.
