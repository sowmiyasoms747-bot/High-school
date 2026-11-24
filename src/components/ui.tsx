import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SubjectId } from '../data/types';

/** Renders text where $...$ marks maths: italic letters, _x subscripts, ^x superscripts. */
export function Rich({ text }: { text: string }) {
  return <>{text.split('$').map((part, i) => (i % 2 ? <Maths key={i} src={part} /> : <Fragment key={i}>{part}</Fragment>))}</>;
}

export function Maths({ src }: { src: string }) {
  if (src.startsWith('"')) return <>{src.slice(1, -1)}</>;
  const tokens = src.match(/[A-Z]{2,}|[a-zA-Z]|[_^][0-9a-zA-Z]|[^a-zA-Z_^]+/g) ?? [];
  return (
    <span className="maths">
      {tokens.map((t, i) =>
        t[0] === '_' ? <sub key={i}>{t[1]}</sub> : t[0] === '^' ? <sup key={i}>{t[1]}</sup> : /^[a-zA-Z]$/.test(t) ? <i key={i}>{t}</i> : <Fragment key={i}>{t}</Fragment>,
      )}
    </span>
  );
}

export function Tabs({ items, value, onChange }: { items: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="tabs" role="tablist" style={{ ['--n' as string]: items.length }}>
      {items.map((t, i) => (
        <button key={t} role="tab" aria-selected={i === value} className={i === value ? 'on' : ''} onClick={() => onChange(i)}>{t}</button>
      ))}
    </div>
  );
}

