# Завдання 35 · Fiche yacht (Aurora): дозаповнити сторінку для презентації

Прочитай CLAUDE.md. Кроки **A → C**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп.

Сторінка `/fr/yachts/aurora/` у перегляді виглядала напівпорожньою: 2 сірі заглушки замість 3 фото, однакове фото зверху і в «Résumé»,
у «Fiche technique» лише довжина, сірі картки «À bord», немає відео і «Le mot de Luigi».

## Що вже зроблено (не міняти)

- Нові фото в `src/assets/img/yachts/aurora/`: `pont-arriere.jpg`, `salon.jpg`, `cabine.jpg`, `salon-salle-a-manger.jpg`, `port.jpg` (2000 × 1117).
- `src/content/yachts/aurora.json` заповнено (демо-яхта, `demo: true`, видно лише в перегляді):
  - характеристики: 2019, 5 кают, 10 гостей, 8 екіпажу, 8,6 × 2,3 м, 14 вузлів, «2 × 1 900 ch», «Construction italienne», pavillon Malte, port Monaco;
  - `gallery` — 3 фото (Pont arrière, Salon, Cabine principale);
  - `interiors` — 4 картки (Salon et salle à manger, Cabine propriétaire, Pont arrière, Salon), палуба «Pont principal»;
  - `video` — тимчасово відео яхти з Partenariats (`video/partenariats/…`), поки не готовий 30-секундний ролик.

## A · «Résumé» — окреме фото

1. Схема `yachts`: нові необовʼязкові поля `summaryImage: image()` і `summaryImageAlt` (fr / en / it). Без них — як зараз (`image`).
2. Aurora: `summaryImage: "../../assets/img/yachts/aurora/port.jpg"` (яхта біля причалу в синю годину),
   alt: «Aurora à quai au crépuscule» / «Aurora moored at dusk» / «Aurora ormeggiata al crepuscolo».
3. Фото 500 × 620 вертикальне → для горизонтального файлу `object-position: 60% 50%` (корма й надбудова в кадрі). Кадр — полем `summaryImagePosition` (як `coverPosition` у Journal).

## B · Відео без розділів і тривалості

- Якщо `chapters` порожні — **рядок розділів не показуємо** (зараз під «Résumé» видно порожню смужку з крапками — прибрати).
- Якщо `duration` порожня — рядок «Visite avec Luigi · X min» показуємо без «· X min».
- Тизер і повне відео зараз один і той самий файл — це нормально для демо. Перевір, що «Regarder la visite» вмикає відео з контролами, а постер є.
- Коли буде ролик на 30 с (Seedance) — лише заміна файлів у `public/video/yachts/aurora/` і шляхів у `aurora.json`.

## C · «Le mot de Luigi» у перегляді

- Секція зараз схована (цитата порожня). Як і інші заглушки (`isPreview()`, завдання 33): у перегляді, коли `luigiWord` порожній, показуємо текст із Figma:
  FR «« Je suis monté à bord en [mois]. Ce qui m’a marqué : [ce qu’il a aimé]. »», EN «“I went on board in [month]. What struck me: [what he liked].”»,
  IT «« Sono salito a bordo a [mese]. Cosa mi ha colpito: [cosa gli è piaciuto]. »» (ключі `yachts.word.demo` в `ui/*.json`).
- **Не вигадувати** цитату Luigi — лише заглушка в дужках, щоб він сам написав.

## Також перевір

- «Le yacht»: 3 фото в ряд (243 × 300) — без сірих заглушок; головне фото — `image`.
- «Fiche technique»: 11 характеристик у сітці 4 колонки, без дірок; «Année 2019».
- «À bord»: перша картка велика (Salon et salle à manger), далі 3 менші, підписи «Pont principal»; стрілки гортають.
- Живий сайт (`PUBLIC_NOINDEX` ≠ `true`): демо-яхти не генеруються.
- `npm run build` зелений.
