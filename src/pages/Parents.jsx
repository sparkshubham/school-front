import ResourcePage from '../components/ResourcePage.jsx';
import { fullName } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export default function Parents() {
  const { t } = useLang();
  return (
    <ResourcePage
      title={t('parents.title')}
      subtitle={t('parents.subtitle')}
      path="/parents"
      columns={[
        { key: 'name', label: t('field.name') },
        { key: 'phone', label: t('field.phone') },
        { key: 'email', label: t('field.email') },
        { key: 'students', label: t('field.children'), render: (r) => r.students?.map(fullName).join(', ') || '—' },
      ]}
      fields={[
        { name: 'name', label: t('field.name'), required: true },
        { name: 'phone', label: t('field.phone'), required: true },
        { name: 'email', label: t('field.email') },
        { name: 'occupation', label: t('field.occupation') },
        { name: 'relation', label: t('field.relation') },
      ]}
    />
  );
}
