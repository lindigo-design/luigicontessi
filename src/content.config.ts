// «Схема» текстів: які поля обовʼязкові. Якщо чогось бракує — збірка зупиниться і покаже де.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().min(1);
const link = z.object({ label: text });
const img = z.object({ alt: z.string() });

const homeSchema = z.object({
  seoTitle: text.max(70),
  seoDescription: text.max(170),
  promo: z.object({ text, code: text }),
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
      }),
    ),
  }),
  universes: z.object({
    eyebrow: text,
    title: text,
    items: z.array(z.object({ name: text, image: img })),
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
  schema: homeSchema,
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
    features: z.object({ shop: z.boolean(), currencySwitch: z.boolean() }),
    // Чи підключені сервіси, яким потрібна згода (CNIL). Хоч одне true → банер cookies і «Paramètres cookies».
    consent: z
      .object({ analytics: z.boolean(), affiliates: z.boolean() })
      .default({ analytics: false, affiliates: false }),
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
      .object({ contact: z.string(), press: z.string(), partnerships: z.string() })
      .default({ contact: '', press: '', partnerships: '' }),
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
});

const partenariats = defineCollection({
  loader: glob({ pattern: '*/partenariats.json', base: './src/content/pages' }),
  // Фото шляхом відносно JSON (../../../assets/img/partenariats/…).
  schema: ({ image }) =>
    partenariatsSchema.extend({
      referencesItems: z.object({
        logos: z
          .array(z.object({ name: text, image: image() }))
          .max(12)
          .default([]),
        cases: z
          .array(
            z.object({
              brand: text,
              type: text,
              title: text,
              image: image(),
              alt: z.string(),
              results: z.array(z.object({ value: text, label: text })).max(3),
            }),
          )
          .max(2)
          .default([]),
      }),
      mediaKitPreview: image().optional(), // прев'ю 360 × 240; немає — картка без прев'ю
    }),
});

export const collections = { home, site, products, codes, privileges, contact, partenariats };
export type HomeData = z.infer<typeof homeSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type CodeData = z.infer<typeof codeSchema>;
export type PrivilegesData = z.infer<typeof privilegesSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type PartenariatsData = z.infer<typeof partenariatsSchema>;
export type CodeCategory = (typeof codeCategories)[number];
