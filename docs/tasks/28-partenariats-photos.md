# Завдання 28 · Partenariats: нові фото з Figma, кейси GAC і Golden Concept, фото-пауза з яхтою

Прочитай CLAUDE.md. Сторінка вже зроблена (завдання 23) — тут **лише зміни з оновленого макета**.
Кроки **A → D**, після кожного `npm run format` + `npm run build`, короткий звіт і стоп, чекай «ок».

Figma: **Partenariats** — desktop `47:379` (оновлено). Mobile `48:439` у Figma ще старий — для mobile дотримуйся правил нижче.

Фото вже в проєкті, `src/assets/img/partenariats/`:

| файл                                    | що                      | де                                             |
| --------------------------------------- | ----------------------- | ---------------------------------------------- |
| `intro.jpg` (1600 × 2400)               | портрет Luigi           | 01 Intro, праворуч (замість `home/brands.jpg`) |
| `case-gac.jpg` (1600 × 2401)            | кампанія GAC            | 05 Références, кейс 1                          |
| `case-golden-concept.jpg` (1600 × 2400) | кампанія Golden Concept | 05 Références, кейс 2                          |
| `media-kit.jpg` (1200 × 1800)           | прев'ю media kit        | 06 Media kit                                   |

Фото яхти для паузи — **те саме, що на Contact**: `src/assets/img/contact/yacht.jpg`.

---

## A · 01 Intro — новий портрет

- `Intro.astro`: імпорт `partenariats/intro.jpg` замість `home/brands.jpg`. Кадр 520 × 640 (як було), `object-position: 50% 50%`.
- `widths={[400, 720, 1040, 1440]}`, `sizes="(min-width: 1024px) 40vw, 100vw"`; фото росте з екраном, як About на головній (40 % контейнера), пропорція 520 / 640.
- `imageAlt` у трьох мовах — опиши нове фото (подивись файл), просто: що на ньому, без оцінок.

## B · Нова секція «08 Yachts» — фото-пауза між «Collaborations» і «Méthode»

Figma `168:3077`: фото яхти на всю ширину, без тексту, з плавним градієнтом згори і знизу — розбавляє темну сторінку.

1. Те саме вже є на Contact (`ContactPhoto.astro`, завдання 25). **Не дублювати**: перейменуй у спільний
   `src/components/ui/PhotoBreak.astro` з пропсами `image`, `alt` (порожній → декоративне), `height` (desktop-висота з Figma при 1440),
   `positionDesktop`, `positionMobile`. Contact переведи на нього (вигляд Contact не має змінитися).
2. Тут: висота **516** при 1440 → правило CLAUDE.md: `min(100svh, max(32.25rem, 35.8vw))` на ≥ 1024;
   < 1024 — `clamp(20rem, 60vw, 32.25rem)`.
3. Кадр: desktop `object-position: 50% 33%` (як у Figma), mobile `86% 50%` (яхта в кадрі — як на Contact).
4. Градієнт — той самий, що на Contact (100 % → 75 % → 0 … 0 → 55 % → 90 % → 100 % на 0 / 6 / 20 / 60 / 80 / 93 / 100 %).
   Колір градієнта = **фон сусідніх секцій**: якщо зверху і знизу різні фони (`--color-bg` / `--color-bg-alt`) — верх і низ градієнта у відповідний колір
   (пропси `fadeTop`, `fadeBottom`), щоб не було видно шва.
5. `widths={[768, 1280, 1920, 2560]}`, `sizes="100vw"`, `loading="lazy"`, `alt=""`.
6. На сторінці: `<Collaborations />` → `<PhotoBreak … />` → `<Method />`.

## C · 05 Références — кейси GAC і Golden Concept

Макет: 2 кейси поруч, фото **628 × 464** (було 380), під ним мета-рядок, назва 28, результати.

1. Схема `referencesItems.cases` (Zod + Keystatic): `type`, `title`, `alt` — **необовʼязкові**; `results` — `default([])`.
2. Дані (fr / en / it):
   - кейс 1: `brand: "GAC"`, `image: case-gac.jpg`, `position: "50% 22%"`;
   - кейс 2: `brand: "Golden Concept"`, `image: case-golden-concept.jpg`, `position: "50% 65%"`;
   - `type`, `title`, `results` — **порожні** (у Figma там `[Type de collaboration]`, `[X] k` — реальних даних ще немає).
3. Вигляд картки:
   - фото `aspect-ratio: 628 / 464`, радіус 4, `object-position` з даних (поле `position`, через CSS-змінну класом / `style.setProperty` у скрипті — без inline-стилів);
   - мета-рядок «GAC · Ambassadeur» (eyebrow): без `type` — лише назва бренду;
   - великий заголовок (28): `title`, а якщо його немає — **назва бренду** (як у Figma: «GAC», «Golden Concept»), тоді мета-рядок не показуємо, щоб не повторювати;
   - результати (число 18 + підпис 14, проміжок 40) — лише коли є хоч один; інакше блок схований.
   - Не посилання (поки немає сторінок кейсів) → без зуму.
4. `widths={[400, 720, 1256]}`, `sizes="(min-width: 1024px) 44vw, 100vw"`.
5. Mobile: кейси один під одним, проміжок 32, фото `aspect-ratio: 358 / 264` (та сама пропорція), та сама `position`.
6. Попередження під час збірки лишити: «références: тип / результати кейсів GAC, Golden Concept».
7. Логотипи брендів у Figma досі сірі заглушки — сітка логотипів лишається схованою, поки немає файлів.

## D · 06 Media kit — прев'ю

- `partenariats.json` → `mediaKitPreview: "../../../assets/img/partenariats/media-kit.jpg"` (fr / en / it).
- Прев'ю 360 × 240 (`aspect-ratio: 3 / 2`), радіус 4, `object-position: 50% 44%` (як у Figma).
- `widths={[360, 720]}`, `sizes="360px"`. На mobile — на всю ширину картки (`sizes="calc(100vw - 72px)"`).
- Решта картки без змін (без PDF — «Demander le media kit»).

## Перевірка

- 390 / 768 / 1024 / 1440 / 1920: нові фото на місці, ніде не обрізано обличчя / головне в кадрі.
- Пауза з яхтою: немає видимого шва ні зверху, ні знизу; на 390 яхта в кадрі. Contact виглядає як раніше.
- Кейси: заголовки «GAC» і «Golden Concept», жодного `[X]` / `[Type…]` на сторінці.
- Немає помилок CSP, `npm run build` зелений.
