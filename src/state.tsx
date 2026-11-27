import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LESSONS } from './data/lessons';
import { SEEDS, STUDENTS } from './data/students';
import { SUBJECTS } from './data/subjects';
import type { Assignment, ChapterProgress, Lesson, Student, Subject, SubjectId, TestResult } from './data/types';

export interface ChatMessage { from: 'me' | 'buddy'; text: string }
interface Submission { text: string; file?: string; at: string }

interface Saved {
  completed: string[];
  chapters: Record<string, ChapterProgress>;
  tests: TestResult[];
  points: number;
  submissions: Record<string, Submission>;
  reminders: string[];
  notes: Record<string, string>;
  profile: { phone: string; guardian: string };
  prefs: Record<string, boolean>;
  chat: ChatMessage[];
  /** Last page visited inside each chapter, so Continue resumes there. */
  last: Record<string, string>;
  /** Notification ids the student has already seen. */
  seen: string[];
}

/** new: never opened · current: started, not finished · completed: finished. */
export type ChapterStatus = 'completed' | 'current' | 'new';
export const PASS_MARK = 80;
export const REWARD = 100;
const EMPTY: ChapterProgress = { theory: [], video: 0, practice: [], test: null };
const SESSION = 'lu-hs-session';
const dataKey = (id: string) => `lu-hs-data-${id}`;
const chapKey = (s: SubjectId, n: number) => `${s}-${n}`;

function read<T>(store: Storage, key: string): T | null {
  try { return JSON.parse(store.getItem(key) || 'null') as T | null; } catch { return null; }
}

