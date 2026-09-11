import { Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../utils/format.js';
import { useLang } from '../context/LanguageContext.jsx';

export function Spinner({ className = 'h-7 w-7' }) {
  return <Loader2 className={`animate-spin text-pine-700 ${className}`} aria-hidden />;
}

export function PageSpinner() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 min-h-[280px]" role="status" aria-live="polite">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-slate-500">{t('common.loading')}</p>
    </div>
  );
}

export function Busy({ on, children, className = '' }) {
  return (
    <div className={`relative ${on ? 'min-h-[220px]' : ''} ${className}`}>
      {children}
      {on && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
          <Spinner className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

export function Badge({ children, status }) {
  const { t } = useLang();
  const cls = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
  const translated = status ? t(`status.${status}`) : '';
  const label = translated && translated !== `status.${status}` ? translated : children || status;
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = 'pine' }) {
  const tones = {
    pine: 'from-pine-800 to-pine-600 text-white',
    gold: 'from-[#3d3420] to-[#6b5728] text-white',
    slate: 'from-slate-800 to-slate-600 text-white',
    rose: 'from-rose-800 to-rose-600 text-white',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} p-5 shadow-card`}>
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-xs text-white/60">{hint}</p>}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="py-12 text-center text-slate-500">{children}</div>;
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-rose-600 mt-1">{children}</p>;
}

export function FormBanner({ children }) {
  if (!children) return null;
  return <div className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm">{children}</div>;
}

export function Modal({ title, children, onClose }) {
  const { t } = useLang();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-ink">
            {t('common.close')}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
