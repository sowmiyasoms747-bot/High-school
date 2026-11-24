import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SubjectIcon } from '../components/Art';
import { Icon } from '../components/Icon';
import { Bar, Tabs, TubeRing } from '../components/ui';
import { PASS_MARK, shortDate, useApp } from '../state';

export function ProgressPage() {
  const app = useApp();
  const [tab, setTab] = useState(0);
  return (
    <>
      <h1>My Progress</h1>
      <Tabs items={['Overview', 'Subject-wise', 'Tests & Exams']} value={tab} onChange={setTab} />
      {tab === 0 && (
        <>
          <div className="prog">
            <section className="card center"><TubeRing pct={app.overallScore} size={280}><b>{app.overallScore}%</b>Overall Score</TubeRing></section>
            <section className="card pad"><h2>Subject Progress</h2>
              <div className="bars">{app.subjects.map((s) => { const v = app.subjectScore(s.id); return <div key={s.id}><span>{s.name}</span><Bar pct={v} gloss={s.id} label={`${s.name} score`} /><b>{v}%</b></div>; })}</div>
            </section>
          </div>
          <div className="trio stats">
            <section className="card"><Icon name="progressChart" size={64} /><h3>Exam Readiness</h3><b>{app.overallScore}%</b><span>Target: 85%</span></section>
            <section className="card"><Icon name="progressTests" size={64} /><h3>Tests Taken</h3><b>{app.data.tests.length}</b><span>(Chapter & Unit)</span></section>
            <section className="card"><Icon name="trophy" size={64} /><h3>Average Rank</h3><b>#{app.seed.rank}</b><span>in Class {app.student.cls}</span></section>
          </div>
        </>
      )}
      {tab === 1 && (
        <div className="rows">
          {app.subjects.map((s) => {
            const tests = app.data.tests.filter((t) => t.subject === s.id).length;
            const doneCount = s.chapters.filter((_, i) => app.status(s.id, i + 1) === 'completed').length;
            return (
              <Link key={s.id} className="row tall" to={`/learning/${s.id}`}>
                <SubjectIcon id={s.id} size={52} />
                <span className="row-t"><b>{s.name}</b>{doneCount} of {s.chapters.length} chapters • {tests} {tests === 1 ? 'test' : 'tests'} • average score {app.subjectScore(s.id)}%<Bar pct={app.subjectPct(s.id)} gloss={s.id} label={`${s.name} completion`} /></span>
                <span className="pct">{app.subjectPct(s.id)}%<em>completed</em></span>
              </Link>
            );
          })}
        </div>
      )}
      {tab === 2 && (
        <div className="card table-wrap"><table><thead><tr><th>Test</th><th>Subject</th><th>Date</th><th>Score</th></tr></thead>
          <tbody>{app.data.tests.map((t) => <tr key={t.id}><td><b>{t.title}</b></td><td>{app.subject(t.subject)!.name}</td><td>{shortDate(t.day)}</td><td><span className={`pill ${t.score >= PASS_MARK ? 'green' : 'amber'}`}>{t.score}%</span></td></tr>)}</tbody></table></div>
      )}
    </>
  );
}
