# Завдання 14 · «À propos» у головному меню

Прочитай CLAUDE.md. Один етап: зроби лише це, потім звіт і стоп.

## Проблема

На сторінку «À propos» зараз можна потрапити лише з кнопки «Mon histoire» на головній
(і з футера, якого багато хто не доходить). У шапці її немає.

## Рішення (вже в Figma на всіх 17 сторінках)

Права частина шапки — «хто такий Luigi і як з ним працювати», ліва/центр — контент:

```
LUIGI CONTESSI   Journal  Yachts  [Boutique]  Coups de cœur  Privilèges        À propos  Partenariats  FR  [EUR  Panier (0)]
```

- «À propos» стоїть **перед** «Partenariats» у групі `Utilities`.
- На сторінці «À propos» пункт активний (червоний, `aria-current="page"`), як інші активні пункти.
- У мобільному меню (`<dialog>`) «À propos» уже є в Figma — порядок: Journal, Yachts, Coups de cœur,
  Privilèges, **À propos**, Partenariats, Contact.

## Кроки

1. `src/i18n/ui/<fr|en|it>.json` — новий ключ `"nav.about"`: «À propos» / «About» / «Chi sono».
2. `src/i18n/nav.ts`:
   ```ts
   export const utilityNav: NavItem[] = [
     { key: 'nav.about', path: 'a-propos' },
     { key: 'nav.partnerships', path: 'partenariats' },
   ];
   ```
   У футері (колонка «Luigi») замінити `footer.about` на той самий `nav.about`, щоб текст був в одному місці.
3. Мобільне меню бере `[...mainNav, ...utilityNav]` — перевір, що порядок як вище, і додай пункт
   **Contact** у кінець мобільного меню (у Figma він там є; на desktop Contact лишається у футері).
4. Перевір ширину шапки на **1024–1180 px**: тепер на 1 пункт більше. Якщо пункти не вміщаються
   в один рядок — перемикати на бургер з `1180px` замість `1100px` (одне число в Header.astro),
   нічого не переносити на другий рядок і не зменшувати шрифт.

## Що НЕ чіпати

Решту шапки, стилі пунктів, футер (крім ключа тексту).

## Перевірка

1. `npm run format`, `npm run build`.
2. Desktop 1440 і 1180: «À propos» видно в шапці, усі пункти в один рядок.
3. На `/fr/a-propos/` пункт червоний; на інших — звичайний.
4. Mobile: у меню є «À propos» і «Contact».
5. EN / IT: «About» / «Chi sono».
6. Звіт + список файлів. Стоп.
