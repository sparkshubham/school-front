import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';

export default function Transport() {
  const { t } = useLang();
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vPage, setVPage] = useState(1);
  const [vPages, setVPages] = useState(1);
  const [vTotal, setVTotal] = useState(0);
  const [rPage, setRPage] = useState(1);
  const [rPages, setRPages] = useState(1);
  const [rTotal, setRTotal] = useState(0);

  async function loadVehicles(nextPage = 1) {
    try {
      const { data } = await api.get('/vehicles', { params: { page: nextPage, limit: PAGE_SIZE } });
      setVehicles(data.items || []);
      setVTotal(data.total || 0);
      setVPages(data.pages || 1);
      setVPage(data.page || nextPage);
    } catch {
      setVehicles([]);
    }
  }
  async function loadRoutes(nextPage = 1) {
    try {
      const { data } = await api.get('/routes', { params: { page: nextPage, limit: PAGE_SIZE } });
      setRoutes(data.items || []);
      setRTotal(data.total || 0);
      setRPages(data.pages || 1);
      setRPage(data.page || nextPage);
    } catch {
      setRoutes([]);
    }
  }

  useEffect(() => {
    loadVehicles(1);
    loadRoutes(1);
  }, []);

  return (
    <div>
      <PageHeader title={t('transport.title')} subtitle={t('transport.subtitle')} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('transport.vehicles')}</h3>
          {vehicles.map((v) => (
            <div key={v._id} className="py-3 border-b border-slate-50">
              <p className="font-medium">{v.number}</p>
              <p className="text-sm text-slate-500">
                {t('transport.driver', { name: v.driverName, phone: v.driverPhone, n: v.capacity })}
              </p>
            </div>
          ))}
          <Pagination page={vPage} pages={vPages} total={vTotal} onPage={loadVehicles} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('transport.routes')}</h3>
          {routes.map((r) => (
            <div key={r._id} className="py-3 border-b border-slate-50">
              <p className="font-medium">{r.name}</p>
              <ol className="text-sm text-slate-600 mt-1 list-decimal ml-4">
                {r.stops?.map((s, i) => (
                  <li key={i}>{s.name} {s.pickupTime && `· ${s.pickupTime}`}</li>
                ))}
              </ol>
            </div>
          ))}
          <Pagination page={rPage} pages={rPages} total={rTotal} onPage={loadRoutes} />
        </div>
      </div>
    </div>
  );
}
