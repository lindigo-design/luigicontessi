// «Схема» текстів: які поля обовʼязкові. Якщо чогось бракує — збірка зупиниться і покаже де.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().min(1);
const link = z.object({ label: text });
const img = z.object({ alt: z.string() });

// Рубрики Journal (?categorie=…). Також звʼязок рядків «Univers» на головній зі сторінкою Journal.
export const articleCategories = [
  'automobiles',
  'horlogerie',
  'voyages',
  'yachts',
  'jets',
  'art-de-vivre',
] as const;

const homeSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  // Промо-смуга: «Code» · купон LUIGI10 · умова (offerShort — коротко на mobile)
  promo: z.object({ label: text, code: text, offer: text, offerShort: text }),
  hero: z.object({
    eyebrow: text,
    title: text,
    primary: link,
    secondary: link,
    image: img,
    cards: z.array(z.object({ tag: text, name: text, image: img })).max(3),
  }),
  about: z.object({
    eyebrow: text,
    title: text,
    body: text,
    stats: z.array(text).max(4), // id цифр із settings.json → stats (одне джерело для всього сайту)
    link,
    image: img,
  }),
  quote: z.object({ text, author: text, image: img }),
  press: z.object({
    eyebrow: text,
    title: text,
    link,
    items: z.array(z.object({ meta: text, title: text, excerpt: text, action: text })),
  }),
  news: z.object({
    index: text,
    eyebrow: text,
    title: text,
    titleMobile: text,
    items: z.array(
      z.object({
        tag: text,
        name: text,
        description: z.string().max(110), // до 2 рядків у великій картці
        action: text,
        image: img,
        product: z.string().optional(), // slug товару → картка веде на його сторінку
        favorite: z.string().optional(), // slug з Coups de cœur → назва звідти, веде на coups-de-coeur/?categorie=…
      }),
    ),
  }),
  universes: z.object({
    eyebrow: text,
    title: text,
    items: z.array(
      z.object({
        name: text,
        image: img,
        // рубрика Journal: рядок веде на journal/?categorie=<рубрика>; порожньо — на весь Journal
        category: z.enum(articleCategories).or(z.literal('')).optional(),
      }),
    ),
  }),
  collection: z.object({
    eyebrow: text,
    title: text,
    body: text,
    cta: link,
    items: z
      .array(
        z.object({
          name: text,
          price: text,
          image: img,
          product: z.string().optional(), // slug товару → картка веде на його сторінку
        }),
      )
      .length(3),
  }),
  privileges: z.object({
    eyebrow: text,
    title: text,
    body: text,
    link,
    codes: z.array(
      z.object({
        disclosure: text,
        offer: text,
        code: text,
        brandLink: text,
        brandUrl: z.string().nullish(),
      }),
    ),
  }),
  yachts: z.object({
    eyebrow: text,
    title: text,
    body: text,
    specs: z.array(z.object({ label: text, value: text })),
    primary: link,
    secondary: link,
    disclosure: text,
    image: img,
  }),
  instagram: z.object({ followers: text, cta: link, images: z.array(img) }),
  faq: z.object({
    eyebrow: text,
    title: text,
    link,
    items: z.array(z.object({ question: text, answer: text })),
    image: img,
  }),
  brands: z.object({
    eyebrow: text,
    testimonials: z.array(z.object({ quote: text, name: text, role: text })),
    titleLine1: text,
    titleLine2: text,
    cta: link,
    sub: text,
    link,
    image: img,
  }),
});

const home = defineCollection({
  loader: glob({ pattern: '*/home.json', base: './src/content/pages' }),
  // «Presse»: необовʼязкове фото картки (шлях відносно JSON: ../../../assets/img/press/…) і кадр
  // (imagePosition, напр. «50% 87%»). Без фото — картка як раніше. logo / url — для «Dans la presse» на Partenariats.
  schema: ({ image }) =>
    homeSchema.extend({
      press: homeSchema.shape.press.extend({
        items: z.array(
          homeSchema.shape.press.shape.items.element.extend({
            image: image().optional(),
            imagePosition: z.string().optional(),
            logo: image().optional(), // логотип медіа 120 × 40 (Partenariats → «Dans la presse»)
            url: z.string().optional(), // посилання на статтю; порожньо — заглушка «Lien bientôt disponible»
          }),
        ),
      }),
    }),
});

