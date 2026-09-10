import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { PageHeader, StatCard, Badge } from '../../components/ui.jsx';
import { fullName, inr, fmtDate } from '../../utils/format.js';

export default function SchoolDashboard() {
  const { user, school } = useAuth();
  const { t, locale } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/school').then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-slate-500">{t('dash.loadingCampus')}</p>;

  return (
    <div>
      <PageHeader
        title={t('dash.goodMorning', { name: user?.name?.split(' ')[0] || 'Admin' })}
        subtitle={school?.name || t('dash.school')}
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t('dash.students')} value={data.students} />
        <StatCard label={t('dash.teachers')} value={data.teachers} tone="slate" />
        <StatCard
          label={t('dash.presentToday')}
          value={data.attendance.present}
          hint={t('dash.attnHint', { absent: data.attendance.absent, leave: data.attendance.leave })}
        />
        <StatCard label={t('dash.pendingFees')} value={inr(data.fees.pending, locale)} tone="gold" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500">{t('dash.feesToday')}</p>
          <p className="text-2xl font-semibold mt-1">{inr(data.fees.today, locale)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">{t('dash.thisMonth')}</p>
          <p className="text-2xl font-semibold mt-1">{inr(data.fees.month, locale)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">{t('dash.classes')}</p>
          <p className="text-2xl font-semibold mt-1">{data.classes}</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{t('dash.upcomingExams')}</h3>
            <Link className="text-sm text-pine-700" to="/exams">{t('common.open')}</Link>
          </div>
          {data.exams.map((e) => (
            <div key={e._id} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span>{e.name}</span>
              <Badge status={e.status} />
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{t('dash.events')}</h3>
            <Link className="text-sm text-pine-700" to="/events">{t('dash.calendar')}</Link>
          </div>
          {data.events.map((e) => (
            <div key={e._id} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span>{e.title}</span>
              <span className="text-sm text-slate-500">{fmtDate(e.startDate, locale)}</span>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('dash.announcements')}</h3>
          {data.notices.map((n) => (
            <p key={n._id} className="py-2 border-b border-slate-50 last:border-0">{n.title}</p>
          ))}
        </div>
        <div className="card p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{t('dash.pipeline')}</h3>
            <Link className="text-sm text-pine-700" to="/admissions">CRM</Link>
          </div>
          {data.enquiries.map((n) => (
            <div key={n._id} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span>{n.studentName} · {n.classApplying}</span>
              <Badge status={n.status} />
            </div>
          ))}
        </div>
      </div>
      {data.birthdays?.length > 0 && (
        <div className="card p-5 mt-6">
          <h3 className="font-semibold mb-2">{t('dash.birthdays')}</h3>
          <p className="text-slate-600">{data.birthdays.map(fullName).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
