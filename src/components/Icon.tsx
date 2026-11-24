import badgeCrown from '../assets/icons/achievements/badge-crown.webp';
import badgeFlame from '../assets/icons/achievements/badge-flame.webp';
import badgeStar from '../assets/icons/achievements/badge-star.webp';
import certificate from '../assets/icons/achievements/certificate.webp';
import starTrophy from '../assets/icons/achievements/trophy.webp';
import assignment from '../assets/icons/assignment.webp';
import workSheet from '../assets/icons/assignments/sheet.webp';
import workClipboard from '../assets/icons/assignments/clipboard.webp';
import workEssay from '../assets/icons/assignments/essay.webp';
import workMap from '../assets/icons/assignments/map.webp';
import askAi from '../assets/icons/ask-ai.webp';
import buddyRobot from '../assets/icons/buddy/robot.webp';
import buddyAsk from '../assets/icons/buddy/ask.webp';
import buddyExplain from '../assets/icons/buddy/explain.webp';
import buddySummarize from '../assets/icons/buddy/summarize.webp';
import buddyPractice from '../assets/icons/buddy/practice.webp';
import buddyPlan from '../assets/icons/buddy/plan.webp';
import buddySend from '../assets/icons/buddy/send.webp';
import calendar from '../assets/icons/calendar.webp';
import continueLearning from '../assets/icons/continue.webp';
import flame from '../assets/icons/flame.webp';
import liveClass from '../assets/icons/live-class.webp';
import bell from '../assets/icons/live/bell.webp';
import classCalendar from '../assets/icons/live/class-calendar.webp';
import classNotes from '../assets/icons/live/class-notes.webp';
import liveBadge from '../assets/icons/live/live-badge.webp';
import progressChart from '../assets/icons/progress/chart.webp';
import progressTests from '../assets/icons/progress/tests.webp';
import trophy from '../assets/icons/progress/trophy.webp';
import stepTheory from '../assets/icons/journey/theory.webp';
import stepVideo from '../assets/icons/journey/video.webp';
import stepPractice from '../assets/icons/journey/practice.webp';
import stepTest from '../assets/icons/journey/test.webp';
import stepReward from '../assets/icons/journey/reward.webp';
import chapterGoal from '../assets/icons/journey/goal.webp';
import bonusStar from '../assets/icons/journey/bonus.webp';
import quiz from '../assets/icons/quiz.webp';
import star from '../assets/icons/star.webp';
import tamil from '../assets/icons/subjects/tamil.webp';
import social from '../assets/icons/subjects/social.webp';
import science from '../assets/icons/subjects/science.webp';
import maths from '../assets/icons/subjects/maths.webp';
import english from '../assets/icons/subjects/english.webp';
import submit from '../assets/icons/submit.webp';

/** Picture icons. Originals are in /assert; add the optimised file here to use it. */
const ICONS = { assignment, askAi, calendar, continueLearning, flame, liveClass, quiz, star, submit, maths, science, english, social, tamil, bell, classCalendar, classNotes, workSheet, workClipboard, workEssay, workMap, progressChart, progressTests, trophy, badgeCrown, badgeFlame, badgeStar, certificate, starTrophy, buddyRobot, buddyAsk, buddyExplain, buddySummarize, buddyPractice, buddyPlan, buddySend, stepTheory, stepVideo, stepPractice, stepTest, stepReward, chapterGoal, bonusStar };
export type IconName = keyof typeof ICONS;

export function Icon({ name, size }: { name: IconName; size: number }) {
  return <img className="icn" src={ICONS[name]} width={size} height={size} alt="" draggable={false} />;
}

export const LiveBadge = () => <img className="live-tag" src={liveBadge} alt="Live" draggable={false} />;

const MENU = import.meta.glob<string>('../assets/icons/menu/*.webp', { eager: true, import: 'default' });
const menuSrc = (n: string) => MENU[`../assets/icons/menu/${n}.webp`];
export type MenuIconName = 'home' | 'learning' | 'live' | 'assignments' | 'quizzes' | 'progress' | 'achievements' | 'buddy' | 'profile';

/** Menu icon with a white version that shows on the highlighted row. */
export function MenuIcon({ name }: { name: MenuIconName }) {
  return (
    <span className="nav-ico" aria-hidden="true">
      <img src={menuSrc(name)} alt="" draggable={false} />
      <img className="on" src={menuSrc(`${name}-on`)} alt="" draggable={false} />
    </span>
  );
}
