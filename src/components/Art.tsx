import type { ReactNode } from 'react';
import type { SubjectId } from '../data/types';
import logo from '../assets/logo.webp';
import badgeFrame from '../assets/icons/achievements/badge-frame.webp';
import { Icon, type IconName } from './Icon';

/** Shared gradients, mounted once at the root. */
export function ArtDefs() {
  const g = (id: string, a: string, b: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
  );
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {g('b-blue', '#3f9bff', '#0a3fd0')}{g('b-green', '#34c45c', '#067a34')}{g('b-indigo', '#6f66ff', '#2412a8')}{g('b-teal', '#22c7c0', '#04757f')}{g('b-pink', '#ff4f97', '#a30d74')}
        <linearGradient id="b-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbc0" /><stop offset=".45" stopColor="#ffe02e" /><stop offset="1" stopColor="#ffa800" /></linearGradient>
        <filter id="b-drop" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor="#10063c" floodOpacity=".5" /></filter>
      </defs>
    </svg>
  );
}

export function LogoMark({ size = 44 }: { size?: number }) {
  return <img className="logo-img" src={logo} width={size} height={Math.round(size * 0.873)} alt="" draggable={false} />;
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={48} /><span>Learning<br />Universe LMS</span>
    </span>
  );
}

export const Flame = ({ size = 24 }: { size?: number }) => <Icon name="flame" size={size} />;
export const StarArt = ({ size = 24 }: { size?: number }) => <Icon name="star" size={size} />;
export const SubjectIcon = ({ id, size = 84 }: { id: SubjectId; size?: number }) => <Icon name={id} size={size} />;

export function Mesh() {
  return (
    <svg className="mesh" viewBox="0 0 900 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${i * 66} 0v260`} stroke="#fff" strokeOpacity=".05" />)}
      {Array.from({ length: 11 }, (_, i) => {
        const y = 120 + i * 11;
        return <path key={`w${i}`} d={`M0 ${y + 60} C 160 ${y + 70}, 260 ${y - 150 + i * 9}, 430 ${y - 60} S 640 ${y + 70}, 900 ${y - 30}`} fill="none" stroke="#9fd0ff" strokeOpacity={0.5 - i * 0.04} strokeWidth="1.6" />;
      })}
    </svg>
  );
}

export function Compass() {
  return (
    <svg className="banner-art" viewBox="0 0 120 180" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 10px #b48cff)' }}>
        <path d="M60 4v14" strokeWidth="8" /><circle cx="60" cy="32" r="14" /><path d="M50 43 16 152l-5 24 14-18 30-104M70 43l34 109 5 24-14-18L65 54M22 104h76" /><circle cx="60" cy="104" r="4" fill="#fff" />
      </g>
    </svg>
  );
}

export function TeacherBoard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 430 320" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Teacher in front of a board">
      <rect width="430" height="320" fill="#24616d" />
      <g stroke="#e9fbff" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".9"><path d="M42 110v150M32 260h190" strokeWidth="4" /><path d="m48 248 40-54 28 22 36-56 20 18 34-50" strokeWidth="5" /></g>
      <g fill="#e9fbff" opacity=".75" fontSize="17" fontFamily="Georgia,serif" fontStyle="italic"><text x="76" y="92">x + y = 8</text><text x="96" y="124">x − y = 2</text><text x="176" y="76" opacity=".6">2x = 10</text></g>
      <path d="M268 110c0-52 28-78 64-78s60 28 60 78c0 34 16 62 10 92-4 22-30 30-70 30s-68-8-72-30c-6-30 8-58 8-92z" fill="#1d1420" />
      <g transform="translate(0 -20)">
      <path d="M208 330c4-62 24-92 70-104h96c38 10 56 42 60 104z" fill="#d6b16a" /><path d="M302 176h52v44c0 18-52 18-52 0z" fill="#c98859" /><path d="M284 222c20 30 70 30 92 0l10 4c-16 46-96 46-112 0z" fill="#c98859" />
      <path d="M392 226c24 10 38 40 42 104H232c16-44 60-92 160-104z" fill="#4b3bc2" /><path d="M392 226c10 4 18 12 24 22-60 18-98 48-116 82h-30c22-52 62-92 122-104z" fill="#e2a544" /><path d="M404 236c-58 18-96 50-114 94" stroke="#fff1c9" strokeWidth="2" fill="none" opacity=".7" /><path d="M424 262c-50 14-80 38-96 68M432 290c-30 10-48 22-60 40" stroke="#3527a0" strokeWidth="3" fill="none" /><path d="M300 212c14 26 48 26 62 0" fill="none" stroke="#e9b63d" strokeWidth="2.6" /><path d="M208 328h230v30H208z" fill="#4b3bc2" /></g>
      <path d="M284 112c0-40 20-60 46-60s46 20 46 60c0 44-24 80-46 80s-46-36-46-80z" fill="#dd9d6d" /><path d="M280 122c-2-50 22-78 52-78s52 26 48 78c-8-28-22-46-50-56-22 8-42 26-50 56z" fill="#241826" />
      <g stroke="#2a1a1e" fill="none" strokeLinecap="round"><path d="M298 108c6-5 14-5 20-1M342 107c6-4 14-4 20 1" strokeWidth="3.4" /><path d="M300 122c5-5 12-5 17 0M343 122c5-5 12-5 17 0" strokeWidth="2.6" /></g><circle cx="309" cy="123" r="4" fill="#2a1a1e" /><circle cx="352" cy="123" r="4" fill="#2a1a1e" />
      <path d="M331 124c-1 10-4 16-5 20 3 3 8 3 11 1" stroke="#b87446" strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d="M314 160c11 4 23 4 34 0-4 10-11 13-17 13s-13-3-17-13z" fill="#fff" stroke="#b23a44" strokeWidth="3" strokeLinejoin="round" /><circle cx="331" cy="98" r="3.6" fill="#b3122e" /><ellipse cx="299" cy="146" rx="8" ry="5" fill="#e8735c" opacity=".25" /><ellipse cx="363" cy="146" rx="8" ry="5" fill="#e8735c" opacity=".25" />
      <circle cx="283" cy="146" r="4.5" fill="#f3c24a" /><circle cx="378" cy="146" r="4.500" fill="#f3c24a" />
    </svg>
  );
}

