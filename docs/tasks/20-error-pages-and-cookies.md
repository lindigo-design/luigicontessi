# Завдання 20 · Сторінки 404 і 500 + банер і налаштування cookies

Прочитай CLAUDE.md. Три частини **A → C**, після кожної `npm run format` + `npm run build`,
короткий звіт і стоп, чекай «ок».

Figma, сторінка **États**:

| що                             | desktop                         | mobile         |
| ------------------------------ | ------------------------------- | -------------- |
| 404                            | `55:536`                        | `55:612`       |
| 500 (нова)                     | `147:613`                       | `147:671`      |
| Cookies — банер                | `55:415` (сам банер — `55:416`) | `55:430`       |
| Cookies — налаштування (вікно) | `55:443`                        | — (див. нижче) |

Логотип для цифр уже в проєкті: `src/assets/brand/corner-k-tall.svg` (Figma «Corner K logo» 130:2704, 122 × 247).

---

## Спільне для 404 і 500

### Одна сторінка — три мови

Хостинг віддає **один** файл `404.html` / `500.html` на будь-яку адресу, тому мова береться з адреси:

- Сторінка рендериться французькою (FR за замовчуванням), але в ній є тексти всіх трьох мов:
  блок `<div class="err__copy" lang="fr">`, `lang="en" hidden`, `lang="it" hidden`.
- Маленький скрипт (`src/scripts/error-lang.ts`, без inline — CSP): бере `location.pathname`, відрізає `import.meta.env.BASE_URL`,
  дивиться перший сегмент. `en` / `it` → показує свій блок, ховає FR, ставить `document.documentElement.lang`.
  Інакше — лишається FR.
- Без JS видно FR — це нормально.
- Шапка й футер — спільні (як на інших сторінках), FR. Шапка в режимі `solid`.
- Усі посилання — абсолютні з урахуванням `BASE_URL` (сторінка може відкритись на будь-якій глибині адреси).
- `noindex` (уже є пропс у BaseLayout).

### Компонент `src/components/sections/ErrorHero.astro`

Пропси: `code: '404' | '500'`, тексти трьох мов, дві кнопки. Обидві сторінки — це лише він.

**Цифри**: рядок `перша цифра · логотип · остання цифра`, по центру.

- 404 → `4` [K] `4`; 500 → `5` [K] `0`.
- Цифри — той самий шрифт і стиль, що в Figma (стиль тексту 200 px — візьми з tokens, який відповідає), колір `--color-text`.
- Логотип — `<svg>` з `corner-k-tall.svg` (імпорт як компонент або `?raw` — як зручніше під CSP), колір `--color-red`.
- Розміри fluid: цифри **56 → 200 px** (390 → 1440), логотип висотою ≈ **73 → 247 px** (пропорція 122/247),
  проміжок **8 → 24 px**. Через `clamp()`, як у `01-fluid-layout`.
- Весь рядок `aria-hidden="true"`; читалці — `<span class="visually-hidden">Erreur 404</span>` (і так само 500, перекладено) всередині `h1` перед заголовком.

**Текст і кнопки** (по центру):

- `h1`: desktop 48 / mobile 30 (стиль H2 → Mobile H1 як у Figma), макс. ширина ~ 560.
- опис: Body M, `--color-text-2`, макс. ширина ~ 560.
- кнопки: desktop — в рядку, проміжок 16: **Primary** + **Link Accent** (зі стрілкою в кружечку, як завжди).
  Mobile — стовпчиком, проміжок 16: Primary на всю ширину, Link Accent по центру під нею.
- Відступи блоку: desktop 160 зверху/знизу, mobile 80; між цифрами і заголовком 24 (mobile 16), між заголовком,
  описом і кнопками — 24 (mobile 16). Блок займає мінімум `min-height: 60svh`, вміст по центру.

## A · 404 (`src/pages/404.astro` — переписати)

|             | FR                                                           | EN                                          | IT                                                               |
| ----------- | ------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Заголовок   | Cette page s’est égarée                                      | This page got lost                          | Questa pagina si è persa                                         |
| Опис        | Le lien est peut-être ancien, ou la page a changé d’adresse. | The link may be old, or the page has moved. | Il link forse è vecchio, oppure la pagina ha cambiato indirizzo. |
| Primary     | Retour à l’accueil                                           | Back to home                                | Torna alla home                                                  |
| Link Accent | Lire le Journal                                              | Read the Journal                            | Leggi il Journal                                                 |

- Primary → головна мови; Link Accent → Journal мови.
  **Поки сторінки Journal немає** — Link Accent веде на Privilèges з текстом «Voir les privilèges» / «See the perks» / «Vedi i privilegi».
  Зроби це однією перевіркою (наприклад, список готових сторінок у `nav.ts`), щоб потім не шукати.
- `<title>`: «Page introuvable — Luigi Contessi» (і переклади в `ui/*.json`, ключі `404.*` — онови / доповни).
- `.htaccess` уже має `ErrorDocument 404 /404.html` — не чіпати. GitHub Pages сам віддає `404.html`.

