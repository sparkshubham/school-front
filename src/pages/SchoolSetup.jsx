import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, PageSpinner } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function SchoolSetup() {
  const { t } = useLang();
  const [school, setSchool] = useState(null);
  const [branches, setBranches] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/school/profile')
      .then(({ data }) => {
        setSchool(data.school);
        setBranches(data.branches || []);
      })
      .catch(() => {});
  }, []);

  async function save(e) {
    e.preventDefault();
    const { data } = await api.patch('/school/profile', school);
    setSchool(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    ['name', 'setup.name'],
    ['principalName', 'setup.principal'],
    ['email', 'setup.email'],
    ['phone', 'setup.phone'],
    ['website', 'setup.website'],
    ['address', 'setup.address'],
    ['city', 'setup.city'],
    ['state', 'setup.state'],
    ['pincode', 'setup.pincode'],
    ['registrationNo', 'setup.reg'],
    ['affiliation', 'setup.aff'],
    ['academicSession', 'setup.session'],
  ];

  return (
    <div>
      <PageHeader title={t('setup.title')} subtitle={t('setup.subtitle')} />
      {!school ? (
        <PageSpinner />
      ) : (
        <>
          <form onSubmit={save} className="card p-6 grid md:grid-cols-2 gap-4">
            {fields.map(([name, key]) => (
              <div key={name}>
                <label className="label">{t(key)}</label>
                <input className="input" value={school[name] || ''} onChange={(e) => setSchool({ ...school, [name]: e.target.value })} />
              </div>
            ))}
            <div className="md:col-span-2">
              <button className="btn-primary">{saved ? t('common.saved') : t('setup.save')}</button>
            </div>
          </form>
          <div className="card p-6 mt-6">
            <h3 className="font-semibold mb-3">{t('setup.branches')}</h3>
            {branches.map((b) => (
              <div key={b._id} className="py-2 border-b border-slate-50">
                {b.name} {b.isMain ? `· ${t('common.main')}` : ''} · {b.address || ''}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
