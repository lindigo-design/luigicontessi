// Адмінка текстів (лише локально: npm run dev → http://127.0.0.1:4321/keystatic).
// Поля мають збігатися зі схемою в src/content.config.ts.
import { config, fields, singleton } from '@keystatic/core';

const txt = (label: string, opts: { multiline?: boolean; max?: number } = {}) =>
  fields.text({
    label,
    multiline: opts.multiline,
    validation: { isRequired: true, length: { min: 1, max: opts.max } },
  });
const optional = (label: string, multiline = false) => fields.text({ label, multiline });
const link = (label: string) => fields.object({ label: txt(`${label}: напис`) }, { label });
const img = (label: string) =>
  fields.object({ alt: optional('Опис фото для незрячих (порожньо = декоративне)') }, { label });
const list = <T extends Parameters<typeof fields.array>[0]>(
  item: T,
  label: string,
  itemLabel: (p: any) => string,
) => fields.array(item, { label, itemLabel });

const homeSchema = {
  seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
  seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
  promo: fields.object(
    { text: txt('Текст смуги'), code: txt('Код, який копіюється') },
    { label: '0 · Промо-смуга' },
  ),
  hero: fields.object(
    {
      eyebrow: txt('Підпис над заголовком'),
      title: txt('Заголовок H1 (новий рядок = перенос на desktop)', { multiline: true }),
      primary: link('Кнопка 1 (світла)'),
      secondary: link('Кнопка 2 (контур)'),
      image: img('Фото hero'),
      cards: list(
        fields.object({ tag: txt('Підпис'), name: txt('Назва'), image: img('Фото') }),
        'Картки справа (до 3)',
        (p) => p.fields.name.value,
      ),
    },
    { label: '1 · Hero' },
  ),
  about: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      stats: list(
        fields.object({ value: txt('Цифра'), label: txt('Підпис') }),
        'Цифри',
        (p) => `${p.fields.value.value} ${p.fields.label.value}`,
      ),
      link: link('Посилання'),
      image: img('Портрет'),
    },
    { label: '2 · À propos' },
  ),
  quote: fields.object(
    { text: txt('Цитата', { multiline: true }), author: txt('Автор'), image: img('Фон') },
    { label: '3 · Цитата' },
  ),
  press: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      link: link('Посилання «вся преса»'),
      items: list(
        fields.object({
          meta: txt('Тип · дата'),
          title: txt('Назва'),
          excerpt: txt('Цитата', { multiline: true }),
          action: txt('Напис посилання'),
        }),
        'Публікації',
        (p) => p.fields.title.value,
      ),
    },
    { label: '3b · Преса' },
  ),
  news: fields.object(
    {
      index: txt('Номер секції'),
      eyebrow: txt('Підпис'),
      title: txt('Заголовок (desktop)', { multiline: true }),
      titleMobile: txt('Заголовок (mobile)'),
      items: list(
        fields.object({
          tag: txt('Підпис (Collection / Coup de cœur · Lien affilié)'),
          name: txt('Назва'),
          description: optional('Опис (видно в активній картці)', true),
          action: txt('Напис посилання'),
          image: img('Фото'),
        }),
        'Картки (5)',
        (p) => p.fields.name.value,
      ),
    },
    { label: '4 · Nouveautés' },
  ),
  universes: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок', { multiline: true }),
      items: list(
        fields.object({ name: txt('Назва'), image: img('Мініатюра') }),
        'Рубрики',
        (p) => p.fields.name.value,
      ),
    },
    { label: '5 · Univers' },
  ),
  collection: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      cta: link('Кнопка'),
      items: list(
        fields.object({ name: txt('Назва'), price: txt('Ціна'), image: img('Фото') }),
        'Товари (рівно 3)',
        (p) => p.fields.name.value,
      ),
    },
    { label: '6 · La collection' },
  ),
  privileges: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      link: link('Посилання'),
      codes: list(
        fields.object({
          disclosure: txt('Позначка (Partenariat — обовʼязково)'),
          offer: txt('Пропозиція'),
          code: txt('Код'),
          brandLink: txt('Напис посилання'),
          brandUrl: fields.url({ label: 'Сайт марки (https://…)' }),
        }),
        'Коди',
        (p) => p.fields.code.value,
      ),
    },
    { label: '7 · Privilèges' },
  ),
  yachts: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      specs: list(
        fields.object({ label: txt('Назва'), value: txt('Значення') }),
        'Характеристики',
        (p) => p.fields.label.value,
      ),
      primary: link('Кнопка 1'),
      secondary: link('Кнопка 2'),
      disclosure: txt('Хто продає'),
      image: img('Фото яхти'),
    },
    { label: '8 · Yachts' },
  ),
  instagram: fields.object(
    {
      followers: txt('Кількість підписників'),
      cta: link('Кнопка'),
      images: list(img('Фото'), 'Фото стрічки (6)', () => 'Фото'),
    },
    { label: '9 · Instagram' },
  ),
  faq: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      link: link('Посилання'),
      items: list(
        fields.object({ question: txt('Питання'), answer: txt('Відповідь', { multiline: true }) }),
        'Питання',
        (p) => p.fields.question.value,
      ),
      image: img('Фото'),
    },
    { label: '10 · FAQ' },
  ),
  brands: fields.object(
    {
      eyebrow: txt('Підпис'),
      testimonials: list(
        fields.object({
          quote: txt('Відгук (лише реальний, зі згоди марки)', { multiline: true }),
          name: txt('Імʼя'),
          role: txt('Посада, марка'),
        }),
        'Відгуки',
        (p) => p.fields.name.value,
      ),
      titleLine1: txt('Заголовок, рядок 1'),
      titleLine2: txt('Заголовок, рядок 2'),
      cta: link('Кнопка'),
      sub: txt('Підпис під заголовком'),
      link: link('Посилання'),
      image: img('Фон'),
    },
    { label: '11 · Pour les marques' },
  ),
};

const home = (lang: 'fr' | 'en' | 'it', label: string) =>
  singleton({
    label,
    path: `src/content/pages/${lang}/home`,
    format: { data: 'json' },
    schema: homeSchema,
  });

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Luigi Contessi' },
    navigation: {
      Головна: ['homeFr', 'homeEn', 'homeIt'],
      Сайт: ['settings'],
    },
  },
  singletons: {
    homeFr: home('fr', 'Головна · FR'),
    homeEn: home('en', 'Головна · EN'),
    homeIt: home('it', 'Головна · IT'),
    settings: singleton({
      label: 'Налаштування сайту',
      path: 'src/content/site/settings',
      format: { data: 'json' },
      schema: {
        name: txt('Імʼя / назва'),
        instagramHandle: txt('Instagram: нік'),
        instagramUrl: fields.url({
          label: 'Instagram: посилання',
          validation: { isRequired: true },
        }),
        socials: list(
          fields.object({
            label: txt('Скорочення (IG, YT…)'),
            name: txt('Назва'),
            url: fields.url({ label: 'Посилання (порожньо = не показувати)' }),
          }),
          'Соцмережі',
          (p) => p.fields.name.value,
        ),
        features: fields.object(
          {
            shop: fields.checkbox({ label: 'Магазин увімкнено (Boutique, Panier, CGV)' }),
            currencySwitch: fields.checkbox({ label: 'Перемикач валют EUR / USD' }),
          },
          { label: 'Функції' },
        ),
      },
    }),
  },
});
