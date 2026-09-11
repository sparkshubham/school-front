import { useEffect, useState } from 'react';
import api from '../api/client.js';
import ResourcePage from '../components/ResourcePage.jsx';
import { Badge, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fmtDate } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { apiErrorMessage, inputClass, requiredErrors } from '../utils/form.js';

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
        { name: 'type', label: t('field.type'), type: 'select', required: true, options: ['casual', 'sick', 'earned', 'emergency'].map((v) => ({ value: v, label: t(`leaves.${v}`) })) },
        { name: 'fromDate', label: t('field.from'), type: 'date', required: true },
        { name: 'toDate', label: t('field.to'), type: 'date', required: true },
        { name: 'reason', label: t('field.reason'), type: 'textarea', required: true },
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
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  async function load(nextPage = 1) {
    try {
      const { data } = await api.get('/leaves', { params: { page: nextPage, limit: 20 } });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.page || nextPage);
    } catch {
      setItems([]);
    }
  }
  useEffect(() => {
    load(1);
  }, []);
  async function submit(e) {
    e.preventDefault();
    const nextErrors = requiredErrors(
      form,
      [
        { name: 'fromDate', required: true },
        { name: 'toDate', required: true },
        { name: 'reason', required: true },
      ],
      t('common.required')
    );
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) {
      setFormError(t('common.fixFields'));
      return;
    }
    try {
      await api.post('/leaves', form);
      setForm({ type: 'casual', reason: '', fromDate: '', toDate: '' });
      load(1);
    } catch (err) {
      setFormError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }
  return (
    <div>
      <h1 className="font-display text-3xl mb-4">{t('leaves.apply')}</h1>
      <form onSubmit={submit} className="card p-5 grid md:grid-cols-2 gap-3 mb-6" noValidate>
        <div className="md:col-span-2">
          <FormBanner>{formError}</FormBanner>
        </div>
        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="casual">{t('leaves.casual')}</option>
          <option value="sick">{t('leaves.sick')}</option>
          <option value="earned">{t('leaves.earned')}</option>
          <option value="emergency">{t('leaves.emergency')}</option>
        </select>
        <div>
          <input
            className={inputClass(errors.fromDate)}
            type="date"
            value={form.fromDate}
            onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
          />
          <FieldError>{errors.fromDate}</FieldError>
        </div>
        <div>
          <input
            className={inputClass(errors.toDate)}
            type="date"
            value={form.toDate}
            onChange={(e) => setForm({ ...form, toDate: e.target.value })}
          />
          <FieldError>{errors.toDate}</FieldError>
        </div>
        <div className="md:col-span-2">
          <textarea
            className={inputClass(errors.reason)}
            placeholder={`${t('leaves.reason')} *`}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <FieldError>{errors.reason}</FieldError>
        </div>
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
