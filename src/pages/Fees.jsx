import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, StatCard, Badge, Busy, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fullName, inr } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';
import { apiErrorMessage, inputClass, isBlank } from '../utils/form.js';

export default function Fees() {
  const { t, locale } = useLang();
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [report, setReport] = useState(null);
  const [pay, setPay] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [status, setStatus] = useState('');
  const [amountError, setAmountError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [structure, setStructure] = useState({ classId: '', sessionId: '', item: 'Tuition', amount: '' });
  const [structErrors, setStructErrors] = useState({});
  const [structError, setStructError] = useState('');

  async function load(nextPage = 1) {
    setLoading(true);
    try {
      const inv = await api.get('/fees/invoices', { params: { status, page: nextPage, limit: PAGE_SIZE } });
      setInvoices(inv.data.items || []);
      setTotal(inv.data.total || 0);
      setPages(inv.data.pages || 1);
      setPage(inv.data.page || nextPage);
      if (nextPage === 1) {
        const rep = await api.get('/fees/reports');
        setReport(rep.data);
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load(1);
  }, [status]);

  useEffect(() => {
    api
      .get('/meta', { params: { keys: 'classes,sessions' } })
      .then(({ data }) => {
        setClasses(data.classes || []);
        setSessions(data.sessions || []);
      })
      .catch(() => {});
  }, []);

  async function saveStructure(e) {
    e.preventDefault();
    const next = {};
    if (isBlank(structure.classId)) next.classId = t('common.required');
    if (isBlank(structure.item)) next.item = t('common.required');
    if (isBlank(structure.amount) || Number(structure.amount) <= 0) next.amount = t('common.required');
    setStructErrors(next);
    setStructError('');
    if (Object.keys(next).length) {
      setStructError(t('common.fixFields'));
      return;
    }
    try {
      await api.post('/fees/structures', {
        classId: structure.classId,
        sessionId: structure.sessionId || undefined,
        items: [{ name: structure.item, amount: Number(structure.amount) }],
      });
      setStructError('');
      setStructure({ ...structure, item: 'Tuition', amount: '' });
    } catch (err) {
      setStructError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  async function generate() {
    if (isBlank(structure.classId)) {
      setStructErrors({ classId: t('common.required') });
      setStructError(t('common.fixFields'));
      return;
    }
    try {
      await api.post('/fees/generate', { classId: structure.classId, sessionId: structure.sessionId || undefined });
      load(1);
    } catch (err) {
      setStructError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  async function collect(e) {
    e.preventDefault();
    if (isBlank(amount) || Number(amount) <= 0) {
      setAmountError(t('common.required'));
      setFormError(t('common.fixFields'));
      return;
    }
    setAmountError('');
    setFormError('');
    try {
      await api.post('/fees/collect', { invoiceId: pay._id, amount: Number(amount), method });
      setPay(null);
      setAmount('');
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  return (
    <div>
      <PageHeader title={t('fees.title')} subtitle={t('fees.subtitle')} />
      <form onSubmit={saveStructure} className="card p-5 mb-6 grid md:grid-cols-5 gap-3" noValidate>
        <h3 className="md:col-span-5 font-semibold">{t('fees.structure')}</h3>
        <div className="md:col-span-5">
          <FormBanner>{structError}</FormBanner>
        </div>
        <div>
          <select
            className={inputClass(structErrors.classId)}
            value={structure.classId}
            onChange={(e) => setStructure({ ...structure, classId: e.target.value })}
          >
            <option value="">{t('field.class')} *</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <FieldError>{structErrors.classId}</FieldError>
        </div>
        <select className="input" value={structure.sessionId} onChange={(e) => setStructure({ ...structure, sessionId: e.target.value })}>
          <option value="">{t('academic.sessions')}</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <div>
          <input
            className={inputClass(structErrors.item)}
            placeholder={`${t('fees.item')} *`}
            value={structure.item}
            onChange={(e) => setStructure({ ...structure, item: e.target.value })}
          />
          <FieldError>{structErrors.item}</FieldError>
        </div>
        <div>
          <input
            className={inputClass(structErrors.amount)}
            type="number"
            step="any"
            min="0"
            placeholder={`${t('fees.amount')} *`}
            value={structure.amount}
            onChange={(e) => setStructure({ ...structure, amount: e.target.value })}
          />
          <FieldError>{structErrors.amount}</FieldError>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{t('fees.addStructure')}</button>
          <button type="button" className="btn-ghost flex-1" onClick={generate}>
            {t('fees.generate')}
          </button>
        </div>
      </form>
      {report && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label={t('fees.collected')} value={inr(report.collected, locale)} />
          <StatCard label={t('fees.pending')} value={inr(report.pending, locale)} tone="gold" />
          <StatCard label={t('fees.overdue')} value={inr(report.overdueAmount, locale)} tone="rose" hint={t('fees.invoiceHint', { n: report.overdueCount })} />
        </div>
      )}
      <div className="flex gap-2 mb-4">
        {['', 'unpaid', 'partial', 'paid'].map((s) => (
          <button key={s || 'all'} className={status === s ? 'btn-primary' : 'btn-ghost'} onClick={() => setStatus(s)}>
            {s ? t(`status.${s}`) : t('common.all')}
          </button>
        ))}
      </div>
      <Busy on={loading} className="card table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{t('fees.invoice')}</th>
              <th>{t('field.student')}</th>
              <th>{t('field.total')}</th>
              <th>{t('fees.due')}</th>
              <th>{t('field.status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i._id}>
                <td>{i.invoiceNo}</td>
                <td>
                  {fullName(i.studentId)} · {i.studentId?.classId?.name}
                </td>
                <td>{inr(i.total, locale)}</td>
                <td>{inr(i.due, locale)}</td>
                <td>
                  <Badge status={i.status}>{i.status}</Badge>
                </td>
                <td>
                  {i.due > 0 && (
                    <button
                      className="text-pine-700 text-sm font-medium"
                      onClick={() => {
                        setPay(i);
                        setAmount(String(i.due));
                        setAmountError('');
                        setFormError('');
                      }}
                    >
                      {t('fees.collect')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pages={pages} total={total} onPage={load} />
      </Busy>
      {pay && (
        <Modal title={`${t('fees.collect')} · ${pay.invoiceNo}`} onClose={() => setPay(null)}>
          <form onSubmit={collect} className="space-y-3" noValidate>
            <FormBanner>{formError}</FormBanner>
            <p className="text-sm text-slate-500">{t('fees.due')} {inr(pay.due, locale)}</p>
            <div>
              <label className="label">{t('field.total')} *</label>
              <input
                className={inputClass(amountError)}
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <FieldError>{amountError}</FieldError>
            </div>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">{t('fees.cash')}</option>
              <option value="upi">{t('fees.upi')}</option>
              <option value="card">{t('fees.card')}</option>
              <option value="bank_transfer">{t('fees.bank')}</option>
              <option value="online">{t('fees.online')}</option>
            </select>
            <button className="btn-primary w-full">{t('fees.receipt')}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
