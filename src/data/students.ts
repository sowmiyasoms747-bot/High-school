import type { ClassNo, Seed, Student, SubjectId, TestResult } from './types';

/** Demo students. The app opens as the first one (there is no login). */
export const STUDENTS: Student[] = [
  { id: 'LU10-045', email: 'kavin@learninguniverse.demo', name: 'Kavin R.', cls: 10, section: 'A', avatar: 'kavin', rollNo: '45', guardian: 'Ramesh K.', phone: '90000 00045' },
  { id: 'LU09-032', email: 'meera@learninguniverse.demo', name: 'Meera S.', cls: 9, section: 'B', avatar: 'meera', rollNo: '32', guardian: 'Suresh M.', phone: '90000 00032' },
];

const done = (s: SubjectId, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${s}-${from + i}`);

const t = (subject: SubjectId, title: string, score: number, day: number): TestResult => ({
  id: `seed-${subject}-${title}`, subject, title, score, day,
});

export const SEEDS: Record<ClassNo, Seed> = {
  10: {
    completed: [
      // Maths was taught out of order this term: 1–2 and 5–11 are done, 3 is under way.
      ...done('maths', 1, 2), ...done('maths', 5, 11), ...done('science', 1, 14),
      ...done('english', 1, 8), ...done('social', 1, 12), ...done('tamil', 1, 8),
    ],
    chapters: {
      'maths-3': { theory: [0, 1, 2], video: 1, practice: [0, 1], test: null },
      'science-15': { theory: [0, 1, 2], video: 0.6, practice: [], test: null },
      'social-13': { theory: [0, 1, 2], video: 0.6, practice: [], test: null },
      'tamil-9': { theory: [0, 1, 2], video: 0.6, practice: [], test: null },
    },
    tests: [
      t('science', 'Electricity – Chapter Test', 85, -6), t('maths', 'Circles – Chapter Test', 82, -9),
      t('english', 'Prose – Unit Test 2', 81, -13), t('social', 'Geography – Unit Test', 72, -16),
      t('science', 'Light – Chapter Test', 80, -20), t('maths', 'Triangles – Chapter Test', 74, -25),
      t('tamil', 'இயல் 4–6 – Unit Test', 71, -29), t('english', 'Grammar – Chapter Test', 80, -33),
      t('science', 'Life Processes – Chapter Test', 85, -38), t('maths', 'Polynomials – Chapter Test', 72, -45),
      t('english', 'Prose – Unit Test 1', 76, -52), t('science', 'Acids, Bases and Salts – Chapter Test', 78, -60),
    ],
    assignments: [
      { id: 'm3', subject: 'maths', title: 'Maths – Ch. 3 Practice Set', icon: 'sheet', due: 1, marks: 20, brief: ['Solve questions 1–8 from the Chapter 3 practice set.', 'Use the substitution method for 1–4 and the elimination method for 5–8.', 'Draw a graph for question 8 and mark the point of intersection.'] },
      { id: 's1', subject: 'science', title: 'Science – Chemical Reactions (Worksheet)', icon: 'clipboard', due: 0, marks: 15, brief: ['Balance all ten equations in the worksheet.', 'Name the type of each reaction.', 'Give one everyday example of an oxidation reaction.'] },
      { id: 'e1', subject: 'english', title: 'English – Writing Skills (Essay)', icon: 'essay', due: -4, marks: 20, brief: ['Write an essay of 250–300 words on “Technology in my classroom”.'], graded: { score: 18, feedback: 'Clear structure and a strong conclusion. Vary your sentence openings.' } },
      { id: 'ss1', subject: 'social', title: 'Social Science – Map Work', icon: 'map', due: -6, marks: 10, brief: ['Mark five major dams and three soil types on the outline map of India.'], graded: { score: 9, feedback: 'Neat and accurate. Check the location of the Tungabhadra dam.' } },
    ],
    live: [
      { id: 'l1', subject: 'maths', title: 'Mathematics – Chapter 3', topic: 'Pair of Linear Equations', day: 0, time: '4:00 PM – 5:00 PM', teacher: 'Ms. Priya S.' },
      { id: 'l2', subject: 'science', title: 'Science – Acids, Bases and Salts', topic: 'Revision', day: 1, time: '4:00 PM – 5:00 PM', teacher: 'Mr. Arun V.' },
      { id: 'l3', subject: 'english', title: 'English – Reading Comprehension', topic: 'Exam practice', day: 2, time: '4:00 PM – 5:00 PM', teacher: 'Ms. Kavitha N.' },
    ],
    nextTest: { subject: 'maths', chapter: 3, day: 0, time: '4:00 PM' },
    points: 560, streak: 14, rank: 8, badges: 8,
    certificates: [
      { title: 'Science Quiz – Term 1', by: 'Learning Universe LMS', day: -40 },
      { title: 'Maths Olympiad Practice', by: 'Learning Universe LMS', day: -75 },
      { title: '10-Day Learning Streak', by: 'Learning Universe LMS', day: -5 },
    ],
  },
  9: {
    completed: [...done('maths', 1, 3), ...done('science', 1, 7), ...done('english', 1, 5), ...done('social', 1, 9), ...done('tamil', 1, 4)],
    chapters: {
      'maths-4': { theory: [0, 1, 2], video: 0.5, practice: [], test: null },
      'science-8': { theory: [0], video: 0, practice: [], test: null },
    },
    tests: [
      t('maths', 'Coordinate Geometry – Chapter Test', 84, -4), t('science', 'Motion – Chapter Test', 78, -8),
      t('english', 'Prose – Unit Test 1', 86, -15), t('social', 'History – Unit Test', 75, -19),
      t('tamil', 'இயல் 1–2 – Unit Test', 80, -24), t('maths', 'Polynomials – Chapter Test', 77, -31),
    ],
    assignments: [
      { id: 'm4', subject: 'maths', title: 'Maths – Ch. 4 Graph Sheet', icon: 'sheet', due: 2, marks: 15, brief: ['Draw the graphs of three linear equations from the worksheet.', 'List four solutions for each equation.'] },
      { id: 's8', subject: 'science', title: 'Science – Laws of Motion (Worksheet)', icon: 'clipboard', due: 1, marks: 15, brief: ['Answer all eight questions.', 'Show the formula and units in every numerical.'] },
      { id: 'e9', subject: 'english', title: 'English – Diary Entry', icon: 'essay', due: -3, marks: 10, brief: ['Write a diary entry in 120 words.'], graded: { score: 9, feedback: 'Lovely voice and good use of tense.' } },
    ],
    live: [
      { id: 'n1', subject: 'maths', title: 'Mathematics – Chapter 4', topic: 'Linear Equations', day: 0, time: '4:00 PM – 5:00 PM', teacher: 'Ms. Priya S.' },
      { id: 'n2', subject: 'science', title: 'Science – Force and Laws of Motion', topic: 'Numericals', day: 1, time: '3:00 PM – 4:00 PM', teacher: 'Mr. Arun V.' },
    ],
    nextTest: { subject: 'maths', chapter: 4, day: 3, time: '3:00 PM' },
    points: 420, streak: 9, rank: 5, badges: 5,
    certificates: [{ title: 'Maths Quiz – Term 1', by: 'Learning Universe LMS', day: -32 }],
  },
};
