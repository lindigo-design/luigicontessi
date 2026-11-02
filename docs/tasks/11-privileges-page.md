# Завдання 11 · Сторінка «Privilèges» (усі коди партнерів)

Прочитай CLAUDE.md. Роби **по кроках A → E**, після кожного: `npm run format` + `npm run build`,
короткий звіт і стоп, чекай «ок».

Figma: сторінка **Privilèges** — desktop `18:377`, mobile `19:550`.
Компоненти: Card / Code partenaire, Chip / Filter, Button (Type × State), FAQ / Item, Image Placeholder.
Адреса: `/fr/privileges/`, `/en/privileges/`, `/it/privileges/` (пункт меню «Privilèges» уже веде сюди).
Сторінка **не залежить** від `features.shop` — коди працюють на сайтах марок, тож вона потрібна з першого дня.

---

## Крок A · Дані кодів

Колекція `codes` (Zod у `content.config.ts` + Keystatic `collection` «Коди партнерів»).
Один файл = одна пропозиція: `src/content/codes/<id>.json`.

```jsonc
{
  "id": "chapeaux-10",
  "brand": "[Marque]", // назва марки, не перекладається
  "logo": "logos/marque.svg", // необовʼязково; без логотипа — сіра плашка «LOGO», як у Figma
  "category": "mode", // mode | tech | mobilite | beaute | voyages
  "offer": { "fr": "−10 % sur les chapeaux", "en": "10% off hats", "it": "−10% sui cappelli" },
  "conditions": { "fr": "…", "en": "…", "it": "…" }, // ≤ 140 знаків; на mobile — conditionsShort
  "conditionsShort": { "fr": "…", "en": "…", "it": "…" },
  "code": "CHAPEAU10",
  "url": "https://…", // сайт марки (лише https)
  "addedAt": "2026-11-01",
  "expiresAt": null, // або дата; після неї код зникає зі сторінки
  "featured": true, // лише ОДИН код може бути «À la une»
  "image": "featured/chapeaux.jpg", // фото для «À la une» (для інших — не потрібне)
}
```

- Валідація: `code` — великі літери/цифри, `url` — лише `https://`, `featured: true` — не більше одного
  (якщо два — збірка падає з зрозумілою помилкою).
- Заповни 10 кодів з Figma: À la une «−10 % sur les chapeaux / CHAPEAU10» + 9 карток сітки
  (LUIGI15, CONTESSI, LUIGI10, LUIGI12, CONTESSI80, LUIGI500, LUIGI20, LC10, LUIGIDRIVE) з їхніми текстами.
  Марки, посилання і дати — `[à compléter]` / `null`. **Нічого не вигадувати.**
- Категорії рознести так, щоб у кожному фільтрі було хоча б 1 код (позначити в звіті, що це тимчасово).
- Коди з `expiresAt` у минулому **не потрапляють** у збірку (а на клієнті ще раз перевіряємо дату —
  сайт статичний, тож код може «прострочитись» між збірками; такий код ховаємо скриптом).

## Крок B · Секція «01 Intro»

**Desktop** (відступи 96 / 80 / 64, проміжок 40):

- Рядок: зліва (800) eyebrow «Privilèges» → H1 «Mes codes chez les ⏎ marques partenaires» (Desktop/H1) →
  Body L «Des marques que j'utilise vraiment. Un code, une réduction, sur le site de la marque.»;
  справа (400) блок **«Transparence»**: лінія зліва 1 px `--color-border`, відступ 24, eyebrow + Body S
  «Ces liens et codes sont des partenariats. Je peux recevoir une commission. Votre prix ne change pas.»
  Це **обовʼязкова** позначка (закон Франції про інфлюенсерів 2023) — не ховати на жодній ширині.
- «Comment ça marche» — 3 кроки в ряд, кожен з лінією зверху: номер (Desktop/H3, secondary) +
  заголовок (Text/Title) + пояснення (Body S, secondary): 01 Copiez le code / 02 Ouvrez le site / 03 Collez au paiement.

**Mobile**: усе в стовпчик; кроки — список з лінією між пунктами, лише номер + заголовок
(«02 Ouvrez le site de la marque» — довший варіант з Figma), без пояснень. «Transparence» — під текстом, лінія зліва.

## Крок C · «02 À la une»

- Eyebrow «À la une» + велика картка `--color-card`, радіус 4:
  **desktop** — фото 600 × 440 зліва, справа контент (відступи 48 / 56, проміжок 24):
  рядок «логотип 140×44 — Partenariat»; H2 пропозиція; Body M умови; рядок коду
  (рамка 1 px, код Label/Button + кнопка Primary «Copier le code»); Link Accent «Voir la marque».
- **mobile** — фото на всю ширину картки, **358 × 283** (`aspect-ratio: 358 / 283`, оновлено в Figma), контент під ним
  (відступи 20, проміжок 16), заголовок Mobile/H2, умови — `conditionsShort`.
  Кнопка в рядку коду на mobile — коротка **«Copier»** (на desktop — «Copier le code»): так код і кнопка
  вміщаються в один рядок 318 px. Тексти — `t('ui.copy')` / `t('ui.copyCode')`, перемикання через CSS
  (два `<span>`, один `visually-hidden`), а не через JS.
- **Кадр фото** однаковий на desktop і mobile (з кадрування у Figma): `object-fit: cover; object-position: 50% 82%` —
  у кадрі Luigi з капелюхом від капелюха до пояса. Desktop-фото 600 × 440 (`aspect-ratio: 600 / 440`),
  висота = висоті контенту, але не менше 440 px.
- Якщо `featured` немає — секція не рендериться.

