import ResourcePage from '../components/ResourcePage.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Notices() {
  const { t } = useLang();
  return (
    <ResourcePage
      title={t('notices.title')}
      subtitle={t('notices.subtitle')}
      path="/notices"
      columns={[
        { key: 'title', label: t('field.title') },
        { key: 'audience', label: t('field.audience'), render: (r) => t(`audience.${r.audience}`) },
        { key: 'pinned', label: t('field.pinned'), render: (r) => (r.pinned ? t('common.yes') : '') },
      ]}
      fields={[
        { name: 'title', label: t('field.title'), required: true },
        {
          name: 'audience',
          label: t('field.audience'),
          type: 'select',
          options: ['all', 'students', 'teachers', 'parents', 'class', 'staff'].map((v) => ({ value: v, label: t(`audience.${v}`) })),
        },
        { name: 'body', label: t('field.body'), type: 'textarea' },
      ]}
    />
  );
}
