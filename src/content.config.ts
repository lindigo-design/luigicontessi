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
    stats: z.array(z.object({ value: text, label: text })).max(4),
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
      z.object({ tag: text, name: text, description: z.string(), action: text, image: img }),
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
    items: z.array(z.object({ name: text, price: text, image: img })).length(3),
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
  }),
});

export const collections = { home, site };
export type HomeData = z.infer<typeof homeSchema>;
