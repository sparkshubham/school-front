import { useLang } from '../context/LanguageContext.jsx';

export default function LanguageSwitch({ light = false }) {
  const { lang, setLang } = useLang();
  const btn = (code, label) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
        lang === code
          ? light
            ? 'bg-white text-ink'
            : 'bg-pine-700 text-white'
          : light
            ? 'text-white/70 hover:text-white'
            : 'text-slate-500 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className={`inline-flex items-center gap-0.5 rounded-xl p-0.5 ${light ? 'bg-white/10' : 'bg-white border border-slate-200'}`}>
      {btn('hi', 'हिंदी')}
      {btn('en', 'EN')}
    </div>
  );
}
