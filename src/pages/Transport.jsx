import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { PageHeader, FieldError, FormBanner } from '../components/ui.jsx';
import Pagination from '../components/Pagination.jsx';
import { useLang } from '../context/LanguageContext.jsx';
import { PAGE_SIZE } from '../utils/session.js';
import { apiErrorMessage, inputClass, requiredErrors } from '../utils/form.js';

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
  const [vehicleForm, setVehicleForm] = useState({});
  const [routeForm, setRouteForm] = useState({});
  const [vErrors, setVErrors] = useState({});
  const [rErrors, setRErrors] = useState({});
  const [vError, setVError] = useState('');
  const [rError, setRError] = useState('');

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
    (async () => {
      await loadVehicles(1);
      await loadRoutes(1);
    })();
  }, []);

  async function addVehicle(e) {
    e.preventDefault();
    const next = requiredErrors(vehicleForm, [{ name: 'number', required: true }], t('common.required'));
    setVErrors(next);
    setVError('');
    if (Object.keys(next).length) {
      setVError(t('common.fixFields'));
      return;
    }
    try {
      await api.post('/vehicles', vehicleForm);
      setVehicleForm({});
      await loadVehicles(1);
    } catch (err) {
      setVError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  async function addRoute(e) {
    e.preventDefault();
    const next = requiredErrors(routeForm, [{ name: 'name', required: true }], t('common.required'));
    setRErrors(next);
    setRError('');
    if (Object.keys(next).length) {
      setRError(t('common.fixFields'));
      return;
    }
    try {
      const payload = { ...routeForm };
      if (payload.stop) {
        payload.stops = [{ name: payload.stop }];
        delete payload.stop;
      }
      await api.post('/routes', payload);
      setRouteForm({});
      await loadRoutes(1);
    } catch (err) {
      setRError(apiErrorMessage(err, t('common.saveFailed')));
    }
  }

  return (
    <div>
      <PageHeader title={t('transport.title')} subtitle={t('transport.subtitle')} />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">{t('transport.vehicles')}</h3>
          <form onSubmit={addVehicle} className="grid gap-2 mb-4" noValidate>
            <FormBanner>{vError}</FormBanner>
            <input
              className={inputClass(vErrors.number)}
              placeholder={`${t('transport.number')} *`}
              value={vehicleForm.number || ''}
              onChange={(e) => setVehicleForm({ ...vehicleForm, number: e.target.value })}
            />
            <FieldError>{vErrors.number}</FieldError>
            <input
              className="input"
              placeholder={t('transport.driverName')}
              value={vehicleForm.driverName || ''}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
            />
            <input
              className="input"
              placeholder={t('transport.driverPhone')}
              value={vehicleForm.driverPhone || ''}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
            />
            <input
              className="input"
              type="number"
              step="1"
              placeholder={t('transport.capacity')}
              value={vehicleForm.capacity || ''}
              onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
            />
            <button className="btn-primary">{t('transport.addVehicle')}</button>
          </form>
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
          <form onSubmit={addRoute} className="grid gap-2 mb-4" noValidate>
            <FormBanner>{rError}</FormBanner>
            <input
              className={inputClass(rErrors.name)}
              placeholder={`${t('transport.routeName')} *`}
              value={routeForm.name || ''}
              onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
            />
            <FieldError>{rErrors.name}</FieldError>
            <select className="input" value={routeForm.vehicleId || ''} onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}>
              <option value="">{t('transport.vehicles')}</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.number}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder={t('transport.stop')}
              value={routeForm.stop || ''}
              onChange={(e) => setRouteForm({ ...routeForm, stop: e.target.value })}
            />
            <button className="btn-primary">{t('transport.addRoute')}</button>
          </form>
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
