# 43 · À propos → Parcours: реальні дати + червона лінія прогресу

Figma: À propos (50:378) → «02 Parcours» — desktop таймлайн **50:416**, mobile **50:551**.
Доповнює задачу 42 (розділ B). Існуючий компонент: `src/components/sections/about/Parcours.astro`.

## 1. Дані (джерело — старий сайт Luigi)

Заповнити `parcours.items` у `src/content/pages/{fr,en,it}/a-propos.json` (рядки `title` у Figma — «Les débuts / L’essor / La collection / La reconnaissance»):

| year | FR title / text                                                                                                     | EN title / text                                                                                  | IT title / text                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 2019 | Les débuts — Une seule idée est devenue un mouvement. Dès le départ, une seule règle : l’authenticité.              | The start — One idea became a movement. From day one, a single rule: authenticity.               | Gli inizi — Un’unica idea è diventata un movimento. Fin dall’inizio, una sola regola: l’autenticità.      |
| 2021 | L’essor — Des partenariats avec des marques exigeantes. Chaque collaboration a fait progresser le travail.          | Growth — Partnerships with demanding brands. Every collaboration pushed the work further.        | La crescita — Collaborazioni con marchi esigenti. Ogni progetto ha fatto crescere il lavoro.              |
| 2023 | La collection — Ouverture de Contessi Boutique. Une vision personnelle devient concrète : à porter, à vivre.        | The collection — Contessi Boutique opens. A personal vision made tangible: to wear, to live.     | La collezione — Nasce Contessi Boutique. Una visione personale diventa concreta: da indossare, da vivere. |
| 2024 | La reconnaissance — Des prix et des distinctions. Mais la vraie victoire : toucher ceux qui comprennent l’élégance. | Recognition — Awards and distinctions. But the real win: reaching those who understand elegance. | Il riconoscimento — Premi e riconoscimenti. Ma la vera vittoria: arrivare a chi capisce l’eleganza.       |

- Французькі нерозривні пробіли перед «:» (U+202F або U+00A0), апостроф `’`.
- Коментар у схемі (content.config.ts → `parcours`) оновити: «дані зі старого сайту Luigi; назви премій 2024 — уточнити в Luigi». Логіку «пункт без року схований» залишити.

## 2. Розмітка (desktop, ≥1024)

4 колонки в ряд, **без проміжку між колонками** (лінія суцільна), у кожного пункту `padding-right: 24px`.
Кожен пункт згори вниз:

1. **Rail** (висота 9): крапка 9×9 (коло) зліва + лінія 1px на всю ширину пункту, вертикально по центру крапки.
   Лінія — сірий шар `--color-border` і над ним червоний шар `--color-red`.
2. Відступ 16 → далі як було: рік (H3 28, Cal Sans) → назва (Title 18) → опис (Body S, `--color-text-2`), проміжок 8.

- Стару лінію `::before` над пунктом прибрати — тепер лінія в Rail.

## 3. Mobile (<1024)

Пункти стовпчиком; Rail вертикальний зліва: крапка 9×9 на рівні року, лінія 1px **вниз до наступного пункту** (у останнього — до кінця тексту),
сірий шар + червоний шар. Праворуч колонка тексту, проміжок 16, у пункту `padding-bottom: 32`.

## 4. Анімація «червона лінія рухається по роках»

Прогрес прив’язаний до **прокрутки** (а не одноразова поява):

- `progress` 0 → 1, коли таймлайн проходить вікно: 0 — верх списку на 85 % висоти вікна, 1 — низ списку на 40 % (desktop) / вертикальна лінія доходить до останньої крапки (mobile).
- Загальний прогрес ділиться на пункти: для пункту `i` (з n) `p_i = clamp(progress·n − i, 0, 1)`.
- Червоний шар пункту: `transform: scaleX(var(--p))` (mobile `scaleY`), `transform-origin: left` / `top`. Без анімації `width` — лише transform.
- Пункт «досягнуто», коли червона лінія дійшла до його крапки (`p_i > 0`): клас `is-reached` → крапка й рік червоні (`--color-red` / `--color-red-text`), transition 300 ms `--ease`.
  Не досягнуто — крапка `--color-border`, рік `--color-text-2` (як 2024 у Figma).
- Реалізація: один `scroll`-слухач (passive) + `requestAnimationFrame`, обчислення через `getBoundingClientRect()` списку;
  значення в CSS-змінну `--p` на кожному пункті через `el.style.setProperty` (inline-атрибути style заборонені CSP — лише зі скрипта). Слухач вмикати через IntersectionObserver лише поки секція на екрані.
- При прокрутці вгору лінія відступає назад: прогрес завжди відповідає позиції на сторінці (читається як шкала часу).
- `prefers-reduced-motion: reduce` і без JS: усі лінії червоні, усі роки червоні, без transition (статичний стан «весь шлях пройдено»).
- Стан у Figma (50:416) — кадр «посередині прокрутки»: 2019 і 2021 повністю, 2023 — частково, 2024 — ще сірий.

## 5. Перевірка

- Desktop: прокрутка вниз — червона лінія безперервно йде зліва направо, крапки й роки червоніють по черзі; вгору — відступає.
- Mobile 390: вертикальна лінія росте вниз, текст не обрізаний, пункти не накладаються.
- Зменшений рух / вимкнений JS — все червоне одразу.
- Немає помилок CSP у консолі; немає «ривків» (лише transform); `npm run build` зелений.
- FR / EN / IT — тексти з таблиці, нерозривні пробіли у FR.
