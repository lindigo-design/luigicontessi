# Завдання 38 · Сторінка «Coups de cœur» (список рекомендацій)

Прочитай CLAUDE.md. Кроки **A → D**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: **Coups de cœur** — desktop `54:379`, mobile `54:560`. Сторінка одного товару («Coup de cœur — produit», Shokz `43:379`) — **окреме завдання**.
Адреса: `/{lang}/coups-de-coeur/` (path є в `nav.ts`; додай у `builtPages` — тоді меню, футер і картки «Coup de cœur» на головній ведуть сюди).

Фото вже в проєкті, `src/assets/img/favorites/`: `shokz.jpg`, `lucibelle.jpg`, `microlino.jpg`, `mode.jpg`, `hotel.jpg`, `horlogerie.jpg`, `tech.jpg`, `art-de-vivre.jpg`.

---

## A · Дані: колекція `favorites`

`src/content/favorites/<slug>.json` (Zod + Keystatic «Coups de cœur»), тексти трьома мовами всередині:

```jsonc
{
  "slug": "shokz-openrun",
  "brand": "Shokz", "name": { "fr": "Shokz OpenRun", "en": "…", "it": "…" },   // назва в картці
  "category": "tech",            // tech | mode | beaute | mobilite | voyages | horlogerie | art-de-vivre
  "image": "../../assets/img/favorites/shokz.jpg", "imageAlt": { … }, "imagePosition": "50% 50%",
  "affiliate": true,             // «Lien affilié» — закон Франції (2023), показуємо завжди, коли true
  "url": "",                     // зовнішнє партнерське посилання (для сторінки товару)
  "code": "",                    // slug коду з колекції codes, якщо є знижка
  "date": "2026-10-01",
  "demo": false
}
```

Категорії (назви для чипів і тегу картки) — у `ui/*.json`: Tech · Mode · Beauté · Mobilité · Voyages · Horlogerie · Art de vivre (EN / IT — переклад).

**Записи (кадр — `imagePosition` з Figma):**

| slug                 | назва           | категорія    | фото             | position | demo     |
| -------------------- | --------------- | ------------ | ---------------- | -------- | -------- |
| shokz-openrun        | Shokz OpenRun   | tech         | shokz.jpg        | 50% 50%  | false    |
| lucibelle-paris      | Lucibelle Paris | beaute       | lucibelle.jpg    | 50% 65%  | false    |
| microlino            | Microlino       | mobilite     | microlino.jpg    | 50% 77%  | false    |
| mode-exemple         | [Marque]        | mode         | mode.jpg         | 50% 19%  | **true** |
| hotel-exemple        | [Hôtel]         | voyages      | hotel.jpg        | 86% 50%  | **true** |
| horlogerie-exemple   | [Marque]        | horlogerie   | horlogerie.jpg   | 50% 50%  | **true** |
| tech-exemple         | [Marque]        | tech         | tech.jpg         | 50% 43%  | **true** |
| art-de-vivre-exemple | [Marque]        | art-de-vivre | art-de-vivre.jpg | 50% 50%  | **true** |

- Усі — `affiliate: true` (так у Figma); ⚠️ перевірити з Luigi для кожного.
- `demo: true` — лише в **перегляді** (`isPreview()`, як демо-яхти і статті), на живому сайті не видно. Ті самі назви — і для карток «Coup de cœur» на головній (Shokz), щоб дані були в одному місці.

## B · 01 Intro + панель

- Intro (padding 96 / 80 / 48; mobile 40 / 16 / 24): eyebrow «Coups de cœur» → H1 «Ce que j’utilise et que je recommande» (52 → 32) →
  «Chaque objet a sa page avec mon avis, ses points faibles et, quand il existe, un code de réduction.» (18 → 16, макс. 760) →
  **плашка прозорості**: лінія зліва 2 px `--color-red`, padding-left 12, Body S secondary: «Liens partenaires : je peux recevoir une commission. Votre prix ne change pas.»
  (обовʼязково за законом про інфлюенсерів — не прибирати, завжди видно).
- Панель (padding 0 / 80 / 40; mobile — стовпчиком, проміжок 16): ліворуч **фільтри** (ChipGroup: Tout · Tech · Mode · Beauté · Mobilité · Voyages · Horlogerie · Art de vivre — лише категорії, де є записи;
  mobile — горизонтальна прокрутка), праворуч Link Accent «Seulement les codes → Privilèges» → `privileges` (текст без «→» у розмітці — стрілка в колі вже є).
- Фільтр без перезавантаження, `?categorie=…` у адресі; порожньо — «Rien dans cette rubrique pour le moment.»

## C · Сітка карток

- Фон секції `--color-bg-alt`, padding 80 (mobile 40 / 16). Сітка **4 колонки**, проміжок 48 × 24; 768–1023 — 3; < 768 — **2 колонки**, проміжок 32 × 12 (як у Figma mobile).
- Картка — та сама, що «Coup de cœur» у Nouveautés на головній (`Card / Nouveauté`, Size=Small): фото `aspect-ratio: 302 / 280` (mobile 173 / 210), радіус 4, `zoom-card` →
  тег eyebrow muted «Tech · Lien affilié» (категорія + «Lien affilié», коли `affiliate`) → назва Text/Title 18. Без опису.
- Уся картка — посилання на сторінку товару. Сторінок ще немає → заглушка `favoriteHref()` (як `articleHref()`): `aria-disabled`, «Page bientôt disponible».
- **Voir plus** (Outline, по центру; mobile — на всю ширину): спершу 8, клік — ще 8; без JS — видно всі.
- `<Image widths={[320, 480, 640]} sizes="(min-width: 1024px) 21vw, (min-width: 768px) 30vw, 45vw">`. `shokz.jpg` і `tech.jpg` лише 533 px завширшки — для 2× на desktop замало; TODO: попросити в Luigi більші фото.

## D · SEO і звʼязки

- `<title>` «Coups de cœur — Luigi Contessi», description з intro.
- Головна: «Voir tous» / посилання з карток «Coup de cœur» у Nouveautés → сюди (з `?categorie=` за категорією картки).
- JSON-LD не потрібен.

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920 — як у Figma; на 390 дві колонки, нічого не обрізано (Microlino, готель — кадр як у Figma).
- Плашка «Liens partenaires…» є завжди; тег «Lien affilié» на кожній картці з `affiliate: true`.
- Фільтри + `?categorie=`, «Voir plus».
- Живий сайт: лише Shokz, Lucibelle, Microlino; у перегляді — усі 8.
- Немає помилок CSP, `npm run build` зелений.
