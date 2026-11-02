// Markdoc: власні теги юридичних сторінок (src/content/legal). Ті самі теги — у Keystatic (keystatic.config.ts → legalComponents).
import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    // таблиця cookies / stockage local — з коду (helpers.ts → storageInventory)
    'storage-table': { render: component('./src/components/legal/StorageTable.astro') },
    // текст лише коли є (немає) сервісів, яким потрібна згода (settings.json → consent)
    'with-consent': {
      render: component('./src/components/legal/ConsentBlock.astro'),
      attributes: { when: { type: Boolean, default: true } },
    },
    'without-consent': {
      render: component('./src/components/legal/ConsentBlock.astro'),
      attributes: { when: { type: Boolean, default: false } },
    },
    // кнопка «Paramètres cookies»
    'cookie-settings': { render: component('./src/components/legal/CookieSettings.astro') },
    // пошта контакту з settings.json
    'contact-email': { render: component('./src/components/legal/ContactEmail.astro') },
    // посилання на іншу юридичну сторінку (лише коли вона готова)
    'legal-link': {
      render: component('./src/components/legal/LegalLink.astro'),
      attributes: { path: { type: String, required: true } },
    },
  },
});
