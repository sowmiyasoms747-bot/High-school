import { Download, Mic, MicOff, PhoneOff, PlayCircle, SendHorizontal, Video, VideoOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { SubjectIcon, TeacherBoard } from '../components/Art';
import { Icon, LiveBadge, type IconName } from '../components/Icon';
import { AVATARS } from '../components/Layout';
import { Crumbs, Empty, Tabs } from '../components/ui';
import { relDate, useApp, useSession } from '../state';
import { downloadNotes } from './Learning';

/** Next-class tiles alternate between the two supplied designs. */
const NEXT_ICONS: IconName[] = ['classCalendar', 'classNotes'];

export function LivePage() {
  const app = useApp();
  const { setToast } = useSession();
  const [tab, setTab] = useState(0);
  const [now, ...next] = app.seed.live;
  const lessons = app.subjects.flatMap((s) => s.chapters.map((t, i) => ({ s, n: i + 1, t, l: app.lesson(s.id, i + 1) }))).filter((c) => c.l && app.status(c.s.id, c.n) !== 'locked');
  return (
    <>
      <h1>Live Classes</h1>
      <Tabs items={['Upcoming', 'Recordings', 'Resources']} value={tab} onChange={setTab} />
      {tab === 0 && now && (
        <>
          <section className="card live">
            <div className="thumb"><TeacherBoard /><LiveBadge /></div>
            <div><h2>{now.title}</h2><p className="topic">{now.topic}</p><p>{relDate(now.day)}, {now.time}</p><p>By {now.teacher}</p><Link className="btn" to={`/live/${now.id}`}>Join Class</Link></div>
          </section>
          <h2 className="sub">Next Classes</h2>
          <div className="rows">
            {next.map((c, i) => {
              const on = app.data.reminders.includes(c.id);
              return (
                <div className="row" key={c.id}><Icon name={NEXT_ICONS[i % NEXT_ICONS.length]} size={52} /><span className="row-t"><b>{c.title}</b>{relDate(c.day)}, {c.time}</span>
                  <button className={`bell${on ? ' on' : ''}`} aria-pressed={on} aria-label={`Reminder for ${c.title}`} onClick={() => { app.toggleReminder(c.id); setToast(on ? 'Reminder removed.' : 'Reminder saved.'); }}><Icon name="bell" size={34} /></button></div>
              );
            })}
          </div>
        </>
      )}
      {tab === 1 && (
        <div className="rows">{lessons.map((c) => <Link key={c.s.id + c.n} className="row" to={`/learning/${c.s.id}/${c.n}/video`}><SubjectIcon id={c.s.id} size={46} /><span className="row-t"><b>{c.s.name} – Chapter {c.n}</b>{c.t}</span><PlayCircle size={32} className="violet" /></Link>)}</div>
      )}
      {tab === 2 && (
        <div className="rows">{lessons.map((c) => <button key={c.s.id + c.n} className="row" onClick={() => downloadNotes(`${c.s.name} – Chapter ${c.n} ${c.t}`, c.l!)}><Icon name="classNotes" size={50} /><span className="row-t"><b>{c.s.name} – Chapter {c.n} notes</b>{c.t}</span><Download size={26} className="violet" /></button>)}</div>
      )}
      {tab > 0 && !lessons.length && <Empty title="Nothing here yet" />}
    </>
  );
}

/** Classroom screen. Put your video provider (Zoom, Meet, Jitsi…) inside `.stage`. */
export function ClassroomPage() {
  const app = useApp();
  const go = useNavigate();
  const { id } = useParams();
  const c = app.seed.live.find((x) => x.id === id);
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  if (!c) return <Navigate to="/live" replace />;
  const send = (e: FormEvent) => { e.preventDefault(); if (msg.trim()) { setChat([...chat, msg.trim()]); setMsg(''); } };
  return (
    <>
      <Crumbs back="/live" items={[{ label: 'Live Classes', to: '/live' }, { label: c.title }]} />
      <div className="room">
        <section className="card stage-card">
          <div className="stage"><TeacherBoard /><LiveBadge /><span className="who">{c.teacher}</span><span className="self">{cam ? <img src={AVATARS[app.student.avatar]} alt="" /> : <VideoOff size={26} />}<em>You</em></span></div>
          <div className="room-ctl">
            <button className={mic ? 'on' : ''} aria-pressed={mic} aria-label="Microphone" onClick={() => setMic(!mic)}>{mic ? <Mic /> : <MicOff />}</button>
            <button className={cam ? 'on' : ''} aria-pressed={cam} aria-label="Camera" onClick={() => setCam(!cam)}>{cam ? <Video /> : <VideoOff />}</button>
            <button className="leave" onClick={() => go('/live')}><PhoneOff /> Leave</button>
          </div>
        </section>
        <section className="card chatbox">
          <h2>Class Chat</h2>
          <div className="msgs">{chat.length ? chat.map((m, i) => <p key={i}><b>You</b>{m}</p>) : <p className="muted">No messages yet.</p>}</div>
          <form onSubmit={send}><input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type a message" aria-label="Type a message" /><button className="btn sq" aria-label="Send"><SendHorizontal size={22} /></button></form>
        </section>
      </div>
    </>
  );
}
