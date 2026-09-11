import { useLang } from '../context/LanguageContext.jsx';

export default function Pagination({ page, pages, total, onPage }) {
  const { t } = useLang();
  const totalPages = Math.max(1, Number(pages) || 1);
  const current = Math.max(1, Number(page) || 1);
  const count = Number(total) || 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm">
      <p className="text-slate-500">{t('common.showing', { total: count })}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost disabled:opacity-40"
          disabled={current <= 1}
          onClick={() => onPage(current - 1)}
        >
          {t('common.prev')}
        </button>
        <span className="text-slate-600">{t('common.pageOf', { page: current, pages: totalPages })}</span>
        <button
          type="button"
          className="btn-ghost disabled:opacity-40"
          disabled={current >= totalPages}
          onClick={() => onPage(current + 1)}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
