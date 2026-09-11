import ResourcePage from '../components/ResourcePage.jsx';
import { Badge } from '../components/ui.jsx';
import { fmtDate } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function Admissions() {
  const { t, locale } = useLang();
  const statuses = ['new', 'contacted', 'interested', 'visit_scheduled', 'application', 'selected', 'rejected', 'admitted'];
  return (
    <ResourcePage
      title={t('admissions.title')}
      subtitle={t('admissions.subtitle')}
      path="/enquiries"
      searchPlaceholder={t('admissions.search')}
      columns={[
        { key: 'studentName', label: t('field.student') },
        { key: 'parentName', label: t('field.parent') },
        { key: 'phone', label: t('field.phone') },
        { key: 'classApplying', label: t('field.class') },
        { key: 'source', label: t('field.source') },
        { key: 'followUpDate', label: t('field.followUp'), render: (r) => fmtDate(r.followUpDate, locale) },
        { key: 'status', label: t('field.status'), render: (r) => <Badge status={r.status} /> },
      ]}
      fields={[
        { name: 'studentName', label: t('field.studentName'), required: true },
        { name: 'parentName', label: t('field.parentName') },
        { name: 'phone', label: t('field.phone'), required: true },
        { name: 'classApplying', label: t('field.classApplying') },
        { name: 'previousSchool', label: t('field.previousSchool') },
        { name: 'source', label: t('field.source') },
        { name: 'followUpDate', label: t('field.followUp'), type: 'date' },
        { name: 'status', label: t('field.status'), type: 'select', options: statuses.map((v) => ({ value: v, label: t(`status.${v}`) })) },
        { name: 'notes', label: t('field.notes'), type: 'textarea' },
      ]}
    />
  );
}
