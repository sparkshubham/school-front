import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ResourcePage from '../components/ResourcePage.jsx';
import { Badge } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fmtDate } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Leaves() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [mine, setMine] = useState({ type: 'casual', reason: '', fromDate: '', toDate: '' });

  if (user?.role === 'teacher' || user?.role === 'staff') {
    return <TeacherLeave form={mine} setForm={setMine} />;
  }

  return (
    <ResourcePage
      title={t('leaves.title')}
      subtitle={t('leaves.subtitle')}
      path="/leaves"
      columns={[
        { key: 'userId', label: t('field.staff'), render: (r) => r.userId?.name },
        { key: 'type', label: t('field.type'), render: (r) => t(`leaves.${r.type}`) },
        { key: 'fromDate', label: t('field.from'), render: (r) => fmtDate(r.fromDate, locale) },
        { key: 'toDate', label: t('field.to'), render: (r) => fmtDate(r.toDate, locale) },
        { key: 'status', label: t('field.status'), render: (r) => <Badge status={r.status} /> },
      ]}
      fields={[
        { name: 'type', label: t('field.type'), type: 'select', options: ['casual', 'sick', 'earned', 'emergency'].map((v) => ({ value: v, label: t(`leaves.${v}`) })) },
        { name: 'fromDate', label: t('field.from'), type: 'date' },
        { name: 'toDate', label: t('field.to'), type: 'date' },
        { name: 'reason', label: t('field.reason'), type: 'textarea' },
        { name: 'status', label: t('field.status'), type: 'select', options: ['pending', 'approved', 'rejected'].map((v) => ({ value: v, label: t(`status.${v}`) })) },
      ]}
    />
  );
}

function TeacherLeave({ form, setForm }) {
  const { t, locale } = useLang();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  async function load(nextPage = 1) {
    const { data } = await api.get('/leaves', { params: { page: nextPage, limit: 20 } });
    setItems(data.items || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setPage(data.page || nextPage);
  }
  useEffect(() => {
    load(1);
  }, []);
  async function submit(e) {
    e.preventDefault();
    await api.post('/leaves', form);
    setForm({ type: 'casual', reason: '', fromDate: '', toDate: '' });
    load(1);
  }
  return (
    <div>
      <h1 className="font-display text-3xl mb-4">{t('leaves.apply')}</h1>
      <form onSubmit={submit} className="card p-5 grid md:grid-cols-2 gap-3 mb-6">
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="casual">{t('leaves.casual')}</option>
          <option value="sick">{t('leaves.sick')}</option>
          <option value="earned">{t('leaves.earned')}</option>
          <option value="emergency">{t('leaves.emergency')}</option>
        </select>
        <input className="input" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
        <input className="input" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
        <textarea className="input md:col-span-2" placeholder={t('leaves.reason')} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        <button className="btn-primary">{t('common.submit')}</button>
      </form>
      <div className="card p-5">
        {items.map((i) => (
          <div key={i._id} className="flex justify-between py-2 border-b border-slate-50">
            <span>{t(`leaves.${i.type}`)} · {fmtDate(i.fromDate, locale)}</span>
            <Badge status={i.status} />
          </div>
        ))}
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </div>
    </div>
  );
}
