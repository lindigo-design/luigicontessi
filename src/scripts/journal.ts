// Сторінка Journal: фільтр рубрик (?categorie=horlogerie, replaceState — без перезавантаження),
// «Plus d'articles» (по 6 карток, фокус на першу нову) і кадр обкладинок з даних (--position, CSP).
// Без JS видно всі картки й «À la une».
const PAGE = 6;

export function initJournal() {
  const root = document.querySelector<HTMLElement>('[data-journal]');
  if (!root) return;

  root.querySelectorAll<HTMLElement>('[data-position]').forEach((el) => {
    el.style.setProperty('--position', el.dataset.position ?? '');
  });

  const radios = [...root.querySelectorAll<HTMLInputElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-article]')];
  const featured = root.querySelector<HTMLElement>('[data-featured]');
  const list = root.querySelector<HTMLElement>('[data-journal-list]');
  const empty = root.querySelector<HTMLElement>('[data-journal-empty]');
  const more = root.querySelector<HTMLElement>('[data-journal-more]');

  let category = 'all';
  let limit = PAGE;

  const render = (focusIndex?: number) => {
    const match = cards.filter((c) => category === 'all' || c.dataset.article === category);
    cards.forEach((c) => (c.hidden = true));
    match.forEach((c, i) => (c.hidden = i >= limit));
    const featuredShown =
      !!featured && (category === 'all' || featured.dataset.featured === category);
    if (featured) featured.hidden = !featuredShown;
    // Лише «À la une» з цієї рубрики — порожню сіру секцію ховаємо.
    if (list) list.hidden = match.length === 0 && featuredShown;
    if (empty) empty.hidden = match.length > 0 || featuredShown;
    if (more) more.hidden = match.length <= limit;
    if (focusIndex !== undefined) match[focusIndex]?.querySelector<HTMLElement>('a')?.focus();
  };

  const select = (value: string, updateUrl: boolean) => {
    category = value;
    limit = PAGE;
    render();
    if (updateUrl) {
      const url = new URL(location.href);
      if (value === 'all') url.searchParams.delete('categorie');
      else url.searchParams.set('categorie', value);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
  };

  radios.forEach((r) => r.addEventListener('change', () => select(r.value, true)));
  more?.querySelector('button')?.addEventListener('click', () => {
    const first = limit;
    limit += PAGE;
    render(first);
  });

  const fromUrl = new URLSearchParams(location.search).get('categorie');
  const radio = radios.find((r) => r.value === fromUrl);
  if (radio) {
    radio.checked = true;
    select(radio.value, false);
  } else {
    render();
  }
}
