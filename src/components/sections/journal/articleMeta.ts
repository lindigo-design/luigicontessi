import type { CollectionEntry } from 'astro:content';
import { t, type Locale } from '../../../i18n/utils';

export type Article = CollectionEntry<'articles'>['data'];

/** «Automobiles · 5 min · Partenariat». Позначка «Partenariat» обовʼязкова (закон Франції, 2023). */
export function articleMeta(a: Article, lang: Locale) {
  return [
    t(`journal.cat.${a.category}` as const, lang),
    t('journal.min', lang).replace('{n}', String(a.readingTime)),
    a.partnership && t('journal.partnership', lang),
  ]
    .filter(Boolean)
    .join(' · ');
}
