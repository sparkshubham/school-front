import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, Modal, StatCard, Badge } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { inr } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

export default function Schools() {
  const { applySession } = useAuth();
  const { t, locale } = useLang();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ total: 0, active: 0, trial: 0 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ plan: 'professional', status: 'trial' });

  async function load(nextPage = 1) {
    const { data } = await api.get('/schools', { params: { page: nextPage, limit: PAGE_SIZE } });
    setItems(data.items || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setPage(data.page || nextPage);
    setCounts(data.counts || { total: data.total || 0, active: 0, trial: 0 });
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    await api.post('/schools', form);
    setOpen(false);
    load();
  }

  async function setStatus(id, status) {
    await api.patch(`/schools/${id}`, { status });
    load();
  }

  async function impersonate(id) {
    const { data } = await api.post(`/schools/${id}/impersonate`);
    applySession(data);
    window.location.href = '/';
  }

  return (
    <div>
      <PageHeader
        title={t('schools.title')}
        subtitle={t('schools.subtitle')}
        actions={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            {t('schools.add')}
          </button>
        }
      />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('super.totalSchools')} value={counts.total || total} />
        <StatCard label={t('super.active')} value={counts.active || 0} tone="slate" />
        <StatCard label={t('super.trial')} value={counts.trial || 0} tone="gold" />
      </div>
      <div className="card table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{t('schools.school')}</th>
              <th>{t('schools.city')}</th>
              <th>{t('schools.plan')}</th>
              <th>{t('schools.status')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id}>
                <td>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </td>
                <td>{s.city || '—'}</td>
                <td className="capitalize">{s.plan}</td>
                <td>
                  <Badge status={s.status}>{s.status}</Badge>
                </td>
                <td className="text-right space-x-2 whitespace-nowrap">
                  {s.status !== 'active' && (
                    <button className="text-sm text-pine-700 font-medium" onClick={() => setStatus(s._id, 'active')}>
                      {t('schools.activate')}
                    </button>
                  )}
                  {s.status === 'active' && (
                    <button className="text-sm text-rose-600 font-medium" onClick={() => setStatus(s._id, 'suspended')}>
                      {t('schools.suspend')}
                    </button>
                  )}
                  <button className="text-sm font-medium" onClick={() => impersonate(s._id)}>
                    {t('schools.loginAs')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </div>
      {open && (
        <Modal title={t('schools.add')} onClose={() => setOpen(false)}>
          <form onSubmit={create} className="space-y-3">
            {[
              ['name', 'setup.name'],
              ['adminName', 'schools.adminName'],
              ['adminEmail', 'schools.adminEmail'],
              ['adminPassword', 'schools.adminPassword'],
              ['city', 'setup.city'],
              ['phone', 'setup.phone'],
            ].map(([name, key]) => (
              <div key={name}>
                <label className="label">{t(key)}</label>
                <input
                  className="input"
                  type={name.includes('Password') ? 'password' : 'text'}
                  required={['name', 'adminEmail', 'adminPassword'].includes(name)}
                  value={form[name] || ''}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
              </div>
            ))}
            <label className="label">{t('schools.plan')}</label>
            <select className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option value="basic">Basic · {inr(4999, locale)}</option>
              <option value="professional">Professional · {inr(9999, locale)}</option>
              <option value="enterprise">Enterprise · {inr(19999, locale)}</option>
            </select>
            <button className="btn-primary w-full">{t('schools.createTenant')}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
