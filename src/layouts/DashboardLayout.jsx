import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { NAV } from '../nav.js';
import LanguageSwitch from '../components/LanguageSwitch.jsx';
import { PageSpinner } from '../components/ui.jsx';

export default function DashboardLayout() {
  const { user, school, logout } = useAuth();
  const { t, locale } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV[user?.role] || NAV.school_admin;

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-ink text-white flex flex-col transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-display text-2xl tracking-tight">EduNest</p>
          <p className="text-xs text-white/60 mt-1">{t('brand.tag')}</p>
          {school && <p className="mt-3 text-sm text-gold truncate">{school.name}</p>}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <LanguageSwitch light />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50">{t(`role.${user?.role}`) || user?.role}</p>
            </div>
            <button onClick={onLogout} className="rounded-lg p-2 hover:bg-white/10" title={t('common.logout')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 bg-[#f4f1ea]/90 backdrop-blur border-b border-slate-200/70">
          <div className="flex items-center gap-3 px-4 py-3">
            <button className="lg:hidden rounded-lg p-2 hover:bg-white" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1">
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="lg:hidden">
              <LanguageSwitch />
            </div>
            {school && (
              <span className="hidden sm:inline badge bg-white text-pine-800 border border-slate-200">
                {t('common.plan', { plan: school.plan })}
              </span>
            )}
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
