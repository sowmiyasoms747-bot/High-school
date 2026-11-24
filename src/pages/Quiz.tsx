import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SubjectIcon } from '../components/Art';
import { Crumbs, Empty, NotPublished, Rich, Ring, Tabs } from '../components/ui';
import { PASS_MARK, longDate, shortDate, useApp } from '../state';
import { useChapter } from './Learning';

export function QuizListPage() {
  const app = useApp();
  const [tab, setTab] = useState(0);
  const { nextTest } = app.seed;
  const open = app.subjects.flatMap((s) => {
    const n = app.currentChapter(s.id);
    const l = n ? app.lesson(s.id, n) : undefined;
    return n && l ? [{ s, n, l }] : [];
  });
  return (
    <>
      <h1>Quizzes & Tests</h1>
      <Tabs items={[`Upcoming (${open.length})`, `Completed (${app.data.tests.length})`]} value={tab} onChange={setTab} />
      <div className="rows">
        {tab === 0 && open.map(({ s, n, l }) => {
          const best = app.raw(s.id, n).test;
          return (
            <Link className="row" key={s.id} to={`/quizzes/${s.id}/${n}`}>
              <SubjectIcon id={s.id} size={44} />
              <span className="row-t"><b>{s.name} – Chapter {n} Test</b>{s.chapters[n - 1]} • {l.test.length} questions • {l.test.length} min{s.id === nextTest.subject && n === nextTest.chapter && <> • <CalendarDays size={16} /> {longDate(nextTest.day)}, {nextTest.time}</>}</span>
              <span className={`pill ${best === null ? 'violet-pill' : 'amber'}`}>{best === null ? 'Start' : `Best ${best}%`}</span><ChevronRight size={24} />
            </Link>
          );
        })}
        {tab === 0 && !open.length && <Empty title="No tests right now">Tests appear here when a chapter is published.</Empty>}
        {tab === 1 && app.data.tests.map((t) => (
          <div className="row" key={t.id}><SubjectIcon id={t.subject} size={44} /><span className="row-t"><b>{t.title}</b>{t.day === 0 ? 'Today' : shortDate(t.day)}</span><span className={`pill ${t.score >= PASS_MARK ? 'green' : 'amber'}`}>{t.score}%</span></div>
        ))}
      </div>
    </>
  );
}

interface Attempt { answers: (number | null)[]; ends: number; at: number }