const site = defineCollection({
  loader: file('./src/content/site/settings.json', {
    parser: (raw) => [{ id: 'settings', ...JSON.parse(raw) }],
  }),
  schema: z.object({
    name: text,
    instagramHandle: text,
    instagramUrl: z.url(),
    socials: z.array(
      z.object({ label: text, name: text, url: z.union([z.url(), z.literal('')]).nullish() }),
    ),
    features: z.object({
      shop: z.boolean(),
      currencySwitch: z.boolean(),
      // Демо-яхти (ілюстрації для презентації) на сторінці Yachts. На живому сайті — false.
      yachtDemo: z.boolean().default(false),
    }),
    // Чи підключені сервіси, яким потрібна згода (CNIL). Хоч одне true → банер cookies і «Paramètres cookies».
    consent: z
      .object({ analytics: z.boolean(), affiliates: z.boolean() })
      .default({ analytics: false, affiliates: false }),
    // Сервіси зі згодою для таблиці на сторінці Cookies (рядок — лише коли його категорія увімкнена в consent).
    // Не додавати сервісів, яких на сайті немає.
    consentServices: z
      .array(
        z.object({
          name: z.string().min(1), // назва cookie / сервісу
          category: z.enum(['analytics', 'affiliates']),
          purpose: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
          duration: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
        }),
      )
      .default([]),
    // Куди форми надсилають дані (PHP на хостингу або сервіс форм). Порожньо — «arrive bientôt».
    forms: z.object({ endpoint: z.string() }).default({ endpoint: '' }),
    // Пошта для відповідей і посилань «écrivez-moi». Порожньо — «[e-mail]» і попередження під час збірки.
    // Промокоди кошика (перевірка поки в браузері). TODO: Shopify discount — окремий етап.
    shopCodes: z
      .array(z.object({ code: text, percent: z.number().int().min(1).max(100) }))
      .default([]),
    // Великі цифри сайту (головна, Partenariats) — одне джерело. value — як показати мовою сторінки,
    // count / decimals — для анімації 0 → count (немає count — без анімації).
    stats: z
      .array(
        z.object({
          id: text,
          count: z.number().nonnegative().nullish(),
          decimals: z.number().int().min(0).max(2).nullish(),
          value: z.object({ fr: text, en: text, it: text }),
          label: z.object({ fr: text, en: text, it: text }),
        }),
      )
      .default([]),
    // Media kit для брендів: PDF у public/media-kit/ (file — назва файлу). Порожньо — «Demander le media kit».
    mediaKit: z
      .object({ file: z.string(), year: z.string(), pages: z.number().int().positive().nullable() })
      .default({ file: '', year: '', pages: null }),
    emails: z
      .object({
        contact: z.string(),
        press: z.string(),
        partnerships: z.string(),
        yachts: z.string().default(''),
      })
      .default({ contact: '', press: '', partnerships: '', yachts: '' }),
    // Продавець яхт, якого представляє Luigi. name порожній — «mon partenaire» у текстах,
    // секція «Le vendeur» і логотипи сховані. logo — файл у src/assets/img/yachts/partner/.
    yachtPartner: z
      .object({
        name: z.string(),
        logo: z.string(),
        url: z.string(),
        about: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
        legal: z.string(), // raison sociale · adresse · numéro d’immatriculation
      })
      .default({ name: '', logo: '', url: '', about: { fr: '', en: '', it: '' }, legal: '' }),
  }),
});

// Товари: один файл на товар (src/content/products/<slug>.json), тексти трьома мовами всередині.
// Фото — імена файлів у src/assets/img/products/<slug>/. Назва товару — без кольору.
// Необовʼязкові поля можна пропустити (товари-заглушки) або лишити порожніми (так зберігає Keystatic).
const tr = (v: z.ZodString) => z.object({ fr: v, en: v, it: v });
const productSchema = z
  .object({
    slug: text,
    line: text,
    name: tr(text),
    price: z.number().positive().nullish(), // EUR; null → «[Prix]»
    summary: tr(z.string().max(200)).optional(),
    defaultColor: z.string().optional(),
    colors: z
      .array(
        z.object({
          id: text,
          label: tr(z.string()).optional(),
          swatch: z.array(z.string()).max(2).optional(), // градієнт кружка 0 % → 100 %
          images: z.array(text).min(1),
        }),
      )
      .min(1),
    sizes: z.array(z.object({ id: text, soldOut: z.boolean().optional() })).default([]),
    defaultSize: z.string().optional(), // вибраний за замовчуванням (Figma: M)
    details: z.array(z.object({ title: tr(text), body: tr(text) })).default([]),
    luigi: z.object({ quote: tr(z.string()), text: tr(z.string()), image: z.string() }).optional(),
    related: z.array(text).default([]),
    seo: z
      .object({ title: tr(z.string().max(70)), description: tr(z.string().max(170)) })
      .optional(),
  })
  .refine((p) => !p.defaultColor || p.colors.some((c) => c.id === p.defaultColor), {
    message: 'defaultColor має збігатися з id одного з кольорів',
    path: ['defaultColor'],
  });

