import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Busy, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';
import { apiErrorMessage, inputClass, requiredErrors } from '../utils/form.js';

function Block({ title, fields, label, path, onChanged }) {
  const { t } = useLang();
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  async function load(nextPage = 1) {
    setLoading(true);
    try {
      const { data } = await api.get(path, { params: { page: nextPage, limit: PAGE_SIZE } });
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
    load(1);
  }, [path]);

  async function add(e) {
    e.preventDefault();
    const nextErrors = requiredErrors(form, fields, t('common.required'));
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) {
      setFormError(t('common.fixFields'));
      return;
    }
    try {
      await api.post(path, form);
      setForm({});
      setErrors({});
      await load(1);
      onChanged?.();
    } catch (err) {
      setFormError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  return (
    <Busy on={loading} className="card">
      <div className="p-5">
        <h3 className="font-semibold mb-3">{title}</h3>
        <form onSubmit={add} className="mb-4" noValidate>
          <FormBanner>{formError}</FormBanner>
          <div className="flex flex-wrap gap-2 mt-2">
            {fields.map((f) => (
              <div key={f.name} className="flex-1 min-w-[120px]">
                <input
                  className={inputClass(errors[f.name])}
                  type={f.type || 'text'}
                  placeholder={`${f.label}${f.required ? ' *' : ''}`}
                  title={f.label}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                />
                <FieldError>{errors[f.name]}</FieldError>
              </div>
            ))}
            <button className="btn-primary self-start">{t('common.add')}</button>
          </div>
        </form>
        <ul className="text-sm space-y-1">
          {items.map((i) => (
            <li key={i._id} className="flex justify-between border-b border-slate-50 py-1.5">
              <span>{label(i)}</span>
              <button
                className="text-rose-600"
                onClick={async () => {
                  await api.delete(`${path}/${i._id}`);
                  await load(page);
                  onChanged?.();
                }}
              >
                {t('common.remove')}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Pagination page={page} pages={pages} total={total} onPage={load} />
    </Busy>
  );
}

export default function Academic() {
  const { t } = useLang();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [assign, setAssign] = useState({});
  const [assignErrors, setAssignErrors] = useState({});
  const [assignError, setAssignError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadMeta(initial = false) {
    if (initial) setLoading(true);
    try {
      const { data } = await api.get('/meta', { params: { keys: 'classes,sections,subjects,teachers' } });
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
      setTeachers(data.teachers || []);
      setSections(data.sections || []);
    } catch {
      /* keep last good data */
    } finally {
      if (initial) setLoading(false);
    }
  }

  useEffect(() => {
    loadMeta(true);
  }, []);

  async function assignSubject(e) {
    e.preventDefault();
    const nextErrors = requiredErrors(
      assign,
      [
        { name: 'classId', required: true },
        { name: 'subjectId', required: true },
      ],
      t('common.required')
    );
    setAssignErrors(nextErrors);
    setAssignError('');
    if (Object.keys(nextErrors).length) {
      setAssignError(t('common.fixFields'));
      return;
    }
    try {
      await api.post('/class-subjects', assign);
      setAssign({});
      alert(t('academic.assigned'));
    } catch (err) {
      setAssignError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  return (
    <div>
      <PageHeader title={t('academic.title')} subtitle={t('academic.subtitle')} />
      <Busy on={loading}>
      <div className="grid lg:grid-cols-2 gap-6">
        <Block
          title={t('academic.sessions')}
          path="/sessions"
          onChanged={loadMeta}
          fields={[
            { name: 'name', label: '2026-27', required: true },
            { name: 'startDate', label: t('field.start'), type: 'date' },
            { name: 'endDate', label: t('field.end'), type: 'date' },
          ]}
          label={(i) => `${i.name}${i.isCurrent ? ` · ${t('academic.current')}` : ''}`}
        />
        <Block
          title={t('academic.classes')}
          path="/classes"
          onChanged={loadMeta}
          fields={[
            { name: 'name', label: t('academic.className'), required: true },
            { name: 'numeric', label: t('academic.numeric') },
          ]}
          label={(i) => i.name}
        />
        <Block
          title={t('academic.sections')}
          path="/sections"
          onChanged={loadMeta}
          fields={[
            { name: 'classId', label: t('academic.classId'), required: true },
            { name: 'name', label: 'A / B / C', required: true },
          ]}
          label={(i) => `${i.classId?.name || i.classId} — ${i.name}`}
        />
        <Block
          title={t('academic.subjects')}
          path="/subjects"
          onChanged={loadMeta}
          fields={[
            { name: 'name', label: t('academic.subject'), required: true },
            { name: 'code', label: t('academic.code') },
          ]}
          label={(i) => `${i.name} (${i.code || '—'})`}
        />
      </div>
      <form onSubmit={assignSubject} className="card p-5 mt-6 grid md:grid-cols-4 gap-3" noValidate>
        <h3 className="md:col-span-4 font-semibold">{t('academic.assign')}</h3>
        <div className="md:col-span-4">
          <FormBanner>{assignError}</FormBanner>
        </div>
        <div>
          <select
            className={inputClass(assignErrors.classId)}
            value={assign.classId || ''}
            onChange={(e) => setAssign({ ...assign, classId: e.target.value })}
          >
            <option value="">{t('field.class')} *</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{assignErrors.classId}</FieldError>
        </div>
        <div>
          <select className="input" value={assign.sectionId || ''} onChange={(e) => setAssign({ ...assign, sectionId: e.target.value })}>
            <option value="">{t('field.section')}</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.classId?.name} {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            className={inputClass(assignErrors.subjectId)}
            value={assign.subjectId || ''}
            onChange={(e) => setAssign({ ...assign, subjectId: e.target.value })}
          >
            <option value="">{t('field.subject')} *</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <FieldError>{assignErrors.subjectId}</FieldError>
        </div>
        <div>
          <select className="input" value={assign.teacherId || ''} onChange={(e) => setAssign({ ...assign, teacherId: e.target.value })}>
            <option value="">{t('field.teacher')}</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary md:col-span-4">{t('academic.saveMap')}</button>
      </form>
      </Busy>
    </div>
  );
}
