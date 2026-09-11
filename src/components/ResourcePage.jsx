import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, Empty, Busy } from './ui.jsx';
import Pagination from './Pagination.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

export default function ResourcePage({
  title,
  subtitle,
  path,
  columns,
  fields,
  searchPlaceholder,
}) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load(nextPage = page) {
    setLoading(true);
    try {
      const { data } = await api.get(path, { params: { q: qDebounced, page: nextPage, limit: PAGE_SIZE } });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.page || nextPage);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
    load(1);
  }, [path, qDebounced]);

  function startCreate() {
    setEditing(null);
    setForm({});
    setOpen(true);
  }

  function startEdit(row) {
    setEditing(row);
    const next = {};
    fields.forEach((f) => {
      const val = row[f.name];
      next[f.name] = val && typeof val === 'object' ? val._id : val ?? '';
    });
    setForm(next);
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    if (editing) await api.patch(`${path}/${editing._id}`, form);
    else await api.post(path, form);
    setOpen(false);
    load(editing ? page : 1);
  }

  async function remove(row) {
    if (!confirm(t('common.confirmDelete'))) return;
    await api.delete(`${path}/${row._id}`);
    load(page);
  }

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button className="btn-primary" onClick={startCreate}>
            {t('common.add')}
          </button>
        }
      />
      <Busy on={loading} className="card">
        <div className="p-4 border-b border-slate-100">
          <input className="input max-w-sm" placeholder={searchPlaceholder || t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <Empty>{t('common.noRecords')}</Empty>
                  </td>
                </tr>
              )}
              {items.map((row) => (
                <tr key={row._id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                  ))}
                  <td className="text-right whitespace-nowrap">
                    <button className="text-pine-700 text-sm font-medium mr-3" onClick={() => startEdit(row)}>
                      {t('common.edit')}
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
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </Busy>
      {open && (
        <Modal title={editing ? t('common.edit') : t('common.create')} onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    className="input"
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                  >
                    <option value="">{t('common.select')}</option>
                    {(f.options || []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    className="input"
                    rows={4}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : (
                  <input
                    className="input"
                    type={f.type || 'text'}
                    value={form[f.name] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button className="btn-primary w-full mt-2">{t('common.save')}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
