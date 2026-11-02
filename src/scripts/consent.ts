// Згода на cookies (CNIL): до вибору людини — жодних необовʼязкових cookies і сторонніх скриптів.
// Вибір — у localStorage['lc-consent'] на 6 місяців; немає запису, інша версія або старий → банер.
// Аналітика / партнерські посилання підключаються лише через onConsent(…) — після згоди.
export type ConsentCategory = 'analytics' | 'affiliates';
type Choice = Record<ConsentCategory, boolean>;
interface Stored extends Choice {
  v: number;
  date: string;
}

const KEY = 'lc-consent';
const VERSION = 1;
const MONTHS = 6;
const CATEGORIES: ConsentCategory[] = ['analytics', 'affiliates'];

function read(): Stored | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Stored | null;
    if (!s || s.v !== VERSION) return null;
    const limit = new Date();
    limit.setMonth(limit.getMonth() - MONTHS);
    const date = new Date(s.date);
    return Number.isNaN(date.getTime()) || date < limit ? null : s;
  } catch {
    return null;
  }
}

function write(choice: Choice) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: VERSION, date: new Date().toISOString(), ...choice }),
    );
  } catch {
    // Приватний режим / заблоковане сховище — вибір діє до кінця візиту.
  }
}

/** Чи дала людина згоду на категорію (і вона ще дійсна). */
export function getConsent(category: ConsentCategory) {
  return read()?.[category] === true;
}

/** Викликає cb одразу, якщо згода вже є, або коли людина її дасть. */
export function onConsent(category: ConsentCategory, cb: () => void) {
  if (getConsent(category)) return cb();
  const listener = (e: Event) => {
    if ((e as CustomEvent<Choice>).detail[category]) {
      window.removeEventListener('lc:consent', listener);
      cb();
    }
  };
  window.addEventListener('lc:consent', listener);
}

/** Відкликали згоду — прибрати cookies категорії. */
function clearCookies(category: ConsentCategory) {
  // TODO: коли підключимо сервіс — перелічити тут його cookies (напр. _ga* для аналітики) і видалити.
  void category;
}

function save(choice: Choice) {
  const before = read();
  write(choice);
  CATEGORIES.forEach((c) => before?.[c] && !choice[c] && clearCookies(c));
  window.dispatchEvent(new CustomEvent<Choice>('lc:consent', { detail: choice }));
}

/** Банер і вікно «Paramètres cookies» (src/components/sections/CookieConsent.astro). */
export function initConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent-banner]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-consent-dialog]');
  if (!banner || !dialog) return;
  const root = document.documentElement;
  // Лише категорії, які справді підключені (settings.json → consent).
  const enabled = (banner.dataset.consentCategories ?? '').split(' ') as ConsentCategory[];
  const all = (value: boolean) =>
    Object.fromEntries(CATEGORIES.map((c) => [c, value && enabled.includes(c)])) as Choice;
  const switches = [...dialog.querySelectorAll<HTMLInputElement>('[data-consent-switch]')];

  // Сторінці — відступ знизу на висоту банера, поки він видимий (клас на <html> + змінна через CSSOM).
  const measure = () => {
    const bottom = parseFloat(getComputedStyle(banner).bottom) || 0;
    root.style.setProperty('--consent-h', `${banner.offsetHeight + bottom}px`);
  };
  const resize = new ResizeObserver(measure);
  const showBanner = () => {
    banner.hidden = false;
    measure();
    resize.observe(banner);
    root.classList.add('has-consent-banner');
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-visible')));
  };
  const hideBanner = () => {
    banner.hidden = true;
    banner.classList.remove('is-visible');
    resize.disconnect();
    root.classList.remove('has-consent-banner');
  };
  if (!read()) showBanner();

  const decide = (choice: Choice) => {
    save(choice);
    hideBanner();
    if (dialog.open) dialog.close();
  };

  // Вікно: перемикачі — як збережено (або вимкнено); фокус на заголовок, після закриття — назад.
  let opener: HTMLElement | null = null;
  const open = (from: HTMLElement) => {
    opener = from;
    const stored = read();
    switches.forEach((s) => {
      s.checked = stored?.[s.dataset.consentSwitch as ConsentCategory] === true;
    });
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-consent-title]')?.focus();
  };
  dialog.addEventListener('close', () => {
    if (opener?.isConnected && !opener.closest('[hidden]')) opener.focus();
    opener = null;
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close(); // клік по фону — без збереження
  });

  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-consent-open], [data-consent-action]',
    );
    if (!el) return;
    if (el.hasAttribute('data-consent-open')) return open(el);
    const action = el.dataset.consentAction;
    if (action === 'close') return dialog.close(); // хрестик — без збереження
    if (action === 'accept') return decide(all(true));
    if (action === 'refuse') return decide(all(false));
    if (action === 'save') {
      const choice = all(false);
      switches.forEach((s) => {
        const c = s.dataset.consentSwitch as ConsentCategory;
        choice[c] = s.checked && enabled.includes(c);
      });
      decide(choice);
    }
  });
}
