// Одна логіка для всіх форм [data-form] (src/components/forms/Form.astro).
// Перевірка — браузером (required, type=email) + своя (мінімум символів), тексти помилок — наші (ui/*.json → form.*).
// Помилки показуємо після спроби надіслати і при виході з поля, не під час набору.
// Кнопка «Envoyer» завжди активна: клік перевіряє все й показує, що не так.
// TODO: сервер для пошти (PHP на хостингу або сервіс форм) — окремий етап; адреса в settings.json → forms.endpoint.
import { suggestEmail } from './email-suggest';

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Свій формат e-mail: type=email браузера пропускає «a@b». Після trim(), без пробілів.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isControl = (el: Element | null): el is Control =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement;

function initForm(form: HTMLFormElement) {
  const d = form.dataset;
  const wrap = form.parentElement;
  const thanks = wrap?.querySelector<HTMLElement>('[data-form-thanks]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type=submit]');
  const controls = () =>
    [...form.elements].filter(
      (el): el is Control => isControl(el) && !!el.dataset.errorId && !el.disabled,
    );
  // Радіо-група — одна помилка на всю групу: перевіряємо перший пункт.
  const groupOf = (c: Control) =>
    c instanceof HTMLInputElement && c.type === 'radio'
      ? [...form.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${c.name}"]`)]
      : [c];

  const message = (c: Control) => {
    const v = c.validity;
    if (c instanceof HTMLInputElement && c.type === 'checkbox') return d.msgConsent;
    if (c instanceof HTMLInputElement && c.type === 'radio') return d.msgChoose;
    if (c instanceof HTMLSelectElement && v.valueMissing) return d.msgChoose;
    if (v.valueMissing) return d.msgRequired;
    if (v.typeMismatch && c.type === 'email') return d.msgEmailIncomplete;
    if (v.typeMismatch && c.type === 'url') return d.msgUrl;
    return c.validationMessage;
  };

  // aria-describedby: підказка «30 caractères minimum» (якщо є) + текст помилки (коли показаний).
  const setError = (c: Control, text: string | null) => {
    const box = document.getElementById(c.dataset.errorId!);
    groupOf(c).forEach((el) => {
      const ids = [el.dataset.hintId, text ? c.dataset.errorId : undefined].filter(Boolean);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
      if (text) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
    if (box) {
      box.textContent = text ?? '';
      box.hidden = !text;
    }
  };

  // minlength рахуємо самі: без пробілів на краях (30 пробілів — не повідомлення), і браузер
  // перевіряє його лише після набору людиною. Лише пробіли = порожнє поле («Remplissez ce champ»).
  const shortText = (c: Control) => {
    if (c instanceof HTMLSelectElement) return null;
    const min = Number(c.getAttribute('minlength'));
    if (!min) return null;
    const length = c.value.trim().length;
    if (!length) return c.required ? (d.msgRequired ?? '') : null;
    return length < min ? (d.msgTooShort ?? '').replace('{min}', String(min)) : null;
  };
  const tooShort = (c: Control) => shortText(c) !== null;
  // E-mail: немає «@» → одна підказка, немає крапки / зона коротша за 2 літери → інша.
  const emailText = (c: Control) => {
    if (!(c instanceof HTMLInputElement) || c.type !== 'email') return null;
    const value = c.value.trim();
    if (!value) return null;
    if (!value.includes('@')) return d.msgEmailNoAt ?? '';
    return EMAIL.test(value) ? null : (d.msgEmailIncomplete ?? '');
  };
  const check = (c: Control) => {
    const first = groupOf(c)[0];
    const text =
      shortText(c) ?? emailText(c) ?? (first.checkValidity() ? null : (message(first) ?? ''));
    setError(first, text);
    return !text;
  };

  // Підказка для одруківок: «Vouliez-vous dire yana@gmail.com ?» — клік підставляє адресу.
  // Не помилка й не блокує надсилання.
  const suggest = (c: HTMLInputElement) => {
    const box = c.closest('[data-field]')?.querySelector<HTMLElement>('[data-suggest]');
    if (!box) return;
    const better = emailText(c) ? null : suggestEmail(c.value.trim());
    box.hidden = !better;
    if (!better) return box.replaceChildren();
    const [before, after = ''] = (d.msgSuggest ?? '').split('{email}');
    const btn = Object.assign(document.createElement('button'), {
      type: 'button',
      textContent: better,
    });
    btn.addEventListener('click', () => {
      c.value = better;
      box.hidden = true;
      box.replaceChildren();
      check(c);
      c.focus();
    });
    box.replaceChildren(before, btn, after);
  };

  // Вихід з поля: перевіряємо, якщо щось уже ввели або помилка вже показана.
  form.addEventListener('focusout', (e) => {
    const c = e.target as Element;
    if (!isControl(c) || !c.dataset.errorId) return;
    // E-mail: пробіли всередині і зайву крапку в кінці («.fr.») прибираємо самі, потім — перевірка і підказка.
    if (c instanceof HTMLInputElement && c.type === 'email') {
      c.value = c.value.replace(/\s+/g, '').replace(/\.+$/, '');
      if (c.value) check(c);
      suggest(c);
      return;
    }
    const touched =
      c.getAttribute('aria-invalid') === 'true' ||
      (c instanceof HTMLInputElement && (c.type === 'checkbox' || c.type === 'radio')
        ? false
        : c.value.trim() !== '');
    if (touched) check(c);
  });
  // Під час набору — лише прибираємо помилку: поле стало правильним або вже не порожнє
  // (тоді «Remplissez ce champ» зникає, а решту перевіримо при виході з поля).
  const clearIfFixed = (e: Event) => {
    const c = e.target as Element;
    if (isControl(c) && c.getAttribute('aria-invalid') === 'true') {
      const first = groupOf(c)[0];
      const box = document.getElementById(first.dataset.errorId!);
      const wasMissing = box?.textContent === d.msgRequired;
      const filled = 'value' in c && c.value.trim() !== '' && !first.validity.valueMissing;
      if ((first.checkValidity() && !tooShort(c) && !emailText(c)) || (wasMissing && filled)) {
        setError(first, null);
      }
    }
  };
  form.addEventListener('input', clearIfFixed);
  form.addEventListener('input', (e) => {
    const c = e.target as Element;
    if (c instanceof HTMLInputElement && c.type === 'email') {
      const box = c.closest('[data-field]')?.querySelector<HTMLElement>('[data-suggest]');
      if (box) box.hidden = true; // друкують далі — підказка вже не про те
    }
  });
  form.addEventListener('change', clearIfFixed);

  // Лічильник «12 / 30» під полями з мінімумом; набрали достатньо — лічильник зникає.
  form.querySelectorAll<HTMLElement>('[data-char-count]').forEach((counter) => {
    const field = counter.closest('[data-field]')?.querySelector<Control>('[data-hint-id]');
    if (!field) return;
    const min = Number(counter.dataset.charCount);
    const render = () => {
      const length = field.value.trim().length;
      counter.textContent = `${length} / ${min}`;
      counter.hidden = length >= min;
    };
    field.addEventListener('input', render);
    render();
  });

  // Текст статусу з адресою пошти як посиланням (mailto:) — без innerHTML.
  const showStatus = (template: string, error = false) => {
    if (!status) return;
    const [before, after = ''] = template.split('{email}');
    const email = d.email ?? '';
    const mail: Node = email
      ? Object.assign(document.createElement('a'), { href: `mailto:${email}`, textContent: email })
      : document.createTextNode(d.msgNoEmail ?? '');
    status.replaceChildren(before, mail, after);
    status.classList.toggle('is-error', error);
    status.hidden = false;
  };

  const showThanks = () => {
    form.hidden = true;
    if (!thanks) return;
    thanks.hidden = false;
    thanks.querySelector<HTMLElement>('[data-form-thanks-title]')?.focus();
  };

  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    if (status) status.hidden = true;
    const seen = new Set<string>();
    const invalid = controls().filter((c) => {
      const key = c instanceof HTMLInputElement && c.type === 'radio' ? `r:${c.name}` : c.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return !check(c);
    });
    if (invalid.length) {
      const first = groupOf(invalid[0]);
      (first.find((el) => (el as HTMLInputElement).checked) ?? first[0]).focus();
      return;
    }
    const data = new FormData(form);
    if (String(data.get('website_hp') ?? '').trim()) return showThanks(); // бот: нічого не надсилаємо
    const endpoint = d.endpoint?.trim();
    if (!endpoint) return showStatus(d.msgSoon ?? '');

    sending = true;
    const label = submit?.querySelector('.btn__label');
    const original = label?.textContent ?? '';
    submit?.setAttribute('aria-busy', 'true');
    if (label) label.textContent = d.msgSending ?? '';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      // TODO: сервер перевіряє MX-запис домену і відповідає { error: 'email_domain' }, якщо пошта
      // на цей домен не приходить — показуємо це біля поля E-mail.
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        const email = form.querySelector<HTMLInputElement>('input[type=email]');
        if (body?.error === 'email_domain' && email) {
          setError(email, d.msgEmailDomain ?? '');
          email.focus();
          return;
        }
        throw new Error(String(res.status));
      }
      showThanks();
    } catch {
      showStatus(d.msgError ?? '', true);
    } finally {
      sending = false;
      submit?.removeAttribute('aria-busy');
      if (label) label.textContent = original;
    }
  });
}

/** Тему (чип) можна вибрати з адреси: ?sujet=code → радіо з value="code" у групі «sujet». */
function presetFromUrl(form: HTMLFormElement) {
  const params = new URLSearchParams(location.search);
  params.forEach((value, key) => {
    const radio = form.querySelector<HTMLInputElement>(
      `[data-chip-group="${CSS.escape(key)}"] input[value="${CSS.escape(value)}"]`,
    );
    if (radio) radio.checked = true;
  });
}

export function initForms() {
  document.querySelectorAll<HTMLFormElement>('[data-form]').forEach((form) => {
    presetFromUrl(form);
    initForm(form);
  });
}
