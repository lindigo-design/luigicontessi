// Функції, які дістають тексти потрібною мовою.
import { getEntry } from 'astro:content';
import type { Locale } from '../i18n/utils';

export async function getHome(lang: Locale) {
  const entry = await getEntry('home', `${lang}/home`);
  if (!entry) throw new Error(`Немає текстів головної: src/content/pages/${lang}/home.json`);
  return entry.data;
}

export async function getSettings() {
  const entry = await getEntry('site', 'settings');
  if (!entry) throw new Error('Немає файлу src/content/site/settings.json');
  return entry.data;
}