## B · 500 (`src/pages/500.astro` — нова)

Показується, коли ламається сервер (на звичайному хостингу Apache). Сторінка має працювати **сама по собі**:
жодних запитів до даних, лише статичний HTML + CSS.

|             | FR                                                                     | EN                                                                      | IT                                                                  |
| ----------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Заголовок   | Petit souci technique                                                  | A small technical problem                                               | Un piccolo problema tecnico                                         |
| Опис        | Le site ne répond pas pour le moment. Réessayez dans quelques minutes. | The site isn’t responding right now. Please try again in a few minutes. | Il sito non risponde in questo momento. Riprova tra qualche minuto. |
| Primary     | Réessayer                                                              | Try again                                                               | Riprova                                                             |
| Link Accent | Retour à l’accueil                                                     | Back to home                                                            | Torna alla home                                                     |

- «Réessayer» — **посилання `href=""`** (відкриває ту саму адресу ще раз, працює без JS).
- `.htaccess`: додай `ErrorDocument 500 /500.html` і `ErrorDocument 503 /500.html` поруч із 404.
- Переконайся, що в `dist/` зʼявився `500.html` (а не `500/index.html`); якщо ні — налаштуй.
- `<title>`: «Erreur technique — Luigi Contessi».

## C · Cookies: банер + вікно налаштувань

### Що кажуть правила (Франція, CNIL) — це вимоги, а не побажання

- **До вибору людини — жодних необовʼязкових cookies** і жодних сторонніх скриптів аналітики / партнерських посилань.
- «Tout refuser» так само помітна й легка, як «Tout accepter» (тому в Figma обидві **Outline** однакового розміру).
- Вибір можна змінити будь-коли: «Paramètres cookies» у футері.
- Вибір зберігаємо **6 місяців**, потім питаємо знову.

### Коли показувати банер

Зараз на сайті **немає** аналітики і партнерського трекінгу. Банер без потреби — зайвий.

- `settings.json` → `consent: { analytics: false, affiliates: false }` — чи підключені такі сервіси (Zod + Keystatic).
- Банер і пункт «Paramètres cookies» показуються, **лише коли хоч одне `true`**. Для перевірки — тимчасово увімкни.
- У вікні налаштувань — лише рядки увімкнених категорій (+ «Nécessaires» завжди).

### Дані і API (`src/scripts/consent.ts`)

- `localStorage['lc-consent'] = { v: 1, date: ISO, analytics: bool, affiliates: bool }` (обгорни в try/catch).
  Немає запису, інша версія `v` або старше 6 місяців → показати банер.
- `getConsent(category)`, `onConsent(category, cb)` — щоб пізніше скрипт аналітики підключався **лише після згоди**.
  Після зміни вибору — подія `window.dispatchEvent(new CustomEvent('lc:consent', { detail }))`.
- Відкликали згоду → видалити cookies цієї категорії (поки — заглушка з TODO, бо сервісів немає).

### Банер — desktop (Figma `55:416`)

- `position: fixed`, знизу 32, по ширині `container` (бокові відступи як у сторінки), `z-index` над контентом, під меню.
- Фон `--color-card`, радіус 4, padding 32, рядок: текст (макс. 622) зліва, кнопки справа, проміжок 40, по центру по висоті.
- Текст: заголовок «Cookies» (Text/Title 18), під ним Body S `--color-text-2`, проміжок 8.
- Кнопки, проміжок 12: **Personnaliser** (Button Link) · **Tout refuser** (Outline) · **Tout accepter** (Outline).
- Не закриває контент повністю: додай `padding-bottom` сторінці на висоту банера, поки він видимий (через клас на `<html>`, не inline-стиль).
- Без хрестика: закрити можна лише вибором.
- `role="region" aria-label="Cookies"`, не забирає фокус. З'являється плавно знизу (200–300 ms), `prefers-reduced-motion` — без руху.

### Банер — mobile < 768 (Figma `55:430`)

- Аркуш знизу на всю ширину, без відступів, радіус лише зверху (4), padding 24 / 16 / 32, проміжок 14.
- Короткий текст: «Mesure d’audience et liens partenaires. Vous pouvez changer d’avis à tout moment.»
- Рядок з двох кнопок 50/50 (Tout refuser · Tout accepter), під ним «Personnaliser» (Button Link).
- `padding-bottom: env(safe-area-inset-bottom)` додатково.

### Вікно «Paramètres cookies» (Figma `55:443`)

- `<dialog>` (`showModal()`), ширина 640, фон `--color-card`, радіус 4, padding 40, проміжок 20.
  Затемнення фону — `::backdrop` rgba(0,0,0,.6). Esc і хрестик (24×24, зона кліку 44×44) закривають **без збереження**.
- Шапка: «Paramètres cookies» (Desktop H3 28) + хрестик.
- Рядки, лінія зверху (`--color-border`), padding-top 16, між назвою/описом і перемикачем 24:
  - **Nécessaires** — «Font fonctionner le site (langue, choix cookies). Toujours actifs.» — увімкнений, вимкнути не можна (`disabled`, `aria-checked="true"`).
  - **Mesure d’audience** — «Savoir quelles pages sont lues, de façon anonyme.»
  - **Liens partenaires** — «Permettre aux marques de savoir que vous venez de chez moi.»
