import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

const DEMOS = [
  { roleKey: 'login.demo.super', email: 'superadmin@edunest.io', password: 'Admin@123' },
  { roleKey: 'login.demo.greenwood', email: 'admin@greenwood.school', password: 'Admin@123' },
];

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@greenwood.school');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('login.failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-4xl">EduNest</p>
            <p className="mt-2 text-white/60">{t('brand.loginTag')}</p>
          </div>
          <LanguageSwitch light />
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-5xl leading-tight">{t('login.hero')}</h1>
          <p className="mt-6 text-white/70 leading-relaxed">{t('login.heroBody')}</p>
        </div>
        <p className="text-sm text-white/40">{t('login.demoNote')}</p>
      </div>
      <div className="flex items-center justify-center p-8 bg-[#f4f1ea]">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <p className="font-display text-3xl lg:hidden">EduNest</p>
            <div className="lg:hidden ml-auto">
              <LanguageSwitch />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">{t('login.title')}</h2>
          <p className="text-slate-500 mt-1 mb-8">{t('login.subtitle')}</p>
          {error && <div className="mb-4 rounded-xl bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</div>}
          <label className="label">{t('login.email')}</label>
          <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label className="label">{t('login.password')}</label>
          <input className="input mb-6" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? t('login.signing') : t('login.continue')}
          </button>
          <div className="mt-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('login.demos')}</p>
            {DEMOS.map((d) => (
              <button
                type="button"
                key={d.email}
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
                className="w-full text-left rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:border-pine-400"
              >
                <span className="font-medium">{t(d.roleKey)}</span>
                <span className="text-slate-400 ml-2">{d.email}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
