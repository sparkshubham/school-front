import { useLang } from '../context/LanguageContext.jsx';

export default function Pagination({ page, pages, total, onPage }) {
  const { t } = useLang();
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-sm">
      <p className="text-slate-500">{t('common.showing', { total })}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t('common.prev')}
        </button>
        <span className="text-slate-600">{t('common.pageOf', { page, pages })}</span>
        <button
          type="button"
          className="btn-ghost disabled:opacity-40"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
