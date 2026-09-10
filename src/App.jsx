import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useLang } from './context/LanguageContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Schools = lazy(() => import('./pages/Schools.jsx'));
const SchoolSetup = lazy(() => import('./pages/SchoolSetup.jsx'));
const Academic = lazy(() => import('./pages/Academic.jsx'));
const Students = lazy(() => import('./pages/Students.jsx'));
const Teachers = lazy(() => import('./pages/Teachers.jsx'));
const Parents = lazy(() => import('./pages/Parents.jsx'));
const Admissions = lazy(() => import('./pages/Admissions.jsx'));
const Attendance = lazy(() => import('./pages/Attendance.jsx'));
const Timetable = lazy(() => import('./pages/Timetable.jsx'));
const Exams = lazy(() => import('./pages/Exams.jsx'));
const Fees = lazy(() => import('./pages/Fees.jsx'));
const Homework = lazy(() => import('./pages/Homework.jsx'));
const Library = lazy(() => import('./pages/Library.jsx'));
const Transport = lazy(() => import('./pages/Transport.jsx'));
const Notices = lazy(() => import('./pages/Notices.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const Leaves = lazy(() => import('./pages/Leaves.jsx'));
const Complaints = lazy(() => import('./pages/Complaints.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));

function ScreenFallback() {
  const { t } = useLang();
  return <p className="text-slate-500 p-6">{t('common.loading')}</p>;
}

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
    <Suspense fallback={<ScreenFallback />}>
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
    </Suspense>
  );
}