- Перемикач 44×24, радіус 12: увімкнений — фон `--color-text`, кружок 18 `--color-bg` справа; вимкнений — фон `--color-border`,
  кружок `--color-text-2` зліва. Технічно — `<input type="checkbox" role="switch">` + видимий фокус. Перехід 150 ms.
  Значення за замовчуванням — **вимкнено** (або як збережено раніше).
- Кнопки внизу, праворуч, проміжок 12: **Tout refuser** (Outline) · **Tout accepter** (Outline) · **Enregistrer** (Primary).
- Mobile < 768: вікно на всю ширину знизу (як аркуш), `max-height: 90svh`, прокрутка всередині, padding 24 / 16,
  кнопки стовпчиком на всю ширину: Enregistrer зверху.
- Фокус: при відкритті — на заголовок вікна; після закриття — назад на кнопку, що відкрила.

### Футер

- Додай у рядок юридичних посилань **«Paramètres cookies»** — це `<button type="button">`, що відкриває вікно
  (виглядає як інші посилання рядка). Показується лише коли банер увімкнений (див. «Коли показувати»).
- «Cookies» (сторінка з політикою) уже в `legalNav` — не чіпати.

### Тексти (додай у `ui/*.json`, ключі `cookies.*`)

|                                                            | FR                                                                                                                                                                                  | EN                                                                                                                                                        | IT                                                                                                                                                                     |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Текст банера (desktop)                                     | J’utilise des cookies pour mesurer l’audience et, si vous l’acceptez, pour les liens partenaires. Vous pouvez changer d’avis à tout moment (« Paramètres cookies » en bas de page). | I use cookies to measure visits and, if you agree, for partner links. You can change your mind at any time (“Cookie settings” at the bottom of the page). | Uso i cookie per misurare le visite e, se sei d’accordo, per i link dei partner. Puoi cambiare idea in qualsiasi momento («Impostazioni cookie» in fondo alla pagina). |
| Текст банера (mobile)                                      | Mesure d’audience et liens partenaires. Vous pouvez changer d’avis à tout moment.                                                                                                   | Visit statistics and partner links. You can change your mind at any time.                                                                                 | Statistiche delle visite e link dei partner. Puoi cambiare idea in qualsiasi momento.                                                                                  |
| Personnaliser / Tout refuser / Tout accepter / Enregistrer | Personnaliser · Tout refuser · Tout accepter · Enregistrer                                                                                                                          | Customise · Refuse all · Accept all · Save                                                                                                                | Personalizza · Rifiuta tutto · Accetta tutto · Salva                                                                                                                   |
| Заголовок вікна                                            | Paramètres cookies                                                                                                                                                                  | Cookie settings                                                                                                                                           | Impostazioni cookie                                                                                                                                                    |
| Nécessaires                                                | Nécessaires — Font fonctionner le site (langue, choix cookies). Toujours actifs.                                                                                                    | Necessary — Keep the site working (language, cookie choice). Always on.                                                                                   | Necessari — Fanno funzionare il sito (lingua, scelta dei cookie). Sempre attivi.                                                                                       |
| Mesure d’audience                                          | Mesure d’audience — Savoir quelles pages sont lues, de façon anonyme.                                                                                                               | Visit statistics — See which pages are read, anonymously.                                                                                                 | Statistiche — Sapere quali pagine vengono lette, in modo anonimo.                                                                                                      |
| Liens partenaires                                          | Liens partenaires — Permettre aux marques de savoir que vous venez de chez moi.                                                                                                     | Partner links — Let brands know you came from my site.                                                                                                    | Link dei partner — Far sapere ai marchi che arrivi dal mio sito.                                                                                                       |
| Хрестик (для читалки)                                      | Fermer                                                                                                                                                                              | Close                                                                                                                                                     | Chiudi                                                                                                                                                                 |

## Перевірка

- `/fr/abc`, `/en/abc`, `/it/abc` у `npm run preview` → 404 своєю мовою; кнопки ведуть на правильні сторінки з base.
- `dist/500.html` існує, відкривається сам по собі, «Réessayer» перезавантажує сторінку.
- 404/500 на 390 / 768 / 1440 / 1920: цифри і логотип на одній лінії, не налазять, як у Figma.
- Cookies (тимчасово `analytics: true`): банер є; «Tout refuser» → зник, у localStorage `analytics: false`;
  перезавантаження → банера немає; «Paramètres cookies» у футері → вікно з правильними перемикачами;
  Esc закриває; Tab по всіх кнопках; змінити дату в localStorage на 7 місяців тому → банер знову.
- Обидва `consent` = false → ні банера, ні пункту у футері.
- Немає помилок CSP, `npm run build` зелений.

## Що НЕ чіпати

Інші сторінки, шапку (крім режиму solid на помилках), токени, шрифти.
