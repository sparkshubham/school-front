import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useLang } from './context/LanguageContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Schools from './pages/Schools.jsx';
import SchoolSetup from './pages/SchoolSetup.jsx';
import Academic from './pages/Academic.jsx';
import Students from './pages/Students.jsx';
import Teachers from './pages/Teachers.jsx';
import Parents from './pages/Parents.jsx';
import Admissions from './pages/Admissions.jsx';
import Attendance from './pages/Attendance.jsx';
import Timetable from './pages/Timetable.jsx';
import Exams from './pages/Exams.jsx';
import Fees from './pages/Fees.jsx';
import Homework from './pages/Homework.jsx';
import Library from './pages/Library.jsx';
import Transport from './pages/Transport.jsx';
import Notices from './pages/Notices.jsx';
import Events from './pages/Events.jsx';
import Leaves from './pages/Leaves.jsx';
import Complaints from './pages/Complaints.jsx';
import Reports from './pages/Reports.jsx';

function Guard({ children }) {
  const { user, loading } = useAuth();
  const { t } = useLang();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        {t('common.loading')}
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Guest>
            <Login />
          </Guest>
        }
      />
      <Route
        element={
          <Guard>
            <DashboardLayout />
          </Guard>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/setup" element={<SchoolSetup />} />
        <Route path="/academic" element={<Academic />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/library" element={<Library />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/events" element={<Events />} />
        <Route path="/leaves" element={<Leaves />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
