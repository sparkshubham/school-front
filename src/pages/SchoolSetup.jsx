import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, PageSpinner, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';
import { apiErrorMessage, inputClass, isBlank } from '../utils/form.js';

export default function SchoolSetup() {
  const { t } = useLang();
  const [school, setSchool] = useState(null);
  const [branches, setBranches] = useState([]);
  const [saved, setSaved] = useState(false);
  const [branchPage, setBranchPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

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
    if (isBlank(school?.name)) {
      setErrors({ name: t('common.required') });
      setFormError(t('common.fixFields'));
      return;
    }
    setErrors({});
    setFormError('');
    try {
      const { data } = await api.patch('/school/profile', school);
      setSchool(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setFormError(apiErrorMessage(err, t('common.saveFailed')));
    }
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
          <form onSubmit={save} className="card p-6 grid md:grid-cols-2 gap-4" noValidate>
            <div className="md:col-span-2">
              <FormBanner>{formError}</FormBanner>
            </div>
            {fields.map(([name, key]) => (
              <div key={name}>
                <label className="label">
                  {t(key)}
                  {name === 'name' ? ' *' : ''}
                </label>
                <input
                  className={inputClass(errors[name])}
                  value={school[name] || ''}
                  onChange={(e) => setSchool({ ...school, [name]: e.target.value })}
                />
                <FieldError>{errors[name]}</FieldError>
              </div>
            ))}
            <div className="md:col-span-2">
              <button className="btn-primary">{saved ? t('common.saved') : t('setup.save')}</button>
            </div>
          </form>
          <div className="card mt-6">
            <div className="p-6">
              <h3 className="font-semibold mb-3">{t('setup.branches')}</h3>
              {branches.slice((branchPage - 1) * PAGE_SIZE, branchPage * PAGE_SIZE).map((b) => (
                <div key={b._id} className="py-2 border-b border-slate-50">
                  {b.name} {b.isMain ? `· ${t('common.main')}` : ''} · {b.address || ''}
                </div>
              ))}
            </div>
            <Pagination
              page={branchPage}
              pages={Math.max(1, Math.ceil(branches.length / PAGE_SIZE) || 1)}
              total={branches.length}
              onPage={setBranchPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
