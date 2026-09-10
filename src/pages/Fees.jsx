import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Modal, StatCard, Badge } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fullName, inr } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

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

  async function load(nextPage = 1) {
    try {
      const invReq = api.get('/fees/invoices', { params: { status, page: nextPage, limit: PAGE_SIZE } });
      const [inv, rep] = await Promise.all([
        invReq,
        nextPage === 1 ? api.get('/fees/reports') : Promise.resolve(null),
      ]);
      setInvoices(inv.data.items || []);
      setTotal(inv.data.total || 0);
      setPages(inv.data.pages || 1);
      setPage(inv.data.page || nextPage);
      if (rep) setReport(rep.data);
    } catch {
      setInvoices([]);
    }
  }
  useEffect(() => {
    load(1);
  }, [status]);

  async function collect(e) {
    e.preventDefault();
    await api.post('/fees/collect', { invoiceId: pay._id, amount: Number(amount), method });
    setPay(null);
    setAmount('');
    load();
  }

  return (
    <div>
      <PageHeader title={t('fees.title')} subtitle={t('fees.subtitle')} />
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
      <div className="card table-wrap">
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
      </div>
      {pay && (
        <Modal title={`${t('fees.collect')} · ${pay.invoiceNo}`} onClose={() => setPay(null)}>
          <form onSubmit={collect} className="space-y-3">
            <p className="text-sm text-slate-500">{t('fees.due')} {inr(pay.due, locale)}</p>
            <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
