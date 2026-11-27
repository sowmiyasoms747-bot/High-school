import { ChevronRight, Headphones, LockKeyhole, Pencil, Settings, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AVATARS } from '../components/Layout';
import { Crumbs } from '../components/ui';
import { useApp, useSession } from '../state';

export function ProfilePage() {
  const { student } = useApp();
  const rows = [
    { to: 'details', icon: UserRound, t: 'My Details', s: '' },
    { to: 'preferences', icon: Settings, t: 'Preferences', s: '(Subjects, Notifications)' },
    { to: 'account', icon: LockKeyhole, t: 'Account Settings', s: '(Learning data)' },
    { to: 'help', icon: Headphones, t: 'Help & Support', s: '' },
  ];
  return (
    <>
      <h1>My Profile</h1>
      <section className="card profile"><img src={AVATARS[student.avatar]} alt="" /><div><h2>{student.name}</h2><p>Class {student.cls} – Section {student.section}</p></div><Link to="/profile/details" className="edit" aria-label="Edit my details"><Pencil size={28} /></Link></section>
      <div className="rows">
        {rows.map(({ to, icon: Icon, t, s }) => <Link key={to} className="row" to={`/profile/${to}`}><Icon size={32} strokeWidth={1.8} /><span className="row-t inline"><b>{t}</b> {s}</span><ChevronRight size={24} /></Link>)}
      </div>
    </>
  );
}

const TITLES: Record<string, string> = { details: 'My Details', preferences: 'Preferences', account: 'Account Settings', help: 'Help & Support' };

export function ProfileSectionPage() {
  const { section = '' } = useParams();
  if (!TITLES[section]) return <Navigate to="/profile" replace />;
  return (
    <>
      <Crumbs back="/profile" items={[{ label: 'My Profile', to: '/profile' }, { label: TITLES[section] }]} />
      {section === 'details' && <Details />}
      {section === 'preferences' && <Preferences />}
      {section === 'account' && <Account />}
      {section === 'help' && <Help />}
    </>
  );
}

function Details() {
  const app = useApp();
  const { setToast } = useSession();
  const { student, data } = app;
  const [f, setF] = useState(data.profile);
  const save = (e: FormEvent) => { e.preventDefault(); app.saveProfile(f); setToast('Details saved.'); };
  return (
    <form className="card pad form" onSubmit={save}>
      <h2>My Details</h2>
      <div className="grid2">
        {[['Name', student.name], ['Student ID', student.id], ['Class', `${student.cls} – Section ${student.section}`], ['Roll number', student.rollNo], ['Email', student.email]].map(([l, v]) => <label key={l}>{l}<input value={v} readOnly /></label>)}
        <label>Parent / guardian<input value={f.guardian} onChange={(e) => setF({ ...f, guardian: e.target.value })} /></label>
        <label>Phone<input value={f.phone} inputMode="tel" onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      </div>
      <p className="muted">Ask your school office to change the greyed-out details.</p>
      <button className="btn">Save</button>
    </form>
  );
}

function Switch({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return <label className="switch"><span>{label}</span><input type="checkbox" role="switch" checked={on} onChange={(e) => set(e.target.checked)} /></label>;
}

function Preferences() {
  const app = useApp();
  const list: [string, string][] = [['classReminders', 'Live class reminders'], ['dueAlerts', 'Assignment due alerts'], ['testResults', 'Test results'], ['weeklyReport', 'Weekly progress report']];
  return (
    <>
      <section className="card pad"><h2>My Subjects</h2><div className="chips">{app.subjects.map((s) => <Link key={s.id} to={`/learning/${s.id}`} className="pill violet-pill">{s.name}</Link>)}</div></section>
      <section className="card pad"><h2>Notifications</h2>{list.map(([k, l]) => <Switch key={k} label={l} on={!!app.data.prefs[k]} set={(v) => app.setPref(k, v)} />)}</section>
    </>
  );
}

function Account() {
  const app = useApp();
  const { setToast } = useSession();
  const [sure, setSure] = useState(false);
  return (
    <>
      <section className="card pad"><h2>Learning data</h2><p>Reset progress, notes, submissions and chat saved on this device.</p>
        {sure ? <div className="acts"><button className="btn ghost" onClick={() => setSure(false)}>Cancel</button><button className="btn danger" onClick={() => { app.resetData(); setSure(false); setToast('Learning data reset.'); }}>Yes, reset</button></div> : <button className="btn ghost" onClick={() => setSure(true)}>Reset my data</button>}</section>
    </>
  );
}

function Help() {
  const faq = [
    ['How do I complete a chapter?', 'Read the theory, watch the video lesson, solve all practice questions and score 80% or more in the chapter test. You can open any chapter at any time.'],
    ['Can I retake a chapter test?', 'Yes. Your best score is kept.'],
    ['How do I submit an assignment?', 'Open Assignments, choose one marked To Do, type your answer or attach a file, then press Submit Assignment.'],
  ];
  return <section className="card pad"><h2>Help & Support</h2>{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>;
}
