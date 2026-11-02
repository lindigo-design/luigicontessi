// Головні налаштування сайту Luigi Contessi.
// Мови: fr (основна), en, it. Keystatic і React — лише в режимі dev.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import { locales, defaultLocale } from './src/i18n/locales.js';
import { readFile, writeFile } from 'node:fs/promises';
import { minify } from 'vite';

// Loader K♥ (public/scripts/loader.js) — звичайний async-скрипт поза бандлом Vite; після збірки
// стискаємо його (< 3 КБ), а в репозиторії лишається читабельний код із коментарями.
const minifyLoader = {
  name: 'lc-minify-loader',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const file = new URL('scripts/loader.js', dir);
      const { code, errors } = await minify('loader.js', await readFile(file, 'utf8'), {
        compress: true,
        mangle: true,
      });
      if (errors.length) throw new Error(`loader.js: ${errors[0].message}`);
      await writeFile(file, code);
    },
  },
};

const isDev = process.argv.includes('dev');
// ⚙️ Адреса сайту: на хостингу передається змінною LC_SITE_URL.
const site = process.env.LC_SITE_URL || 'https://luigicontessi.com';
// Підпапка сайту: на GitHub Pages це /luigicontessi, на власному домені — '/'.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  // У dev — 'ignore', бо адмінка Keystatic відкриває адреси без «/» у кінці.
  trailingSlash: isDev ? 'ignore' : 'always',
  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: { fr: 'fr-FR', en: 'en-GB', it: 'it-IT' },
      },
    }),
    markdoc(),
    minifyLoader,
    ...(isDev ? [react(), keystatic()] : []),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp', config: { webp: { quality: 90 } } },
  },
  // Сувора CSP лише для зібраного сайту (у dev вона заважає адмінці Keystatic).
  security: isDev ? {} : { csp: true },
  build: { inlineStylesheets: 'never', assetsPrefix: undefined },
  vite: {
    build: { assetsInlineLimit: 0, sourcemap: false },
  },
});
