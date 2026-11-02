// Yachts → фільтр за довжиною: ховає картки (і «À la une») без перезавантаження; вибір — у адресі
// ?taille=30-50 (history.replaceState), тож працює після перезавантаження й у посиланні.
// Нічого не знайшли — «Aucun yacht dans cette taille… Demandez l’off-market.»
const SIZES = ['all', 'lt30', '30-50', 'gt50'];

export function initYachtFilters() {
  const root = document.querySelector<HTMLElement>('[data-yachts]');
  if (!root) return;
  const radios = [...root.querySelectorAll<HTMLInputElement>('[data-yacht-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-yacht]')];
  const empty = root.querySelector<HTMLElement>('[data-yacht-empty]');
  if (!radios.length) return;

  const apply = (size: string, updateUrl: boolean) => {
    let shown = 0;
    items.forEach((el) => {
      const on = size === 'all' || el.dataset.yacht === size;
      el.hidden = !on;
      if (on) shown++;
    });
    if (empty) empty.hidden = shown > 0;
    if (updateUrl) {
      const url = new URL(location.href);
      if (size === 'all') url.searchParams.delete('taille');
      else url.searchParams.set('taille', size);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }
  };

  radios.forEach((r) => r.addEventListener('change', () => apply(r.value, true)));
  const fromUrl = new URLSearchParams(location.search).get('taille');
  if (fromUrl && SIZES.includes(fromUrl)) {
    const radio = radios.find((r) => r.value === fromUrl);
    if (radio) radio.checked = true;
    apply(fromUrl, false);
  }
}

/**
 * Форма «Demande»: що прийшло в адресі. ?yacht=aurora — рядок «Yacht : Aurora · 45 m» + «Changer»
 * і приховане поле yacht; ?topic=off-market — рядок «Accès off-market» і поле topic;
 * ?taille=30-50 (з фільтра) — підставляємо в «Taille recherchée». «Changer» прибирає вибір.
 */
export function initYachtRequest() {
  const root = document.querySelector<HTMLElement>('[data-yacht-request]');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const yachtField = root.querySelector<HTMLInputElement>('[data-yacht-field]');
  const topicField = root.querySelector<HTMLInputElement>('[data-topic-field]');
  const lines = [...root.querySelectorAll<HTMLElement>('[data-yacht-choice]')];

  const show = (key: string | null) => {
    lines.forEach((l) => (l.hidden = l.dataset.yachtChoice !== key));
    const isYacht = !!key && key !== 'off-market';
    if (yachtField) yachtField.value = isYacht ? key : '';
    if (topicField) topicField.value = key === 'off-market' ? 'off-market' : '';
  };

  const yacht = params.get('yacht');
  const topic = params.get('topic');
  if (yacht && lines.some((l) => l.dataset.yachtChoice === yacht)) show(yacht);
  else if (topic === 'off-market') show('off-market');

  root.querySelectorAll<HTMLElement>('[data-yacht-clear]').forEach((btn) =>
    btn.addEventListener('click', () => {
      show(null);
      const url = new URL(location.href);
      url.searchParams.delete('yacht');
      url.searchParams.delete('topic');
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
      root.querySelector<HTMLElement>('input:not([type=hidden]), textarea')?.focus();
    }),
  );

  const size = params.get('taille');
  const select = root.querySelector<HTMLSelectElement>('select[name="size"]');
  if (size && select && [...select.options].some((o) => o.value === size)) select.value = size;

  // Прийшли з картки (#demande): фото вище довантажуються й зсувають сторінку — після завантаження
  // ще раз ставимо форму на місце.
  if (location.hash === `#${root.id}`) {
    const settle = () => root.scrollIntoView({ block: 'start' });
    if (document.readyState === 'complete') requestAnimationFrame(settle);
    else window.addEventListener('load', settle, { once: true });
  }
}