const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: productSchema,
});

// Коди партнерів: один файл = одна пропозиція (src/content/codes/<id>.json).
// Фото й логотипи — у src/assets/img/codes/. Прострочені коди у збірку не потрапляють (helpers.ts).
export const codeCategories = ['mode', 'tech', 'mobilite', 'beaute', 'voyages'] as const;
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'дата у форматі РРРР-ММ-ДД')
  .nullish();
const codeSchema = z.object({
  id: text,
  brand: text, // назва марки, не перекладається
  logo: z.string().nullish(), // без логотипа — сіра плашка «LOGO»
  category: z.enum(codeCategories),
  offer: tr(text),
  conditions: tr(z.string().max(140)).optional(),
  conditionsShort: tr(z.string().max(140)).optional(), // для mobile
  code: z.string().regex(/^[A-Z0-9]+$/, 'код — лише великі латинські літери й цифри'),
  url: z.url().startsWith('https://', 'посилання марки — лише https://').nullish(),
  addedAt: day,
  expiresAt: day, // після цієї дати код зникає зі сторінки
  featured: z.boolean().default(false), // «À la une» — не більше одного
  image: z.string().nullish(), // фото для «À la une»
  order: z.number().int().optional(), // порядок, коли дат немає або вони однакові
});

// Яхти: один файл на яхту (src/content/yachts/<slug>.json). Назва не перекладається.
// demo: true — ілюстрація для презентації (згенероване фото), показується лише з features.yachtDemo.
// price / year / cabins: null — «Sur demande» / «—» (нічого не вигадуємо).
// Текст трьома мовами, який може бути порожнім (тоді блок схований).
const empty3 = { fr: '', en: '', it: '' };
const trEmpty = z.object({ fr: z.string(), en: z.string(), it: z.string() }).default(empty3);

const yachts = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/yachts' }),
  schema: ({ image }) =>
    z.object({
      slug: text,
      name: text,
      length: z.number().positive(), // метри; фільтр: < 30 / 30–50 / > 50
      year: z.number().int().nullable(),
      cabins: z.number().int().nonnegative().nullable(),
      price: z.number().positive().nullable(), // EUR
      featured: z.boolean().default(false), // одна яхта «À la une»
      image: image(),
      imageAlt: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
      demo: z.boolean().default(false),
      order: z.number().default(0),

      // ---- Fiche yacht (завдання 27). Порожньо (null / "") — рядок / картка / секція схована.
      builder: z.string().nullish(), // chantier
      architect: z.string().nullish(),
      refit: z.number().int().nullish(), // рік переобладнання
      beam: z.number().positive().nullish(), // largeur, м
      draft: z.number().positive().nullish(), // tirant d’eau, м
      guests: z.number().int().nonnegative().nullish(),
      crew: z.number().int().nonnegative().nullish(),
      cruiseSpeed: z.number().positive().nullish(), // вузли
      engines: z.string().nullish(),
      flag: trEmpty, // pavillon
      port: trEmpty, // порт базування
      headline: trEmpty, // «Pensé pour vivre en mer, pas seulement pour naviguer»
      intro: z
        .object({ fr: z.string().max(220), en: z.string().max(220), it: z.string().max(220) })
        .default(empty3),
      summaryTitle: trEmpty, // заголовок «Résumé»
      // 3 фото біля головного. Без image — у демо сіра заглушка з підписом, без демо — схована.
      gallery: z
        .array(z.object({ image: image().optional(), label: trEmpty }))
        .max(3)
        .default([]),
      // Карусель «À bord»: назва кімнати + палуба
      interiors: z
        .array(z.object({ image: image().optional(), title: trEmpty, deck: trEmpty }))
        .default([]),
      // Плани палуб (SVG, світлі лінії у файлі)
      decks: z.array(z.object({ id: text, label: trEmpty, plan: image().optional() })).default([]),
      // Відеовізит: файли в public/video/yachts/<slug>/ (шляхи від кореня сайту, без base)
      video: z
        .object({
          src: z.string().default(''),
          poster: z.string().default(''),
          teaser: z.string().default(''),
          duration: z.number().positive().nullish(), // хвилини
          chapters: z.array(z.object({ t: z.number().nonnegative(), label: trEmpty })).default([]),
          captions: trEmpty, // .vtt для кожної мови
        })
        .default({ src: '', poster: '', teaser: '', chapters: [], captions: empty3 }),
      luigiWord: trEmpty, // цитата Luigi; порожньо — секції немає
      sheetPdf: z.string().default(''), // fiche technique у public/yachts/
      seo: z
        .object({ title: trEmpty, description: trEmpty })
        .default({ title: empty3, description: empty3 }),
    }),
});

