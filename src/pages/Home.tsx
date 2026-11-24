import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CapBooks } from '../components/Art';
import { Icon, type IconName } from '../components/Icon';
import { GlossRing } from '../components/ui';
import { longDate, shortDate, useApp } from '../state';

export function HomePage() {
  const app = useApp();
  const { nextTest: scheduled, assignments, live } = app.seed;
  // Once the scheduled test is passed, show the next open chapter test instead.
  const upcoming = app.subjects.flatMap((s) => {
    const c = app.currentChapter(s.id);
    return c && app.lesson(s.id, c) ? [{ subject: s.id, chapter: c, when: 'Open now' }] : [];
  });
  const nextTest = app.status(scheduled.subject, scheduled.chapter) === 'completed' ? upcoming[0] : { ...scheduled, when: `${longDate(scheduled.day)} • ${scheduled.time}` };
  const n = app.currentChapter('maths');
  const resume = n ? `/learning/maths/${n}` : '/learning';
  const todo = assignments.filter((a) => app.assignmentState(a) === 'todo');
  const actions: { to: string; label: [string, string]; icon: IconName }[] = [
    { to: resume, label: ['Continue', 'Learning'], icon: 'continueLearning' },
    { to: '/quizzes', label: ['Take a', 'Quiz'], icon: 'quiz' },
    { to: todo[0] ? `/assignments/${todo[0].id}` : '/assignments', label: ['Submit', 'Assignment'], icon: 'submit' },
    { to: live[0] ? `/live/${live[0].id}` : '/live', label: ['Join', 'Live Class'], icon: 'liveClass' },
    { to: '/buddy', label: ['Ask AI', 'Doubt'], icon: 'askAi' },
  ];
  return (
    <>
      <section className="hero">
        <svg className="hero-lines" viewBox="0 0 900 260" preserveAspectRatio="none" aria-hidden="true"><path d="M300 260C520 250 640 120 900 0v260z" fill="#fff" opacity=".13" /><path d="M520 260c120-30 250-90 380-190v190z" fill="#fff" opacity=".12" /><path d="m440 90 46-50 18 56zM486 40l-8 56" fill="none" stroke="#fff" opacity=".6" /></svg>
        <div>
          <h1>Exam Readiness<br />for Classes 9 – 10</h1>
          <p><span>Learn • Practice • Test</span> • Improve</p>
          <Link to={resume} className="btn">Start Learning <ArrowRight size={20} /></Link>
        </div>
        <CapBooks />
      </section>
      <section className="panel">
        <h2>Quick Actions</h2>
        <div className="quick">
          {actions.map((a) => (
            <Link key={a.label.join()} to={a.to} className="card"><Icon name={a.icon} size={64} /><span>{a.label[0]}<br />{a.label[1]}</span></Link>
          ))}
        </div>
      </section>
      <div className="trio">
        <Link to="/progress" className="card">
          <h3>My Progress</h3>
          <div className="mini"><GlossRing pct={app.overallPct} size={112} /><span className="big-num"><b>{app.overallPct}%</b>Overall</span></div>
        </Link>
        <Link to={nextTest ? `/quizzes/${nextTest.subject}/${nextTest.chapter}` : '/quizzes'} className="card">
          <h3>Chapter Test</h3>
          <div className="mini left"><Icon name="calendar" size={58} /><span>{nextTest ? <><b>Next: {app.subject(nextTest.subject)!.short} – Ch. {nextTest.chapter}</b>{nextTest.when}</> : <><b>No tests due</b>You are up to date</>}</span></div>
        </Link>
        <Link to={todo[0] ? `/assignments/${todo[0].id}` : '/assignments'} className="card">
          <h3>Recent Assignment</h3>
          <div className="mini left"><Icon name="assignment" size={58} /><span>{todo[0] ? <><b>{todo[0].title}</b>Due: {shortDate(todo[0].due)}</> : <><b>All caught up</b>No pending work</>}</span></div>
        </Link>
      </div>
    </>
  );
}
