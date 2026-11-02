// «Tous les codes»: фільтр за категорією, сортування, «Voir plus», стан у адресі (?cat=mode&tri=expire).
// Сайт статичний, тож код може прострочитись між збірками — такі картки прибираємо тут (дата браузера).
type Sort = 'recent' | 'expire';

export function initCodes() {
  const root = document.querySelector<HTMLElement>('[data-codes]');
  const list = root?.querySelector<HTMLElement>('[data-codes-list]');
  if (!root || !list) return;
  const toolbar = root.querySelector<HTMLElement>('[data-codes-toolbar]');
  const filters = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const sort = root.querySelector<HTMLSelectElement>('[data-sort]');
  const more = root.querySelector<HTMLElement>('[data-codes-more]');
  const empty = root.querySelector<HTMLElement>('[data-codes-empty]');

  // Прострочені — геть (порівнюємо РРРР-ММ-ДД за місцевою датою).
  const d = new Date();
  const today = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');
  const items = [...list.children].filter((li): li is HTMLElement => {
    const expires = (li as HTMLElement).dataset.expires;
    if (expires && expires < today) {
      li.remove();
      return false;
    }
    return true;
  });
  // Фільтр, у якому не лишилось кодів, ховаємо.
  filters.forEach((b) => {
    const cat = b.dataset.filter;
    b.hidden = cat !== 'all' && !items.some((li) => li.dataset.cat === cat);
  });

  const valid = new Set(filters.filter((b) => !b.hidden).map((b) => b.dataset.filter));
  const params = new URLSearchParams(location.search);
  let cat = valid.has(params.get('cat') ?? '') ? (params.get('cat') as string) : 'all';
  let tri: Sort = params.get('tri') === 'expire' ? 'expire' : 'recent';
  const pageSize = () => (window.matchMedia('(min-width: 1024px)').matches ? 9 : 4);
  let shown = pageSize();

  const order = (li: HTMLElement) => Number(li.dataset.order || Infinity);
  const byRecent = (a: HTMLElement, b: HTMLElement) =>
    (b.dataset.added ?? '').localeCompare(a.dataset.added ?? '') || order(a) - order(b);
  // «Expirent bientôt»: найближча дата першою, без дати — у кінець.
  const byExpire = (a: HTMLElement, b: HTMLElement) =>
    (a.dataset.expires || '9999').localeCompare(b.dataset.expires || '9999') || byRecent(a, b);

  const render = () => {
    const sorted = [...items].sort(tri === 'expire' ? byExpire : byRecent);
    list.append(...sorted);
    const matching = sorted.filter((li) => cat === 'all' || li.dataset.cat === cat);
    sorted.forEach((li) => (li.hidden = true));
    matching.slice(0, shown).forEach((li) => (li.hidden = false));
    if (more) more.hidden = matching.length <= shown;
    if (empty) empty.hidden = matching.length > 0;
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    if (sort) sort.value = tri;
  };

  const syncUrl = () => {
    const url = new URL(location.href);
    if (cat === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', cat);
    if (tri === 'recent') url.searchParams.delete('tri');
    else url.searchParams.set('tri', tri);
    history.replaceState(history.state, '', url);
  };

  const setCat = (next: string) => {
    cat = next;
    shown = pageSize();
    render();
    syncUrl();
  };

  filters.forEach((b) => b.addEventListener('click', () => setCat(b.dataset.filter ?? 'all')));
  root.querySelector('[data-codes-all]')?.addEventListener('click', () => setCat('all'));
  sort?.addEventListener('change', () => {
    tri = sort.value === 'expire' ? 'expire' : 'recent';
    shown = pageSize();
    render();
    syncUrl();
  });
  // «Voir plus»: ще стільки ж карток; фокус — на першу нову.
  more?.querySelector('button')?.addEventListener('click', () => {
    const before = items.filter((li) => !li.hidden);
    shown += pageSize();
    render();
    items.find((li) => !li.hidden && !before.includes(li))?.focus();
  });

  if (toolbar) toolbar.hidden = false;
  render();
  syncUrl(); // напр. ?cat=tech, а коди Tech уже прострочені — адреса показує те, що на екрані
}
