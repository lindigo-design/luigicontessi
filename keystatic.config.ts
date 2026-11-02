// Адмінка текстів (лише локально: npm run dev → http://127.0.0.1:4321/keystatic).
// Поля мають збігатися зі схемою в src/content.config.ts.
import { collection, config, fields, singleton } from '@keystatic/core';
import { block, inline, wrapper } from '@keystatic/core/content-components';

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
    {
      label: txt('Слово перед кодом («Code»)'),
      code: txt('Код, який копіюється'),
      offer: txt('Умова'),
      offerShort: txt('Умова коротко (mobile)'),
    },
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
        txt('id цифри з «Сайт → Цифри» (followers, collaborations…)'),
        'Цифри (самі значення — у «Сайт → Цифри»)',
        (p) => p.value,
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
          image: fields.image({
            label: 'Фото (необовʼязково; з публікації або кадр з репортажу)',
            directory: 'src/assets/img/press',
            publicPath: '../../../assets/img/press/',
          }),
          imagePosition: optional('Кадр фото, напр. «50% 87%» (порожньо — центр)'),
          logo: fields.image({
            label: 'Логотип медіа (необовʼязково; 120 × 40, для Partenariats)',
            directory: 'src/assets/img/press',
            publicPath: '../../../assets/img/press/',
          }),
          url: optional('Посилання на статтю (порожньо — «Lien bientôt disponible»)'),
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
          description: fields.text({
            label: 'Опис для великої картки, до 2 рядків (≤ 110 знаків)',
            multiline: true,
            validation: { length: { max: 110 } },
          }),
          action: txt('Напис посилання'),
          image: img('Фото'),
          product: optional(
            'Товар (slug з «Товари», лише для тегу Collection; порожньо = як було)',
          ),
          favorite: optional(
            'Coup de cœur (slug з «Coups de cœur»): назва береться звідти, картка веде на його рубрику',
          ),
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
        fields.object({
          name: txt('Назва'),
          image: img('Мініатюра'),
          category: fields.select({
            label: 'Рубрика Journal (куди веде рядок)',
            options: [
              { label: '— весь Journal', value: '' },
              { label: 'Automobiles', value: 'automobiles' },
              { label: 'Horlogerie', value: 'horlogerie' },
              { label: 'Voyages & Hôtels', value: 'voyages' },
              { label: 'Yachts', value: 'yachts' },
              { label: 'Jets privés', value: 'jets' },
              { label: 'Art de vivre', value: 'art-de-vivre' },
            ],
            defaultValue: '',
          }),
        }),
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
        fields.object({
          name: txt('Назва'),
          price: txt('Ціна'),
          image: img('Фото'),
          product: optional(
            'Товар (slug з «Товари», напр. veste-contessi; порожньо = /collection/)',
          ),
        }),
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

// Товар: тексти трьома мовами в одному файлі (src/content/products/<slug>.json).
const tr = (label: string, opts: { multiline?: boolean; max?: number; required?: boolean } = {}) =>
  fields.object(
    Object.fromEntries(
      (['fr', 'en', 'it'] as const).map((l) => [
        l,
        fields.text({
          label: l.toUpperCase(),
          multiline: opts.multiline,
          validation: {
            isRequired: opts.required ?? false,
            length: { min: opts.required ? 1 : 0, max: opts.max },
          },
        }),
      ]),
    ),
    { label },
  );
const productSchema = {
  slug: fields.text({
    label: 'Адреса (slug): veste-contessi → /fr/collection/veste-contessi/',
    validation: { isRequired: true, length: { min: 1 } },
  }),
  line: txt('Лінія (eyebrow, не перекладається): Contessi Collection'),
  name: tr('Назва товару — без кольору', { required: true }),
  price: fields.number({ label: 'Ціна в EUR (порожньо = «[Prix]»)' }),
  summary: tr('Короткий опис (≤ 200)', { multiline: true, max: 200 }),
  defaultColor: optional('Колір за замовчуванням (id кольору)'),
  colors: list(
    fields.object({
      id: txt('id кольору (noir, navy…) — для адреси ?couleur='),
      label: tr('Назва кольору'),
      swatch: fields.array(fields.text({ label: 'HEX' }), {
        label: 'Кружок: 2 кольори градієнта (0 % → 100 %)',
        itemLabel: (p) => p.value,
      }),
      images: fields.array(fields.text({ label: 'Файл' }), {
        label: 'Фото: файли з src/assets/img/products/<slug>/ (перше — головне)',
        itemLabel: (p) => p.value,
      }),
    }),
    'Кольори (порядок = як на сторінці)',
    (p) => p.fields.id.value,
  ),
  sizes: list(
    fields.object({
      id: txt('Розмір (S, M, L…)'),
      soldOut: fields.checkbox({ label: 'Розпродано' }),
    }),
    'Розміри',
    (p) => p.fields.id.value,
  ),
  defaultSize: optional('Розмір за замовчуванням (напр. M; порожньо = не вибрано)'),
  details: list(
    fields.object({
      title: tr('Заголовок', { required: true }),
      body: tr('Текст', { multiline: true, required: true }),
    }),
    'Акордеони (Description, Composition…)',
    (p) => p.fields.title.fields.fr.value,
  ),
  luigi: fields.object(
    {
      quote: tr('Цитата', { multiline: true }),
      text: tr('Текст', { multiline: true }),
      image: optional('Фото: файл з src/assets/img/products/<slug>/'),
    },
    { label: 'Le mot de Luigi' },
  ),
  related: fields.array(fields.text({ label: 'slug товару' }), {
    label: 'Complétez le look (slug-и інших товарів)',
    itemLabel: (p) => p.value,
  }),
  seo: fields.object(
    {
      title: tr('SEO: заголовок (≤ 70)', { max: 70 }),
      description: tr('SEO: опис (≤ 170)', { multiline: true, max: 170 }),
    },
    { label: 'SEO' },
  ),
};

