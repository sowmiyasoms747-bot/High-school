import type { Api } from './state';
import { longDate } from './state';

/**
 * Built-in study helper. It solves quadratics and linear pairs and answers from the
 * published lessons. Replace `askBuddy` with a call to your AI service when you have one.
 */
const num = (s: string | undefined) => {
  const t = (s ?? '').replace(/\s/g, '');
  if (t === '' || t === '+') return 1;
  if (t === '-') return -1;
  return Number(t);
};
const clean = (s: string) => s.toLowerCase().replace(/[−–]/g, '-').replace(/²/g, '^2').replace(/\s+/g, ' ');
const fmt = (n: number) => String(Math.round(n * 1000) / 1000 || 0).replace('-', '−');

function quadratic(q: string): string | null {
  const m = q.match(/([+-]?\s*\d*\.?\d*)\s*x\^2\s*(?:([+-]\s*\d*\.?\d*)\s*x(?!\^))?\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/);
  if (!m) return null;
  const a = num(m[1]), b = m[2] === undefined ? 0 : num(m[2]), c = m[3] === undefined ? 0 : num(m[3]);
  if (!a || [a, b, c].some(Number.isNaN)) return null;
  const d = b * b - 4 * a * c;
  const out = [`Compare with $ax^2 + bx + c = 0$: a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}.`, `Discriminant $b^2 − 4ac$ = ${fmt(d)}.`];
  if (d < 0) return [...out, 'The discriminant is negative, so there are no real roots.'].join('\n');
  const r1 = (-b + Math.sqrt(d)) / (2 * a), r2 = (-b - Math.sqrt(d)) / (2 * a);
  out.push('Use $x = (−b ± √(b^2 − 4ac)) / 2a$.');
  out.push(d === 0 ? `So x = ${fmt(r1)} (equal roots).` : `So x = ${fmt(r1)} or x = ${fmt(r2)}${Number.isInteger(Math.sqrt(d)) ? '' : ' (to 3 decimal places)'}.`);
  return out.join('\n');
}

function linearPair(q: string): string | null {
  const re = /([+-]?\s*\d*)\s*x\s*([+-]\s*\d*)\s*y\s*=\s*([+-]?\s*\d+)/g;
  const eq = [...q.matchAll(re)].slice(0, 2).map((m) => [num(m[1]), num(m[2]), num(m[3])]);
  if (eq.length < 2) return null;
  const [[a, b, c], [d, e, f]] = eq;
  const det = a * e - b * d;
  if (!det) return a * f === c * d && b * f === c * e ? 'The two equations are the same line, so there are infinitely many solutions.' : 'The lines are parallel, so there is no solution.';
  const x = (c * e - b * f) / det, y = (a * f - c * d) / det;
  return [
    'Use the elimination method.',
    `Make the y terms match and subtract: ${fmt(det)}x = ${fmt(c * e - b * f)}.`,
    `So x = ${fmt(x)}.`,
    `Put x back in the first equation to get y = ${fmt(y)}.`,
    `The solution is (${fmt(x)}, ${fmt(y)}).`,
  ].join('\n');
}

const SKIP = ['explain', 'concept', 'what', 'give', 'practice', 'question', 'summarize', 'summarise', 'notes', 'chapter', 'about', 'simple', 'steps', 'solve', 'from', 'with', 'that', 'this', 'does', 'have', 'similar', 'doubt', 'current', 'please', 'tell'];

export function askBuddy(question: string, app: Api): string {
  const q = clean(question);
  const solved = quadratic(q) ?? linearPair(q);
  if (solved) return solved;

  if (/study plan|\bplan\b|revision/.test(q)) {
    const rows = app.subjects.map((s) => ({ s, n: app.currentChapter(s.id) })).filter((r) => r.n)
      .sort((a, b) => app.subjectScore(a.s.id) - app.subjectScore(b.s.id));
    return ['Here is a plan that starts with your lowest test scores:',
      ...rows.map((r, i) => `• ${longDate(i + 1)}: ${r.s.name} – Ch. ${r.n} ${r.s.chapters[r.n! - 1]}`),
      `• ${longDate(rows.length + 1)}: Take the chapter tests and review mistakes`].join('\n');
  }

  const all = app.subjects.flatMap((s) => s.chapters.map((title, i) => ({ s, n: i + 1, title, l: app.lesson(s.id, i + 1) }))).filter((c) => c.l);
  const words = q.split(/[^\p{L}\p{M}\p{N}]+/u).filter((w) => w.length > 3 && !SKIP.includes(w));
  const ranked = all.map((c) => {
    const title = c.title.toLowerCase();
    const body = [...c.l!.concept, c.l!.conclusion, ...c.l!.keyPoints].join(' ').toLowerCase();
    return { c, score: words.reduce((a, w) => a + (title.includes(w) ? 4 : 0) + (body.includes(w) ? 1 : 0), 0) };
  }).sort((a, b) => b.score - a.score);
  const here = all.find((c) => app.status(c.s.id, c.n) === 'current') ?? all[0];
  const hit = ranked[0]?.score > 0 ? ranked[0].c : words.length === 0 ? here : null;
  if (!hit) return 'I do not have a lesson on that yet. Try a chapter name, or an equation such as “Solve x² − 5x + 6 = 0”.';
  const l = hit.l!;
  if (/practi[cs]e|similar|question/.test(q)) {
    const p = l.practice[Math.floor(Math.random() * l.practice.length)];
    return [`Practice question – ${hit.title}`, p[0], ...p[1].map((o, i) => `${'ABCD'[i]}. ${o}`), `Answer: ${'ABCD'[p[2]]}. ${p[3]}`].join('\n');
  }
  if (/summar|notes|\bkey\b|takeaway/.test(q)) return [`Key points – ${hit.title}`, ...l.keyPoints.map((k) => `• ${k}`)].join('\n');
  return [hit.title, ...l.concept, ...(l.equations ?? []).map((e) => `$${e}$`), l.conclusion, `Example: ${l.example.problem}`, ...l.example.steps.map((s) => `• ${s}`)].join('\n');
}
