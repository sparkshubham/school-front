import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, Empty, Badge } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fullName } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

export default function Students() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [classId, setClassId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ createLogin: true });

  async function load(nextPage = page) {
    const { data } = await api.get('/students', {
      params: { q: qDebounced, classId, page: nextPage, limit: PAGE_SIZE },
    });
    setItems(data.items || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setPage(data.page || nextPage);
  }

  useEffect(() => {
    const timer = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    api.get('/meta', { params: { keys: 'classes,sections' } }).then((r) => {
      setClasses(r.data.classes || []);
      setSections(r.data.sections || []);
    });
  }, []);

  useEffect(() => {
    load(1);
  }, [qDebounced, classId]);

  async function save(e) {
    e.preventDefault();
    await api.post('/students', { ...form, createLogin: true });
    setOpen(false);
    setForm({ createLogin: true });
    load(1);
  }

  return (
    <div>
      <PageHeader
        title={t('students.title')}
        subtitle={t('students.subtitle')}
        actions={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            {t('students.add')}
          </button>
        }
      />
      <div className="card">
        <div className="p-4 flex flex-wrap gap-3 border-b border-slate-100">
          <input className="input max-w-xs" placeholder={t('students.search')} value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-xs" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">{t('students.allClasses')}</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t('field.student')}</th>
                <th>{t('field.admission')}</th>
                <th>{t('field.class')}</th>
                <th>{t('field.roll')}</th>
                <th>{t('field.status')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <Empty>{t('students.none')}</Empty>
                  </td>
                </tr>
              )}
              {items.map((s) => (
                <tr key={s._id}>
                  <td>
                    <p className="font-medium">{fullName(s)}</p>
                    <p className="text-xs text-slate-500">{s.fatherName}</p>
                  </td>
                  <td>{s.admissionNo}</td>
                  <td>
                    {s.classId?.name}-{s.sectionId?.name}
                  </td>
                  <td>{s.rollNo}</td>
                  <td>
                    <Badge status={s.status}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </div>
      {open && (
        <Modal title={t('students.new')} onClose={() => setOpen(false)}>
          <form onSubmit={save} className="grid grid-cols-2 gap-3">
            {[
              ['firstName', 'field.firstName'],
              ['lastName', 'field.lastName'],
              ['admissionNo', 'field.admissionNo'],
              ['rollNo', 'field.rollNo'],
              ['email', 'field.studentEmail'],
              ['fatherName', 'field.fatherName'],
              ['parentName', 'field.parentName'],
              ['parentEmail', 'field.parentEmail'],
            ].map(([name, key]) => (
              <div key={name} className="col-span-2 sm:col-span-1">
                <label className="label">{t(key)}</label>
                <input className="input" required={['firstName', 'admissionNo'].includes(name)} value={form[name] || ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="label">{t('field.gender')}</label>
              <select className="input" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">{t('common.select')}</option>
                <option value="male">{t('field.male')}</option>
                <option value="female">{t('field.female')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('field.admissionDate')}</label>
              <input className="input" type="date" value={form.admissionDate || ''} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('field.class')}</label>
              <select className="input" value={form.classId || ''} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                <option value="">{t('common.select')}</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('field.section')}</label>
              <select className="input" value={form.sectionId || ''} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
                <option value="">{t('common.select')}</option>
                {sections.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.classId?.name} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary col-span-2">{t('students.create')}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