// Статті Journal: src/content/articles/<slug>.json, тексти трьома мовами всередині.
// demo — приклад для презентації, draft — текст ще не готовий: обидва видно лише в перегляді (isPreview).
// partnership — позначка «Partenariat» (закон Франції про інфлюенсерів, 2023), показуємо завжди.
const articles = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      slug: text,
      category: z.enum(articleCategories),
      title: z.object({ fr: text, en: text, it: text }),
      excerpt: z.object({
        fr: z.string().max(110),
        en: z.string().max(110),
        it: z.string().max(110),
      }),
      readingTime: z.number().int().positive(), // хвилини
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // РРРР-ММ-ДД
      partnership: z.boolean().default(false),
      featured: z.boolean().default(false), // «À la une» (лише одна)
      cover: image(),
      coverAlt: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
      coverPosition: z.string().optional(), // кадр, напр. «50% 30%»
      demo: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

// Coups de cœur: src/content/favorites/<slug>.json, тексти трьома мовами всередині.
// affiliate — позначка «Lien affilié» (закон Франції про інфлюенсерів, 2023), показуємо завжди.
// demo — приклад для презентації: видно лише в перегляді (isPreview).
export const favoriteCategories = [
  'tech',
  'mode',
  'beaute',
  'mobilite',
  'voyages',
  'horlogerie',
  'art-de-vivre',
] as const;
const favorites = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/favorites' }),
  schema: ({ image }) =>
    z.object({
      slug: text,
      brand: text,
      name: z.object({ fr: text, en: text, it: text }),
      category: z.enum(favoriteCategories),
      image: image(),
      imageAlt: z.object({ fr: z.string(), en: z.string(), it: z.string() }),
      imagePosition: z.string().optional(), // кадр, напр. «50% 65%»
      affiliate: z.boolean().default(false),
      url: z.string().optional(), // зовнішнє партнерське посилання (для сторінки товару)
      code: z.string().optional(), // slug коду з колекції codes, якщо є знижка
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // РРРР-ММ-ДД
      demo: z.boolean().default(false),
    }),
});

// Сторінка «Coups de cœur»: Intro, плашка прозорості, панель і SEO (src/content/pages/<мова>/coups-de-coeur.json).
const favoritesPageSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({
    eyebrow: text,
    title: text,
    body: text,
    disclosure: text, // «Liens partenaires : …» — закон про інфлюенсерів, не прибирати
  }),
  codesLink: text, // «Seulement les codes» → Privilèges
  empty: text, // порожня рубрика
  more: text, // «Voir plus»
});
const favoritesPage = defineCollection({
  loader: glob({ pattern: '*/coups-de-coeur.json', base: './src/content/pages' }),
  schema: favoritesPageSchema,
});

// Юридичні сторінки (Mentions légales, Confidentialité, Cookies, CGV): src/content/legal/<мова>/<slug>.mdoc.
// Текст — Markdoc (у ньому можна вставляти таблиці з коду, напр. {% storage-table /%}); updated — дата редакції.
const legal = defineCollection({
  loader: glob({ pattern: '*/*.mdoc', base: './src/content/legal' }),
  schema: z.object({
    title: text, // H1
    seoTitle: text.max(70),
    seoDescription: text.max(170),
    updated: z.coerce.date(), // РРРР-ММ-ДД (YAML читає як дату)
  }),
});

