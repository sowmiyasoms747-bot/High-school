import { ArrowRight, Check, ChevronLeft, Download, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LinesGraph, ParabolaGraph } from '../components/Art';
import { Icon } from '../components/Icon';
import { Crumbs, Maths, NotPublished, Rich, Tabs } from '../components/ui';
import type { Lesson } from '../data/types';
import { PASS_MARK, REWARD } from '../state';
import { downloadNotes, useChapter } from './Learning';

const THEORY = ['Concept', 'Example', 'Key Points', 'Notes'];
const Figure = ({ kind }: { kind: Lesson['figure'] }) => (kind === 'lines' ? <LinesGraph /> : kind === 'parabola' ? <ParabolaGraph /> : null);

export function TheoryPage() {
  const ch = useChapter();
  const go = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = Math.min(3, Math.max(0, Number(params.get('tab')) || 0));
  const visit = ch?.app.visitTheory, sid = ch?.sub.id, n = ch?.n, has = !!ch?.lesson;
  useEffect(() => {
    if (visit && sid && n && has) visit(sid, n, tab);
    // `visit` changes identity on every save; the visit itself is idempotent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, n, tab, has]);
  if (!ch) return <Navigate to="/learning" replace />;
  const { app, sub, title, lesson, base } = ch;
  const setTab = (i: number) => setParams({ tab: String(i) }, { replace: true });
  return (
    <>
      <Crumbs back={base} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Ch. ${ch.n}`, to: base }, { label: 'Theory' }]} />
      <h1>{title}</h1>
      {!lesson ? <NotPublished back={`/learning/${sub.id}`} /> : (
        <>
          <Tabs items={THEORY} value={tab} onChange={setTab} />
          {tab === 0 && (
            <section className={`card concept${lesson.figure ? ' has-fig' : ''}`}>
              <h2>Concept Explanation</h2>
              <div className="concept-text">
                {lesson.concept.map((p) => <p key={p}><Rich text={p} /></p>)}
                {lesson.equations && <div className="eqs">{lesson.equations.map((e) => <div key={e}><Maths src={e} /></div>)}</div>}
                <p><Rich text={lesson.conclusion} /></p>
              </div>
              {lesson.figure && <div className="fig"><Figure kind={lesson.figure} /></div>}
            </section>
          )}
          {tab === 1 && (
            <section className="card concept">
              <h2>Worked Example</h2>
              <div className="concept-text"><p><b><Rich text={lesson.example.problem} /></b></p><ol className="steps">{lesson.example.steps.map((s) => <li key={s}><Rich text={s} /></li>)}</ol></div>
            </section>
          )}
          {tab === 2 && (
            <section className="card concept">
              <h2>Key Points</h2>
              <div className="concept-text"><ul className="keys">{lesson.keyPoints.map((k) => <li key={k}><Check size={20} strokeWidth={3} /><span><Rich text={k} /></span></li>)}</ul></div>
            </section>
          )}
          {tab === 3 && (
            <section className="card concept">
              <h2>My Notes</h2>
              <div className="concept-text notes">
                <textarea rows={7} value={app.note(sub.id, ch.n)} onChange={(e) => app.saveNote(sub.id, ch.n, e.target.value)} placeholder="Write your notes here. They save as you type." aria-label="My notes" />
                <button className="btn ghost" onClick={() => downloadNotes(`${sub.name} – Chapter ${ch.n} ${title}`, lesson)}><Download size={20} /> Download chapter notes</button>
              </div>
            </section>
          )}
          <div className="pager">
            <button className="btn ghost" onClick={() => (tab ? setTab(tab - 1) : go(base))}><ChevronLeft size={22} /> Previous</button>
            <button className="btn" onClick={() => (tab < 3 ? setTab(tab + 1) : go(`${base}/video`))}>Next: {tab < 3 ? THEORY[tab + 1] : 'Video Lesson'} <ArrowRight size={22} /></button>
          </div>
        </>
      )}
    </>
  );
}

const SCENE_SECONDS = 6;
function buildScenes(title: string, l: Lesson) {
  return [
    { head: title, lines: ['Chapter lesson'], fig: undefined },
    { head: 'The idea', lines: l.concept, fig: undefined },
    { head: 'Remember', lines: [...(l.equations ?? []).map((e) => `$${e}$`), l.conclusion], fig: undefined },
    ...(l.figure ? [{ head: 'See it on the graph', lines: [], fig: l.figure }] : []),
    { head: 'Example', lines: [l.example.problem], fig: undefined },
    { head: 'Solution', lines: l.example.steps, fig: undefined },
    { head: 'Key points', lines: l.keyPoints, fig: undefined },
  ];
}
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function VideoPage() {
  const ch = useChapter();
  const lesson = ch?.lesson;
  const scenes = useMemo(() => (lesson ? buildScenes(ch!.title, lesson) : []), [lesson, ch?.title]);
  const total = scenes.length * SCENE_SECONDS;
  const [t, setT] = useState(() => {
    const seen = ch && lesson ? ch.app.stages(ch.sub.id, ch.n).video : 0;
    return seen < 1 ? seen * total : 0;
  });
  const [playing, setPlaying] = useState(false);
  const top = useRef(t);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((x) => Math.min(total, x + 0.1)), 100);
    return () => clearInterval(id);
  }, [playing, total]);
  useEffect(() => {
    if (!ch || !lesson || !total || t <= top.current) return;
    if (t >= total) setPlaying(false);
    // Save once a second, and always at the end.
    if (t - top.current >= 1 || t >= total) {
      top.current = t;
      ch.app.watchVideo(ch.sub.id, ch.n, t >= total ? 1 : t / total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, total]);
  if (!ch) return <Navigate to="/learning" replace />;
  const { sub, n, title, base, app } = ch;
  const i = Math.min(scenes.length - 1, Math.floor(t / SCENE_SECONDS));
  const scene = scenes[i];
  const ended = t >= total;
  return (
    <>
      <Crumbs back={base} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Ch. ${n}`, to: base }, { label: 'Video Lesson' }]} />
      <h1>{title}</h1>
      {!lesson ? <NotPublished back={`/learning/${sub.id}`} /> : (
        <>
          <section className="card player">
            {lesson.videoUrl ? (
              <video src={lesson.videoUrl} controls onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) app.watchVideo(sub.id, n, v.currentTime / v.duration); }} onEnded={() => app.watchVideo(sub.id, n, 1)} />
            ) : (
              <>
                <div className="board" onClick={() => setPlaying((p) => !p && !ended)}>
                  <div key={i} className="scene">
                    <h2>{scene.head}</h2>
                    {scene.lines.map((l, k) => <p key={l} style={{ animationDelay: `${0.25 + k * 0.7}s` }}><Rich text={l} /></p>)}
                    {scene.fig && <div className="scene-fig"><Figure kind={scene.fig} /></div>}
                  </div>
                  {!playing && !ended && <span className="big-play"><Play size={40} fill="#fff" /></span>}
                </div>
                <div className="controls">
                  <button onClick={() => { if (ended) { setT(0); setPlaying(true); } else setPlaying((p) => !p); }} aria-label={ended ? 'Replay' : playing ? 'Pause' : 'Play'}>{ended ? <RotateCcw /> : playing ? <Pause /> : <Play />}</button>
                  <input type="range" min={0} max={total} step={0.1} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Seek" style={{ ['--p' as string]: `${(t / total) * 100}%` }} />
                  <span>{clock(t)} / {clock(total)}</span>
                </div>
              </>
            )}
          </section>
          <div className="pager">
            <Link className="btn ghost" to={`${base}/theory`}><ChevronLeft size={22} /> Theory</Link>
            <Link className="btn" to={`${base}/practice`}>Next: Practice <ArrowRight size={22} /></Link>
          </div>
        </>
      )}
    </>
  );
}

