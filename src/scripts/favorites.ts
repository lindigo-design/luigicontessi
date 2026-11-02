// Сторінка Coups de cœur: фільтр категорій (?categorie=tech, replaceState — без перезавантаження),
// «Voir plus» (по 8 карток, фокус на першу нову) і кадр фото з даних (--position, CSP).
// Без JS видно всі картки.
const PAGE = 8;

export function initFavorites() {
  const root = document.querySelector<HTMLElement>('[data-favorites]');
  if (!root) return;

  root.querySelectorAll<HTMLElement>('[data-position]').forEach((el) => {
    el.style.setProperty('--position', el.dataset.position ?? '');
  });

  const radios = [...root.querySelectorAll<HTMLInputElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-fav]')];
  const empty = root.querySelector<HTMLElement>('[data-fav-empty]');
  const more = root.querySelector<HTMLElement>('[data-fav-more]');

  let category = 'all';
  let limit = PAGE;

  const render = (focusIndex?: number) => {
    const match = cards.filter((c) => category === 'all' || c.dataset.fav === category);
    cards.forEach((c) => (c.hidden = true));
    match.forEach((c, i) => (c.hidden = i >= limit));
    if (empty) empty.hidden = match.length > 0;
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
