import { useState } from 'react';
import type { OrderData, OrderType } from '../types/order';

interface Props {
  value: OrderData;
  onChange: (next: OrderData) => void;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  marketingConsent: boolean;
  onMarketingConsentChange: (next: boolean) => void;
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';

const TYPES: { id: OrderType; label: string }[] = [
  { id: 'domicilio', label: '🛵 Domicilio' },
  { id: 'recoger', label: '🏃 Recoger' },
];

function isGeolocationError(error: unknown): error is GeolocationPositionError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export default function OrderForm({ value, onChange, deliveryEnabled, pickupEnabled, marketingConsent, onMarketingConsentChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  function set<K extends keyof OrderData>(key: K, v: OrderData[K]) {
    onChange({ ...value, [key]: v });
  }

  function askLocation() {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no permite ubicación. Escribe tu dirección.');
      return;
    }
    setLoading(true);
    setGeoError('');
    const locate = (options: PositionOptions) => new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    void (async () => {
      try {
        let position: GeolocationPosition;
        try {
          position = await locate({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        } catch (error) {
          if (isGeolocationError(error) && error.code === 1) throw error;
          position = await locate({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
        }
        onChange({
          ...value,
          coords: {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
          },
        });
      } catch (error) {
        if (isGeolocationError(error) && error.code === 1) setGeoError('No diste permiso de ubicación. Escribe tu dirección.');
        else if (isGeolocationError(error) && error.code === 3) setGeoError('No pudimos obtener la ubicación a tiempo. Intenta de nuevo o escribe tu dirección.');
        else setGeoError('No pudimos detectar tu ubicación. Escribe tu dirección.');
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-yellow-300">Datos del pedido</p>

      {(deliveryEnabled && pickupEnabled) ? (
        <div className="grid grid-cols-2 gap-2">
        {TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => set('type', t.id)}
            className={`rounded-xl py-3 text-sm font-black transition-all active:scale-95 ${
              value.type === t.id
                ? 'bg-yellow-400 text-black'
                : 'border border-white/10 bg-[#0c0c10] text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
        </div>
      ) : (
        <p className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-sm font-bold text-yellow-200">
          {deliveryEnabled ? '🛵 Pedido a domicilio' : '🏃 Pedido para recoger en el local'}
        </p>
      )}

      <input
        className={inputClass}
        placeholder="Tu nombre"
        autoComplete="name"
        value={value.name}
        onChange={e => set('name', e.target.value)}
      />
      <input
        className={inputClass}
        placeholder="Tu celular"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value.phone}
        onChange={e => set('phone', e.target.value)}
      />

      {value.type === 'domicilio' && deliveryEnabled && (
        <>
          <input
            className={inputClass}
            placeholder="Dirección (calle, número, barrio)"
            autoComplete="street-address"
            value={value.address}
            onChange={e => set('address', e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Referencia (casa verde, portón negro...)"
            value={value.reference}
            onChange={e => set('reference', e.target.value)}
          />

          {value.coords ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#00C853]/40 bg-[#00C853]/10 px-3 py-3">
              <span className="text-sm font-bold text-[#00C853]">📍 Ubicación lista</span>
              <button
                type="button"
                onClick={() => set('coords', null)}
                className="text-xs font-semibold text-white/60 underline"
              >
                Quitar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={askLocation}
              disabled={loading}
              className="w-full rounded-xl border border-yellow-400/40 bg-yellow-400/10 py-3 text-sm font-black text-yellow-300 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Buscando tu ubicación...' : '📍 Usar mi ubicación actual'}
            </button>
          )}
          {geoError && <p className="text-xs text-red-400">{geoError}</p>}
        </>
      )}

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0c0c10] p-3 text-xs leading-5 text-white/65">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-yellow-400"
          checked={marketingConsent}
          onChange={event => onMarketingConsentChange(event.target.checked)}
        />
        <span>
          Acepto recibir mensajes promocionales por WhatsApp de Mucha Mazorca. Es opcional y puedo retirar mi consentimiento cuando quiera.
        </span>
      </label>
    </div>
  );
}