// Код партнера: один файл = одна пропозиція (src/content/codes/<id>.json).
const codeSchema = {
  id: fields.text({
    label: 'id (назва файлу): chapeaux-10',
    validation: { isRequired: true, length: { min: 1 } },
  }),
  brand: txt('Марка (не перекладається)'),
  logo: optional('Логотип: файл з src/assets/img/codes/ (порожньо = сіра плашка «LOGO»)'),
  category: fields.select({
    label: 'Категорія (фільтр)',
    options: [
      { label: 'Mode', value: 'mode' },
      { label: 'Tech', value: 'tech' },
      { label: 'Mobilité', value: 'mobilite' },
      { label: 'Beauté', value: 'beaute' },
      { label: 'Voyages', value: 'voyages' },
    ],
    defaultValue: 'mode',
  }),
  offer: tr('Пропозиція (−10 % sur…)', { required: true }),
  conditions: tr('Умови (≤ 140)', { multiline: true, max: 140 }),
  conditionsShort: tr('Умови коротко — для mobile (≤ 140)', { multiline: true, max: 140 }),
  code: fields.text({
    label: 'Код (великі латинські літери й цифри)',
    validation: {
      isRequired: true,
      length: { min: 1 },
      pattern: { regex: /^[A-Z0-9]+$/, message: 'Лише A–Z і 0–9' },
    },
  }),
  url: fields.url({
    label: 'Сайт марки (https://…) — поки порожнє, на сайті буде заглушка',
  }),
  addedAt: fields.date({ label: 'Додано (для сортування «Les plus récents»)' }),
  expiresAt: fields.date({ label: 'Діє до (після цієї дати код зникає; порожньо = без терміну)' }),
  featured: fields.checkbox({ label: '«À la une» — головний код (лише один!)' }),
  image: optional('Фото для «À la une»: файл з src/assets/img/codes/'),
  order: fields.integer({ label: 'Порядок, коли дат немає (0, 1, 2…)' }),
};

// Сторінка «Privilèges» (тексти; самі коди — колекція «Коди партнерів»).
const privilegesSchema = {
  seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
  seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
  intro: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок H1 (новий рядок = перенос на desktop)', { multiline: true }),
      body: txt('Текст', { multiline: true }),
      disclosure: fields.object(
        {
          title: txt('Підпис (Transparence)'),
          text: txt('Текст позначки (обовʼязково за законом)', { multiline: true }),
        },
        { label: 'Transparence' },
      ),
      steps: list(
        fields.object({
          title: txt('Заголовок'),
          titleMobile: optional('Заголовок на mobile (порожньо = як на desktop)'),
          text: txt('Пояснення (лише desktop)'),
        }),
        'Comment ça marche (3 кроки)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '01 · Intro' },
  ),
  gallery: fields.object(
    {
      images: fields.array(
        fields.object({
          image: fields.image({
            label: 'Фото',
            directory: 'src/assets/img/privileges',
            publicPath: '../../../assets/img/privileges/',
            validation: { isRequired: true },
          }),
          alt: optional('Опис фото для незрячих (порожньо = декоративне)'),
          position: fields.select({
            label: 'Кадр',
            options: [
              { label: 'Центр', value: 'center' },
              { label: 'Верх', value: 'top' },
              { label: 'Низ', value: 'bottom' },
            ],
            defaultValue: 'center',
          }),
        }),
        {
          label: 'Фото (рівно 3: велике, середнє, праве)',
          itemLabel: (p) => p.fields.alt.value || 'Фото',
          validation: { length: { min: 3, max: 3 } },
        },
      ),
    },
    { label: '03b · 3 фото (між кодами і питаннями)' },
  ),
  questions: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст під заголовком'),
      link: link('Посилання на Contact'),
      items: list(
        fields.object({
          question: txt('Питання'),
          answer: txt('Відповідь', { multiline: true }),
        }),
        'Питання (перше відкрите)',
        (p) => p.fields.question.value,
      ),
    },
    { label: '04 · Questions' },
  ),
  featured: fields.object(
    { eyebrow: txt('Підпис (À la une)') },
    { label: '02 · À la une (сам код позначається в «Коди партнерів» → «À la une»)' },
  ),
};