export type BadgeKind = 'star' | 'crown' | 'flame' | 'book' | 'target' | 'bolt' | 'medal' | 'rocket';
/** Badges with supplied artwork; the others are drawn inside the same gold frame. */
const BADGE_ART: Partial<Record<BadgeKind, IconName>> = { star: 'badgeStar', crown: 'badgeCrown', flame: 'badgeFlame' };
const BADGE_PANEL: Partial<Record<BadgeKind, string>> = { book: 'url(#b-blue)', target: 'url(#b-green)', bolt: 'url(#b-indigo)', medal: 'url(#b-teal)', rocket: 'url(#b-pink)' };
export function Badge({ kind, size = 120, locked }: { kind: BadgeKind; size?: number; locked?: boolean }) {
  const cls = `badge-art${locked ? ' locked' : ''}`;
  const art = BADGE_ART[kind];
  if (art) return <span className={cls}><Icon name={art} size={size} /></span>;
  const glyph: Partial<Record<BadgeKind, ReactNode>> = {
    book: <path d="M58 46c-8-6-17-6-24-4v36c8-2 16-1 24 4zM62 46c8-6 17-6 24-4v36c-8-2-16-1-24 4z" />,
    target: <path fillRule="evenodd" d="M60 36a24 24 0 1 0 0 48 24 24 0 0 0 0-48zm0 8a16 16 0 1 1 0 32 16 16 0 0 1 0-32zm0 9a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />,
    bolt: <path d="M66 30 40 66h16l-4 24 28-38H62z" />,
    medal: <path d="M46 32h10l4 14 4-14h10L66 54a15 15 0 1 1-12 0z" />,
    rocket: <path fillRule="evenodd" d="M60 30c12 8 16 22 12 38l8 8-6 10-8-6H54l-8 6-6-10 8-8c-4-16 0-30 12-38zm0 18a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" />,
  };
  return (
    <span className={cls}>
      <svg className="icn" width={size} height={size} viewBox="0 0 253 288" aria-hidden="true">
        <path d="M126 22 232 84v120L126 266 22 204V84z" fill={BADGE_PANEL[kind]} />
        <path d="M126 46 211 95v98l-85 49-85-49V95z" fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2.5" strokeLinejoin="round" />
        <image href={badgeFrame} width="253" height="288" />
        <g transform="translate(126.500 144) scale(2.85) translate(-60 -60)" fill="url(#b-gold)" stroke="#f3a200" strokeWidth="1.2" strokeLinejoin="round" filter="url(#b-drop)">{glyph[kind]}</g>
      </svg>
    </span>
  );
}

const axes = (yBase: number) => (
  <g stroke="#16163a" strokeWidth="3.4" fill="none"><path d={`M86 312V44M20 ${yBase}h248`} /><path d={`m76 58 10-16 10 16M254 ${yBase - 10}l16 10-16 10`} /></g>
);
export function LinesGraph() {
  return (
    <svg viewBox="0 0 300 330" className="graph" role="img" aria-label="Two lines crossing at the point x, y">
      {axes(262)}
      <path d="M40 298 246 84" stroke="#0f6cf2" strokeWidth="4" strokeLinecap="round" /><path d="M26 88 246 298" stroke="#7a35d6" strokeWidth="4" strokeLinecap="round" /><circle cx="138" cy="195" r="9" fill="#f0431f" stroke="#8f1d08" strokeWidth="2" />
      <g fontSize="23" fontWeight="500" fill="#16163a"><text x="81" y="30" fontStyle="italic">y</text><text x="276" y="269" fontStyle="italic">x</text><text x="186" y="202">(<tspan fontStyle="italic">x</tspan>, <tspan fontStyle="italic">y</tspan>)</text></g>
    </svg>
  );
}
export function ParabolaGraph() {
  return (
    <svg viewBox="0 0 300 330" className="graph" role="img" aria-label="Parabola crossing the x axis at two points">
      {axes(222)}
      <path d="M100 90 Q 170 420 240 90" stroke="#7a35d6" strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="139" cy="222" r="8" fill="#f0431f" /><circle cx="201" cy="222" r="8" fill="#f0431f" />
      <g fontSize="22" fontWeight="500" fill="#16163a"><text x="81" y="30" fontStyle="italic">y</text><text x="276" y="229" fontStyle="italic">x</text><text x="112" y="250">α</text><text x="212" y="250">β</text></g>
    </svg>
  );
}
