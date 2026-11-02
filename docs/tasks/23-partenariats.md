# Завдання 23 · Сторінка «Partenariats» (для брендів)

Прочитай CLAUDE.md. Спершу має бути зроблене **завдання 21** (спільні елементи форм).
Кроки **A → E**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: сторінка **Partenariats** — desktop `47:379`, mobile `48:439`. «Merci» — **États** `55:492` / `55:502`.
Адреса: `/{lang}/partenariats/` (path є в `nav.ts`; додай у `builtPages`). Посилання «Media kit» у футері веде на `#media-kit` — дай цей `id` блоку.

Дані — `src/content/pages/{fr,en,it}/partenariats.json` (колекція, Zod + Keystatic). **Правило для заглушок:** у Figma багато `[X] %`,
`[Marque]`, `[date]`. На сайті такі місця **не показуємо**: порожнє значення → блок (або рядок) ховається + попередження під час збірки
(`LC_STRICT=1` — збірка падає). Нічого не вигадувати.

---

## A · 01 Intro

- Desktop: рядок, проміжок 80, padding 96 / 120. Ліворуч текст (680), проміжок 28: eyebrow «Partenariats» → H1 «Votre marque, racontée comme je raconte ma vie» (52 → 32) →
  «Je travaille avec des marques que j’utilise vraiment. Pour vous, ça veut dire des contenus crédibles, vus par une audience qui me fait confiance.» (18 → 16) →
  кнопки **Proposer un projet** (Primary → `#proposer`) + **Télécharger le media kit** (Outline → PDF).
- Праворуч фото 520 × 640 (радіус 4) — поки `src/assets/img/home/brands.jpg` (Luigi в ситуації), `object-position` підбери, щоб обличчя було в кадрі.
  Текст по центру висоти фото.
- Mobile: фото **зверху** 358 × 400, далі текст, кнопки стовпчиком на всю ширину; padding 32 / 16 / 56, проміжок 20.
- **Media kit**: `settings.json` → `mediaKit: { file: "", year: "", pages: null }` (PDF кладемо в `public/media-kit/`).
  Файлу немає → кнопки media kit ведуть на `#proposer` з текстом «Demander le media kit».

## B · 02 Audience

- Заголовок секції: eyebrow «Audience» → H2 «Mon audience en chiffres» (48 → 30) → текст Body M (макс. 760). Фон секції `--color-bg-alt`.
- **4 цифри** (рядок 4 × 302, проміжок 24; mobile 2 × 2, проміжок 16): лінія зверху, padding-top 24, проміжок 8:
  число 64 (mobile 40) через `StatValue` + анімація count-up (завдання 12) → підпис Body S.

| число  | підпис               |
| ------ | -------------------- |
| 1,7 M+ | abonnés Instagram    |
| 4,8 %  | taux d’engagement    |
| 50 M+  | impressions par mois |
| 500+   | collaborations       |

Ці числа беремо **з тих самих даних, що на головній** (одне джерело — не дублювати; якщо на головній їх немає — винеси в `settings.json → stats`).

- **Pays / Âge** — дві картки поруч (`--color-card`, радіус 4, padding 32, проміжок 16; mobile одна під одною, padding 20):
  рядок = назва ліворуч + `NN %` праворуч (Body S), під ним смужка 6 px (фон `--color-border`, заповнення `--color-text`, радіус 3), проміжок 6.
  Ширина заповнення = відсоток (через `style.setProperty('--w', …)` у скрипті або клас-утиліта — **без inline-стилів**, CSP).
  Країни: France, Italie, États-Unis, Autres. Вік: 18–24, 25–34, 35–44, 45+.
  Значень зараз немає → обидві картки сховані. Mobile показує і «Âge» теж (у Figma лише «Pays» — так місця менше, але дані потрібні брендам).
- Підпис під картками: «Données au [date] · Source : Instagram Insights» (Body S, secondary); без дати — ховаємо разом із картками.

## C · 03 Collaborations + 04 Méthode

**Collaborations** — H2 «Ce que je propose», 4 картки (рядок 4 × 302, проміжок 24): `--color-card`, радіус 4, padding 28, проміжок 14,
назва (H3 28) → опис (Body S, secondary) → внизу (притиснуто до низу картки) деталі Body S:

| назва              | опис                                                              | деталі                                               |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| Contenus Instagram | Posts, reels et stories, tournés et montés par mon équipe.        | Formats : posts, reels, stories. Photo et vidéo pro. |
| Ambassadeur        | Une présence sur l’année, avec plusieurs prises de parole.        | Durée : [à préciser] → ховаємо, поки порожньо        |
| Événements         | Lancements, press trips, soirées. Je viens, je filme, je partage. | Zones : [à préciser] → ховаємо                       |
| Sur mesure         | Une idée qui ne rentre dans aucune case ? Parlons-en.             | — (немає)                                            |

- Hover — як текстові картки (завдання 13). Уся картка — посилання на `#proposer` з вибраним типом (`?type=ambassadeur#proposer` → вибраний чип у формі).
- Tablet 768–1023: 2 × 2. Mobile: стовпчиком, padding 20, назва 18, лише короткий опис (як у Figma) — деталі ховаємо.

