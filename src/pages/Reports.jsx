import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, StatCard } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { inr } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function Reports() {
  const { t, locale } = useLang();
  const [fees, setFees] = useState(null);
  const [attn, setAttn] = useState(null);
  const [attnPage, setAttnPage] = useState(1);
  async function loadAttn(nextPage = 1) {
    const { data } = await api.get('/attendance/reports', { params: { page: nextPage, limit: 20 } });
    setAttn(data);
    setAttnPage(data.page || nextPage);
  }
  useEffect(() => {
    api
      .get('/fees/reports')
      .then((r) => setFees(r.data))
      .catch(() => {});
    loadAttn(1).catch(() => {});
  }, []);
  const low = attn?.rows?.filter((r) => r.low) || attn?.rows || [];
  return (
    <div>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />
      {fees && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label={t('reports.collected')} value={inr(fees.collected, locale)} />
          <StatCard label={t('fees.pending')} value={inr(fees.pending, locale)} tone="gold" />
          <StatCard label={t('fees.overdue')} value={inr(fees.overdueAmount, locale)} tone="rose" />
        </div>
      )}
      <div className="card p-5">
        <h3 className="font-semibold mb-3">{t('reports.low')}</h3>
        {low.length === 0 && <p className="text-slate-500">{t('reports.noneLow')}</p>}
        {low.map((r) => (
          <div key={r.student._id} className="flex justify-between py-2 border-b border-slate-50">
            <span>{r.student.firstName} {r.student.lastName}</span>
            <span>{r.percentage}%</span>
          </div>
        ))}
        {attn && (
          <Pagination page={attnPage} pages={attn.pages || 1} total={attn.total || 0} onPage={loadAttn} />
        )}
      </div>
    </div>
  );
}
