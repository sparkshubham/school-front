import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { Spinner } from './components/ui.jsx';

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
  return (
    <div className="min-h-screen grid place-items-center bg-[#f4f1ea]">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <ScreenFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (user) return <Navigate to="/" replace />;
  if (loading) {
    return (
      <div className="relative min-h-screen">
        {children}
        <div className="absolute inset-0 grid place-items-center bg-[#f4f1ea]/70">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<ScreenFallback />}>
            <Guest>
              <Login />
            </Guest>
          </Suspense>
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
