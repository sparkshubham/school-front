import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, Badge } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { fullName } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

const STATUSES = ['present', 'absent', 'late', 'half_day', 'leave'];

export default function Attendance() {
  const { t } = useLang();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [report, setReport] = useState(null);
  const [tab, setTab] = useState('mark');

  useEffect(() => {
    api.get('/meta', { params: { keys: 'classes,sections' } }).then((r) => {
      const items = r.data.classes || [];
      setClasses(items);
      if (items[0]) setClassId(items.find((c) => c.numeric === 10)?._id || items[0]._id);
      setSections(r.data.sections || []);
    });
  }, []);

  async function loadSheet() {
    if (!classId) return;
    const { data } = await api.get('/attendance/sheet', { params: { classId, sectionId, date } });
    setStudents(data.students || []);
    const map = {};
    (data.students || []).forEach((s) => {
      const existing = data.attendance?.records?.find((r) => String(r.studentId) === String(s._id));
      map[s._id] = existing?.status || 'present';
    });
    setRecords(map);
  }

  async function save() {
    await api.post('/attendance/sheet', {
      classId,
      sectionId,
      date,
      records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
    });
    alert(t('attendance.saved'));
  }

  async function loadReport(nextPage = 1) {
    const { data } = await api.get('/attendance/reports', {
      params: { classId, sectionId, page: nextPage, limit: PAGE_SIZE },
    });
    setReport(data);
  }

  return (
    <div>
      <PageHeader title={t('attendance.title')} subtitle={t('attendance.subtitle')} />
      <div className="flex gap-2 mb-4">
        {['mark', 'report'].map((tabKey) => (
          <button key={tabKey} className={tab === tabKey ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab(tabKey)}>
            {tabKey === 'mark' ? t('attendance.mark') : t('attendance.report')}
          </button>
        ))}
      </div>
      <div className="card p-4 flex flex-wrap gap-3 mb-4">
        <select className="input max-w-xs" value={classId} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="input max-w-xs" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">{t('attendance.allSections')}</option>
          {sections
            .filter((s) => !classId || String(s.classId?._id || s.classId) === classId)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>
        {tab === 'mark' && <input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
        <button className="btn-primary" onClick={tab === 'mark' ? loadSheet : loadReport}>
          {t('common.load')}
        </button>
      </div>
      {tab === 'mark' && (
        <div className="card table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t('field.roll')}</th>
                <th>{t('field.student')}</th>
                <th>{t('field.status')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNo}</td>
                  <td>{fullName(s)}</td>
                  <td>
                    <select className="input max-w-[160px]" value={records[s._id]} onChange={(e) => setRecords({ ...records, [s._id]: e.target.value })}>
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {t(`status.${st}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > 0 && (
            <div className="p-4">
              <button className="btn-primary" onClick={save}>
                {t('attendance.save')}
              </button>
            </div>
          )}
        </div>
      )}
      {tab === 'report' && report && (
        <div className="card table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>{t('field.student')}</th>
                <th>{t('status.present')}</th>
                <th>{t('status.absent')}</th>
                <th>%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.student._id}>
                  <td>{fullName(r.student)}</td>
                  <td>{r.present}</td>
                  <td>{r.absent}</td>
                  <td>{r.percentage}%</td>
                  <td>{r.low && <Badge status="absent">{t('attendance.below')}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={report.page || 1}
            pages={report.pages || 1}
            total={report.total || report.rows.length}
            onPage={loadReport}
          />
        </div>
      )}
    </div>
  );
}