export function PracticePage() {
  const ch = useChapter();
  const solved = ch?.lesson ? (ch.app.status(ch.sub.id, ch.n) === 'completed' ? ch.lesson.practice.map((_, i) => i) : ch.app.raw(ch.sub.id, ch.n).practice) : [];
  const [i, setI] = useState(() => {
    const k = ch?.lesson?.practice.findIndex((_, x) => !solved.includes(x)) ?? 0;
    return Math.max(0, k);
  });
  const [pick, setPick] = useState<number | null>(null);
  if (!ch) return <Navigate to="/learning" replace />;
  const { app, sub, n, title, lesson, base } = ch;
  const crumbs = <Crumbs back={base} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Ch. ${n}`, to: base }, { label: 'Practice' }]} />;
  if (!lesson) return <>{crumbs}<h1>{title}</h1><NotPublished back={`/learning/${sub.id}`} /></>;
  const [q, opts, answer, why] = lesson.practice[i];
  const last = i === lesson.practice.length - 1;
  const move = (k: number) => { setI(k); setPick(null); };
  const choose = (k: number) => {
    if (pick === answer) return;
    setPick(k);
    if (k === answer) app.solvePractice(sub.id, n, i);
  };
  return (
    <>
      {crumbs}
      <section className="card quiz">
        <header><h2>Practice {i + 1} of {lesson.practice.length}</h2><span className="pill violet-pill">{solved.length} solved</span></header>
        <p className="q"><Rich text={q} /></p>
        <div className="opts">
          {opts.map((o, k) => (
            <button key={k} className={`opt${pick === k ? (k === answer ? ' on' : ' bad') : ''}`} onClick={() => choose(k)}><span className="radio" /><Rich text={o} />{pick === k && (k === answer ? <Check className="mark" /> : <X className="mark" />)}</button>
          ))}
        </div>
        {pick !== null && <p className={`why${pick === answer ? ' good' : ''}`} role="status">{pick === answer ? <><b>Correct.</b> <Rich text={why} /></> : <><b>Not quite.</b> Try again, or check the theory page.</>}</p>}
      </section>
      <div className="pager">
        <button className="btn ghost" disabled={i === 0} onClick={() => move(i - 1)}><ChevronLeft size={22} /> Previous</button>
        {last ? <Link className="btn" to={`/quizzes/${sub.id}/${n}`}>Go to Test <ArrowRight size={22} /></Link> : <button className="btn" onClick={() => move(i + 1)}>Next <ArrowRight size={22} /></button>}
      </div>
    </>
  );
}

export function RewardPage() {
  const ch = useChapter();
  if (!ch) return <Navigate to="/learning" replace />;
  const { app, sub, n, title, base } = ch;
  const done = app.status(sub.id, n) === 'completed';
  const st = app.stages(sub.id, n);
  const next = sub.chapters[n] ? n + 1 : null;
  const items = [['Read the theory', st.theory], ['Watch the video lesson', st.video], ['Solve all practice questions', st.practice], [`Score ${PASS_MARK}% or more in the test`, st.test]] as const;
  return (
    <>
      <Crumbs back={base} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Ch. ${n}`, to: base }, { label: 'Completion Reward' }]} />
      <section className="card reward">
        <Icon name="stepReward" size={150} />
        <h1>{done ? 'Chapter complete!' : 'Almost there'}</h1>
        <p>{done ? `You finished Chapter ${n}: ${title}.` : `Finish these steps to earn your reward for Chapter ${n}: ${title}.`}</p>
        <span className="reward-pts"><Icon name="bonusStar" size={40} /> +{REWARD} Points</span>
        {!done && <ul>{items.map(([t, v]) => <li key={t} className={v >= 1 ? 'ok' : ''}>{v >= 1 ? <Check size={20} strokeWidth={3} /> : <span className="radio" />}{t}</li>)}</ul>}
        {done ? <Link className="btn" to={next ? `/learning/${sub.id}/${next}` : `/learning/${sub.id}`}>{next ? `Go to Chapter ${next}` : 'Back to chapters'} <ArrowRight size={20} /></Link> : <Link className="btn" to={base}>Back to chapter <ArrowRight size={20} /></Link>}
      </section>
    </>
  );
}
