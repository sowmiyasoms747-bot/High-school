import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Circle, Download, FlaskConical, Globe, Languages, LockKeyhole, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Compass, Mesh, SubjectIcon } from '../components/Art';
import { Icon, type IconName } from '../components/Icon';
import { Bar, Crumbs, Empty, NotPublished, Ring, Tabs, downloadText } from '../components/ui';
import type { Lesson, SubjectId } from '../data/types';
import { REWARD, PASS_MARK, useApp, useSession } from '../state';

const plain = (s: string) => s.replace(/[$"]/g, '').replace(/_(\w)/g, '$1').replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\^(\w)/g, '^$1');
export function downloadNotes(title: string, l: Lesson) {
  downloadText(`${title}.txt`, [title, '', ...l.concept, ...(l.equations ?? []), l.conclusion, '', 'Example', l.example.problem, ...l.example.steps, '', 'Key points', ...l.keyPoints.map((k) => `- ${k}`)].map(plain).join('\r\n'));
}

export function MyLearningPage() {
  const app = useApp();
  const [tab, setTab] = useState(0);
  const list = app.subjects.filter((s) => {
    const p = app.subjectPct(s.id);
    return tab === 0 || (tab === 1 ? p < 100 : p >= 100);
  });
  return (
    <>
      <h1>My Learning</h1>
      <Tabs items={['All Subjects', 'In Progress', 'Completed']} value={tab} onChange={setTab} />
      {list.length ? (
        <div className="subjects">
          {list.map((s) => (
            <Link key={s.id} to={`/learning/${s.id}`} className={`subject s-${s.id}`}>
              <SubjectIcon id={s.id} />
              <h2>{s.name}</h2>
              {s.note && <span className="note">{s.note}</span>}
              <span>{s.chapters.length} Chapters</span>
              <b>{app.subjectPct(s.id)}%</b>
              <Bar pct={app.subjectPct(s.id)} label={`${s.name} progress`} />
            </Link>
          ))}
        </div>
      ) : <Empty title="No completed subjects yet">Finish every chapter in a subject and it will appear here.</Empty>}
    </>
  );
}

const ART: Record<Exclude<SubjectId, 'maths'>, LucideIcon> = { science: FlaskConical, english: BookOpen, social: Globe, tamil: Languages };

export function SubjectPage() {
  const app = useApp();
  const { setToast } = useSession();
  const go = useNavigate();
  const sub = app.subject(useParams().sid ?? '');
  const [tab, setTab] = useState(0);
  if (!sub) return <Navigate to="/learning" replace />;
  const Art = sub.id === 'maths' ? null : ART[sub.id];
  const cur = app.currentChapter(sub.id);
  const base = `/learning/${sub.id}`;
  const open = sub.chapters.map((title, i) => ({ title, n: i + 1, l: app.lesson(sub.id, i + 1) })).filter((c) => app.status(sub.id, c.n) !== 'locked');
  const withLesson = open.filter((c) => c.l);

  return (
    <>
      <h1 className="with-back"><Link to="/learning" className="back" aria-label="Back to My Learning"><ArrowLeft size={26} /></Link>{sub.name}</h1>
      <section className="banner">
        <Mesh />
        <div><h2>{sub.name}</h2><p>Class {app.student.cls} &nbsp;•&nbsp; {sub.chapters.length} Chapters</p></div>
        {Art ? <Art className="banner-art lucide-art" strokeWidth={1.2} /> : <Compass />}
        <span className="banner-ring"><Ring pct={app.subjectPct(sub.id)} size={144} stroke={17}><b>{app.subjectPct(sub.id)}%</b>Completed</Ring></span>
      </section>
      <Tabs items={['Chapters', 'Resources', 'Practice', 'Notes']} value={tab} onChange={setTab} />
      {tab === 0 && (
        <div className="rows">
          {sub.chapters.map((title, i) => {
            const n = i + 1;
            const st = app.status(sub.id, n);
            const open = () => (st === 'locked' ? setToast(`Finish Chapter ${cur} to unlock this chapter.`) : go(`${base}/${n}`));
            return (
              <button key={title} className="row" onClick={open}>
                {st === 'completed' ? <span className="tick"><Check size={20} strokeWidth={3.4} /></span> : st === 'current' ? <Circle size={34} className="ring-ico" /> : <LockKeyhole size={32} className="lock-ico" />}
                <span className="row-t"><b>Chapter {n}: {title}</b></span>
                {st === 'completed' && <span className="pill green">Completed</span>}
                {st === 'current' && <span className="btn">Continue <ArrowRight size={20} /></span>}
                {st === 'locked' && <span className="pill grey">Locked</span>}
                {st !== 'current' && <ChevronRight size={24} />}
              </button>
            );
          })}
        </div>
      )}
      {tab === 1 && (
        <div className="rows">
          {withLesson.map((c) => (
            <button key={c.n} className="row" onClick={() => downloadNotes(`${sub.name} – Chapter ${c.n} ${c.title}`, c.l!)}>
              <Icon name="classNotes" size={50} /><span className="row-t"><b>Chapter {c.n}: {c.title}</b>Concept, example and key points</span><Download size={24} className="violet" />
            </button>
          ))}
          {!withLesson.length && <Empty title="No resources yet">Resources appear when your teacher publishes a chapter.</Empty>}
        </div>
      )}
      {tab === 2 && (
        <div className="rows">
          {withLesson.map((c) => {
            const total = c.l!.practice.length;
            const solved = Math.round(app.stages(sub.id, c.n).practice * total);
            return (
              <Link key={c.n} className="row" to={`${base}/${c.n}/practice`}>
                <Icon name="stepPractice" size={50} /><span className="row-t"><b>Chapter {c.n}: {c.title}</b>{solved} of {total} solved</span>
                <span className={`pill ${solved === total ? 'green' : 'violet-pill'}`}>{solved === total ? 'Completed' : 'Practise'}</span><ChevronRight size={24} />
              </Link>
            );
          })}
          {!withLesson.length && <Empty title="No practice sets yet">Practice appears when your teacher publishes a chapter.</Empty>}
        </div>
      )}
      {tab === 3 && <SubjectNotes sid={sub.id} chapters={open} />}
    </>
  );
}

function SubjectNotes({ sid, chapters }: { sid: SubjectId; chapters: { n: number; title: string }[] }) {
  const app = useApp();
  const [n, setN] = useState(app.currentChapter(sid) ?? chapters[0]?.n ?? 1);
  return (
    <div className="card notes">
      <label>Chapter
        <select value={n} onChange={(e) => setN(Number(e.target.value))}>{chapters.map((c) => <option key={c.n} value={c.n}>Chapter {c.n}: {c.title}</option>)}</select>
      </label>
      <textarea value={app.note(sid, n)} onChange={(e) => app.saveNote(sid, n, e.target.value)} placeholder="Write your notes here. They save as you type." aria-label="My notes" rows={9} />
    </div>
  );
}

export function useChapter() {
  const app = useApp();
  const { sid, n: raw } = useParams();
  const sub = app.subject(sid ?? '');
  const n = Number(raw);
  const title = sub?.chapters[n - 1];
  if (!sub || !title || app.status(sub.id, n) === 'locked') return null;
  return { app, sub, n, title, lesson: app.lesson(sub.id, n), base: `/learning/${sub.id}/${n}` };
}

export function ChapterPage() {
  const ch = useChapter();
  const go = useNavigate();
  if (!ch) return <Navigate to="/learning" replace />;
  const { app, sub, n, title, lesson, base } = ch;
  const st = app.stages(sub.id, n);
  const done = app.status(sub.id, n) === 'completed';
  const pct = app.chapterPct(sub.id, n);
  const firstOpen = (['theory', 'video', 'practice', 'test'] as const).find((k) => st[k] < 1);
  const testScore = app.raw(sub.id, n).test;
  const steps: { k: 'theory' | 'video' | 'practice' | 'test'; t: string; d: string; to: string; cls: string; icon: IconName }[] = [
    { k: 'theory', t: 'Theory', d: 'Learn concepts', to: `${base}/theory`, cls: 'st-green', icon: 'stepTheory' },
    { k: 'video', t: 'Video Lesson', d: 'Watch & understand', to: `${base}/video`, cls: 'st-blue', icon: 'stepVideo' },
    { k: 'practice', t: 'Practice', d: 'Solve questions', to: `${base}/practice`, cls: 'st-purple', icon: 'stepPractice' },
    { k: 'test', t: 'Test', d: 'Chapter test', to: `/quizzes/${sub.id}/${n}`, cls: st.test >= 1 ? 'st-purple' : 'st-grey', icon: st.test >= 1 ? 'progressTests' : 'stepTest' },
  ];
  return (
    <>
      <Crumbs back={`/learning/${sub.id}`} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Chapter ${n}` }]} />
      <section className="card chap-head">
        <h1>Chapter {n}: {title}</h1>
        <div><span>Overall Progress</span><b>{pct}%</b><Bar pct={pct} label="Chapter progress" /></div>
      </section>
      {!lesson ? <NotPublished back={`/learning/${sub.id}`} /> : (
        <>
          <section className="card journey">
            {steps.map((s) => {
              const ok = st[s.k] >= 1;
              const active = !ok && s.k === firstOpen;
              return (
                <div className="step-wrap" key={s.k}>
                  <button className={`step ${s.cls}${active ? ' active' : ''}`} onClick={() => go(s.to)}>
                    <span className="orb"><Icon name={s.icon} size={80} />{ok && <span className="tick"><Check size={20} strokeWidth={3.4} /></span>}</span>
                    <b>{s.t}</b><span>{s.d}</span>
                    {ok ? <em className="ok"><Check size={18} strokeWidth={3} /> Completed</em>
                      : s.k === 'test' && testScore !== null ? <em className="pill violet-pill">Best {testScore}%</em>
                      : active || st[s.k] > 0 ? <em className="pill violet-pill">In Progress</em> : <em className="pill line">Not Started</em>}
                  </button>
                  <ArrowRight className={`arrow${ok ? ' done' : ''}`} size={34} strokeWidth={2} />
                </div>
              );
            })}
            <div className="step-wrap">
              <button className={`step st-gold`} onClick={() => go(`${base}/reward`)}>
                <span className="orb"><Icon name="stepReward" size={84} />{done && <span className="tick"><Check size={20} strokeWidth={3.4} /></span>}</span>
                <b>Completion Reward</b><span>Earn points & badge</span>
              </button>
            </div>
          </section>
          <div className="goal">
            <section className="card"><Icon name="chapterGoal" size={56} /><span><h3>Chapter Goal</h3>Master the concepts, solve problems, and score {PASS_MARK}%+ in the chapter test.</span></section>
            <section className="card"><Icon name="bonusStar" size={52} /><span><h3>+{REWARD} Points</h3>on Completion</span></section>
          </div>
        </>
      )}
    </>
  );
}
