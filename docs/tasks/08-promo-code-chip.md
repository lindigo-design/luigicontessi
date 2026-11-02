# Завдання 08 · Промо-смуга: код LUIGI10 виділений «купоном»

Прочитай CLAUDE.md. Один етап: зроби лише це, потім звіт і стоп.
Файли: `src/components/sections/PromoBar.astro`, `src/content/pages/<fr|en|it>/home.json` (`promo`),
`src/content.config.ts`, `keystatic.config.ts`. Figma: Home → «00 Promo bar» (desktop 3:3, mobile 6:186).

## Проблема

Зараз уся смуга — один рядок тексту одного кольору: «Code LUIGI10 — 10% off your first order».
Код губиться серед слів, хоча це головне, що людина має запамʼятати чи скопіювати.

## Як у Figma тепер

```
Code  ┌╌╌╌╌╌╌╌╌╌┐  −10 % sur la première commande   COPIER
      ╎ LUIGI10 ╎
      └╌╌╌╌╌╌╌╌╌┘
```

- «Code» і умова — Text/Body S (14), колір `--color-text-2` (сірий).
- Сам код — «купон»: Label/Button (Manrope 600, 13 px, `letter-spacing: .12em`, великі літери),
  колір `--color-text`, рамка **1 px пунктиром** `--color-text`, відступи 5 / 10 px, радіус `--radius-btn` (2 px).
  Пунктир = звична ознака промокоду, і він не сперечається з червоним (червоний у нас — дія).
- Проміжок між частинами 10 px; «Copier» — Button Link **без кола-стрілки** (це не перехід, а дія на місці).
- Висота смуги підлаштовується під вміст (у Figma ≈ 52 px).
- **Mobile (< 768):** слово «Code» приховане (`visually-hidden`, для читалок лишається),
  умова коротша: «−10 % sur la 1re commande». Усе в один рядок, без переносу.

## Кроки

1. **Дані** — розділити текст на частини (зараз код «зашитий» у рядок):
   ```jsonc
   "promo": {
     "label": "Code",                                   // EN «Code», IT «Codice»
     "code": "LUIGI10",
     "offer": "−10 % sur la première commande",         // EN «10% off your first order», IT «−10% sul primo ordine»
     "offerShort": "−10 % sur la 1re commande"           // EN «10% off 1st order», IT «−10% sul 1° ordine»
   }
   ```
   Оновити Zod-схему і поля Keystatic («Слово перед кодом», «Код», «Умова», «Умова коротко (mobile)»).
   Старе поле `text` прибрати.
2. **Розмітка:**
   ```astro
   <aside class="promo">
     <p class="promo__offer">
       <span class="promo__label">{data.label}</span>
       <button
         class="promo__code"
         type="button"
         data-copy={data.code}
         data-copied={t('ui.copied', lang)}
       >
         <span class="btn__label">{data.code}</span>
       </button>
       <span class="promo__long">{data.offer}</span>
       <span class="promo__short" aria-hidden="true">
         {data.offerShort}
       </span>
     </p>
     <Button variant="link" data-copy="…">
       {t('ui.copy', lang)}
     </Button>
   </aside>
   ```
   - Купон теж копіює код при кліку (той самий `data-copy` → скрипт `copy.ts` уже вміє): на телефоні це
     найзручніше місце, куди тицьнути. Після копіювання в купоні на 2 с — «Copié», як на кнопці.
   - Підказка при наведенні: `title={t('ui.copyCode', lang)}`.
3. **Стилі** — лише через токени; dashed-рамку задати `border: 1px dashed var(--color-text)`.
   Hover на купоні: фон `rgb(237 234 228 / .08)` (додай токен `--color-hover-tint`), без руху.
   Mobile: `.promo__label` → `visually-hidden`, `.promo__long` → `display:none`, `.promo__short` → показати;
   desktop — навпаки. `white-space: nowrap` на купоні.

## Що НЕ чіпати

- Логіку копіювання в `copy.ts` (лише переконайся, що працює і для купона).
- Інші секції.

## Перевірка

1. `npm run format`, `npm run build`.
2. Desktop 1440 і mobile 390, три мови: код одразу кидається в очі, смуга в один рядок, нічого не переноситься.
3. Клік по купону і по «Copier» → код у буфері, текст на 2 с змінюється на «Copié / Copied / Copiato».
4. Tab: купон і «Copier» отримують видимий фокус.
5. Звіт + список файлів. Стоп.