/** `gloss` picks the glossy subject style (see .g-maths etc. in styles.css). */
export function Bar({ pct, gloss, label }: { pct: number; gloss?: SubjectId; label?: string }) {
  return (
    <span className={gloss ? `bar gloss g-${gloss}` : 'bar'} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span className={pct > 0 ? 'has' : ''} style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Ring({ pct, size, stroke, children }: { pct: number; size: number; stroke: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ ['--size' as string]: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#dcdfee" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ring-green)" strokeWidth={stroke} strokeDasharray={`${(c * pct) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <defs><linearGradient id="ring-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#62c846" /><stop offset="1" stopColor="#2f9c20" /></linearGradient></defs>
      </svg>
      {children && <span className="ring-in">{children}</span>}
    </span>
  );
}

const C = 50; // centre of the 100 × 100 drawing used by the glossy rings
const at = (r: number, deg: number) => `${(C + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)} ${(C - r * Math.cos((deg * Math.PI) / 180)).toFixed(2)}`;
/** Closed ring segment between two radii, angles in degrees clockwise from the top. */
const arc = (o: number, i: number, from: number, to: number) => {
  const big = to - from > 180 ? 1 : 0;
  return `M${at(o, from)}A${o} ${o} 0 ${big} 1 ${at(o, to)}L${at(i, to)}A${i} ${i} 0 ${big} 0 ${at(i, from)}Z`;
};

/** Glossy progress ring used on the home page. */
export function GlossRing({ pct, size }: { pct: number; size: number }) {
  const OUT = 47.5, IN = 34, R = 3; // R rounds the corners of the arc
  const end = Math.min(100, pct) * 3.6;
  const pad = 4; // degrees taken up by the rounded ends
  const full = pct >= 100;
  const shape = arc(OUT - R, IN + R, pad, Math.max(pad + 0.5, end - pad));
  const mid = (OUT + IN) / 2, w = OUT - IN;
  return (
    <span className="ring" style={{ ['--size' as string]: size }}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${pct}%`}>
        <defs>
          <linearGradient id="gr-fill" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="98"><stop offset="0" stopColor="#55d800" /><stop offset=".5" stopColor="#35b800" /><stop offset="1" stopColor="#119100" /></linearGradient>
          <linearGradient id="gr-edge" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="98"><stop offset="0" stopColor="#2fa000" /><stop offset="1" stopColor="#0a6d05" /></linearGradient>
          <linearGradient id="gr-track" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e6e6f8" /><stop offset="1" stopColor="#cfd0ee" /></linearGradient>
          <linearGradient id="gr-shine" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="98"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".55" stopColor="#fff" stopOpacity=".12" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        </defs>
        <circle cx={C} cy={C} r={mid} fill="none" stroke="#bfc0e2" strokeWidth={w} />
        <circle cx={C} cy={C} r={mid} fill="none" stroke="url(#gr-track)" strokeWidth={w - 1.6} />
        {full ? (
          <><circle cx={C} cy={C} r={mid} fill="none" stroke="url(#gr-edge)" strokeWidth={w + 1.4} /><circle cx={C} cy={C} r={mid} fill="none" stroke="url(#gr-fill)" strokeWidth={w - 0.6} /></>
        ) : pct > 0 && (
          <g strokeLinejoin="round"><path d={shape} fill="url(#gr-edge)" stroke="url(#gr-edge)" strokeWidth={R * 2 + 1.4} /><path d={shape} fill="url(#gr-fill)" stroke="url(#gr-fill)" strokeWidth={R * 2 - 0.8} /></g>
        )}
        {end > pad * 4 && <path d={arc(OUT - 2.2, OUT - 4.6, pad, end - pad)} fill="url(#gr-shine)" />}
      </svg>
    </span>
  );
}

/** Large tube-style ring on the progress page, lit from above like the supplied artwork. */
export function TubeRing({ pct, size, children }: { pct: number; size: number; children?: ReactNode }) {
  const OUT = 49, IN = 37.4, R = 1.5, PAD = 2.3; // PAD = degrees taken up by the rounded ends
  const p = Math.min(100, Math.max(0, pct));
  const from = PAD, to = Math.max(PAD + 0.4, p * 3.6 - PAD);
  const mid = (OUT + IN) / 2, w = OUT - IN;
  const line = (r: number) => (p >= 100 ? `M${at(r, 0)}A${r} ${r} 0 1 1 ${at(r, 180)}A${r} ${r} 0 1 1 ${at(r, 360)}` : `M${at(r, from)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${at(r, to)}`);
  const shape = arc(OUT - R - 0.3, IN + R + 0.3, from, to);
  const v = (id: string, ...stops: [number, string, number][]) => (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="1" x2="0" y2="99">{stops.map(([o, c, a]) => <stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}</linearGradient>
  );
  return (
    <span className="ring" style={{ ['--size' as string]: size }}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${pct}%`}>
        <defs>
          {v('tr-fill', [0, '#45c911', 1], [0.5, '#3ec30b', 1], [1, '#2fbc08', 1])}
          {v('tr-edge', [0, '#22ad06', 1], [0.5, '#119a02', 1], [1, '#099201', 1])}
          {v('tr-top', [0, '#b4f795', 0.95], [0.3, '#9bef7a', 0.75], [0.52, '#7de256', 0])}
          {v('tr-low', [0.45, '#a9f793', 0], [0.68, '#98ee76', 0.75], [0.9, '#a9f793', 0.95])}
          {v('tr-dark', [0.2, '#0a8f00', 0], [0.5, '#0a8f00', 0.3], [1, '#0a8f00', 0.65])}
          {v('tr-dark2', [0, '#0a8f00', 0.7], [0.5, '#0a8f00', 0.3], [0.75, '#0a8f00', 0])}
          {v('tr-track', [0, '#d8deec', 1], [1, '#cdd4e4', 1])}
          <filter id="tr-soft" filterUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><feGaussianBlur stdDeviation=".55" /></filter>
        </defs>
        <circle cx={C} cy={C} r={mid} fill="none" stroke="#b3bacb" strokeWidth={w} />
        <circle cx={C} cy={C} r={mid} fill="none" stroke="url(#tr-track)" strokeWidth={w - 1} />
        <path d={arc(OUT - 1, OUT - 2.2, 200, 359.9)} fill="#edf1fb" opacity=".8" filter="url(#tr-soft)" />
        {p >= 100 ? (
          <><circle cx={C} cy={C} r={mid} fill="none" stroke="url(#tr-edge)" strokeWidth={w} /><circle cx={C} cy={C} r={mid} fill="none" stroke="url(#tr-fill)" strokeWidth={w - 0.9} /></>
        ) : p > 0 && (
          <g strokeLinejoin="round"><path d={shape} fill="url(#tr-edge)" stroke="url(#tr-edge)" strokeWidth={R * 2 + 0.6} /><path d={shape} fill="url(#tr-fill)" stroke="url(#tr-fill)" strokeWidth={R * 2 - 0.3} /></g>
        )}
        {p > 3 && (
          <g fill="none" filter="url(#tr-soft)">
            <path d={line(OUT - 1)} stroke="url(#tr-dark)" strokeWidth="1.4" />
            <path d={line(IN + 1)} stroke="url(#tr-dark2)" strokeWidth="1.4" />
            <path d={line(OUT - 1.7)} stroke="url(#tr-top)" strokeWidth="1.5" />
            <path d={line(IN + 1.9)} stroke="url(#tr-low)" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      {children && <span className="ring-in">{children}</span>}
    </span>
  );
}

export function Crumbs({ items, back }: { items: { label: string; to?: string }[]; back: string }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to={back} className="back" aria-label="Back"><ArrowLeft size={24} /></Link>
      {items.map((it, i) => (
        <Fragment key={it.label}>
          {i > 0 && <ChevronRight size={18} className="sep" />}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <b>{it.label}</b>}
        </Fragment>
      ))}
    </nav>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="card empty"><b>{title}</b>{children && <p>{children}</p>}</div>;
}

export function NotPublished({ back }: { back: string }) {
  return (
    <Empty title="This lesson is not published yet">
      Your teacher has not added content for this chapter. <Link to={back}>Go back to the chapter list</Link>
    </Empty>
  );
}

export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