// Сторінка «À propos» (src/content/pages/<мова>/a-propos.json). Цифри — id з settings.json → stats (не дублювати).
const aboutPageSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({
    eyebrow: text,
    title: text, // H1
    lead: text, // Body L
    body: text, // Body M, secondary
    imageAlt: text,
    stats: z.array(text), // id з settings.json → stats
  }),
  // Таймлайн: дані зі старого сайту Luigi; назви премій 2024 — уточнити в Luigi. Порожній рік — у перегляді
  // «[Année]», на живому сайті пункт без року схований, без жодного пункту — уся секція.
  parcours: z.object({
    eyebrow: text,
    title: text,
    items: z.array(z.object({ year: z.string(), title: text, text: z.string() })),
  }),
  // «Le roi de cœur»: текст — лише від Luigi (історія тату, «roi de cœur» і «K», чому на колекції).
  // Порожньо — у перегляді заглушка, на живому сайті секції немає. Абзаци — через порожній рядок.
  king: z.object({ eyebrow: text, title: text, text: z.string(), imageAlt: z.string().optional() }),
  // «Mes règles»: 3 картки (номер «01» — автоматично).
  rules: z.object({
    eyebrow: text,
    title: text,
    items: z.array(z.object({ title: text, text: text })),
  }),
  // Цитата на фото (citation.jpg). Підпис — settings.json → name.
  quote: z.object({ text: text, imageAlt: z.string() }),
  // «Travailler ensemble»: Partenariats + Instagram (settings.json → instagramUrl). jobTitle — для JSON-LD Person.
  together: z.object({ title: text, body: text, partnerships: text, instagram: text }),
  jobTitle: text,
});
const aboutPage = defineCollection({
  loader: glob({ pattern: '*/a-propos.json', base: './src/content/pages' }),
  schema: aboutPageSchema,
});

// Сторінка «Journal»: тексти Intro і SEO (src/content/pages/<мова>/journal.json).
const journalPageSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({ eyebrow: text, title: text, body: text }),
});
const journalPage = defineCollection({
  loader: glob({ pattern: '*/journal.json', base: './src/content/pages' }),
  schema: journalPageSchema,
});

const codes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/codes' }),
  schema: codeSchema,
});

// Сторінка «Privilèges»: src/content/pages/<мова>/privileges.json. Секції додаються по кроках.
const privilegesSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({
    eyebrow: text,
    title: text, // новий рядок = перенос на desktop
    body: text,
    // «Transparence» — обовʼязкова позначка (закон Франції про інфлюенсерів 2023)
    disclosure: z.object({ title: text, text }),
    steps: z.array(z.object({ title: text, titleMobile: z.string().optional(), text })).length(3),
  }),
  featured: z.object({ eyebrow: text }), // «À la une»; сам код — featured у колекції codes
  questions: z.object({
    eyebrow: text,
    title: text,
    body: text,
    link, // «Contact»
    items: z.array(z.object({ question: text, answer: text })).min(1),
  }),
});

const privileges = defineCollection({
  loader: glob({ pattern: '*/privileges.json', base: './src/content/pages' }),
  // 03b — блок «3 фото» (велике + два вертикальні). Шляхи відносно JSON (../../../assets/img/privileges/…).
  // alt порожній = декоративне; position — кадр фото (центр за замовчуванням).
  schema: ({ image }) =>
    privilegesSchema.extend({
      gallery: z.object({
        images: z
          .array(
            z.object({
              image: image(),
              alt: z.string(),
              position: z.enum(['top', 'center', 'bottom']).optional(),
            }),
          )
          .length(3),
      }),
    }),
});

// Сторінка «Contact»: src/content/pages/<мова>/contact.json. Куди веде кожен варіант — у коді
// (kind): partenariats / yachts — сторінки, press — пошта з settings.json, instagram — instagramUrl.
export const contactOptionKinds = ['partenariats', 'yachts', 'press', 'instagram'] as const;
const contactSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({ eyebrow: text, title: text, body: text }),
  options: z
    .array(
      z.object({
        kind: z.enum(contactOptionKinds),
        title: text,
        text,
        label: z.string().optional(), // напис кнопки; для press / instagram — сама адреса
      }),
    )
    .min(1),
  // Форма «Autre question». Теми (value) — у коді: question, code, presse, autre (?sujet=code у адресі).
  form: z.object({
    title: text,
    name: z.object({ label: text, placeholder: text }),
    email: z.object({ label: text, placeholder: text }),
    subject: z.object({
      legend: text,
      options: z.object({ question: text, code: text, presse: text, autre: text }),
    }),
    message: z.object({ label: text, placeholder: text }),
    consent: text,
    submit: text,
    thanks: z.object({ title: text, text, link }),
  }),
});

