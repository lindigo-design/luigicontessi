// Підказка для одруківок у e-mail: «Vouliez-vous dire yana@gmail.com ?». Лише підказка — не блокує
// надсилання. Список популярних доменів — тільки для порівняння, не «дозволені» домени
// (корпоративна пошта nom@maison.fr — нормальна адреса, для неї підказки немає).
const DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.fr',
  'outlook.com',
  'outlook.fr',
  'live.com',
  'live.fr',
  'yahoo.com',
  'yahoo.fr',
  'icloud.com',
  'me.com',
  'orange.fr',
  'free.fr',
  'sfr.fr',
  'wanadoo.fr',
  'laposte.net',
  'libero.it',
  'virgilio.it',
  'tiscali.it',
  'alice.it',
  'proton.me',
  'gmx.com',
  'gmx.fr',
];
// Типові помилки зони: .con / .cmo / .comm → .com; .co замість .com — лише для великих поштовиків.
const TLD_TYPOS = new Set(['con', 'cmo', 'comm', 'cpm', 'vom']);
const COM_ONLY = /^(gmail|googlemail|hotmail|yahoo|outlook|icloud)$/;

/** Відстань Левенштейна: скільки літер треба додати, прибрати або замінити. */
export function levenshtein(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length];
}

/** Виправлена адреса, якщо домен схожий на популярний; інакше null. */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (DOMAINS.includes(domain)) return null;

  let fixed = domain.replace(/\.+$/, ''); // «.fr.» — зайва крапка в кінці
  const dot = fixed.lastIndexOf('.');
  if (dot > 0) {
    const base = fixed.slice(0, dot);
    const tld = fixed.slice(dot + 1);
    if (TLD_TYPOS.has(tld) || (tld === 'co' && COM_ONLY.test(base))) fixed = `${base}.com`;
  }
  if (DOMAINS.includes(fixed)) return `${local}@${fixed}`;

  let best: string | null = null;
  let bestDistance = 3;
  for (const d of DOMAINS) {
    const distance = levenshtein(fixed, d);
    if (distance < bestDistance) {
      best = d;
      bestDistance = distance;
    }
  }
  return best && bestDistance <= 2 ? `${local}@${best}` : null;
}
