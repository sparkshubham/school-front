import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, Badge, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fullName } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';
import { apiErrorMessage, inputClass, requiredErrors } from '../utils/form.js';

export default function Exams() {
  const { t } = useLang();
  const { school } = useAuth();
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [resultPage, setResultPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'term' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [card, setCard] = useState(null);

  async function load(nextPage = 1) {
    try {
      const { data } = await api.get('/exams', { params: { page: nextPage, limit: PAGE_SIZE } });
      setExams(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.page || nextPage);
    } catch {
      setExams([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    const nextErrors = requiredErrors(
      form,
      [
        { name: 'name', required: true },
        { name: 'startDate', required: true },
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
      await api.post('/exams', form);
      setOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  async function showResults(exam, nextPage = 1) {
    setSelected(exam);
    const { data } = await api.get(`/exams/${exam._id}/results`, { params: { page: nextPage, limit: PAGE_SIZE } });
    setResults(data);
    setResultPage(data.page || nextPage);
    setCard(null);
  }

  async function openCard(row) {
    const { data } = await api.get(`/exams/${selected._id}/students/${row.student._id}`);
    setCard(data);
  }

  function printCard() {
    window.print();
  }

  return (
    <div>
      <PageHeader
        title={t('exams.title')}
        subtitle={t('exams.subtitle')}
        actions={
          <button className="btn-primary" onClick={() => { setForm({ name: '', type: 'term' }); setErrors({}); setFormError(''); setOpen(true); }}>
            {t('exams.new')}
          </button>
        }
      />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {exams.map((e) => (
          <button key={e._id} onClick={() => showResults(e)} className="card p-4 text-left hover:border-pine-400 border border-transparent">
            <p className="font-semibold">{e.name}</p>
            <p className="text-sm text-slate-500 capitalize">{e.type}</p>
            <Badge status={e.status}>{e.status}</Badge>
          </button>
        ))}
      </div>
      <div className="card mb-6">
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </div>
      {results && (
        <div className="card table-wrap">
          <div className="p-4 font-semibold">{t('exams.results', { name: results.exam.name })}</div>
          <table className="data">
            <thead>
              <tr>
                <th>{t('exams.rank')}</th>
                <th>{t('exams.student')}</th>
                <th>{t('exams.total')}</th>
                <th>%</th>
                <th>{t('exams.grade')}</th>
                <th>{t('exams.result')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.rows.map((r) => (
                <tr key={r.student?._id}>
                  <td>{r.rank}</td>
                  <td>{fullName(r.student)}</td>
                  <td>
                    {r.total}/{r.max}
                  </td>
                  <td>{r.percentage}</td>
                  <td>{r.grade}</td>
                  <td>
                    <Badge status={r.result === 'PASS' ? 'paid' : 'unpaid'}>{t(`status.${r.result}`)}</Badge>
                  </td>
                  <td>
                    <button className="text-pine-700 text-sm font-medium" onClick={() => openCard(r)}>
                      {t('exams.reportCard')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={results.page || resultPage}
            pages={results.pages || 1}
            total={results.total || results.rows.length}
            onPage={(p) => showResults(selected, p)}
          />
        </div>
      )}
      {card && (
        <div className="card p-8 mt-6 max-w-2xl mx-auto print:shadow-none" id="report-card">
          <div className="text-center border-b pb-4 mb-4">
            <p className="font-display text-2xl">{school?.name || 'EduNest'}</p>
            <p className="text-sm text-slate-500">{card.exam.name}</p>
          </div>
          <p>
            <strong>{t('exams.student')}:</strong> {fullName(card.student)}
          </p>
          <p>
            <strong>{t('exams.class')}:</strong> {card.student.classId?.name}-{card.student.sectionId?.name} · {t('dash.roll', { n: card.student.rollNo })}
          </p>
          <table className="data mt-4">
            <thead>
              <tr>
                <th>{t('exams.subject')}</th>
                <th>{t('exams.max')}</th>
                <th>{t('exams.obtained')}</th>
              </tr>
            </thead>
            <tbody>
              {card.rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.max}</td>
                  <td>{r.obtained}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p>{t('exams.total')}: {card.total}/{card.max}</p>
            <p>{t('exams.percentage')}: {card.percentage}%</p>
            <p>{t('exams.grade')}: {card.grade}</p>
            <p>{t('exams.result')}: {t(`status.${card.result}`)}</p>
          </div>
          <div className="mt-10 flex justify-between text-sm text-slate-500">
            <span>{t('exams.teacherSign')}</span>
            <span>{t('exams.principalSign')}</span>
          </div>
          <button className="btn-ghost mt-6 print:hidden" onClick={printCard}>
            {t('exams.print')}
          </button>
        </div>
      )}
      {open && (
        <Modal title={t('exams.create')} onClose={() => setOpen(false)}>
          <form onSubmit={create} className="space-y-3" noValidate>
            <FormBanner>{formError}</FormBanner>
            <div>
              <label className="label">{t('exams.name')} *</label>
              <input
                className={inputClass(errors.name)}
                placeholder={t('exams.name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FieldError>{errors.name}</FieldError>
            </div>
            <div>
              <label className="label">{t('field.start')} *</label>
              <input
                className={inputClass(errors.startDate)}
                type="date"
                value={form.startDate || ''}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <FieldError>{errors.startDate}</FieldError>
            </div>
            <button className="btn-primary w-full">{t('common.save')}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
