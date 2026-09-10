export function inr(n, locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

export function fmtDate(value, locale = 'en-IN') {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fullName(s) {
  if (!s) return '—';
  if (s.name) return s.name;
  return [s.firstName, s.lastName].filter(Boolean).join(' ') || '—';
}

export const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  trial: 'bg-amber-50 text-amber-700',
  expired: 'bg-rose-50 text-rose-700',
  suspended: 'bg-slate-100 text-slate-600',
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-rose-50 text-rose-700',
  late: 'bg-amber-50 text-amber-700',
  leave: 'bg-sky-50 text-sky-700',
  half_day: 'bg-violet-50 text-violet-700',
  paid: 'bg-emerald-50 text-emerald-700',
  unpaid: 'bg-rose-50 text-rose-700',
  partial: 'bg-amber-50 text-amber-700',
  overdue: 'bg-orange-50 text-orange-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  completed: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-sky-50 text-sky-700',
  new: 'bg-sky-50 text-sky-700',
  interested: 'bg-emerald-50 text-emerald-700',
  open: 'bg-amber-50 text-amber-700',
};
