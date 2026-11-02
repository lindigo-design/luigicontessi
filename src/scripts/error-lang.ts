// Сторінки 404 / 500: хостинг віддає один файл на будь-яку адресу, тож мову беремо з адреси.
// /en/… → англійський блок, /it/… → італійський; інакше лишається FR (так само без JS).
export function initErrorLang() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const lang = location.pathname.slice(base.length).split('/').filter(Boolean)[0];
  if (lang !== 'en' && lang !== 'it') return;
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-err-copy]')];
  const block = blocks.find((b) => b.lang === lang);
  if (!block) return;
  blocks.forEach((b) => (b.hidden = b !== block));
  document.documentElement.lang = lang;
  if (block.dataset.title) document.title = block.dataset.title;
}
