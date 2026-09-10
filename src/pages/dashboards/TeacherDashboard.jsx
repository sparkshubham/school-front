import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LanguageContext.jsx';
import { PageHeader, StatCard } from '../../components/ui.jsx';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/teacher').then((r) => setData(r.data));
  }, []);
  if (!data) return <p className="text-slate-500">{t('common.loading')}</p>;
  return (
    <div>
      <PageHeader title={t('dash.hello', { name: user?.name?.split(' ')[0] })} subtitle={data.teacher?.designation || t('dash.teacherPortal')} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('dash.assigned')} value={data.assigned.length} />
        <StatCard label={t('dash.homework')} value={data.homework.length} tone="gold" />
        <StatCard label={t('dash.notices')} value={data.notices.length} tone="slate" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('dash.myClasses')}</h3>
          {data.assigned.map((a) => (
            <div key={a._id} className="py-2 border-b border-slate-50">
              {a.classId?.name} {a.sectionId?.name} · {a.subjectId?.name}
            </div>
          ))}
        </div>
        <div className="card p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">{t('dash.homework')}</h3>
            <Link to="/homework" className="text-sm text-pine-700">{t('common.manage')}</Link>
          </div>
          {data.homework.map((h) => (
            <p key={h._id} className="py-2 border-b border-slate-50">{h.title}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
