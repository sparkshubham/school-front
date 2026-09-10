import ResourcePage from '../components/ResourcePage.jsx';
import { fmtDate } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function Homework() {
  const { t, locale } = useLang();
  return (
    <ResourcePage
      title={t('homework.title')}
      subtitle={t('homework.subtitle')}
      path="/homework"
      columns={[
        { key: 'title', label: t('field.title') },
        { key: 'classId', label: t('field.class'), render: (r) => r.classId?.name },
        { key: 'subjectId', label: t('field.subject'), render: (r) => r.subjectId?.name },
        { key: 'dueDate', label: t('field.due'), render: (r) => fmtDate(r.dueDate, locale) },
      ]}
      fields={[
        { name: 'title', label: t('field.title'), required: true },
        { name: 'classId', label: t('field.classId'), required: true },
        { name: 'subjectId', label: t('field.subjectId') },
        { name: 'dueDate', label: t('field.dueDate'), type: 'date' },
        { name: 'description', label: t('field.description'), type: 'textarea' },
      ]}
    />
  );
}