const contact = defineCollection({
  loader: glob({ pattern: '*/contact.json', base: './src/content/pages' }),
  schema: contactSchema,
});

// Сторінка «Partenariats»: src/content/pages/<мова>/partenariats.json. Секції додаються по кроках.
// Заглушки з Figma ([X] %, [Marque], [date]) не показуємо: порожнє поле — блок схований + попередження.
const partenariatsSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  intro: z.object({
    eyebrow: text,
    title: text,
    body: text,
    primary: link, // «Proposer un projet» → #proposer
    mediaKit: link, // «Télécharger le media kit» (є PDF)
    mediaKitRequest: link, // «Demander le media kit» (PDF ще немає → #proposer)
    imageAlt: z.string(),
  }),
  // 02 Audience. Відсотки й дата — з Instagram Insights; порожньо (null / "") — картки сховані.
  audience: z.object({
    eyebrow: text,
    title: text,
    body: text,
    stats: z.array(text).max(4), // id цифр із settings.json → stats
    countries: z.object({
      title: text,
      items: z.array(z.object({ label: text, percent: z.number().min(0).max(100).nullable() })),
    }),
    ages: z.object({
      title: text,
      items: z.array(z.object({ label: text, percent: z.number().min(0).max(100).nullable() })),
    }),
    date: z.string(), // «mars 2026» → «Données au mars 2026 · Source : Instagram Insights»
    source: text, // «Données au {date} · Source : Instagram Insights»
  }),
  // 03 Collaborations. type — значення чипа у формі (?type=ambassadeur#proposer).
  // details порожньо — сховано (+ попередження, крім «Sur mesure», де деталей немає за задумом).
  collaborations: z.object({
    eyebrow: text,
    title: text,
    items: z
      .array(
        z.object({
          type: z.enum(['contenus', 'ambassadeur', 'evenement', 'sur-mesure']),
          title: text,
          text,
          details: z.string().nullish(),
        }),
      )
      .length(4),
  }),
  // 04 Méthode
  method: z.object({
    eyebrow: text,
    title: text,
    steps: z.array(z.object({ title: text, text })).length(4),
  }),
  // 05 Références (логотипи й кейси — у schema нижче, бо там фото). Порожньо — секція схована.
  references: z.object({ eyebrow: text, title: text }),
  // 06 Presse (статті — ті самі, що «Presse» на головній) + Media kit
  press: z.object({ eyebrow: text, title: text }),
  mediaKit: z.object({
    title: text, // «Media kit {year}»
    text: text, // «Audience, formats, tarifs indicatifs et références.»
    pages: text, // «PDF, {pages} pages.» — лише коли відома кількість сторінок
    download: link, // «Télécharger le PDF»
    previewAlt: z.string(),
  }),
  // 07 Proposer un projet (id="proposer"). Теми чипів (value) — у коді: contenus, ambassadeur,
  // evenement, sur-mesure (?type=ambassadeur#proposer з карток Collaborations).
  proposal: z.object({
    eyebrow: text,
    title: text,
    body: text,
    form: z.object({
      brand: z.object({ label: text, placeholder: text }),
      site: z.object({ label: text, placeholder: text }),
      name: z.object({ label: text, placeholder: text }),
      email: z.object({ label: text, placeholder: text }),
      type: z.object({
        legend: text,
        options: z.object({
          contenus: text,
          ambassadeur: text,
          evenement: text,
          'sur-mesure': text,
        }),
      }),
      budget: z.object({ label: text, placeholder: text, options: z.array(text).min(1) }),
      dates: z.object({ label: text }),
      message: z.object({ label: text, placeholder: text }),
      consent: text,
      submit: text,
      thanks: z.object({ title: text, text, link }),
    }),
  }),
});

