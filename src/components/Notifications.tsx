import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp, type Api } from '../state';
import { Icon, type IconName } from './Icon';

interface Note { id: string; icon: IconName; title: string; text: string; to: string }

const dueLabel = (d: number) => (d < 0 ? 'Assignment overdue' : d === 0 ? 'Assignment due today' : d === 1 ? 'Assignment due tomorrow' : `Assignment due in ${d} days`);

/** Monday of this week, so the weekly report notifies once a week. */
function weekId() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** Builds the list from the student's data, honouring the switches in Profile → Preferences. */
export function buildNotes(app: Api): Note[] {
  const { prefs } = app.data;
  const notes: Note[] = [];
  if (prefs.classReminders) {
    for (const c of app.seed.live.filter((l) => l.day === 0 || l.day === 1 || (l.day > 1 && app.data.reminders.includes(l.id)))) {
      notes.push({ id: `live-${c.id}`, icon: 'liveClass', title: c.day === 0 ? 'Live class today' : c.day === 1 ? 'Live class tomorrow' : 'Live class reminder', text: `${c.title} • ${c.time}`, to: `/live/${c.id}` });
    }
  }
  if (prefs.dueAlerts) {
    for (const a of app.seed.assignments.filter((x) => app.assignmentState(x) === 'todo' && x.due <= 2).sort((x, y) => x.due - y.due)) {
      notes.push({ id: `due-${a.id}`, icon: 'assignment', title: dueLabel(a.due), text: a.title, to: `/assignments/${a.id}` });
    }
  }
  if (prefs.testResults) {
    for (const t of app.data.tests.filter((x) => x.day >= -7).slice(0, 4)) {
      notes.push({ id: `test-${t.id}-${t.score}`, icon: 'progressTests', title: `Test result: ${t.score}%`, text: t.title, to: '/progress' });
    }
    for (const a of app.seed.assignments.filter((x) => x.graded)) {
      notes.push({ id: `graded-${a.id}`, icon: 'trophy', title: `Assignment graded: ${a.graded!.score}/${a.marks}`, text: a.title, to: `/assignments/${a.id}` });
    }
  }
  if (prefs.weeklyReport) {
    notes.push({ id: `weekly-${weekId()}`, icon: 'progressChart', title: 'Your weekly progress report', text: `Overall progress ${app.overallPct}% • Average score ${app.overallScore}%`, to: '/progress' });
  }
  return notes;
}

export function NotificationBell() {
  const app = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  /** Ids that were unread when the panel opened, so they stay highlighted while it is open. */
  const [fresh, setFresh] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const notes = useMemo(() => buildNotes(app), [app]);
  const unread = notes.filter((n) => !app.data.seen.includes(n.id));
  const anyOn = Object.values(app.data.prefs).some(Boolean);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', click);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', key); };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setFresh(unread.map((n) => n.id));
      if (unread.length) app.markSeen(unread.map((n) => n.id));
    }
    setOpen(!open);
  };

  return (
    <div className="notif" ref={box}>
      <button className="notif-btn" onClick={toggle} aria-expanded={open} aria-label={unread.length ? `Notifications, ${unread.length} unread` : 'Notifications'}>
        <Icon name="bell" size={30} />
        {unread.length > 0 && <span className="notif-dot">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      {open && (
        <div className="notif-pop" role="dialog" aria-label="Notifications">
          <div className="notif-head"><b>Notifications</b><button onClick={() => setOpen(false)} aria-label="Close notifications"><X size={20} /></button></div>
          {notes.length ? (
            <ul>
              {notes.map((n) => (
                <li key={n.id}>
                  <Link to={n.to} className={fresh.includes(n.id) ? 'new' : undefined}>
                    <Icon name={n.icon} size={40} />
                    <span><b>{n.title}</b>{n.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notif-empty">{anyOn ? 'You’re all caught up.' : 'All notifications are turned off.'}</p>
          )}
          <Link to="/profile/preferences" className="notif-foot">Notification settings</Link>
        </div>
      )}
    </div>
  );
}
