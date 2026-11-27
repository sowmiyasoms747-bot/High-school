import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AchievementsPage } from './pages/Achievements';
import { AssignmentPage, AssignmentsPage } from './pages/Assignments';
import { BuddyPage } from './pages/Buddy';
import { HomePage } from './pages/Home';
import { ChapterPage, MyLearningPage, SubjectPage } from './pages/Learning';
import { PracticePage, RewardPage, TheoryPage, VideoPage } from './pages/Lesson';
import { ClassroomPage, LivePage } from './pages/Live';
import { ProfilePage, ProfileSectionPage } from './pages/Profile';
import { ProgressPage } from './pages/Progress';
import { QuizListPage, QuizPage } from './pages/Quiz';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learning" element={<MyLearningPage />} />
        <Route path="learning/:sid" element={<SubjectPage />} />
        <Route path="learning/:sid/:n" element={<ChapterPage />} />
        <Route path="learning/:sid/:n/theory" element={<TheoryPage />} />
        <Route path="learning/:sid/:n/video" element={<VideoPage />} />
        <Route path="learning/:sid/:n/practice" element={<PracticePage />} />
        <Route path="learning/:sid/:n/reward" element={<RewardPage />} />
        <Route path="quizzes" element={<QuizListPage />} />
        <Route path="quizzes/:sid/:n" element={<QuizPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="assignments/:id" element={<AssignmentPage />} />
        <Route path="live" element={<LivePage />} />
        <Route path="live/:id" element={<ClassroomPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="buddy" element={<BuddyPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:section" element={<ProfileSectionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
