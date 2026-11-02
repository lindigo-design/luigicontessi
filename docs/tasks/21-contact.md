# Завдання 21 · Сторінка «Contact» + спільні елементи форм

Прочитай CLAUDE.md. Кроки **A → D**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Contact** — desktop `50:641`, mobile `50:771`. Стан «Merci» — сторінка **États**: `55:512` (desktop), `55:522` (mobile).
Компоненти: Form / Field (Default, Textarea), Chip / Filter (Default / Active), Button (Primary, Link Accent).
Адреса: `/fr/contact/`, `/en/contact/`, `/it/contact/` (path `contact` вже є в `nav.ts`; додай у `builtPages`).

---

## A · Спільні елементи форм (знадобляться і для «Partenariats», завдання 23)

`src/components/forms/`:

1. **`Field.astro`** — підпис (Body S, `--color-text-2`) над полем, проміжок 8; поле — клас `.field` з `forms.css` (висота 52, рамка `--color-border`,
   фокус — рамка `--color-text`). Пропси: `label`, `name`, `type` (`text` / `email` / `url` / `month`), `placeholder`, `required`, `autocomplete`,
   `textarea` (висота 140, padding 16), `select` + `options`. Підпис звʼязаний з полем (`for` / `id`). Обовʼязкові поля — без зірочки в макеті,
   тому поруч із необовʼязковими пиши «(facultatif)» дрібно.
   Помилка: рамка `--color-red-text`, під полем текст 14 px того ж кольору, `aria-invalid` + `aria-describedby`.
2. **`ChipGroup.astro`** — радіо-група у вигляді чипів (Chip / Filter, як розміри на сторінці товару): `<fieldset><legend>` + приховані
   `input type="radio"`, клавіатура ←/→. Чипи **переносяться на новий рядок** (`flex-wrap: wrap`, проміжок 8) — на mobile в Figma вони
   не вміщаються в 358 px.
3. **`Consent.astro`** — чекбокс 20×20 (рамка `--color-border`, вибраний — фон `--color-text`, галочка `--color-bg`) + текст Body S, проміжок 12.
   Обовʼязковий. «Politique de confidentialité» у тексті — посилання на `confidentialite` (через `isBuilt`, як інші).
4. **`FormThanks.astro`** — блок «Merci» з Figma: картка `--color-card`, радіус 4, padding 48 (mobile 24), проміжок 16, по центру:
   Corner K logo 78 (mobile 65), заголовок 48 (mobile 30), текст Body M, кнопка Link Accent.
5. **`src/scripts/form.ts`** — одна логіка для всіх форм `[data-form]`:
   - перевірка браузером (`required`, `type=email`) + свої тексти помилок трьома мовами (`ui/*.json`, ключі `form.*`);
     помилки показуємо після спроби надіслати і при виході з поля, не під час набору;
   - фокус на перше поле з помилкою;
   - **поле-пастка для ботів**: приховане поле `website_hp` (`tabindex="-1"`, `autocomplete="off"`, приховане CSS-класом); заповнене → нічого не надсилаємо;
   - надсилання `fetch(endpoint, { method: 'POST', body: FormData })`, кнопка — «Envoi…» і `aria-busy`, двічі не надсилається;
   - успіх → форма ховається, на її місці `FormThanks` (фокус на заголовок, `aria-live="polite"`);
   - помилка мережі → над кнопкою текст «L’envoi n’a pas marché. Réessayez ou écrivez-moi à [e-mail].»
6. **Куди надсилати**: `settings.json` → `forms: { endpoint: "" }` (Zod + Keystatic).
   Поки **порожньо** → форма не надсилає, а після перевірки показує чесний текст
   «Le formulaire arrive bientôt. En attendant, écrivez-moi à [e-mail].» (як «bientôt» у розсилці у футері).
   Сервер для пошти (PHP на хостингу або сервіс форм) — окремий етап, у коді TODO.
7. **Адреси пошти**: `settings.json` → `emails: { contact: "", press: "", partnerships: "" }`. Порожня → у кнопці/тексті заглушка
   `[e-mail]` і попередження під час збірки (як посилання брендів у завданні 17; `LC_STRICT=1` — збірка падає).

