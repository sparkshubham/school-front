import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, Empty } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Teachers() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [creds, setCreds] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/teachers', { params: { q: qDebounced } });
    setItems(data.items || []);
  }

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    load();
  }, [qDebounced]);

  function startCreate() {
    setEditing(null);
    setForm({ password: 'Teacher@123' });
    setError('');
    setOpen(true);
  }

  function startEdit(row) {
    setEditing(row);
    setError('');
    setForm({
      employeeId: row.employeeId || '',
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      qualification: row.qualification || '',
      department: row.department || '',
      designation: row.designation || '',
      salary: row.salary || '',
    });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.patch(`/teachers/${editing._id}`, form);
        setOpen(false);
      } else {
        const { data } = await api.post('/teachers', form);
        setOpen(false);
        if (data.loginCreated) {
          setCreds({
            name: data.name,
            email: data.loginEmail,
            password: data.temporaryPassword,
          });
        }
      }
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('teachers.saveFail'));
    }
  }

  async function issueLogin(row) {
    const email = row.email || prompt(t('teachers.promptEmail'));
    if (!email) return;
    try {
      const { data } = await api.post(`/teachers/${row._id}/login`, { email, password: 'Teacher@123' });
      setCreds({
        name: row.name,
        email: data.loginEmail,
        password: data.temporaryPassword,
        reset: data.reset,
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || t('teachers.loginFail'));
    }
  }

  async function remove(row) {
    if (!confirm(t('teachers.confirmDelete'))) return;
    await api.delete(`/teachers/${row._id}`);
    load();
  }

  return (
    <div>
      <PageHeader
        title={t('teachers.title')}
        subtitle={t('teachers.subtitle')}
        actions={
          <button className="btn-primary" onClick={startCreate}>
            {t('teachers.add')}
          </button>
        }
      />
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <input className="input max-w-sm" placeholder={t('teachers.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('field.name')}</th>
                <th>{t('teachers.loginCol')}</th>
                <th>{t('field.designation')}</th>
                <th>{t('field.phone')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <Empty>{t('teachers.none')}</Empty>
                  </td>
                </tr>
              )}
              {items.map((row) => (
                <tr key={row._id}>
                  <td>{row.employeeId}</td>
                  <td className="font-medium">{row.name}</td>
                  <td>
                    <p>{row.email || '—'}</p>
                    <p className="text-xs text-slate-500">{row.userId ? t('teachers.loginOn') : t('teachers.loginOff')}</p>
                  </td>
                  <td>{row.designation || '—'}</td>
                  <td>{row.phone || '—'}</td>
                  <td className="text-right whitespace-nowrap">
                    <button className="text-pine-700 text-sm font-medium mr-3" onClick={() => startEdit(row)}>
                      {t('common.edit')}
                    </button>
                    <button className="text-pine-700 text-sm font-medium mr-3" onClick={() => issueLogin(row)}>
                      {row.userId ? t('teachers.reset') : t('teachers.createLogin')}
                    </button>
                    <button className="text-rose-600 text-sm font-medium" onClick={() => remove(row)}>
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal title={editing ? t('teachers.edit') : t('teachers.add')} onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            {error && <div className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>}
            {[
              ['employeeId', 'field.employeeId', true],
              ['name', 'field.name', true],
              ['email', 'field.loginEmail', !editing],
              ['phone', 'field.phone', false],
              ['qualification', 'field.qualification', false],
              ['department', 'field.department', false],
              ['designation', 'field.designation', false],
              ['salary', 'field.salary', false],
            ].map(([name, key, required]) => (
              <div key={name}>
                <label className="label">{t(key)}</label>
                <input
                  className="input"
                  type={name === 'salary' ? 'number' : name === 'email' ? 'email' : 'text'}
                  required={required}
                  value={form[name] ?? ''}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                />
              </div>
            ))}
            {!editing && (
              <div>
                <label className="label">{t('teachers.tempPass')}</label>
                <input
                  className="input"
                  value={form.password ?? 'Teacher@123'}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">{t('teachers.tempHint')}</p>
              </div>
            )}
            <button className="btn-primary w-full mt-2">{t('common.save')}</button>
          </form>
        </Modal>
      )}

      {creds && (
        <Modal title={t('teachers.created')} onClose={() => setCreds(null)}>
          <p className="text-sm text-slate-600 mb-4">
            {t('teachers.copy')}
          </p>
          <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
            <p>
              <span className="text-slate-500">{t('field.name')}</span> · {creds.name}
            </p>
            <p>
              <span className="text-slate-500">{t('field.email')}</span> · <strong>{creds.email}</strong>
            </p>
            <p>
              <span className="text-slate-500">{t('login.password')}</span> · <strong>{creds.password}</strong>
            </p>
          </div>
          <button className="btn-primary w-full mt-4" onClick={() => setCreds(null)}>
            {t('common.done')}
          </button>
        </Modal>
      )}
    </div>
  );
}
