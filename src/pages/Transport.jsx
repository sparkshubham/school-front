import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader } from '../components/ui.jsx';
import { useLang } from '../context/LanguageContext.jsx';

export default function Transport() {
  const { t } = useLang();
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    api.get('/vehicles').then((r) => setVehicles(r.data.items || []));
    api.get('/routes').then((r) => setRoutes(r.data.items || []));
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
        </div>
      </div>
    </div>
  );
}
