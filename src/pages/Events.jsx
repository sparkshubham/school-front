import ResourcePage from '../components/ResourcePage.jsx';
import { fmtDate } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function Events() {
  const { t, locale } = useLang();
  return (
    <ResourcePage
      title={t('events.title')}
      subtitle={t('events.subtitle')}
      path="/events"
      columns={[
        { key: 'title', label: t('field.event') },
        { key: 'type', label: t('field.type') },
        { key: 'startDate', label: t('field.date'), render: (r) => fmtDate(r.startDate, locale) },
      ]}
      fields={[
        { name: 'title', label: t('field.title'), required: true },
        { name: 'type', label: t('field.type') },
        { name: 'startDate', label: t('field.start'), type: 'date' },
        { name: 'endDate', label: t('field.end'), type: 'date' },
        { name: 'description', label: t('field.description'), type: 'textarea' },
      ]}
    />
  );
}