## B · Блок «Titre» + «Options»

**Desktop (Figma `01 Contact`):** padding 96 / 120 зверху/знизу, проміжок 64 між заголовком і рядком.

- Заголовок: eyebrow «Contact» → H1 «Écrivez-moi» (Desktop H1 52 → Mobile 32) → «Je lis tous les messages. Choisissez le bon sujet, ça ira plus vite.» (Body L 18 → 16), проміжок 20 (mobile 12).
- Рядок: зліва **Options** 440 px, справа **Formulaire** (решта), проміжок 96. `align-items: start`.
- Options — 4 пункти, лінія `--color-border` між ними (і зверху першого), padding 20 / 0, проміжок 6:
  назва (Text/Title 18) → опис (Body S, secondary) → Button **Link Accent**:

| назва                   | опис                                     | кнопка → куди                                            |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Vous êtes une marque    | Collaborations, événements, media kit.   | «Partenariats» → `partenariats`                          |
| Un yacht vous intéresse | Visite, essai en mer, off-market.        | «Page Yachts» → `yachts`                                 |
| Presse                  | Interviews, photos, informations.        | e-mail преси (`mailto:`), текст = сама адреса            |
| Instagram               | Le plus rapide pour une petite question. | `@contessiluigi` → `settings.instagramUrl`, нова вкладка |

Сторінок, яких ще немає (`isBuilt` = false), — заглушка як у завданні 17 (`aria-disabled`, «Lien bientôt disponible»).

**Mobile:** padding 40 / 16 / 56, усе одним стовпчиком, проміжок 32; між Options і формою 40.

## C · Форма «Autre question»

- Заголовок «Autre question» (Desktop H3 28), проміжок між елементами 20.
- Desktop: «Nom» і «E-mail» в одному рядку (по 50 %, проміжок 20); mobile — одне під одним.

| поле         | тип                                                                            | placeholder      | обовʼязкове           |
| ------------ | ------------------------------------------------------------------------------ | ---------------- | --------------------- |
| Nom          | text, `autocomplete="name"`                                                    | Votre nom        | так                   |
| E-mail       | email, `autocomplete="email"`                                                  | vous@exemple.com | так                   |
| Sujet        | ChipGroup: **Question** (вибрано) · Code partenaire · Presse · Autre           | —                | так                   |
| Message      | textarea                                                                       | Votre message    | так, мін. 10 символів |
| Consentement | «J’accepte que mes informations soient utilisées pour répondre à mon message.» | —                | так                   |

- Кнопка **Envoyer** — Primary; desktop — за шириною тексту, mobile — на всю ширину.
- **Тему можна вибрати з адреси**: `?sujet=code` / `presse` / `autre` → відповідний чип вибраний.
  На сторінці Privilèges посилання «Contact» у блоці «Un code ne marche pas ?» веде на `contact/?sujet=code`.
- Успіх → `FormThanks`: «Message bien reçu.» / «Je vous réponds personnellement.» / Link Accent «Retour à l’accueil».

## D · SEO і тексти

- `<title>`: «Contact — Luigi Contessi»; description: «Une question, un projet, la presse ? Écrivez à Luigi Contessi.»
- Тексти трьома мовами — у `src/content/pages/{fr,en,it}/contact.json` (колекція `contact`, Zod + Keystatic). EN / IT — переклад
  тим самим простим стилем (EN: «Write to me», IT: «Scrivimi»).

## Перевірка

- 390 / 768 / 1024 / 1440: як у Figma; чипи на 390 переносяться, нічого не вилазить.
- Надіслати порожню форму → помилки біля полів, фокус на першому; e-mail без «@» → помилка.
- `endpoint` порожній → текст «arrive bientôt» з адресою; тимчасово постав будь-яку адресу (наприклад, `https://httpbin.org/post`) → видно «Merci».
- `?sujet=code` вибирає «Code partenaire». Tab проходить усе по порядку.
- Немає помилок CSP, `npm run build` зелений.
