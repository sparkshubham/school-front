import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { PageSpinner } from '../components/ui.jsx';

const SuperDashboard = lazy(() => import('./dashboards/SuperDashboard.jsx'));
const SchoolDashboard = lazy(() => import('./dashboards/SchoolDashboard.jsx'));
const TeacherDashboard = lazy(() => import('./dashboards/TeacherDashboard.jsx'));
const ParentDashboard = lazy(() => import('./dashboards/ParentDashboard.jsx'));
const StudentDashboard = lazy(() => import('./dashboards/StudentDashboard.jsx'));

export default function Home() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<PageSpinner />}>
      {user?.role === 'super_admin' ? (
        <SuperDashboard />
      ) : user?.role === 'teacher' ? (
        <TeacherDashboard />
      ) : user?.role === 'parent' ? (
        <ParentDashboard />
      ) : user?.role === 'student' ? (
        <StudentDashboard />
      ) : (
        <SchoolDashboard />
      )}
    </Suspense>
  );
}
