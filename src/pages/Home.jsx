import { useAuth } from '../context/AuthContext.jsx';
import SuperDashboard from './dashboards/SuperDashboard.jsx';
import SchoolDashboard from './dashboards/SchoolDashboard.jsx';
import TeacherDashboard from './dashboards/TeacherDashboard.jsx';
import ParentDashboard from './dashboards/ParentDashboard.jsx';
import StudentDashboard from './dashboards/StudentDashboard.jsx';

export default function Home() {
  const { user } = useAuth();
  if (user?.role === 'super_admin') return <SuperDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  if (user?.role === 'parent') return <ParentDashboard />;
  if (user?.role === 'student') return <StudentDashboard />;
  return <SchoolDashboard />;
}
