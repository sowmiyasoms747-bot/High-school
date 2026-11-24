import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { askBuddy } from '../buddy';
import { Icon, type IconName } from '../components/Icon';
import { Rich } from '../components/ui';
import { useApp } from '../state';

export function BuddyPage() {
  const app = useApp();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const { chat } = app.data;
  useEffect(() => { if (chat.length) end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [chat.length]);
  const ask = (text: string) => {
    if (!text.trim()) return;
    app.addChat({ from: 'me', text: text.trim() }, { from: 'buddy', text: askBuddy(text, app) });
    setQ('');
  };
  const cards: { t: string; d: string; icon: IconName; act: () => void }[] = [
    { t: 'Ask a Doubt', d: 'Get instant solutions', icon: 'buddyAsk', act: () => input.current?.focus() },
    { t: 'Explain Concept', d: 'In simple steps', icon: 'buddyExplain', act: () => ask('Explain concept') },
    { t: 'Summarize Notes', d: 'Key takeaways', icon: 'buddySummarize', act: () => ask('Summarize notes') },
    { t: 'Practice Question', d: 'Similar & exam-based', icon: 'buddyPractice', act: () => ask('Give practice question') },
    { t: 'Create Study Plan', d: 'For exams & revision', icon: 'buddyPlan', act: () => ask('Create study plan') },
  ];
  return (
    <div className="buddy">
      <h1 className="with-ico"><Icon name="buddyRobot" size={44} /> AI Study Buddy</h1>
      <section className="buddy-hero"><Icon name="buddyRobot" size={136} /><div><h2>Your AI Learning Assistant</h2><p>Ask doubts, learn concepts, practice questions, get summaries, and create a study plan.</p></div></section>
      <div className="buddy-cards">{cards.map((c) => <button key={c.t} className="card" onClick={c.act}><Icon name={c.icon} size={64} /><b>{c.t}</b><span>{c.d}</span></button>)}</div>
      {chat.length > 0 && (
        <section className="card chat" aria-live="polite">
          <header><h2>Chat</h2><button className="link" onClick={app.clearChat}><Trash2 size={18} /> Clear</button></header>
          {chat.map((m, i) => <div key={i} className={`bub ${m.from}`}>{m.text.split('\n').map((l, k) => <p key={k}><Rich text={l} /></p>)}</div>)}
        </section>
      )}
      <div ref={end} className="chat-end" />
      <form className="ask" onSubmit={(e: FormEvent) => { e.preventDefault(); ask(q); }}>
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={'Ask a question... (e.g., “Solve x² − 5x + 6 = 0”)'} aria-label="Ask a question" />
        <button className="send" aria-label="Send"><Icon name="buddySend" size={72} /></button>
      </form>
    </div>
  );
}