const partenariats = defineCollection({
  loader: glob({ pattern: '*/partenariats.json', base: './src/content/pages' }),
  // Фото шляхом відносно JSON (../../../assets/img/partenariats/…).
  schema: ({ image }) =>
    partenariatsSchema.extend({
      referencesItems: z.object({
        logos: z
          .array(z.object({ name: text, image: image() }))
          .max(20)
          .default([]),
        cases: z
          .array(
            z.object({
              brand: text,
              type: z.string().optional(), // «Ambassadeur»; порожньо — у мета-рядку лише марка
              title: z.string().optional(), // назва кампанії; порожньо — заголовок = марка
              image: image(),
              position: z.string().optional(), // кадр фото, напр. «50% 22%»
              alt: z.string().optional(),
              results: z
                .array(z.object({ value: text, label: text }))
                .max(3)
                .default([]),
            }),
          )
          .max(2)
          .default([]),
      }),
      mediaKitPreview: image().optional(), // прев'ю 360 × 240; немає — картка без прев'ю
    }),
});

// Сторінка «Yachts»: src/content/pages/<мова>/yachts.json. Секції додаються по кроках.
// {partner} у текстах — назва продавця з settings.json → yachtPartner (порожньо — «mon partenaire»).
const yachtsPageSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text, // desktop
    bodyMobile: text, // mobile — коротше
    primary: link, // «Voir les yachts» → #disponibles
    secondary: link, // «Demander des informations» → #demande
    partner: text, // «En partenariat avec»
    imageAlt: z.string(),
  }),
  // 02 Comment ça se passe — 4 кроки (textShort — коротший текст на mobile)
  process: z.object({
    eyebrow: text,
    title: text,
    steps: z.array(z.object({ title: text, text, textShort: z.string().optional() })).length(4),
  }),
  // 03 Yachts disponibles (id="disponibles"): фільтри за довжиною, «À la une», картки, Off-market
  available: z.object({
    eyebrow: text,
    title: text,
    filters: z.object({
      legend: text, // для читалки: «Filtrer par taille»
      all: text,
      lt30: text,
      '30-50': text,
      gt50: text,
    }),
    featured: text, // «À la une»
    empty: text, // фільтр нічого не знайшов
    emptyLink: text, // «Demandez l’off-market»
    offMarket: z.object({
      eyebrow: text,
      title: text,
      text,
      textShort: z.string().optional(),
      cta: link,
    }),
  }),
  // 05 Le vendeur — дані продавця в settings.json → yachtPartner; тут лише підписи
  seller: z.object({ eyebrow: text, link: text }), // link: «Site de {name}»
  // 06 Demande (id="demande"). Розміри (value) — як у фільтрі: lt30, 30-50, gt50, unknown.
  request: z.object({
    eyebrow: text,
    title: text,
    body: text,
    form: z.object({
      name: z.object({ label: text, placeholder: text }),
      email: z.object({ label: text, placeholder: text }),
      phone: z.object({ label: text, placeholder: text }),
      country: z.object({ label: text, placeholder: text }),
      size: z.object({
        label: text,
        placeholder: text,
        options: z.object({ lt30: text, '30-50': text, gt50: text, unknown: text }),
      }),
      budget: z.object({ label: text, placeholder: text, options: z.array(text).min(1) }),
      message: z.object({ label: text, placeholder: text }),
      consent: text, // {partner}
      submit: text,
      yacht: text, // «Yacht»
      offMarket: text, // «Accès off-market»
      change: text, // «Changer»
      thanks: z.object({ title: text, text, link }), // text: {partner}
    }),
  }),
  // 04 Pourquoi passer par moi — 3 пункти
  why: z.object({
    eyebrow: text,
    title: text,
    items: z.array(z.object({ title: text, text, textShort: z.string().optional() })).length(3),
  }),
});

const yachtsPage = defineCollection({
  loader: glob({ pattern: '*/yachts.json', base: './src/content/pages' }),
  schema: yachtsPageSchema,
});

export const collections = {
  home,
  site,
  products,
  codes,
  privileges,
  contact,
  partenariats,
  yachts,
  yachtsPage,
  articles,
  journalPage,
  favorites,
  favoritesPage,
  legal,
  aboutPage,
};
export type HomeData = z.infer<typeof homeSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type CodeData = z.infer<typeof codeSchema>;
export type PrivilegesData = z.infer<typeof privilegesSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type YachtsPageData = z.infer<typeof yachtsPageSchema>;
export type JournalPageData = z.infer<typeof journalPageSchema>;
export type AboutPageData = z.infer<typeof aboutPageSchema>;
export type FavoritesPageData = z.infer<typeof favoritesPageSchema>;
export type PartenariatsData = z.infer<typeof partenariatsSchema>;
export type CodeCategory = (typeof codeCategories)[number];
