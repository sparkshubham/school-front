import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { PageHeader, StatCard, Badge } from '../../components/ui.jsx';
import { inr } from '../../utils/format.js';
import { useLang } from '../../context/LanguageContext.jsx';

export default function SuperDashboard() {
  const { t, locale } = useLang();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/super').then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-slate-500">{t('super.loading')}</p>;

  return (
    <div>
      <PageHeader title={t('super.morning')} subtitle={t('super.subtitle')} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t('super.totalSchools')} value={data.totalSchools} />
        <StatCard label={t('super.active')} value={data.active} tone="slate" />
        <StatCard label={t('super.trial')} value={data.trial} tone="gold" />
        <StatCard label={t('super.expired')} value={data.expired} tone="rose" />
        <StatCard label={t('dash.students')} value={data.totalStudents} />
        <StatCard label={t('dash.teachers')} value={data.totalTeachers} tone="slate" />
        <StatCard label={t('super.monthly')} value={inr(data.monthlyRevenue, locale)} tone="gold" />
        <StatCard label={t('super.annual')} value={inr(data.annualRevenue, locale)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{t('super.recent')}</h3>
            <Link to="/schools" className="text-sm text-pine-700 font-medium">{t('common.manage')}</Link>
          </div>
          <div className="space-y-3">
            {data.schools?.map((s) => (
              <div key={s._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.city} · {s.plan}</p>
                </div>
                <Badge status={s.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4">{t('super.plans')}</h3>
          <div className="grid gap-3">
            {Object.entries(data.plans || {}).map(([key, p]) => (
              <div key={key} className="rounded-xl border border-slate-100 p-4">
                <div className="flex justify-between">
                  <p className="font-semibold">{p.label}</p>
                  <p className="text-pine-700 font-medium">{inr(p.priceMonthly, locale)}{t('super.perMonth')}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t('super.modules', { n: p.modules.length })}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
