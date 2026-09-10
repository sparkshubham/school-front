import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { PageHeader, StatCard } from '../../components/ui.jsx';
import { fullName, inr, fmtDate } from '../../utils/format.js';
import { useLang } from '../../context/LanguageContext.jsx';

export default function ParentDashboard() {
  const { t, locale } = useLang();
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/dashboard/parent').then((r) => setData(r.data));
  }, []);
  if (!data) return <p className="text-slate-500">{t('common.loading')}</p>;
  const child = data.parent?.students?.[0];
  const pending = data.invoices?.reduce((s, i) => s + (i.due || 0), 0) || 0;
  return (
    <div>
      <PageHeader
        title={child ? fullName(child) : t('dash.parent')}
        subtitle={child ? `${child.classId?.name}-${child.sectionId?.name}` : ''}
      />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('dash.pendingFees')} value={inr(pending, locale)} tone="gold" />
        <StatCard label={t('dash.homework')} value={data.homework.length} />
        <StatCard label={t('dash.upcomingExams')} value={data.exams.length} tone="slate" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('dash.homework')}</h3>
          {data.homework.map((h) => (
            <div key={h._id} className="py-2 border-b border-slate-50 flex justify-between">
              <span>{h.title}</span>
              <span className="text-sm text-slate-500">{fmtDate(h.dueDate, locale)}</span>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('dash.notices')}</h3>
          {data.notices.map((n) => (
            <p key={n._id} className="py-2 border-b border-slate-50">{n.title}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