## Крок D · «03 Tous les codes»

- Фон `--color-bg-alt`, відступи 96 / 80 (mobile 40 / 16 / 56).
- **Фільтри** (Chip / Filter): Tout · Mode · Tech · Mobilité · Beauté · Voyages.
  Це кнопки з `aria-pressed`; активний — State=Active. Фільтр без кодів не показувати.
  Mobile — стрічка з горизонтальною прокруткою (як у Figma «scroll horizontal»), без смуги прокрутки.
- **Сортування** справа: «Trier : Les plus récents ▾» — нативний `<select>`, стилізований під Label/Nav:
  «Les plus récents» (за `addedAt`) / «Expirent bientôt» (за `expiresAt`, без дати — в кінець).
- Вибір фільтра і сортування записується в адресу (`?cat=mode&tri=expire`), щоб посиланням можна було поділитись.
  Без JS показуємо всі коди, відсортовані за датою (сторінка корисна і без скрипта).
- **Сітка**: desktop 3 колонки (`repeat(3, minmax(0,1fr))`, проміжок 24), mobile — 1 колонка, проміжок 12,
  картка з відступами 20 / проміжком 16.
- Картка — та сама Card / Code partenaire, що на головній (перевикористати компонент, не копіювати):
  логотип + «Partenariat», пропозиція (висота 68 px, 2 рядки), рядок коду + «Copier le code», «Voir la marque».
  - Після копіювання кнопка на 2 с: **«Code copié ✓»** (так у Figma) — тексти в `i18n/ui`.
  - «Voir la marque» → `url` марки, `target="_blank"`, `rel="sponsored noopener"` (так Google розуміє,
    що це партнерське посилання), прихований текст «(nouvelle fenêtre)».
- **«Voir plus de codes»** (Outline): спочатку 9 карток на desktop / 4 на mobile, кнопка додає ще стільки ж;
  коли більше нема — кнопка зникає. Після натискання фокус переходить на першу нову картку.
- Порожній стан фільтра (якщо код прострочився): «Aucun code dans cette catégorie pour l'instant.» + кнопка «Tout voir».

## Крок D2 · «03b Image plein écran» (нове в Figma)

Між «Tous les codes» і «Questions» — одне фото **на всю ширину екрана**, без тексту: візуальна пауза,
щоб сторінка не була «сухою» з самих карток.

- Фото: великий план — рука Luigi в темному костюмі з годинником (Golden Concept).
  **Файл уже в проєкті:** `src/assets/img/privileges/break.jpg` (1920 × 2880, вертикальне).
  `<Image>` з `widths={[768, 1280, 1920]}`, `sizes="100vw"`, `loading="lazy"`, `alt=""`
  (декоративне; поле алт-тексту в контенті сторінки — порожнє за замовчуванням).
- Висота: **749 px desktop → 420 px mobile**:
  `height: clamp(26.25rem, 18.6125rem + 31.333vw, 46.8125rem); /* 420 → 749 */`, `width: 100%`, `object-fit: cover`.
- Кадр з Figma (фото вертикальне, видно смугу з годинником і рукою):
  desktop (≥ 768) `object-position: 50% 69%`, mobile `object-position: 50% 56%`.
  Перевір на 1920 і 2560: годинник має лишатися в кадрі.
- Без відступів, без радіуса, без затемнення і без зуму при наведенні (не посилання).
- Секція — `<figure aria-hidden="true">`, щоб читалка її пропускала.
- Фото — поле в Keystatic для сторінки «Privilèges» («Фото на всю ширину»), щоб його можна було замінити без коду.

## Крок E · «04 Questions»

- Desktop: ліворуч (400) eyebrow «Questions», H2 «Un code ne marche pas ?», Body M «Écrivez-moi. Je vérifie avec la marque.»,
  Link Accent «Contact»; праворуч (784) FAQ / Item ×4, перший відкритий. Проміжок 96.
- Mobile: заголовок + «Contact» під ним (як на всіх сторінках), **додати** рядок «Écrivez-moi…» (у Figma mobile його бракує).
  Показати **всі 4** питання (на mobile в Figma лише 3 — дані ті самі, що й на desktop).
- Відповіді: 01 — з Figma; 02–04 — `[Réponse à compléter]`. Для 04 «Les codes sont-ils cumulables ?»
  не вигадувати: правила задає марка.
- Питання — у файлі текстів сторінки `src/content/pages/<мова>/privileges.json` (+ схема + Keystatic singleton).

---

## SEO

`seoTitle` «Codes promo de Luigi Contessi — marques partenaires» (≤ 70), опис ≤ 170.
Без JSON-LD «Offer» на коди (Google не любить розмітку купонів на чужі сайти).

## Що НЕ чіпати

Шапку, футер, головну (лише переконайся, що «Tous les privilèges» з головної веде сюди),
токени і шрифти. Компонент картки коду — тільки розширити (props), не ламати головну.

## Перевірка

1. `npm run format`, `npm run build`, без помилок CSP.
2. Ширини 390 / 768 / 1024 / 1440 / 1920: без горизонтальної прокрутки сторінки (стрічка фільтрів крутиться всередині).
3. Фільтр «Tech» → лише tech-коди; адреса оновилась; перезавантаження сторінки зберігає фільтр.
4. «Copier le code» → код у буфері, «Code copié ✓» на 2 с; «Voir la marque» відкриває нову вкладку.
5. Tab по фільтрах, select, картках, «Voir plus», FAQ.
6. Блок «Transparence» видно на всіх ширинах.
7. Три мови — тексти перекладені, перемикач мов лишається на /privileges/.
8. Звіт + список файлів. Стоп.