// Сторінка «Contact». Куди веде кожен варіант — за типом (сторінка, пошта преси, Instagram).
const contactSchema = {
  seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
  seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
  intro: fields.object(
    { eyebrow: txt('Підпис'), title: txt('Заголовок H1'), body: txt('Текст', { multiline: true }) },
    { label: 'Заголовок сторінки' },
  ),
  options: list(
    fields.object({
      kind: fields.select({
        label: 'Куди веде кнопка',
        options: [
          { label: 'Сторінка Partenariats', value: 'partenariats' },
          { label: 'Сторінка Yachts', value: 'yachts' },
          { label: 'Пошта преси (Сайт → Пошта)', value: 'press' },
          { label: 'Instagram (Сайт → instagramUrl)', value: 'instagram' },
        ],
        defaultValue: 'partenariats',
      }),
      title: txt('Назва'),
      text: txt('Опис'),
      label: optional('Напис кнопки (для пошти й Instagram — порожньо, показується адреса)'),
    }),
    'Варіанти (зліва від форми)',
    (p) => p.fields.title.value,
  ),
  form: fields.object(
    {
      title: txt('Заголовок форми'),
      name: fields.object(
        { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
        { label: 'Nom' },
      ),
      email: fields.object(
        { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
        { label: 'E-mail' },
      ),
      subject: fields.object(
        {
          legend: txt('Підпис'),
          options: fields.object(
            {
              question: txt('Question'),
              code: txt('Code partenaire (?sujet=code)'),
              presse: txt('Presse (?sujet=presse)'),
              autre: txt('Autre (?sujet=autre)'),
            },
            { label: 'Теми' },
          ),
        },
        { label: 'Sujet' },
      ),
      message: fields.object(
        { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
        { label: 'Message' },
      ),
      consent: txt('Текст згоди', { multiline: true }),
      submit: txt('Кнопка'),
      thanks: fields.object(
        {
          title: txt('Заголовок'),
          text: txt('Текст'),
          link: link('Посилання на головну'),
        },
        { label: '«Merci» після надсилання' },
      ),
    },
    { label: 'Форма «Autre question»' },
  ),
};

const contactPage = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Contact · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/contact`,
    format: { data: 'json' },
    schema: contactSchema,
  });

// Сторінка «Partenariats» (секції додаються по кроках). Порожні поля — блок на сайті схований.
const partenariatsSchema = {
  seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
  seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
  intro: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок H1', { multiline: true }),
      body: txt('Текст', { multiline: true }),
      primary: link('Кнопка «Proposer un projet»'),
      mediaKit: link('Кнопка «Télécharger le media kit» (є PDF)'),
      mediaKitRequest: link('Кнопка, поки PDF немає («Demander le media kit»)'),
      imageAlt: optional('Опис фото для незрячих'),
    },
    { label: '01 · Intro' },
  ),
  audience: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      stats: list(txt('id цифри з «Сайт → Цифри»'), 'Цифри (4)', (p) => p.value),
      countries: fields.object(
        {
          title: txt('Заголовок картки'),
          items: list(
            fields.object({
              label: txt('Країна'),
              percent: fields.number({
                label: '% (з Instagram Insights; порожньо — картка схована)',
              }),
            }),
            'Рядки',
            (p) => `${p.fields.label.value}: ${p.fields.percent.value ?? '—'} %`,
          ),
        },
        { label: 'Pays' },
      ),
      ages: fields.object(
        {
          title: txt('Заголовок картки'),
          items: list(
            fields.object({
              label: txt('Вік'),
              percent: fields.number({
                label: '% (з Instagram Insights; порожньо — картка схована)',
              }),
            }),
            'Рядки',
            (p) => `${p.fields.label.value}: ${p.fields.percent.value ?? '—'} %`,
          ),
        },
        { label: 'Âge' },
      ),
      date: optional('Дата даних (напр. «mars 2026»; порожньо — картки сховані)'),
      source: txt('Підпис під картками ({date} — дата)'),
    },
    { label: '02 · Audience' },
  ),
  collaborations: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      items: list(
        fields.object({
          type: fields.select({
            label: 'Тип (чип у формі «Proposer un projet»)',
            options: [
              { label: 'Contenus Instagram', value: 'contenus' },
              { label: 'Ambassadeur', value: 'ambassadeur' },
              { label: 'Événement', value: 'evenement' },
              { label: 'Sur mesure', value: 'sur-mesure' },
            ],
            defaultValue: 'contenus',
          }),
          title: txt('Назва'),
          text: txt('Опис', { multiline: true }),
          details: optional('Деталі внизу картки (порожньо — сховано)'),
        }),
        'Картки (4)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '03 · Collaborations' },
  ),
  method: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      steps: list(
        fields.object({ title: txt('Назва'), text: txt('Текст', { multiline: true }) }),
        'Кроки (4)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '04 · Méthode' },
  ),
  references: fields.object(
    { eyebrow: txt('Підпис'), title: txt('Заголовок') },
    { label: '05 · Références (тексти)' },
  ),
  referencesItems: fields.object(
    {
      logos: list(
        fields.object({
          name: txt('Марка'),
          image: fields.image({
            label: 'Логотип (світлий, на прозорому тлі)',
            directory: 'src/assets/img/partenariats',
            publicPath: '../../../assets/img/partenariats/',
            validation: { isRequired: true },
          }),
        }),
        'Логотипи марок (до 12; порожньо — сітка схована)',
        (p) => p.fields.name.value,
      ),
      cases: list(
        fields.object({
          brand: txt('Марка'),
          type: optional('Тип співпраці (порожньо — лише марка)'),
          title: optional('Назва кампанії (порожньо — заголовок = марка)'),
          image: fields.image({
            label: 'Фото 628 × 380',
            directory: 'src/assets/img/partenariats',
            publicPath: '../../../assets/img/partenariats/',
            validation: { isRequired: true },
          }),
          position: optional('Кадр фото, напр. «50% 22%» (порожньо — центр)'),
          alt: optional('Опис фото для незрячих'),
          results: list(
            fields.object({ value: txt('Число (120 k)'), label: txt('Підпис (vues)') }),
            'Результати (до 3)',
            (p) => `${p.fields.value.value} ${p.fields.label.value}`,
          ),
        }),
        'Кейси (до 2; порожньо — блок схований)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '05 · Références (логотипи й кейси)' },
  ),
  press: fields.object(
    { eyebrow: txt('Підпис'), title: txt('Заголовок') },
    { label: '06 · Presse (статті — з головної)' },
  ),
  mediaKit: fields.object(
    {
      title: txt('Заголовок ({year} — рік із «Сайт → Media kit»)'),
      text: txt('Текст', { multiline: true }),
      pages: txt('Кількість сторінок ({pages})'),
      download: link('Кнопка завантаження'),
      previewAlt: optional('Опис прев’ю для незрячих'),
    },
    { label: '06 · Media kit' },
  ),
  proposal: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      form: fields.object(
        {
          brand: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Marque' },
          ),
          site: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Site web' },
          ),
          name: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Votre nom' },
          ),
          email: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'E-mail' },
          ),
          type: fields.object(
            {
              legend: txt('Підпис'),
              options: fields.object(
                {
                  contenus: txt('Contenus Instagram'),
                  ambassadeur: txt('Ambassadeur'),
                  evenement: txt('Événement'),
                  'sur-mesure': txt('Sur mesure'),
                },
                { label: 'Чипи' },
              ),
            },
            { label: 'Type de collaboration' },
          ),
          budget: fields.object(
            {
              label: txt('Підпис'),
              placeholder: txt('Перший пункт («Choisir»)'),
              options: list(txt('Діапазон'), 'Діапазони (узгодити з Luigi)', (p) => p.value),
            },
            { label: 'Budget' },
          ),
          dates: fields.object({ label: txt('Підпис') }, { label: 'Dates souhaitées' }),
          message: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Message' },
          ),
          consent: txt('Текст згоди', { multiline: true }),
          submit: txt('Кнопка'),
          thanks: fields.object(
            {
              title: txt('Заголовок'),
              text: txt('Текст', { multiline: true }),
              link: link('Посилання'),
            },
            { label: '«Merci» після надсилання' },
          ),
        },
        { label: 'Форма' },
      ),
    },
    { label: '07 · Proposer un projet' },
  ),
  mediaKitPreview: fields.image({
    label: 'Прев’ю media kit 360 × 240 (необовʼязково)',
    directory: 'src/assets/img/partenariats',
    publicPath: '../../../assets/img/partenariats/',
  }),
};

const partenariatsPage = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Partenariats · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/partenariats`,
    format: { data: 'json' },
    schema: partenariatsSchema,
  });

// Сторінка «Yachts» (секції додаються по кроках). {partner} — назва продавця з «Сайт → Продавець яхт».
const yachtsPageSchema = {
  seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
  seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
  hero: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок H1'),
      body: txt('Текст (desktop; {partner} — продавець)', { multiline: true }),
      bodyMobile: txt('Текст на телефоні (коротше)', { multiline: true }),
      primary: link('Кнопка «Voir les yachts»'),
      secondary: link('Кнопка «Demander des informations»'),
      partner: txt('Підпис над логотипом («En partenariat avec»)'),
      imageAlt: optional('Опис фото для незрячих'),
    },
    { label: '01 · Hero' },
  ),
  available: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      filters: fields.object(
        {
          legend: txt('Підпис для читалки («Filtrer par taille»)'),
          all: txt('Усі'),
          lt30: txt('Менше 30 м'),
          '30-50': txt('30 – 50 м'),
          gt50: txt('Більше 50 м'),
        },
        { label: 'Фільтри' },
      ),
      featured: txt('Підпис «À la une»'),
      empty: txt('Фільтр нічого не знайшов'),
      emptyLink: txt('Посилання на Off-market (після тексту)'),
      offMarket: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок'),
          text: txt('Текст', { multiline: true }),
          textShort: optional('Текст на телефоні (коротше)', true),
          cta: link('Кнопка'),
        },
        { label: 'Off-market' },
      ),
    },
    { label: '03 · Yachts disponibles (самі яхти — у «Яхти»)' },
  ),
  request: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      body: txt('Текст', { multiline: true }),
      form: fields.object(
        {
          name: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Nom' },
          ),
          email: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'E-mail' },
          ),
          phone: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Téléphone' },
          ),
          country: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Pays' },
          ),
          size: fields.object(
            {
              label: txt('Підпис'),
              placeholder: txt('Перший пункт («Choisir»)'),
              options: fields.object(
                {
                  lt30: txt('Менше 30 м'),
                  '30-50': txt('30 – 50 м'),
                  gt50: txt('Більше 50 м'),
                  unknown: txt('Ще не знаю'),
                },
                { label: 'Варіанти' },
              ),
            },
            { label: 'Taille recherchée' },
          ),
          budget: fields.object(
            {
              label: txt('Підпис'),
              placeholder: txt('Перший пункт («Choisir»)'),
              options: list(txt('Діапазон'), 'Діапазони (узгодити з Luigi)', (p) => p.value),
            },
            { label: 'Budget' },
          ),
          message: fields.object(
            { label: txt('Підпис'), placeholder: txt('Підказка в полі') },
            { label: 'Message' },
          ),
          consent: txt('Текст згоди ({partner} — продавець)', { multiline: true }),
          submit: txt('Кнопка'),
          yacht: txt('Підпис вибраної яхти («Yacht»)'),
          offMarket: txt('Тема off-market («Accès off-market»)'),
          change: txt('Кнопка «Changer»'),
          thanks: fields.object(
            {
              title: txt('Заголовок'),
              text: txt('Текст ({partner} — продавець)', { multiline: true }),
              link: link('Посилання («Voir les autres yachts»)'),
            },
            { label: '«Merci» після надсилання' },
          ),
        },
        { label: 'Форма' },
      ),
    },
    { label: '06 · Demande' },
  ),
  seller: fields.object(
    {
      eyebrow: txt('Підпис («Le vendeur»)'),
      link: txt('Посилання на сайт ({name} — назва продавця)'),
    },
    { label: '05 · Le vendeur (дані — «Сайт → Продавець яхт»)' },
  ),
  process: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      steps: list(
        fields.object({
          title: txt('Назва'),
          text: txt('Текст ({partner} — продавець)', { multiline: true }),
          textShort: optional('Коротший текст на телефоні', true),
        }),
        'Кроки (4)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '02 · Comment ça se passe' },
  ),
  why: fields.object(
    {
      eyebrow: txt('Підпис'),
      title: txt('Заголовок'),
      items: list(
        fields.object({
          title: txt('Назва'),
          text: txt('Текст ({partner} — продавець)', { multiline: true }),
          textShort: optional('Коротший текст на телефоні', true),
        }),
        'Пункти (3)',
        (p) => p.fields.title.value,
      ),
    },
    { label: '04 · Pourquoi passer par moi' },
  ),
};

