import { ChevronRight, Upload } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { Crumbs, Empty, Tabs } from '../components/ui';
import type { Assignment } from '../data/types';
import { shortDate, useApp, useSession } from '../state';

const ICON: Record<Assignment['icon'], IconName> = { sheet: 'workSheet', clipboard: 'workClipboard', essay: 'workEssay', map: 'workMap' };

function Status({ a }: { a: Assignment }) {
  const st = useApp().assignmentState(a);
  if (st === 'graded') return <span className="pill green two">Graded <br />{a.graded!.score} / {a.marks}</span>;
  return st === 'submitted' ? <span className="pill violet-pill">Submitted</span> : <span className="pill red">To Do</span>;
}
function useWhen() {
  const app = useApp();
  return (a: Assignment) => {
    const st = app.assignmentState(a);
    if (st === 'todo') return `Due: ${shortDate(a.due)}, 11:59 PM`;
    const at = app.data.submissions[a.id]?.at;
    const d = at ? new Date(at) : null;
    return `Submitted on ${d ? `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}` : shortDate(a.due)}`;
  };
}

export function AssignmentsPage() {
  const app = useApp();
  const when = useWhen();
  const [tab, setTab] = useState(0);
  const all = app.seed.assignments;
  const todo = all.filter((a) => app.assignmentState(a) === 'todo');
  const sent = all.filter((a) => app.assignmentState(a) !== 'todo');
  const list = [all, todo, sent][tab];
  return (
    <>
      <h1>Assignments</h1>
      <Tabs items={[`All (${all.length})`, `To Do (${todo.length})`, `Submitted (${sent.length})`]} value={tab} onChange={setTab} />
      <div className="rows">
        {list.map((a) => (
          <Link key={a.id} className="row tall" to={`/assignments/${a.id}`}>
            <Icon name={ICON[a.icon]} size={58} /><span className="row-t"><b>{a.title}</b>{when(a)}</span><Status a={a} /><ChevronRight size={24} />
          </Link>
        ))}
        {!list.length && <Empty title="Nothing here">You have no assignments in this list.</Empty>}
      </div>
    </>
  );
}

export function AssignmentPage() {
  const app = useApp();
  const { setToast } = useSession();
  const when = useWhen();
  const { id } = useParams();
  const a = app.seed.assignments.find((x) => x.id === id);
  const [text, setText] = useState('');
  const [file, setFile] = useState<string>();
  const [error, setError] = useState('');
  if (!a) return <Navigate to="/assignments" replace />;
  const st = app.assignmentState(a);
  const sub = app.data.submissions[a.id];
  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return setError('Write an answer or attach a file first.');
    app.submitAssignment(a.id, text.trim(), file);
    setToast('Assignment submitted.');
  };
  return (
    <>
      <Crumbs back="/assignments" items={[{ label: 'Assignments', to: '/assignments' }, { label: app.subject(a.subject)!.name }]} />
      <section className="card chap-head"><div className="grow"><h1>{a.title}</h1><p>{when(a)} • {a.marks} marks</p></div><Status a={a} /></section>
      <section className="card pad"><h2>Instructions</h2><ol className="steps">{a.brief.map((b) => <li key={b}>{b}</li>)}</ol></section>
      {st === 'todo' && (
        <form className="card pad notes" onSubmit={send}>
          <h2>Your work</h2>
          <textarea rows={6} value={text} onChange={(e) => { setText(e.target.value); setError(''); }} placeholder="Type your answer here" aria-label="Your answer" />
          <label className="upload"><Upload size={24} /><span>{file ?? 'Attach a file (PDF, image or document)'}</span><input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => { setFile(e.target.files?.[0]?.name); setError(''); }} /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="btn">Submit Assignment</button>
        </form>
      )}
      {st === 'submitted' && <section className="card pad"><h2>Your submission</h2>{sub.text && <p className="pre">{sub.text}</p>}{sub.file && <p><b>File:</b> {sub.file}</p>}<p className="muted">Waiting for your teacher to grade it.</p></section>}
      {st === 'graded' && <section className="card pad"><h2>Teacher feedback</h2><p className="score">{a.graded!.score} / {a.marks}</p><p>{a.graded!.feedback}</p></section>}
    </>
  );
}
