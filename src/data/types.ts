export type SubjectId = 'maths' | 'science' | 'english' | 'social' | 'tamil';
export type ClassNo = 9 | 10;

export interface Subject {
  id: SubjectId;
  name: string;
  short: string;
  note?: string;
  chapters: string[];
}

/** [question, options, index of correct option, explanation] – text supports $math$ */
export type Question = [q: string, options: string[], answer: number, why: string];

export interface Lesson {
  concept: string[];
  equations?: string[];
  conclusion: string;
  figure?: 'lines' | 'parabola';
  example: { problem: string; steps: string[] };
  keyPoints: string[];
  practice: Question[];
  test: Question[];
  /** Set this to an mp4 URL to replace the built-in animated lesson. */
  videoUrl?: string;
}

export interface Assignment {
  id: string;
  subject: SubjectId;
  title: string;
  icon: 'sheet' | 'clipboard' | 'essay' | 'map';
  /** Days from today (negative = in the past). */
  due: number;
  marks: number;
  brief: string[];
  graded?: { score: number; feedback: string };
}

export interface LiveClass {
  id: string;
  subject: SubjectId;
  title: string;
  topic: string;
  day: number;
  time: string;
  teacher: string;
}

export interface TestResult {
  id: string;
  subject: SubjectId;
  title: string;
  score: number;
  day: number;
}

export interface ChapterProgress {
  theory: number[];
  video: number;
  practice: number[];
  test: number | null;
}

export interface Seed {
  completed: string[];
  chapters: Record<string, ChapterProgress>;
  tests: TestResult[];
  assignments: Assignment[];
  live: LiveClass[];
  nextTest: { subject: SubjectId; chapter: number; day: number; time: string };
  points: number;
  streak: number;
  rank: number;
  badges: number;
  certificates: { title: string; by: string; day: number }[];
}

export interface Student {
  id: string;
  email: string;
  password: string;
  name: string;
  cls: ClassNo;
  section: string;
  avatar: 'kavin' | 'meera';
  rollNo: string;
  guardian: string;
  phone: string;
}
