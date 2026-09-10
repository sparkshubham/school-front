import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

function Block({ title, items, fields, label, path, onChanged }) {
  const { t } = useLang();
  const [form, setForm] = useState({});
  async function add(e) {
    e.preventDefault();
    await api.post(path, form);
    setForm({});
    onChanged();
  }
  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <form onSubmit={add} className="flex flex-wrap gap-2 mb-4">
        {fields.map((f) => (
          <input
            key={f.name}
            className="input flex-1 min-w-[120px]"
            placeholder={f.label}
            value={form[f.name] || ''}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            required={f.required}
          />
        ))}
        <button className="btn-primary">{t('common.add')}</button>
      </form>
      <ul className="text-sm space-y-1">
        {items.map((i) => (
          <li key={i._id} className="flex justify-between border-b border-slate-50 py-1.5">
            <span>{label(i)}</span>
            <button
              className="text-rose-600"
              onClick={async () => {
                await api.delete(`${path}/${i._id}`);
                onChanged();
              }}
            >
              {t('common.remove')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Academic() {
  const { t } = useLang();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assign, setAssign] = useState({});

  async function loadMeta() {
    try {
      const { data } = await api.get('/meta', { params: { keys: 'classes,sections,subjects,sessions,teachers' } });
      setClasses(data.classes || []);
      setSubjects(data.subjects || []);
      setTeachers(data.teachers || []);
      setSections(data.sections || []);
      setSessions(data.sessions || []);
    } catch {
      /* keep last good data */
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  async function assignSubject(e) {
    e.preventDefault();
    await api.post('/class-subjects', assign);
    setAssign({});
    alert(t('academic.assigned'));
  }

  return (
    <div>
      <PageHeader title={t('academic.title')} subtitle={t('academic.subtitle')} />
      <div className="grid lg:grid-cols-2 gap-6">
        <Block
          title={t('academic.sessions')}
          path="/sessions"
          items={sessions}
          onChanged={loadMeta}
          fields={[
            { name: 'name', label: '2026-27', required: true },
            { name: 'startDate', label: 'Start YYYY-MM-DD' },
            { name: 'endDate', label: 'End YYYY-MM-DD' },
          ]}
          label={(i) => `${i.name}${i.isCurrent ? ` · ${t('academic.current')}` : ''}`}
        />
        <Block
          title={t('academic.classes')}
          path="/classes"
          items={classes}
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
          items={sections}
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
          items={subjects}
          onChanged={loadMeta}
          fields={[
            { name: 'name', label: t('academic.subject'), required: true },
            { name: 'code', label: t('academic.code') },
          ]}
          label={(i) => `${i.name} (${i.code || '—'})`}
        />
      </div>
      <form onSubmit={assignSubject} className="card p-5 mt-6 grid md:grid-cols-4 gap-3">
        <h3 className="md:col-span-4 font-semibold">{t('academic.assign')}</h3>
        <select className="input" value={assign.classId || ''} onChange={(e) => setAssign({ ...assign, classId: e.target.value })} required>
          <option value="">{t('field.class')}</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input" value={assign.sectionId || ''} onChange={(e) => setAssign({ ...assign, sectionId: e.target.value })}>
          <option value="">{t('field.section')}</option>
          {sections.map((s) => (
            <option key={s._id} value={s._id}>
              {s.classId?.name} {s.name}
            </option>
          ))}
        </select>
        <select className="input" value={assign.subjectId || ''} onChange={(e) => setAssign({ ...assign, subjectId: e.target.value })} required>
          <option value="">{t('field.subject')}</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="input" value={assign.teacherId || ''} onChange={(e) => setAssign({ ...assign, teacherId: e.target.value })}>
          <option value="">{t('field.teacher')}</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <button className="btn-primary md:col-span-4">{t('academic.saveMap')}</button>
      </form>
    </div>
  );
}
