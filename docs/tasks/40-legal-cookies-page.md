# Завдання 40 · Сторінка «Cookies» (політика cookies) + шаблон юридичних сторінок

Прочитай CLAUDE.md. Кроки **A → C**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп.

Банер і вікно «Paramètres cookies» вже зроблені (завдання 20). Тут — **сторінка** `/{lang}/cookies/`, на яку веде посилання «Cookies» у футері
(path `cookies` є в `legalNav`; додай у `builtPages`).
Figma: сторінка **Légal** — шаблон «Mentions légales (modèle)» desktop `54:988`, mobile `54:1086`. Cookies — за тим самим шаблоном.

⚠️ Тексти нижче — чесний опис того, що сайт робить **зараз**. Остаточну редакцію має перевірити юрист (так написано і в Figma).

## A · Шаблон `src/layouts/LegalLayout.astro`

Один шаблон для всіх юридичних сторінок (Mentions légales, Confidentialité, Cookies, CGV — інші потім).
- Desktop: рядок, проміжок 96, padding 96 / 80 / 120.
  - ліворуч **навігація** 260 px, `position: sticky; top: calc(var(--header-h) + 32px)`: eyebrow «Informations légales» → посилання (Body S, padding 10 / 0 / 10 / 14,
    лінія зліва 2 px: поточна сторінка — `--color-red`, інші — `--color-border`; поточна ще й `aria-current="page"`). Пункти — з `legalNav` (CGV лише коли `shop`), лише ті, що `isBuilt`.
  - праворуч **текст** 720 px: H1 52 (→ 32) + «Dernière mise à jour : 2 novembre 2026» (Body S, secondary, дата з даних), далі розділи:
    лінія зверху, padding-top 24, заголовок H3 28 «1. …», текст Body M, проміжок 10; між розділами 40. Таблиці — Body S, лінії `--color-border`, на mobile горизонтальна прокрутка.
- Mobile: навігація — горизонтальна стрічка чипів над текстом (не sticky), padding 40 / 16 / 56.
- Тексти сторінок — `src/content/legal/{fr,en,it}/<slug>.md` (Markdoc / Markdown, колекція `legal`, Keystatic), поле `updated`.
- `noindex` не ставимо (юридичні сторінки можуть бути в пошуку).

## B · Сторінка «Cookies» — зміст (FR; EN / IT — переклад тим самим простим стилем)

**H1:** «Cookies»

**1. Qu’est-ce qu’un cookie ?**
Un cookie est un petit fichier enregistré par votre navigateur. Ce site utilise aussi le « stockage local » du navigateur, qui fonctionne de la même façon. Dans cette page, nous appelons les deux « cookies ».

**2. Ce que ce site utilise aujourd’hui**
Uniquement ce qui est nécessaire pour que le site fonctionne. Aucun cookie publicitaire, aucune mesure d’audience pour l’instant.

Таблиця — **генерується з коду**, а не пишеться вручну (щоб не розходилась із сайтом). Список у `src/content/helpers.ts → storageInventory(settings)`:

| Nom | À quoi ça sert | Durée | Type |
| --- | --- | --- | --- |
| `lc-consent` | Retenir votre choix sur les cookies | 6 mois | Nécessaire |
| `lc-cart` | Garder votre panier *(seulement si la boutique est ouverte)* | jusqu’à la commande ou suppression | Nécessaire |
| `lc-cart-code` | Garder le code promo saisi dans le panier *(boutique)* | idem | Nécessaire |

- Рядки `lc-cart*` — лише коли `features.shop: true`.
- Коли в `settings.consent` увімкнено `analytics` або `affiliates` — у таблиці зʼявляються рядки цих сервісів (назва, мета, строк, «Avec votre accord»), дані — у `settings.json → consentServices[]` (поки порожньо).
  **Не додавати** сервісів, яких на сайті немає.

**3. Les cookies qui demandent votre accord**
Mesure d’audience (savoir quelles pages sont lues) et liens partenaires (permettre aux marques de savoir que vous venez de ce site). Ils ne sont jamais déposés sans votre accord. Votre choix est gardé 6 mois, puis nous vous le redemandons.
→ Якщо обидві категорії вимкнені в `settings.consent` — замість цього абзацу: «Aujourd’hui, le site n’en utilise aucun. Si cela change, une bannière vous demandera votre accord avant.»

**4. Changer d’avis**
Vous pouvez changer votre choix à tout moment : кнопка **«Paramètres cookies»** (Outline, відкриває те саме вікно, що у футері; ховається, якщо категорій немає) + «Vous pouvez aussi supprimer les cookies dans les réglages de votre navigateur.»

**5. Vidéos**
Les vidéos du site sont hébergées sur ce site : elles ne déposent pas de cookies.

**6. Contact**
Pour toute question : [e-mail контакту з `settings.emails.contact`; порожньо → `[e-mail]` + попередження збірки]. Lien vers « Confidentialité » (через `isBuilt`).

**Note** (картка `--color-card`, padding 20, Body S secondary — лише в перегляді `isPreview()`): «Modèle de mise en page. Les textes définitifs doivent être rédigés ou validés par un juriste.»

## C · Звʼязки

- Футер «Cookies» → ця сторінка (поточна підсвічується червоним).
- Вікно «Paramètres cookies»: під перемикачами — посилання «En savoir plus» → `cookies`.
- `<title>` «Cookies — Luigi Contessi», description: «Quels cookies utilise le site de Luigi Contessi et comment changer votre choix.»

## Перевірка

- 390 / 1024 / 1440: як шаблон у Figma; ліва навігація прилипає, поточний пункт червоний.
- `shop: false` → у таблиці лише `lc-consent`; `shop: true` → ще 2 рядки. `consent.analytics: true` → абзац 3 «з accord», кнопка «Paramètres cookies» видна.
- Три мови: `/fr/cookies/`, `/en/cookies/`, `/it/cookies/`.
- `npm run build` зелений.