**Méthode** — H2 «Comment on travaille», 4 кроки (рядок 4 × 302): лінія зверху, padding-top 24, проміжок 12: номер «01» (28, `--color-red-text`) → назва (18) → текст Body S.
Brief / Proposition / Création / Rapport — тексти з Figma. Mobile: рядок «номер (18) + назва й текст», проміжок 16, padding-top 14.

## D · 05 Références + 06 Presse / Media kit

**Références** — H2 «Ils m’ont fait confiance»:

- Логотипи брендів: сітка 6 × 2 (200 × 80, проміжок 16; mobile 3 × 2, проміжок 12), логотипи світлі (монохром `--color-text-2`, hover → `--color-text`).
  Якщо можна — візьми логотипи з тих самих даних, що бігуча стрічка «Presse» / бренди на головній. Поки логотипів немає → сітка схована.
- Кейси (2 поруч, проміжок 24; mobile 1): фото 628 × 380 → «[Marque] · [Type]» (eyebrow) → назва кампанії (28) → 3 результати (число 18 + підпис 14, проміжок 40):
  vues / engagement / codes utilisés. Кейсів немає → блок схований. Коли **вся** секція порожня — ховаємо її разом із заголовком.

**Presse + Media kit** (рядок, проміжок 80):

- Ліворуч «Dans la presse»: список статей (логотип 120 × 40 → назва + джерело → Link Accent «Lire»), лінія між рядками, padding 20 / 0.
  Дані — **ті самі, що «Presse» на головній** (перші 3), без дублювання.
- Праворуч картка **Media kit** 440 (`id="media-kit"`, `--color-card`, padding 40, проміжок 20): прев'ю 360 × 240 → «Media kit 2026» (28) →
  «Audience, formats, tarifs indicatifs et références. PDF, N pages.» → **Télécharger le PDF** (Primary, на всю ширину, `download`).
  Без файлу — див. A.
- Mobile: спершу статті, потім картка; у статтях без логотипа (як у Figma).

## E · 07 Proposer un projet (`id="proposer"`)

- Desktop: ліворуч текст 440 (eyebrow «Proposer un projet» → H2 «Parlons de votre marque» → «Je lis chaque proposition. Plus le brief est précis, plus ma réponse le sera.» →
  e-mail партнерств `settings.emails.partnerships` як посилання `mailto:` (18)), праворуч форма, проміжок 96.
- Поля (компоненти із завдання 21), по 2 в рядку на desktop, стовпчиком на mobile. **На mobile ті самі поля**, що на desktop (у Figma частина прибрана — лишаємо всі, вони необовʼязкові):

| поле                  | тип                                                                                                         | placeholder               | обовʼязкове |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- | ----------- |
| Marque                | text, `autocomplete="organization"`                                                                         | Nom de la marque          | так         |
| Site web              | url                                                                                                         | www.                      | ні          |
| Votre nom             | text, `autocomplete="name"`                                                                                 | Prénom Nom                | так         |
| E-mail                | email                                                                                                       | vous@marque.com           | так         |
| Type de collaboration | ChipGroup: Contenus Instagram (вибрано) · Ambassadeur · Événement · Sur mesure                              | —                         | так         |
| Budget                | select: «Choisir» · Moins de 5 000 € · 5 000 – 15 000 € · 15 000 – 50 000 € · Plus de 50 000 € · À discuter | —                         | ні          |
| Dates souhaitées      | month                                                                                                       | —                         | ні          |
| Message               | textarea                                                                                                    | Objectif, produit, idées… | так         |
| Consentement          | «J’accepte que mes informations soient utilisées pour répondre à ma demande. Politique de confidentialité.» | —                         | так         |

⚠️ Діапазони бюджету — пропозиція, узгодити з Luigi (Keystatic — список у `partenariats.json`).

- Кнопка **Envoyer la proposition** (Primary; mobile — на всю ширину).
- Успіх → `FormThanks`: «Merci pour votre proposition.» / «Je lis chaque brief. Si le projet me correspond, je reviens vers vous par e-mail.» / Link Accent «Retour aux partenariats» (→ верх сторінки).
- `?type=…` з карток Collaborations вибирає чип і прокручує до форми.

## SEO

- `<title>` «Partenariats — Luigi Contessi», description «Collaborations avec Luigi Contessi : contenus Instagram, ambassadeur, événements. Audience, méthode et media kit.»
- Тексти EN / IT — переклад тим самим простим стилем (EN «Partnerships», IT «Collaborazioni»).

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920 — як у Figma, без горизонтальної прокрутки.
- Порожні дані (зараз): немає жодного `[X]`, `[Marque]`, `[date]` на сторінці; у консолі збірки — список попереджень, що заповнити.
- Цифри рахуються при прокрутці (count-up), зменшений рух — одразу кінцеві числа.
- Клік по картці «Ambassadeur» → форма з вибраним «Ambassadeur». Футер «Media kit» → блок media kit.
- Форма: перевірки, пастка для ботів, «bientôt» без endpoint, «Merci» з endpoint.
- Немає помилок CSP, `npm run build` зелений.
