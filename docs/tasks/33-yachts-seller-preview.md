# Завдання 33 · Yachts → блок «Le vendeur» у перегляді

Прочитай CLAUDE.md. Після кроку `npm run format` + `npm run build`, короткий звіт і стоп.

Figma: Yachts desktop «05 Le vendeur» `36:535`, mobile `37:597`; той самий блок — на Fiche yacht.
Зараз блоку на сайті не видно: він показується лише коли `settings.json → yachtPartner.name` заповнене, а продавця ще немає.
Для презентації блок потрібен — **як Audience і кейси на Partenariats**: у перегляді показуємо заглушки з Figma, на живому сайті — ховаємо.

## Що зробити

1. «Перегляд» — та сама умова, що вже є на Partenariats: `import.meta.env.DEV || import.meta.env.PUBLIC_NOINDEX === 'true'`.
   Винеси її в одну функцію `isPreview()` у `src/content/helpers.ts` і використай на Partenariats, Yachts і Fiche yacht (щоб не повторювати).
2. `yachts.astro` і `yachts/[slug].astro`: показуємо `<Seller>`, коли `partner.name || isPreview()`; передай пропс `preview`.
3. `Seller.astro`, коли `preview` і поле порожнє — текст з Figma (переклади для EN / IT — у `ui/*.json`, ключі `seller.demo.*`):

| поле          | FR (Figma)                                                                                                  | EN                                                                | IT                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| назва         | [Société]                                                                                                   | [Company]                                                         | [Società]                                               |
| опис          | [Deux phrases sur la société : depuis quand, spécialité, zones.]                                            | [Two sentences about the company: since when, speciality, areas.] | [Due frasi sull’azienda: da quando, specialità, zone.]  |
| юридичні дані | [Raison sociale] · [Adresse] · [N° d’immatriculation]                                                       | [Company name] · [Address] · [Registration no.]                   | [Ragione sociale] · [Indirizzo] · [N. di registrazione] |
| посилання     | «Site de [Société]» → `href="#"` з заглушкою (`aria-disabled`, «Lien bientôt disponible», як у завданні 17) |                                                                   |                                                         |

4. **Логотип-заглушка**, коли немає файлу: плашка 240 × 96 (mobile 160 × 64), фон `--color-image`, радіус 4, по центру напис «LOGO [SOCIÉTÉ]»
   (eyebrow, `--color-text-2`), `aria-hidden="true"`. Лише в перегляді.
5. Вигляд — як зараз (рядок, проміжок 64, по центру по висоті; mobile — логотип над текстом), фон секції `--color-bg-alt`.
6. Живий сайт (`PUBLIC_NOINDEX` ≠ `true`, `yachtPartner.name` порожній) — блоку немає, попередження під час збірки лишається.

## Перевірка

- `npm run dev` і збірка для GitHub Pages: блок «Le vendeur» є на Yachts і на Fiche yacht, як у Figma.
- Збірка без `PUBLIC_NOINDEX` — блоку немає.
- Заповнити `yachtPartner.name` тимчасово — показуються справжні дані, заглушки зникають.
- `npm run build` зелений.
