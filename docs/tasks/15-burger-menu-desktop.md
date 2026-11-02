# Завдання 15 · Шапка з «MENU» на всіх ширинах + меню на весь екран

Прочитай CLAUDE.md. Роби **по кроках A → C**, після кожного — `npm run format`, `npm run build`, звіт, стоп.
**Замінює завдання 14** (з нього лишається тільки ключ `nav.about` у i18n — якщо 14 ще не зроблене, зроби лише цей ключ).

Figma:

- компонент **Header / Desktop** — Components & Tokens (`131:499`), уже стоїть на всіх 17 сторінках;
- відкрите меню — сторінка **États → «Menu desktop (ouvert)»** (`132:590`);
- мобільне меню — **États → «Menu mobile (ouvert)»** (`55:379`), як і було.

---

## Крок A · Шапка

```
☰ MENU                      LUIGI CONTESSI                      PRIVILÈGES   FR   [PANIER (0)]
```

- Три зони: `grid-template-columns: 1fr auto 1fr`. Ліва — кнопка меню (`justify-self: start`),
  центр — логотип (завжди рівно по центру екрана, незалежно від ширини лівої/правої частини),
  права — посилання (`justify-self: end`).
- **Кнопка меню**: іконка (3 лінії) + слово «Menu» (Label/Nav). Це `<button aria-expanded aria-controls="site-menu">`,
  текст з i18n: Menu / Menu / Menu; у відкритому стані — «Fermer / Close / Chiudi» + іконка ✕.
- **Справа**: «Privilèges» (активний червоний на своїй сторінці), перемикач мови (лише поточна мова «FR»,
  клік відкриває маленький список FR / EN / IT — `<details>` або кнопка + список), «Panier (0)» — **лише коли `features.shop: true`**.
  EUR / USD з шапки прибрати зовсім (повернемо в кошик/товар разом з магазином).
- Mobile (< 768): логотип зліва, справа «Panier» (якщо магазин) + кнопка-бургер **без слова** (44 × 44) — як зараз у Figma.
  На mobile «Privilèges» у шапці не показуємо (він є в меню і на головній) — місця нема.
- Поведінка при прокрутці (фон, ховається вниз / зʼявляється вгору) — з завдання 01, не змінювати.
- `src/i18n/nav.ts`: прибрати `utilityNav` у шапці; нова структура:
  ```ts
  export const menuPrimary = [journal, yachts, favorites, privileges, collection]; // великі пункти
  export const menuSecondary = [about, partnerships, press, contact]; // дрібні
  export const headerLinks = [privileges]; // видно в шапці
  ```
  «Collection» у меню — замість «Boutique», поки `shop: false`; коли магазин увімкнеться — «Boutique».

## Крок B · Меню на весь екран (desktop і tablet ≥ 768)

Figma «Menu desktop (ouvert)». Відкривається поверх сторінки, `<dialog id="site-menu">` (`showModal()`):
фокус усередині, Esc і «Fermer» закривають, фокус повертається на кнопку «Menu», сторінка під меню не скролиться.

**Вигляд:**

- Фон `--color-bg-alt` (сірий, трохи світліший за сторінку) + **м'яка підсвітка за курсором** —
  та сама пляма, що на картках преси (завдання 13: `radial-gradient(circle 420px at var(--mx) var(--my), --card-glow, transparent 70%)`),
  тільки на весь фон меню. Не «прожектор» з футера: там текст поза плямою зникає, а в меню все має **добре читатися завжди**.
- Верх: «✕ Fermer» зліва, логотип по центру, «Privilèges · FR» справа — на тих самих місцях, що в шапці (нічого не «стрибає» при відкритті).
- **Основні пункти** — великі, Desktop/H1 (52 / 60, на tablet — Mobile/H1 32), колір `--color-text`:
  `01 Journal`, `02 Yachts`, `03 Coups de cœur`, `04 Privilèges`, `05 Collection`.
  Номер — Label/Eyebrow, secondary. Між пунктами лінія `--color-border`, відступи рядка 14 px.
  Пункт поточної сторінки — номер червоний + `aria-current="page"`.
- **Hover на пункті** (як Univers на головній):
  - наведений — `--color-text` + справа зʼявляється червоне коло-стрілка (заливка `--color-red-text`, стрілка `--color-bg`);
  - інші — плавно стають `--color-text-2` (сірі), але **залишаються читабельними** (контраст ≥ 4.5 : 1 на bg-alt — перевір);
  - без hover (просто відкрили меню) — усі пункти білі.
    Те саме для фокусу з клавіатури (`:focus-visible` = стан hover).
- **Дрібні пункти** під списком в один рядок, Text/Title 18: À propos · Partenariats · Presse · Contact; hover — сірий.
- **Праворуч фото 440 × 520** (радіус 4) + підпис Body S secondary.
  Фото змінюється при наведенні на пункт — плавне `opacity` 300 мс між зображеннями:
  Journal → `univers-1.jpg`, Yachts → `yachts.jpg`, Coups de cœur → `news-2.jpg`, Privilèges → `privileges/break.jpg`,
  Collection → `collection-1.jpg` (усі вже є в проєкті; список — у `nav.ts` поруч із пунктами).
  За замовчуванням — фото пункту поточної сторінки, на головній — Yachts.
  Підписи (з i18n): Journal «Ce que j'essaie, en vrai» · Yachts «Yachts à vendre — du premier contact à la signature» ·
  Coups de cœur «Mes marques préférées» · Privilèges «Mes codes chez les partenaires» · Collection «Contessi Collection».
- **Низ** (лінія зверху): мови FR · EN · IT (поточна — біла), «Instagram @contessiluigi» (нова вкладка),
  купон «Code [LUIGI10] −10 % sur la première commande» (той самий компонент, що промо-смуга; клік копіює).
- Відкриття: фон з'являється за 240 мс (opacity), пункти — по черзі знизу вгору (translateY 16px → 0, крок 40 мс).
  `prefers-reduced-motion` — без руху, лише opacity.

## Крок C · Мобільне меню (< 768)

Те саме меню, інша розкладка (Figma «Menu mobile (ouvert)»): без фото, пункти Mobile/H1 32 зі стрілкою «→»
біля кожного, дрібні пункти списком, внизу мови і кнопка «Suivre @contessiluigi». Підсвітки за курсором немає (touch).

---

## Що НЕ чіпати

Hero, футер, решту сторінок. Мобільна шапка — лише переконайся, що вона така, як описано в кроці A.

## Перевірка

1. `npm run format`, `npm run build`, без помилок CSP.
2. Desktop 1440 / 1920: шапка — MENU · логотип рівно по центру · Privilèges FR; меню відкривається, Esc закриває.
3. Наведення на пункти: фото й підпис змінюються, інші пункти сіріють, але читаються; пляма світла йде за курсором.
4. Tab по меню: фокус по колу всередині, не виходить на сторінку під ним.
5. Tablet 768 і mobile 390: розкладка як у Figma.
6. `shop: true` — у шапці з'являється «Panier (0)», у меню «Boutique» замість «Collection».
7. Звіт + список файлів. Стоп.
