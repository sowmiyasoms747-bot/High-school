import { Menu, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import kavin from '../assets/avatar-kavin.webp';
import meera from '../assets/avatar-meera.webp';
import { useApp, useSession } from '../state';
import { Flame, Logo, StarArt } from './Art';
import { MenuIcon, type MenuIconName } from './Icon';
import { NotificationBell } from './Notifications';

export const AVATARS = { kavin, meera };

interface NavItem { to: string; label: string; icon: MenuIconName }

const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/learning', label: 'My Learning', icon: 'learning' },
  { to: '/live', label: 'Live Classes', icon: 'live' },
  { to: '/assignments', label: 'Assignments', icon: 'assignments' },
  { to: '/quizzes', label: 'Quizzes & Tests', icon: 'quizzes' },
  { to: '/progress', label: 'Progress', icon: 'progress' },
  { to: '/achievements', label: 'Achievements', icon: 'achievements' },
  { to: '/buddy', label: 'AI Study Buddy', icon: 'buddy' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

/** Bottom bar on phones; everything else is in the menu. */
const TABS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/learning', label: 'Learning', icon: 'learning' },
  { to: '/live', label: 'Live', icon: 'live' },
  { to: '/assignments', label: 'Tasks', icon: 'assignments' },
  { to: '/buddy', label: 'AI Buddy', icon: 'buddy' },
];

function SearchBox({ expanded, onClose }: { expanded: boolean; onClose: () => void }) {
  const app = useApp();
  const go = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { if (expanded) field.current?.focus(); }, [expanded]);

  const index = useMemo(() => [
    ...NAV.map((n) => ({ label: n.label, sub: 'Page', to: n.to })),
    ...app.subjects.flatMap((s) => [
      { label: s.name, sub: 'Subject', to: `/learning/${s.id}` },
      ...s.chapters.map((c, i) => ({ label: c, sub: `${s.name} – Chapter ${i + 1}`, to: `/learning/${s.id}/${i + 1}` })),
    ]),
    ...app.seed.assignments.map((a) => ({ label: a.title, sub: 'Assignment', to: `/assignments/${a.id}` })),
  ], [app]);
  const term = q.trim().toLowerCase();
  const hits = term ? index.filter((r) => `${r.label} ${r.sub}`.toLowerCase().includes(term)).slice(0, 7) : [];

  useEffect(() => {
    const f = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const close = () => { setQ(''); setOpen(false); onClose(); };
  const pick = (to: string) => { close(); go(to); };

  return (
    <div className={`search${expanded ? ' open' : ''}`} ref={box}>
      <Search size={20} />
      <input
        ref={field} value={q} placeholder="Search lessons, chapters, topics..." aria-label="Search lessons, chapters, topics"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) pick(hits[0].to); if (e.key === 'Escape') close(); }}
      />
      {expanded && <button className="search-btn" onClick={close} aria-label="Close search"><X size={22} /></button>}
      {open && term && (
        <div className="search-pop">
          {hits.map((h) => <button key={h.label + h.sub} onClick={() => pick(h.to)}><b>{h.label}</b><span>{h.sub}</span></button>)}
          {!hits.length && <p>No results for “{q}”</p>}
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const app = useApp();
  const { toast } = useSession();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  useEffect(() => { setMenu(false); setSearch(false); window.scrollTo(0, 0); }, [pathname]);
  // Remember where the student is inside a chapter so "Continue" can bring them back here.
  useEffect(() => {
    const m = pathname.match(/^\/(?:learning|quizzes)\/([^/]+)\/(\d+)(?:\/(?:theory|video|practice))?$/);
    if (!m) return;
    const sub = app.subject(m[1]);
    const n = Number(m[2]);
    if (sub?.chapters[n - 1]) app.visitChapter(sub.id, n, pathname);
  }, [pathname, app]);
  // While the drawer is open: no page scroll behind it, Escape closes it, and it
  // closes if the screen is resized or rotated to a layout without a drawer.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    window.addEventListener('resize', close);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', key);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  return (
    <div className="shell">
      <header className="top">
        <button className="menu-btn" onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>{menu ? <X /> : <Menu />}</button>
        <Link to="/" className="top-logo" aria-label="Learning Universe LMS home"><Logo /></Link>
        <SearchBox expanded={search} onClose={() => setSearch(false)} />
        <button className="search-btn" onClick={() => { setMenu(false); setSearch(true); }} aria-label="Search"><Search size={24} /></button>
        <div className="top-right">
          <Link to="/achievements" className="chip"><Flame size={28} /><span>{app.seed.streak} <em>Day Streak</em></span></Link>
          <Link to="/achievements" className="chip"><StarArt size={28} /><span>{app.data.points} <em>Points</em></span></Link>
          <NotificationBell />
          <Link to="/profile" className="me">
            <img src={AVATARS[app.student.avatar]} alt="" />
            <span><b>{app.student.name}</b>Class {app.student.cls}</span>
          </Link>
        </div>
      </header>
      <aside className={`side${menu ? ' open' : ''}`}>
        <nav aria-label="Main">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'}><MenuIcon name={icon} />{label}</NavLink>
          ))}
        </nav>
      </aside>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <main className="main"><div className="page"><Outlet /></div></main>
      <nav className="tabbar" aria-label="Quick navigation">
        {TABS.map(({ to, label, icon }) => <NavLink key={to} to={to} end={to === '/'}><MenuIcon name={icon} />{label}</NavLink>)}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
