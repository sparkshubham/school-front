import ResourcePage from '../components/ResourcePage.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Library() {
  const { t } = useLang();
  return (
    <ResourcePage
      title={t('library.title')}
      subtitle={t('library.subtitle')}
      path="/books"
      columns={[
        { key: 'name', label: t('field.book') },
        { key: 'author', label: t('field.author') },
        { key: 'isbn', label: t('field.isbn') },
        { key: 'available', label: t('field.available') },
        { key: 'quantity', label: t('field.qty') },
      ]}
      fields={[
        { name: 'name', label: t('field.bookName'), required: true },
        { name: 'author', label: t('field.author') },
        { name: 'isbn', label: t('field.isbn') },
        { name: 'category', label: t('field.category') },
        { name: 'rack', label: t('field.rack') },
        { name: 'quantity', label: t('field.quantity'), type: 'number' },
        { name: 'available', label: t('field.available'), type: 'number' },
      ]}
    />
  );
}
