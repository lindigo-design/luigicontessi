# Завдання 09 · Hover кнопок: кожен тип має свій, відмінний від інших стан

Прочитай CLAUDE.md. Один етап: зроби лише це, потім звіт і стоп.
Файли: `src/components/ui/Button.astro`, `src/styles/tokens.css`.
Figma: Components & Tokens → **Button** — тепер дві властивості: `Type` (Primary / Outline / Link / Link Accent)
і `State` (Default / Hover).

## Що зараз не так (видно в секції Yachts)

- **Outline при наведенні** заливається світлим (`background: var(--color-text)`), тобто стає **точною копією
  Primary** у звичайному стані. Поруч дві однакові кнопки — незрозуміло, яка головна.
- **Primary при наведенні** міняє `#EDEAE4 → #FFFFFF` — різниця на око майже не видна, здається, що hover немає.

## Нові стани (з Figma)

| Тип             | Default                                                   | Hover                                                                                                                                     |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary**     | фон `--color-text` #EDEAE4, текст `--color-on-light`      | фон **`--color-primary-hover` #C9C5BD** (темнішає, «натискається»), текст той самий                                                       |
| **Outline**     | без фону, рамка 1 px `--color-text`, текст `--color-text` | фон **`--color-hover-tint` rgba(237,234,228,.08)** — ледь помітна підсвітка; рамка й текст **не змінюються**. Ніколи не заливати світлим. |
| **Link**        | текст `--color-text`                                      | текст `--color-text-2`                                                                                                                    |
| **Link Accent** | текст і коло червоні, коло — лише контур                  | коло **заливається** `--color-red-text`, стрілка всередині стає `--color-bg` (вже так — лишити)                                           |

Правило: hover робить кнопку **ближчою до її власного стилю**, а не перетворює на інший тип.

## Кроки

1. `tokens.css`:
   ```css
   --color-primary-hover: #c9c5bd; /* surface/primary-hover */
   --color-hover-tint: rgb(237 234 228 / 0.08); /* surface/hover-tint */
   ```
   (якщо `--color-hover-tint` вже додано в завданні 08 — не дублювати).
2. `Button.astro`:
   - `.btn--primary:hover { background: var(--color-primary-hover); }` — прибрати `#fff`;
   - `.btn--outline:hover { background: var(--color-hover-tint); }` — **прибрати** зміну кольору тексту на темний;
   - `.btn--link:hover { color: var(--color-text-2); }` замість `opacity: .7`;
   - ті самі правила і для `:focus-visible` (клавіатура бачить той самий стан) — плюс наш звичайний червоний контур фокусу;
   - `:active` (натиснуто): `transform: translateY(1px)` для Primary і Outline — легкий «клік»;
   - hover лише на пристроях з мишкою: обгорнути в `@media (hover: hover)`, щоб на телефоні кнопка не «залипала»
     у стані hover після дотику;
   - `prefers-reduced-motion` → без `transition` і без `translateY`.
3. Перевір усі місця, де є Outline поруч із Primary: hero (Découvrir le Journal / Voir la collection),
   Yachts (Voir les yachts / Demander des informations), Collection, Instagram, футер (S'inscrire), сторінка товару.

## Що НЕ чіпати

Розміри, відступи, шрифти кнопок; червоний колір Link Accent.

## Перевірка

1. `npm run format`, `npm run build`.
2. Yachts, desktop: наведення на «Demander des informations» — лише легка підсвітка фону, кнопка лишається контурною;
   на «Voir les yachts» — фон помітно темнішає. Дві кнопки ніколи не виглядають однаково.
3. Tab по кнопках — ті самі стани + червоний контур фокусу.
4. Mobile (touch): після натискання кнопка не лишається підсвіченою.
5. Звіт + список файлів. Стоп.