const yachtsPageSingleton = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Yachts · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/yachts`,
    format: { data: 'json' },
    schema: yachtsPageSchema,
  });

// Теги Markdoc юридичних сторінок (ті самі — у markdoc.config.mjs): вміст з коду й settings.json.
const legalComponents = {
  'storage-table': block({ label: 'Таблиця cookies (з коду)', schema: {} }),
  'with-consent': wrapper({ label: 'Лише коли є сервіси зі згодою', schema: {} }),
  'without-consent': wrapper({ label: 'Лише коли сервісів зі згодою немає', schema: {} }),
  'cookie-settings': block({ label: 'Кнопка «Paramètres cookies»', schema: {} }),
  'contact-email': inline({ label: 'Пошта контакту (settings.json)', schema: {} }),
  'legal-link': inline({
    label: 'Посилання на юридичну сторінку',
    schema: {
      path: fields.select({
        label: 'Сторінка',
        options: [
          { label: 'Mentions légales', value: 'mentions-legales' },
          { label: 'Confidentialité', value: 'confidentialite' },
          { label: 'Cookies', value: 'cookies' },
          { label: 'CGV', value: 'cgv' },
        ],
        defaultValue: 'confidentialite',
      }),
    },
  }),
};

// Юридичні сторінки однієї мови: src/content/legal/<мова>/<slug>.mdoc. Файл = адреса (cookies → /<мова>/cookies/).
const legalCollection = (lang: 'fr' | 'en' | 'it') =>
  collection({
    label: `Юридичні · ${lang.toUpperCase()}`,
    path: `src/content/legal/${lang}/*`,
    slugField: 'title',
    format: { contentField: 'content' },
    schema: {
      title: fields.slug({
        name: { label: 'Заголовок H1' },
        slug: { label: 'Адреса (cookies, mentions-legales, confidentialite, cgv)' },
      }),
      seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
      seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
      updated: fields.date({ label: 'Дата останньої редакції', validation: { isRequired: true } }),
      content: fields.markdoc({
        label: 'Текст (розділи «## 1. …»)',
        extension: 'mdoc',
        components: legalComponents,
      }),
    },
  });

const aboutPageSingleton = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `À propos · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/a-propos`,
    format: { data: 'json' },
    schema: {
      seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
      seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
      intro: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок H1'),
          lead: txt('Перший абзац (великий)', { multiline: true }),
          body: txt('Другий абзац', { multiline: true }),
          imageAlt: txt('Опис портрета для незрячих'),
          stats: list(
            fields.text({ label: 'id цифри з «Сайт → Цифри» (followers, collaborations…)' }),
            'Цифри',
            (p) => p.value,
          ),
        },
        { label: '01 · Intro' },
      ),
      parcours: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок'),
          items: list(
            fields.object({
              year: fields.text({ label: 'Рік (лише справжній; порожньо — пункт схований)' }),
              title: txt('Назва'),
              text: fields.text({ label: 'Що сталося (1–2 речення)', multiline: true }),
            }),
            'Дати',
            (p) => `${p.fields.year.value || '[рік]'} · ${p.fields.title.value}`,
          ),
        },
        { label: '02 · Parcours' },
      ),
      king: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок'),
          text: fields.text({
            label:
              'Історія символу — лише слова Luigi (абзаци через порожній рядок; порожньо — секція схована)',
            multiline: true,
          }),
        },
        { label: '03 · Le roi de cœur' },
      ),
      rules: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок'),
          items: list(
            fields.object({ title: txt('Назва'), text: txt('Текст', { multiline: true }) }),
            'Правила (номер — автоматично)',
            (p) => p.fields.title.value,
          ),
        },
        { label: '04 · Mes règles' },
      ),
      quote: fields.object(
        {
          text: txt('Цитата (слова Luigi)', { multiline: true }),
          imageAlt: fields.text({ label: 'Опис фото (порожньо — декоративне)' }),
        },
        { label: '05 · Citation' },
      ),
      together: fields.object(
        {
          title: txt('Заголовок'),
          body: txt('Текст'),
          partnerships: txt('Кнопка → Partenariats'),
          instagram: txt('Посилання → Instagram'),
        },
        { label: '06 · Travailler ensemble' },
      ),
      jobTitle: txt('Для Google (JSON-LD): ким є Luigi'),
    },
  });

const favoritesPageSingleton = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Coups de cœur · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/coups-de-coeur`,
    format: { data: 'json' },
    schema: {
      seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
      seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
      intro: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок H1'),
          body: txt('Текст', { multiline: true }),
          disclosure: txt('Плашка прозорості (закон — не прибирати)', { multiline: true }),
        },
        { label: 'Intro' },
      ),
      codesLink: txt('Посилання «лише коди» → Privilèges'),
      empty: txt('Порожня рубрика'),
      more: txt('Кнопка «Voir plus»'),
    },
  });

const journalPageSingleton = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Journal · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/journal`,
    format: { data: 'json' },
    schema: {
      seoTitle: txt('SEO: заголовок для Google (≤ 70)', { max: 70 }),
      seoDescription: txt('SEO: опис для Google (≤ 170)', { multiline: true, max: 170 }),
      intro: fields.object(
        {
          eyebrow: txt('Підпис'),
          title: txt('Заголовок H1'),
          body: txt('Текст', { multiline: true }),
        },
        { label: 'Intro' },
      ),
    },
  });

const privilegesPage = (lang: 'fr' | 'en' | 'it') =>
  singleton({
    label: `Privilèges · ${lang.toUpperCase()}`,
    path: `src/content/pages/${lang}/privileges`,
    format: { data: 'json' },
    schema: privilegesSchema,
  });

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
      Магазин: ['products'],
      Яхти: ['yachtsFr', 'yachtsEn', 'yachtsIt', 'yachts'],
      Privilèges: ['privilegesFr', 'privilegesEn', 'privilegesIt', 'codes'],
      Contact: ['contactFr', 'contactEn', 'contactIt'],
      'À propos': ['aboutFr', 'aboutEn', 'aboutIt'],
      Journal: ['journalFr', 'journalEn', 'journalIt', 'articles'],
      'Coups de cœur': ['favoritesFr', 'favoritesEn', 'favoritesIt', 'favorites'],
      Partenariats: ['partenariatsFr', 'partenariatsEn', 'partenariatsIt'],
      Юридичні: ['legalFr', 'legalEn', 'legalIt'],
      Сайт: ['settings'],
    },
  },
  collections: {
    legalFr: legalCollection('fr'),
    legalEn: legalCollection('en'),
    legalIt: legalCollection('it'),
    codes: collection({
      label: 'Коди партнерів',
      path: 'src/content/codes/*',
      slugField: 'id',
      format: { data: 'json' },
      schema: codeSchema,
    }),
    favorites: collection({
      label: 'Coups de cœur',
      path: 'src/content/favorites/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        slug: fields.text({ label: 'slug (латиницею, як назва файлу)' }),
        brand: txt('Марка'),
        name: fields.object(
          { fr: txt('FR'), en: txt('EN'), it: txt('IT') },
          { label: 'Назва в картці' },
        ),
        category: fields.select({
          label: 'Категорія',
          options: [
            { label: 'Tech', value: 'tech' },
            { label: 'Mode', value: 'mode' },
            { label: 'Beauté', value: 'beaute' },
            { label: 'Mobilité', value: 'mobilite' },
            { label: 'Voyages', value: 'voyages' },
            { label: 'Horlogerie', value: 'horlogerie' },
            { label: 'Art de vivre', value: 'art-de-vivre' },
          ],
          defaultValue: 'tech',
        }),
        image: fields.image({
          label: 'Фото',
          directory: 'src/assets/img/favorites',
          publicPath: '../../assets/img/favorites/',
          validation: { isRequired: true },
        }),
        imageAlt: fields.object(
          { fr: optional('FR'), en: optional('EN'), it: optional('IT') },
          { label: 'Опис фото для незрячих' },
        ),
        imagePosition: optional('Кадр фото, напр. «50% 65%»'),
        affiliate: fields.checkbox({
          label: 'Lien affilié (партнерське посилання — обовʼязкова позначка)',
        }),
        url: optional('Партнерське посилання (для сторінки товару)'),
        code: optional('Код знижки: slug з «Коди» (якщо є)'),
        date: fields.date({ label: 'Дата', validation: { isRequired: true } }),
        demo: fields.checkbox({
          label: 'Демо (приклад для презентації — на живому сайті не видно)',
        }),
      },
    }),
    articles: collection({
      label: 'Статті (Journal)',
      path: 'src/content/articles/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        slug: fields.text({ label: 'slug (латиницею, як назва файлу)' }),
        category: fields.select({
          label: 'Рубрика',
          options: [
            { label: 'Automobiles', value: 'automobiles' },
            { label: 'Horlogerie', value: 'horlogerie' },
            { label: 'Voyages & Hôtels', value: 'voyages' },
            { label: 'Yachts', value: 'yachts' },
            { label: 'Jets privés', value: 'jets' },
            { label: 'Art de vivre', value: 'art-de-vivre' },
          ],
          defaultValue: 'automobiles',
        }),
        title: fields.object(
          { fr: txt('FR'), en: txt('EN'), it: txt('IT') },
          { label: 'Заголовок' },
        ),
        excerpt: fields.object(
          {
            fr: optional('FR (≤ 110 знаків)', true),
            en: optional('EN (≤ 110)', true),
            it: optional('IT (≤ 110)', true),
          },
          { label: 'Коротко (1–2 рядки)' },
        ),
        readingTime: fields.integer({ label: 'Читати, хв', validation: { isRequired: true } }),
        date: fields.date({ label: 'Дата', validation: { isRequired: true } }),
        partnership: fields.checkbox({ label: 'Partenariat (з маркою — обовʼязкова позначка)' }),
        featured: fields.checkbox({ label: '«À la une» (лише одна стаття)' }),
        cover: fields.image({
          label: 'Обкладинка',
          directory: 'src/assets/img/journal',
          publicPath: '../../assets/img/journal/',
          validation: { isRequired: true },
        }),
        coverAlt: fields.object(
          { fr: optional('FR'), en: optional('EN'), it: optional('IT') },
          { label: 'Опис обкладинки для незрячих' },
        ),
        coverPosition: optional('Кадр обкладинки, напр. «50% 30%»'),
        demo: fields.checkbox({ label: 'Демо (приклад для презентації)' }),
        draft: fields.checkbox({
          label: 'Чернетка (текст ще не готовий — на живому сайті не видно)',
        }),
      },
    }),
    yachts: collection({
      label: 'Яхти',
      path: 'src/content/yachts/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        slug: fields.text({ label: 'slug (латиницею, як назва файлу)' }),
        name: txt('Назва яхти (не перекладається)'),
        length: fields.number({ label: 'Довжина, м', validation: { isRequired: true } }),
        year: fields.integer({ label: 'Рік (порожньо — «—»)' }),
        cabins: fields.integer({ label: 'Каюти (порожньо — «—»)' }),
        price: fields.number({ label: 'Ціна, € (порожньо — «Sur demande»)' }),
        featured: fields.checkbox({ label: '«À la une» (лише одна яхта)' }),
        image: fields.image({
          label: 'Фото',
          directory: 'src/assets/img/yachts',
          publicPath: '../../assets/img/yachts/',
          validation: { isRequired: true },
        }),
        imageAlt: fields.object(
          { fr: optional('FR'), en: optional('EN'), it: optional('IT') },
          { label: 'Опис фото для незрячих' },
        ),
        demo: fields.checkbox({ label: 'Демо (ілюстрація для презентації, не справжня яхта)' }),
        order: fields.integer({ label: 'Порядок (1, 2, 3…)' }),
        // ---- Fiche yacht. Порожнє поле — рядок / секція на сторінці схована.
        builder: optional('Верф (chantier)'),
        architect: optional('Архітектор'),
        refit: fields.integer({ label: 'Рік переобладнання (refit)' }),
        beam: fields.number({ label: 'Ширина, м' }),
        draft: fields.number({ label: 'Осадка, м' }),
        guests: fields.integer({ label: 'Гостей' }),
        crew: fields.integer({ label: 'Екіпаж' }),
        cruiseSpeed: fields.number({ label: 'Крейсерська швидкість, вузлів' }),
        engines: optional('Двигуни'),
        flag: fields.object(
          { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
          { label: 'Прапор (pavillon)' },
        ),
        port: fields.object(
          { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
          { label: 'Порт базування' },
        ),
        headline: fields.object(
          { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
          { label: 'Заголовок «Le yacht»' },
        ),
        intro: fields.object(
          { fr: optional('FR', true), en: optional('EN', true), it: optional('IT', true) },
          { label: 'Вступ (≤ 220 символів)' },
        ),
        summaryTitle: fields.object(
          { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
          { label: 'Заголовок «Résumé»' },
        ),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: 'Фото',
              directory: 'src/assets/img/yachts',
              publicPath: '../../assets/img/yachts/',
            }),
            label: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'Підпис (для заглушки в демо)' },
            ),
          }),
          {
            label: '3 фото біля головного',
            itemLabel: (p) => p.fields.label.fields.fr.value || 'Фото',
          },
        ),
        interiors: fields.array(
          fields.object({
            image: fields.image({
              label: 'Фото',
              directory: 'src/assets/img/yachts',
              publicPath: '../../assets/img/yachts/',
            }),
            title: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'Назва кімнати' },
            ),
            deck: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'Палуба' },
            ),
          }),
          {
            label: 'Інтерʼєри «À bord»',
            itemLabel: (p) => p.fields.title.fields.fr.value || 'Фото',
          },
        ),
        decks: fields.array(
          fields.object({
            id: fields.text({ label: 'id (main, lower, flybridge…)' }),
            label: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'Назва палуби' },
            ),
            plan: fields.image({
              label: 'План палуби (SVG, світлі лінії)',
              directory: 'src/assets/img/yachts/plans',
              publicPath: '../../assets/img/yachts/plans/',
            }),
          }),
          {
            label: 'Плани палуб',
            itemLabel: (p) => p.fields.label.fields.fr.value || p.fields.id.value,
          },
        ),
        video: fields.object(
          {
            src: optional('Повне відео (video/yachts/<slug>/visite.mp4)'),
            poster: optional('Постер (video/yachts/<slug>/poster.jpg)'),
            teaser: optional('Тизер без звуку (video/yachts/<slug>/teaser.mp4)'),
            duration: fields.number({ label: 'Тривалість, хв' }),
            chapters: fields.array(
              fields.object({
                t: fields.number({ label: 'Початок, секунд' }),
                label: fields.object(
                  {
                    fr: optional('FR', false),
                    en: optional('EN', false),
                    it: optional('IT', false),
                  },
                  { label: 'Назва розділу' },
                ),
              }),
              {
                label: 'Розділи',
                itemLabel: (p) => p.fields.label.fields.fr.value || String(p.fields.t.value),
              },
            ),
            captions: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'Субтитри .vtt (шлях для кожної мови)' },
            ),
          },
          { label: 'Відеовізит' },
        ),
        luigiWord: fields.object(
          { fr: optional('FR', true), en: optional('EN', true), it: optional('IT', true) },
          { label: 'Слово Luigi (цитата)' },
        ),
        sheetPdf: optional('Fiche technique PDF (yachts/<slug>.pdf у public/)'),
        seo: fields.object(
          {
            title: fields.object(
              { fr: optional('FR', false), en: optional('EN', false), it: optional('IT', false) },
              { label: 'SEO: заголовок' },
            ),
            description: fields.object(
              { fr: optional('FR', true), en: optional('EN', true), it: optional('IT', true) },
              { label: 'SEO: опис' },
            ),
          },
          { label: 'SEO' },
        ),
      },
    }),
    products: collection({
      label: 'Товари',
      path: 'src/content/products/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: productSchema,
    }),
  },
  singletons: {
    homeFr: home('fr', 'Головна · FR'),
    homeEn: home('en', 'Головна · EN'),
    homeIt: home('it', 'Головна · IT'),
    privilegesFr: privilegesPage('fr'),
    privilegesEn: privilegesPage('en'),
    privilegesIt: privilegesPage('it'),
    yachtsFr: yachtsPageSingleton('fr'),
    yachtsEn: yachtsPageSingleton('en'),
    yachtsIt: yachtsPageSingleton('it'),
    aboutFr: aboutPageSingleton('fr'),
    aboutEn: aboutPageSingleton('en'),
    aboutIt: aboutPageSingleton('it'),
    favoritesFr: favoritesPageSingleton('fr'),
    favoritesEn: favoritesPageSingleton('en'),
    favoritesIt: favoritesPageSingleton('it'),
    journalFr: journalPageSingleton('fr'),
    journalEn: journalPageSingleton('en'),
    journalIt: journalPageSingleton('it'),
    contactFr: contactPage('fr'),
    contactEn: contactPage('en'),
    contactIt: contactPage('it'),
    partenariatsFr: partenariatsPage('fr'),
    partenariatsEn: partenariatsPage('en'),
    partenariatsIt: partenariatsPage('it'),
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
            yachtDemo: fields.checkbox({
              label: 'Демо-яхти (ілюстрації для презентації). На живому сайті — вимкнути!',
            }),
          },
          { label: 'Функції' },
        ),
        consent: fields.object(
          {
            analytics: fields.checkbox({ label: 'Аналітика підключена (Mesure d’audience)' }),
            affiliates: fields.checkbox({
              label: 'Партнерський трекінг підключений (Liens partenaires)',
            }),
          },
          { label: 'Cookies: що потребує згоди (хоч одне — показує банер)' },
        ),
        consentServices: fields.array(
          fields.object({
            name: fields.text({ label: 'Назва cookie / сервісу' }),
            category: fields.select({
              label: 'Категорія',
              options: [
                { label: 'Mesure d’audience', value: 'analytics' },
                { label: 'Liens partenaires', value: 'affiliates' },
              ],
              defaultValue: 'analytics',
            }),
            purpose: fields.object(
              {
                fr: fields.text({ label: 'FR' }),
                en: fields.text({ label: 'EN' }),
                it: fields.text({ label: 'IT' }),
              },
              { label: 'Навіщо' },
            ),
            duration: fields.object(
              {
                fr: fields.text({ label: 'FR' }),
                en: fields.text({ label: 'EN' }),
                it: fields.text({ label: 'IT' }),
              },
              { label: 'Строк' },
            ),
          }),
          {
            label: 'Cookies: сервіси зі згодою (для таблиці на сторінці Cookies; лише справжні)',
            itemLabel: (p) => p.fields.name.value || 'Сервіс',
          },
        ),
        forms: fields.object(
          {
            endpoint: fields.text({
              label: 'Адреса для надсилання форм (порожньо — «arrive bientôt»)',
            }),
          },
          { label: 'Форми' },
        ),
        shopCodes: list(
          fields.object({
            code: txt('Код (великими літерами, напр. LUIGI10)'),
            percent: fields.integer({
              label: 'Знижка, %',
              validation: { isRequired: true, min: 1, max: 100 },
            }),
          }),
          'Промокоди кошика (поки перевіряються на сайті; потім — Shopify)',
          (p) => p.fields.code.value,
        ),
        stats: list(
          fields.object({
            id: txt('id (followers, engagement…) — ним цифру вибирають сторінки'),
            count: fields.number({ label: 'Число для анімації (необовʼязково): 1.7' }),
            decimals: fields.integer({ label: 'Знаків після коми (1,7 → 1)' }),
            value: fields.object(
              { fr: txt('FR (1,7 M+)'), en: txt('EN (1.7M+)'), it: txt('IT (1,7 M+)') },
              { label: 'Як показати' },
            ),
            label: fields.object(
              { fr: txt('FR'), en: txt('EN'), it: txt('IT') },
              { label: 'Підпис' },
            ),
          }),
          'Цифри (головна, Partenariats)',
          (p) => `${p.fields.id.value}: ${p.fields.value.fields.fr.value}`,
        ),
        mediaKit: fields.object(
          {
            file: fields.text({
              label: 'Файл PDF у public/media-kit/ (напр. luigi-contessi-media-kit-2026.pdf)',
            }),
            year: fields.text({ label: 'Рік (Media kit 2026)' }),
            pages: fields.integer({ label: 'Сторінок у PDF' }),
          },
          { label: 'Media kit (порожньо — «Demander le media kit»)' },
        ),
        emails: fields.object(
          {
            contact: fields.text({ label: 'Contact (загальні питання)' }),
            press: fields.text({ label: 'Presse' }),
            partnerships: fields.text({ label: 'Partenariats (бренди)' }),
            yachts: fields.text({ label: 'Yachts (заявки на яхти)' }),
          },
          { label: 'Пошта (порожньо — «[e-mail]» на сайті)' },
        ),
        yachtPartner: fields.object(
          {
            name: fields.text({
              label: 'Назва компанії-продавця (порожньо — «mon partenaire», секція схована)',
            }),
            logo: fields.text({ label: 'Логотип: файл у src/assets/img/yachts/partner/' }),
            url: fields.url({ label: 'Сайт продавця' }),
            about: fields.object(
              {
                fr: fields.text({ label: 'FR', multiline: true }),
                en: fields.text({ label: 'EN', multiline: true }),
                it: fields.text({ label: 'IT', multiline: true }),
              },
              { label: 'Про продавця' },
            ),
            legal: fields.text({
              label: 'Юридичні дані: raison sociale · adresse · immatriculation',
            }),
          },
          { label: 'Продавець яхт' },
        ),
      },
    }),
  },
});