export function QuizPage() {
  const ch = useChapter();
  const qs = ch?.lesson?.test ?? [];
  const key = ch ? `lu-hs-quiz-${ch.app.student.id}-${ch.sub.id}-${ch.n}` : '';
  const [att, setAtt] = useState<Attempt | null>(() => {
    try {
      const a = JSON.parse(sessionStorage.getItem(key) || 'null') as Attempt | null;
      return a && a.ends > Date.now() && a.answers.length === qs.length ? a : null;
    } catch { return null; }
  });
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<{ score: number; right: number; answers: (number | null)[] } | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (att) sessionStorage.setItem(key, JSON.stringify(att));
  }, [att, key]);
  useEffect(() => {
    if (!att) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [!att]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    if (!att || !ch) return;
    const right = qs.filter((q, i) => att.answers[i] === q[2]).length;
    const score = Math.round((right / qs.length) * 100);
    sessionStorage.removeItem(key);
    ch.app.finishTest(ch.sub.id, ch.n, score);
    setResult({ score, right, answers: att.answers });
    setAtt(null);
    setConfirm(false);
  };
  const timeUp = !!att && now >= att.ends;
  useEffect(() => { if (timeUp) finish(); }, [timeUp]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ch) return <Navigate to="/quizzes" replace />;
  const { sub, n, title, lesson, base, app } = ch;
  const crumbs = <Crumbs back={base} items={[{ label: sub.name, to: `/learning/${sub.id}` }, { label: `Chapter Test – Ch. ${n}` }]} />;
  if (!lesson) return <>{crumbs}<NotPublished back={`/learning/${sub.id}`} /></>;
  const start = () => { setResult(null); setAtt({ answers: qs.map(() => null), ends: Date.now() + qs.length * 60_000, at: 0 }); };

  if (result) {
    const pass = result.score >= PASS_MARK;
    const complete = app.status(sub.id, n) === 'completed';
    return (
      <>
        {crumbs}
        <section className="card result">
          <Ring pct={result.score} size={150} stroke={18}><b>{result.score}%</b>Score</Ring>
          <div><h1>{pass ? 'Well done!' : 'Good try'}</h1><p>You got {result.right} of {qs.length} right. {pass ? (complete ? 'This chapter is complete.' : 'Finish the other steps to complete this chapter.') : `Score ${PASS_MARK}% or more to complete the test.`}</p>
            <div className="acts"><button className="btn ghost" onClick={start}>Try again</button><Link className="btn" to={complete ? `${base}/reward` : base}>{complete ? 'See reward' : 'Back to chapter'} <ArrowRight size={20} /></Link></div></div>
        </section>
        <section className="card review">
          <h2>Review answers</h2>
          {qs.map(([q, opts, ans, why], i) => {
            const mine = result.answers[i];
            const ok = mine === ans;
            return (
              <div key={i} className="rev"><span className={ok ? 'tick' : 'cross'}>{ok ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}</span>
                <div><b>{i + 1}. <Rich text={q} /></b>{!ok && <p>Your answer: {mine === null ? 'Not answered' : <Rich text={opts[mine]} />}</p>}<p>Correct answer: <Rich text={opts[ans]} /></p><p className="muted"><Rich text={why} /></p></div></div>
            );
          })}
        </section>
      </>
    );
  }

  if (!att) {
    return (
      <>
        {crumbs}
        <section className="card intro">
          <SubjectIcon id={sub.id} size={90} /><h1>{title}</h1><p>{qs.length} questions • {qs.length} minutes • Pass mark {PASS_MARK}%</p>
          {app.stages(sub.id, n).practice < 1 && <p className="muted">You still have practice questions left. You can take the test now, or <Link to={`${base}/practice`}>practise first</Link>.</p>}
          <button className="btn" onClick={start}>Start Test <ArrowRight size={22} /></button>
        </section>
      </>
    );
  }

  const i = att.at;
  const [q, opts] = qs[i];
  const left = Math.max(0, Math.ceil((att.ends - now) / 1000));
  const blank = att.answers.filter((a) => a === null).length;
  const to = (k: number) => { setAtt({ ...att, at: k }); setConfirm(false); };
  return (
    <>
      {crumbs}
      <section className="card quiz">
        <header><h2>Question {i + 1} of {qs.length}</h2><span className={`timer${left < 60 ? ' low' : ''}`}><Clock size={30} /> {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span></header>
        <p className="q"><Rich text={q} /></p>
        <div className="opts" role="radiogroup" aria-label="Answers">
          {opts.map((o, k) => (
            <button key={k} role="radio" aria-checked={att.answers[i] === k} className={`opt${att.answers[i] === k ? ' on' : ''}`} onClick={() => setAtt({ ...att, answers: att.answers.map((a, x) => (x === i ? k : a)) })}><span className="radio" /><Rich text={o} /></button>
          ))}
        </div>
        {confirm && <p className="why" role="alert"><b>{blank} {blank === 1 ? 'question is' : 'questions are'} not answered.</b> Submit anyway? <button className="link" onClick={finish}>Yes, submit</button></p>}
      </section>
      <div className="pager">
        <button className="btn ghost" disabled={i === 0} onClick={() => to(i - 1)}><ChevronLeft size={22} /> Previous</button>
        {i < qs.length - 1 ? <button className="btn" onClick={() => to(i + 1)}>Next <ArrowRight size={22} /></button> : <button className="btn" onClick={() => (blank ? setConfirm(true) : finish())}>Submit <ArrowRight size={22} /></button>}
      </div>
    </>
  );
}
