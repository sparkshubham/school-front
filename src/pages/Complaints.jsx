import ResourcePage from '../components/ResourcePage.jsx';
import { Badge } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Complaints() {
  const { t } = useLang();
  return (
    <ResourcePage
      title={t('complaints.title')}
      subtitle={t('complaints.subtitle')}
      path="/complaints"
      columns={[
        { key: 'title', label: t('field.title') },
        { key: 'category', label: t('field.category') },
        { key: 'status', label: t('field.status'), render: (r) => <Badge status={r.status} /> },
      ]}
      fields={[
        { name: 'title', label: t('field.title'), required: true },
        { name: 'category', label: t('field.category') },
        { name: 'body', label: t('field.details'), type: 'textarea' },
        {
          name: 'status',
          label: t('field.status'),
          type: 'select',
          options: ['open', 'assigned', 'in_progress', 'resolved', 'closed'].map((v) => ({ value: v, label: t(`status.${v}`) })),
        },
      ]}
    />
  );
}