function initial(st: Student): Saved {
  const seed = SEEDS[st.cls];
  const base: Saved = {
    completed: seed.completed, chapters: seed.chapters, tests: seed.tests, points: seed.points,
    submissions: {}, reminders: [], notes: {}, profile: { phone: st.phone, guardian: st.guardian },
    prefs: { classReminders: true, dueAlerts: true, testResults: true, weeklyReport: false }, chat: [], last: {}, seen: [],
  };
  return { ...base, ...(read<Partial<Saved>>(localStorage, dataKey(st.id)) ?? {}) };
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function useStore() {
  const [student, setStudent] = useState<Student | null>(() => {
    const id = read<string>(localStorage, SESSION) ?? read<string>(sessionStorage, SESSION);
    return STUDENTS.find((s) => s.id === id) ?? null;
  });
  const [data, setData] = useState<Saved | null>(() => (student ? initial(student) : null));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (student && data) localStorage.setItem(dataKey(student.id), JSON.stringify(data));
  }, [student, data]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const login = useCallback((idOrEmail: string, password: string) => {
    const key = idOrEmail.trim().toLowerCase();
    const st = STUDENTS.find((s) => (s.id.toLowerCase() === key || s.email === key) && s.password === password);
    if (!st) return false;
    localStorage.setItem(SESSION, JSON.stringify(st.id));
    setStudent(st);
    setData(initial(st));
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION);
    sessionStorage.removeItem(SESSION);
    setStudent(null);
    setData(null);
  }, []);

  const keepSignedIn = useCallback((on: boolean) => {
    if (!student) return;
    (on ? sessionStorage : localStorage).removeItem(SESSION);
    (on ? localStorage : sessionStorage).setItem(SESSION, JSON.stringify(student.id));
  }, [student]);

  const patch = useCallback((fn: (d: Saved) => Partial<Saved>) => setData((d) => (d ? { ...d, ...fn(d) } : d)), []);

  const api = useMemo(() => {
    if (!student || !data) return null;
    const seed = SEEDS[student.cls];
    const subjects = SUBJECTS[student.cls];
    const subject = (id: string): Subject | undefined => subjects.find((s) => s.id === id);
    const lesson = (s: SubjectId, n: number): Lesson | undefined => LESSONS[`${student.cls}-${s}-${n}`];
    const raw = (s: SubjectId, n: number) => data.chapters[chapKey(s, n)] ?? EMPTY;
    const isDone = (s: SubjectId, n: number) => data.completed.includes(chapKey(s, n));

    /** 0–1 for each of the four learning stages. */
    const stages = (s: SubjectId, n: number) => {
      if (isDone(s, n)) return { theory: 1, video: 1, practice: 1, test: 1 };
      const p = raw(s, n);
      const total = lesson(s, n)?.practice.length ?? 5;
      return {
        theory: Math.min(1, p.theory.filter((t) => t < 3).length / 3),
        video: p.video,
        practice: Math.min(1, p.practice.length / total),
        test: p.test !== null && p.test >= PASS_MARK ? 1 : 0,
      };
    };
    const chapterPct = (s: SubjectId, n: number) => {
      const st = stages(s, n);
      return Math.floor(((st.theory + st.video + st.practice + st.test) / 4) * 100 + 1e-6);
    };
    /** Every chapter is open. It counts as started once visited or once any work is saved. */
    const isStarted = (s: SubjectId, n: number) => {
      const p = raw(s, n);
      return !!data.last[chapKey(s, n)] || p.theory.length > 0 || p.video > 0 || p.practice.length > 0 || p.test !== null;
    };
    const status = (s: SubjectId, n: number): ChapterStatus => (isDone(s, n) ? 'completed' : isStarted(s, n) ? 'current' : 'new');
    /** Where Continue should take the student: the last page they were on, else the chapter page. */
    const resume = (s: SubjectId, n: number) => data.last[chapKey(s, n)] ?? `/learning/${s}/${n}`;
    const currentChapter = (s: SubjectId) => {
      const chs = subject(s)!.chapters;
      const started = chs.findIndex((_, k) => status(s, k + 1) === 'current');
      if (started >= 0) return started + 1;
      const i = chs.findIndex((_, k) => !isDone(s, k + 1));
      return i < 0 ? null : i + 1;
    };
    const subjectPct = (s: SubjectId) => {
      const { chapters } = subject(s)!;
      const sum = chapters.reduce((a, _, i) => a + chapterPct(s, i + 1), 0);
      return Math.floor(sum / chapters.length + 1e-6);
    };
    const subjectScore = (s: SubjectId) => Math.round(avg(data.tests.filter((t) => t.subject === s).map((t) => t.score)));

    const saveChapter = (s: SubjectId, n: number, change: (p: ChapterProgress) => Partial<ChapterProgress>) =>
      patch((d) => {
        const k = chapKey(s, n);
        if (d.completed.includes(k)) return {};
        const p = d.chapters[k] ?? EMPTY;
        const next = { ...p, ...change(p) };
        const total = lesson(s, n)?.practice.length ?? 5;
        const finished = next.theory.filter((t) => t < 3).length >= 3 && next.video >= 1 && next.practice.length >= total && (next.test ?? 0) >= PASS_MARK;
        return {
          chapters: { ...d.chapters, [k]: next },
          ...(finished ? { completed: [...d.completed, k], points: d.points + REWARD } : {}),
        };
      });

    const assignmentState = (a: Assignment): 'todo' | 'submitted' | 'graded' =>
      a.graded ? 'graded' : data.submissions[a.id] ? 'submitted' : 'todo';

    return {
      student, data, seed, subjects, subject, lesson, raw, stages, chapterPct, status, resume, currentChapter, subjectPct, subjectScore,
      overallPct: Math.round(avg(subjects.map((s) => subjectPct(s.id)))),
      overallScore: Math.round(avg(data.tests.map((t) => t.score))),
      assignmentState,
      visitTheory: (s: SubjectId, n: number, tab: number) =>
        saveChapter(s, n, (p) => (p.theory.includes(tab) ? {} : { theory: [...p.theory, tab] })),
      watchVideo: (s: SubjectId, n: number, f: number) => saveChapter(s, n, (p) => ({ video: Math.max(p.video, f) })),
      solvePractice: (s: SubjectId, n: number, i: number) =>
        saveChapter(s, n, (p) => (p.practice.includes(i) ? {} : { practice: [...p.practice, i] })),
      /** Keeps the best score for each chapter test. */
      finishTest: (s: SubjectId, n: number, score: number) => {
        const id = `chapter-${chapKey(s, n)}`;
        const title = `${subject(s)!.chapters[n - 1]} – Chapter Test`;
        patch((d) => {
          const old = d.tests.find((t) => t.id === id);
          const entry: TestResult = { id, subject: s, title, score: Math.max(score, old?.score ?? 0), day: 0 };
          return { tests: [entry, ...d.tests.filter((t) => t.id !== id)] };
        });
        saveChapter(s, n, (p) => ({ test: Math.max(p.test ?? 0, score) }));
      },
      submitAssignment: (id: string, text: string, file?: string) =>
        patch((d) => ({ submissions: { ...d.submissions, [id]: { text, file, at: new Date().toISOString() } } })),
      toggleReminder: (id: string) =>
        patch((d) => ({ reminders: d.reminders.includes(id) ? d.reminders.filter((x) => x !== id) : [...d.reminders, id] })),
      /** Remembers the page the student is on inside a chapter. */
      visitChapter: (s: SubjectId, n: number, path: string) => {
        if (data.last[chapKey(s, n)] !== path) patch((d) => ({ last: { ...d.last, [chapKey(s, n)]: path } }));
      },
      markSeen: (ids: string[]) => patch((d) => ({ seen: [...new Set([...d.seen, ...ids])] })),
      saveNote: (s: SubjectId, n: number, text: string) => patch((d) => ({ notes: { ...d.notes, [chapKey(s, n)]: text } })),
      note: (s: SubjectId, n: number) => data.notes[chapKey(s, n)] ?? '',
      saveProfile: (profile: Saved['profile']) => patch(() => ({ profile })),
      setPref: (k: string, v: boolean) => patch((d) => ({ prefs: { ...d.prefs, [k]: v } })),
      addChat: (...m: ChatMessage[]) => patch((d) => ({ chat: [...d.chat, ...m] })),
      clearChat: () => patch(() => ({ chat: [] })),
      resetData: () => { localStorage.removeItem(dataKey(student.id)); setData(initial(student)); },
    };
  }, [student, data, patch]);

  return { student, api, login, logout, keepSignedIn, toast, setToast };
}

type Store = ReturnType<typeof useStore>;
export type Api = NonNullable<Store['api']>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useStore()}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx)!;
/** Use inside signed-in pages only. */
export const useApp = (): Api => useContext(Ctx)!.api!;

export function dateFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const shortDate = (days: number) => { const d = dateFromToday(days); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const longDate = (days: number) => `${DAYS[dateFromToday(days).getDay()]}, ${shortDate(days)}`;
export const relDate = (days: number) => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : longDate(days));
