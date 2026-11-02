# Завдання 22 · Сторінка «Panier» (кошик)

Прочитай CLAUDE.md. Кроки **A → D**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Panier** — desktop `41:379`, mobile `42:408`, порожній кошик `41:547` / `42:538`, нижня панель mobile `42:532`.
Адреса: `/{lang}/panier/` (однакова для всіх мов, як інші сторінки).

## Важливо: магазин вимкнений

- Сторінка будується **лише коли `features.shop: true`**. Зараз `false` → сторінки немає, у шапці немає «Panier (0)» (вже так).
- Для роботи тимчасово перемкни `shop: true`, у кінці поверни `false`.
- Справжні оплата, ціни, залишки — **Shopify, окремий етап**. Зараз робимо інтерфейс і локальний кошик у браузері,
  щоб потім замінити лише «джерело даних». Ніде не вигадуємо ціни: `price: null` → «[Prix] €».

## A · Кошик у браузері (`src/scripts/cart.ts`)

- Сховище — `localStorage['lc-cart'] = { v: 1, items: [{ slug, color, size, qty }] }` (try/catch).
- Функції: `getCart()`, `add(item)`, `setQty(slug, color, size, qty)` (1…10), `remove(...)`, `count()`, подія `lc:cart` після кожної зміни.
- Підключи кнопку «Ajouter au panier» на сторінці товару (`data-action="add-to-cart"` із завдання 07): додає вибраний колір і розмір;
  без розміру — підказка «Choisissez une taille», як зараз. Після додавання — короткий текст під кнопкою «Ajouté au panier» + посилання «Voir le panier».
- Лічильник у шапці «Panier (2)» оновлюється з `count()` на всіх сторінках.
- Дані товарів (назва, кольори, фото, ціна) — з колекції `products`: на сторінку кошика вбудуй **легкий JSON** лише з потрібних полів
  (`<script type="application/json" id="products-data">` — дозволено CSP, бо не виконується) + розміри фото, згенеровані `getImage()`.
  Кошик малюється скриптом із `<template>`.
  Товар, якого вже немає в колекції, — тихо прибрати з кошика.

## B · Сторінка — desktop (Figma «01 Panier»)

- padding 80 / 120, проміжок 48. Заголовок: H1 «Panier» (52 → mobile 32) + поруч «2 articles» (Body M, secondary), вирівняні по базовій лінії, проміжок 16.
- Рядок: **Articles** (ліворуч, `minmax(0, 1fr)`) + **Récapitulatif** 440 px праворуч, проміжок 80.
- **Рядок товару**: лінія знизу `--color-border`, padding 28 / 0, проміжок 24:
  - фото 128 × 160 (радіус 4) — посилання на товар (з `?couleur=`);
  - справа: назва + колір (Text/Title 18, «Veste Contessi Navy») і ціна праворуч; під ними «Couleur : Navy · Taille : M» (Body S, secondary);
  - внизу: **кількість** (— / 1 / +, кнопки 44 × 44, рамка `--color-border`, радіус 2; `aria-label` «Diminuer / Augmenter la quantité», число — `aria-live="polite"`)
    і «Retirer» (Body S, підкреслене при наведенні) праворуч.
  - Ціна рядка = ціна × кількість; поки ціни немає — «[Prix] €».
