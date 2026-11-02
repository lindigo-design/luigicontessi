# Завдання 26 · Форми: повідомлення від 30 символів, перевірка e-mail, кнопка завжди активна

Прочитай CLAUDE.md. Після кожного кроку `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».
Стосується всіх форм (`src/scripts/form.ts`, `src/components/forms/*`): Contact, Partenariats, Yachts.

## A · Повідомлення — мінімум 30 символів

- `ContactForm.astro`: `minlength={30}` (і в Partenariats / Yachts, де є «Message»). Рахуємо **без пробілів на початку і в кінці** (`trim()`).
- Під полем — лічильник **«12 / 30»** (Body S, `--color-text-2`), праворуч під полем. Коли ≥ 30 — лічильник зникає.
  `aria-live` на лічильнику **не** ставити (читалка щоразу озвучувала б число); замість того — `aria-describedby` поля на текст «30 caractères minimum».
- Текст помилки: FR «Écrivez au moins 30 caractères.» / EN «Write at least 30 characters.» / IT «Scrivi almeno 30 caratteri.» (`form.tooShort` з `{min}`).
- Прибери `form.sentence` і `form.gateHint` («The button turns on once…») — вони більше не потрібні.

## B · Кнопка «Envoyer» — завжди активна

Неактивна кнопка, яка «вмикається, коли…», — поганий шаблон: людина не розуміє, що не так, а читалка екрана часто взагалі не бачить пояснення.

- Прибери логіку `[data-gate]` / `aria-disabled` з кнопки. Кнопка завжди Primary.
- Клік → перевірка всіх полів → помилки біля полів + фокус на перше поле з помилкою (як уже зроблено).

## C · Перевірка e-mail

Список «дозволених» доменів (.com, gmail …) **не робимо**: доменних зон понад 1 500 (.ch, .mc, .it, .luxury, .agency…), а клієнти й бренди Luigi часто пишуть
з корпоративної пошти (`nom@maison.fr`). Список відсікав би справжніх людей.

Робимо так:

1. **Формат** (своя перевірка, бо `type=email` браузера пропускає `a@b`): `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` після `trim()`.
   - немає «@» → «Il manque le signe @. Exemple : vous@exemple.com»
   - немає крапки в домені або зона коротша за 2 літери → «L’adresse semble incomplète. Exemple : vous@exemple.com»
   - пробіли всередині → прибрати автоматично при виході з поля.
2. **Підказка для одруківок** (не блокує надсилання): якщо домен схожий на популярний — під полем текст
   «Vouliez-vous dire **vous@gmail.com** ?» — клік підставляє виправлену адресу.
   Список для порівняння (лише для підказок!): gmail.com, googlemail.com, hotmail.com, hotmail.fr, outlook.com, outlook.fr, live.com, live.fr,
   yahoo.com, yahoo.fr, icloud.com, me.com, orange.fr, free.fr, sfr.fr, wanadoo.fr, laposte.net, libero.it, virgilio.it, tiscali.it, alice.it, proton.me, gmx.com, gmx.fr.
   Також типові помилки зони: `.con`, `.cmo`, `.comm`, `.fr.`, `.co` замість `.com` для gmail/hotmail/yahoo.
   Схожість — відстань Левенштейна ≤ 2 (маленька функція в `src/scripts/email-suggest.ts`, без бібліотек).
   Тексти: EN «Did you mean …?», IT «Intendevi …?».
3. **Чи існує домен насправді** (MX-запис) — перевіряє лише сервер. TODO в коді: коли буде `forms.endpoint`, сервер перевіряє MX і відповідає
   помилкою `email_domain` → форма показує «Ce domaine ne reçoit pas d’e-mails. Vérifiez l’adresse.»

## D · Поля після автозаповнення

Браузер (Chrome) фарбує автозаповнені поля в синій — на темній темі це виглядає чужим (видно на «Name» / «E-mail»).
У `forms.css`:

```css
.field:-webkit-autofill,
.field:-webkit-autofill:hover,
.field:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--color-text);
  box-shadow: 0 0 0 100px var(--color-bg) inset; /* фон як у звичайного поля */
  caret-color: var(--color-text);
  transition: background-color 9999s; /* не дає браузеру перефарбувати */
}
```

Перевір у Chrome і Safari: автозаповнене поле виглядає так само, як звичайне.

## E · Зірочки обовʼязкових полів

У Contact **усі** поля обовʼязкові — зірочки й рядок «* Champs obligatoires» лише додають шуму.
Правило для всіх форм: якщо обовʼязкових більше, ніж необовʼязкових, — **без зірочок**, а необовʼязкові позначаємо «(facultatif)» (як у Figma: «Téléphone (optionnel)»).
Contact → без зірочок і без примітки. Partenariats / Yachts → «(facultatif)» біля Site web, Budget, Dates, Téléphone, Pays, Taille.

## Перевірка

- «вав» → «Écrivez au moins 30 caractères.», лічильник «3 / 30»; 30 символів пробілів → не проходить.
- `yana@gmial.com` → підказка «Vouliez-vous dire yana@gmail.com ?», клік підставляє; `yana@maison.fr` → без підказок; `yanagmail.com` → «Il manque le signe @».
- Кнопка завжди активна; порожня форма → помилки, фокус на «Nom».
- Автозаповнення Chrome — поле темне, як інші.
- Немає помилок CSP, `npm run build` зелений.
