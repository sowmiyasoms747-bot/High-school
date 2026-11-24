import { ArrowRight, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Flame, LogoMark, StarArt, type BadgeKind } from '../components/Art';
import { Icon } from '../components/Icon';
import { Bar, Empty, Tabs } from '../components/ui';
import { PASS_MARK, dateFromToday, shortDate, useApp } from '../state';

/** The first `seed.badges` entries are the ones the student has earned. */
const BADGES: { kind: BadgeKind; name: string; text: string }[] = [
  { kind: 'star', name: 'Chapter Master', text: 'Complete 5 chapters' },
  { kind: 'crown', name: 'Quiz Ace', text: 'Score 80%+ in a quiz' },
  { kind: 'flame', name: 'Consistent Learner', text: '7-day streak' },
  { kind: 'book', name: 'Bookworm', text: 'Read 10 theory pages' },
  { kind: 'target', name: 'Sharp Shooter', text: 'Solve 20 practice questions' },
  { kind: 'bolt', name: 'Quick Starter', text: 'Log in 5 days in a row' },
  { kind: 'medal', name: 'Top Ten', text: 'Reach the class top 10' },
  { kind: 'rocket', name: 'Fast Finisher', text: 'Submit 3 assignments early' },
];

export function AchievementsPage() {
  const app = useApp();
  const [tab, setTab] = useState(0);
  const [all, setAll] = useState(false);
  const [cert, setCert] = useState<number | null>(null);
  const { streak, badges, certificates } = app.seed;
  const doneCount = app.data.completed.length;
  const high = app.data.tests.filter((t) => t.score >= PASS_MARK).length;
  const milestones: [string, number, number][] = [['Complete 50 chapters', doneCount, 50], ['Reach 1,000 points', app.data.points, 1000], ['Keep a 30-day streak', streak, 30], ['Take 20 tests', app.data.tests.length, 20], [`Score ${PASS_MARK}%+ in 10 tests`, high, 10]];
  const shown = cert === null ? null : certificates[cert];
  return (
    <>
      <h1>Achievements & Badges</h1>
      <Tabs items={['My Achievements', 'Milestones', 'Certificates']} value={tab} onChange={setTab} />
      {tab === 0 && (
        <>
          <div className="quad">
            <section className="card"><Flame size={68} /><b>{streak}</b><span>Day Streak</span></section>
            <section className="card"><StarArt size={68} /><b>{app.data.points}</b><span>Points Earned</span></section>
            <section className="card"><Icon name="starTrophy" size={68} /><b>{badges}</b><span>Badges</span></section>
            <section className="card"><Icon name="certificate" size={68} /><b>{certificates.length}</b><span>Certificates</span></section>
          </div>
          <section className="panel">
            <header className="panel-h"><h2>My Badges</h2><button className="link" onClick={() => setAll(!all)}>{all ? 'Show Less' : 'View All'} <ArrowRight size={22} /></button></header>
            <div className="badges">{(all ? BADGES : BADGES.slice(0, 3)).map((b, i) => <div key={b.name} className="card"><Badge kind={b.kind} locked={i >= badges} /><b>{b.name}</b><span>{b.text}</span></div>)}</div>
          </section>
        </>
      )}
      {tab === 1 && <div className="rows">{milestones.map(([t, v, goal]) => <div key={t} className="row tall"><Icon name="starTrophy" size={54} /><span className="row-t"><b>{t}</b><Bar pct={Math.min(100, Math.round((v / goal) * 100))} label={t} /></span><span className="pct">{Math.min(v, goal)} / {goal}</span></div>)}</div>}
      {tab === 2 && (certificates.length ? <div className="rows">{certificates.map((c, i) => <button key={c.title} className="row tall" onClick={() => setCert(i)}><Icon name="certificate" size={54} /><span className="row-t"><b>{c.title}</b>Awarded on {shortDate(c.day)}</span><ChevronRight size={24} /></button>)}</div> : <Empty title="No certificates yet" />)}
      {shown && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={shown.title} onClick={() => setCert(null)} onKeyDown={(e) => e.key === 'Escape' && setCert(null)}>
          <div className="cert" onClick={(e) => e.stopPropagation()}>
            <button className="close" autoFocus onClick={() => setCert(null)} aria-label="Close"><X /></button>
            <LogoMark size={76} /><p>Certificate of Achievement</p><h2>{app.student.name}</h2><p>Class {app.student.cls} – Section {app.student.section}</p><h3>{shown.title}</h3><p className="muted">{shown.by} • {dateFromToday(shown.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <button className="btn" onClick={() => window.print()}>Print</button>
          </div>
        </div>
      )}
    </>
  );
}