- Під списком — Button Link «Continuer mes achats» → `collection`.
- **Récapitulatif** — картка `--color-card`, радіус 4, padding 32, проміжок 20, `position: sticky; top: calc(var(--header-h) + 32px)`:
  1. «Récapitulatif» (H3 28);
  2. рядки «Sous-total» / «Réduction» / «Livraison» — Body S, назва ліворуч secondary, значення праворуч primary; «Livraison» → «Calculée à l’étape suivante»;
  3. **Code promo** (лінії зверху/знизу, padding 16 / 0):
     - поле + кнопка «Appliquer» (як у mobile Figma); введений код у верхньому регістрі;
     - застосований — плашка (рамка `--color-border`, padding 12 / 16): «✓ LUIGI10 −10 %» (код — шрифтом коду, як у CodeCard) + «Retirer»;
     - перевірка коду поки локальна: `settings.json` → `shopCodes: [{ code: "LUIGI10", percent: 10 }]` (Zod + Keystatic). TODO: Shopify discount.
     - невірний код → «Ce code n’existe pas ou a expiré.» під полем (`--color-red-text`);
     - код із адреси `?code=LUIGI10` (з промо-бару) → вставляється сам.
  4. **Total** (лінія зверху, padding-top 16): «Total» (18) + «TVA incluse» (Body S, secondary) ліворуч, сума H3 28 праворуч;
  5. кнопка **Passer au paiement** (Primary, на всю ширину). Поки — `aria-disabled`, клік → текст «Paiement bientôt disponible.» TODO Shopify Checkout;
  6. «Carte · Apple Pay · Google Pay · PayPal» (Body S, secondary, по центру);
  7. Réassurance (лінія зверху, padding-top 16, проміжок 8): «— Paiement sécurisé», «— Retours sous 14 jours», «— Livraison Europe et États-Unis».
     ⚠️ Ці умови — з макета; перед запуском узгодити з Luigi (вони мають збігатися з CGV).
- Нижче — «Complétez le look» (той самий компонент `CompleteLook`, що на сторінці товару), без товарів, які вже в кошику.

## C · Mobile < 1024 (Figma `42:408`, `42:532`)

- padding 32 / 16 / 48, проміжок 24. Рядок товару: фото 96 × 120, проміжок 16, у колонці: назва, «Navy · M», ціна, внизу кількість (кнопки 40 × 40) + «Retirer».
- Récapitulatif під товарами, не sticky, padding 20, порядок: Code promo → Sous-total → Livraison («Étape suivante») → Total. Réassurance — під карткою.
- **Нижня панель** (fixed, фон `--color-bg`, лінія зверху, padding 12 / 16 / 12 + `env(safe-area-inset-bottom)`): ліворуч «Total · 2 articles» (Body S) + сума (16),
  праворуч кнопка «Paiement» (Primary). Зʼявляється, коли кнопка «Passer au paiement» в картці не видно (IntersectionObserver); сторінці — нижній відступ на висоту панелі.
- «Complétez le look» — свайп-стрічка Compact, як на сторінці товару.

## D · Порожній кошик (Figma `41:547` / `42:538`)

- Замість списку і підсумку, по центру, padding 160 (mobile 96), проміжок 24 (16): eyebrow «Panier» → «Votre panier est vide» (48 → 30) →
  «Jetez un œil à la collection, ou à mes coups de cœur chez les marques partenaires.» (mobile — коротко: «…ou à mes coups de cœur.») →
  кнопки **Voir la collection** (Primary) + **Coups de cœur** (Outline); mobile — стовпчиком на всю ширину.
- Останній товар прибрали → одразу цей стан.
- Без JS — показуємо цей самий стан з текстом «Activez JavaScript pour voir votre panier.».

## Тексти, SEO

- `ui/*.json`, ключі `cart.*` — FR з Figma, EN / IT переклад (Cart / Carrello, Remove / Rimuovi, Promo code / Codice promo, Checkout / Pagamento…).
- `<title>` «Panier — Luigi Contessi», `noindex` (сторінка особиста, у пошуку не потрібна).

## Перевірка

- `shop: true`: додати Veste Contessi Navy M двічі → у кошику 1 рядок, кількість 2; інший розмір — окремий рядок.
- +/− (не менше 1, не більше 10), «Retirer», лічильник у шапці міняється одразу.
- LUIGI10 → плашка з кодом; «ABC» → помилка; `?code=LUIGI10` → вставлено.
- 390 / 768 / 1024 / 1440: як у Figma; на mobile нижня панель не закриває кнопку і футер.
- Перезавантаження сторінки — кошик на місці. `shop: false` → сторінки `/fr/panier/` немає в `dist/`.
- Немає помилок CSP, `npm run build` зелений. Наприкінці `shop` знову `false`.
