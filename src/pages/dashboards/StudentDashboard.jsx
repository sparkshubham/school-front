import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { PageHeader, StatCard, PageSpinner } from '../../components/ui.jsx';
import { fullName, fmtDate } from '../../utils/format.js';
import { useLang } from '../../context/LanguageContext.jsx';

export default function StudentDashboard() {
  const { t, locale } = useLang();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    api
      .get('/dashboard/student')
      .then((r) => live && setData(r.data))
      .catch(() => live && setError(t('common.loadError')));
    return () => {
      live = false;
    };
  }, []);
  const s = data?.student;
  return (
    <div>
      <PageHeader
        title={s ? fullName(s) : t('dash.student')}
        subtitle={s ? `${s.classId?.name}-${s.sectionId?.name} · ${t('dash.roll', { n: s.rollNo })}` : ''}
      />
      {error && <p className="text-rose-600 mb-4">{error}</p>}
      {!data && !error ? <PageSpinner /> : null}
      {data ? (
      <>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard label={t('dash.homeworkDue')} value={data.homework?.length || 0} />
        <StatCard label={t('dash.invoices')} value={data.invoices?.length || 0} tone="gold" />
      </div>
      <div className="card p-5">
        <h3 className="font-semibold mb-3">{t('dash.homework')}</h3>
        {data.homework?.map((h) => (
          <div key={h._id} className="flex justify-between py-2 border-b border-slate-50">
            <span>{h.title}</span>
            <span className="text-sm text-slate-500">{fmtDate(h.dueDate, locale)}</span>
          </div>
        ))}
      </div>
      </>
      ) : null}
    </div>
  );
}
