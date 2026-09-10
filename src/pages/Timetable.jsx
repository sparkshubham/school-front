import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function Timetable() {
  const { t } = useLang();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [slots, setSlots] = useState([]);
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    api.get('/meta', { params: { keys: 'classes,periods' } }).then((r) => {
      const items = r.data.classes || [];
      setClasses(items);
      const c10 = items.find((c) => c.numeric === 10) || items[0];
      if (c10) setClassId(c10._id);
      setPeriods((r.data.periods || []).sort((a, b) => a.order - b.order));
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    api.get('/timetable', { params: { classId } }).then((r) => setSlots(r.data.items || []));
  }, [classId]);

  function cell(day, periodId) {
    return slots.find((s) => s.day === day && String(s.periodId?._id || s.periodId) === String(periodId));
  }

  return (
    <div>
      <PageHeader title={t('timetable.title')} subtitle={t('timetable.subtitle')} />
      <select className="input max-w-xs mb-4" value={classId} onChange={(e) => setClassId(e.target.value)}>
        {classes.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <div className="card table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>{t('timetable.time')}</th>
              {DAYS.map((d) => (
                <th key={d}>{t(`day.${d}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p._id}>
                <td className="whitespace-nowrap">
                  {p.isBreak ? t('common.break') : p.name}
                  <div className="text-xs text-slate-400">{p.startTime}–{p.endTime}</div>
                </td>
                {DAYS.map((d) => {
                  const slot = cell(d, p._id);
                  return (
                    <td key={d} className={p.isBreak ? 'bg-slate-50 text-slate-400' : ''}>
                      {p.isBreak ? t('common.break') : slot ? slot.subjectId?.name : '—'}
                      {!p.isBreak && slot?.teacherId?.name && (
                        <div className="text-xs text-slate-400">{slot.teacherId.name}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
