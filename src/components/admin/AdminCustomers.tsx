import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Customer {
  id: number;
  customer_name: string;
  phone: string;
  marketing_consent_at: string;
  last_order_at: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
  });
}

function whatsappUrl(customer: Customer) {
  const digits = customer.phone.replace(/\D/g, '');
  const internationalPhone = digits.length === 10 ? `57${digits}` : digits;
  const message = encodeURIComponent(`Hola ${customer.customer_name}, te escribimos de Mucha Mazorca para compartirte nuestras novedades y promociones. Si no deseas recibir más mensajes, puedes decírnoslo por este medio.`);
  return `https://wa.me/${internationalPhone}?text=${message}`;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setCustomers(await apiFetch<Customer[]>('/api/admin/customers'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function revokeConsent(customer: Customer) {
    if (!window.confirm(`¿Retirar el consentimiento de marketing de ${customer.customer_name}? Dejará de aparecer en esta lista.`)) return;
    setBusyId(customer.id);
    setError('');
    setNotice('');
    try {
      await apiFetch(`/api/admin/customers/${customer.id}/opt-out`, {
        method: 'PATCH',
        body: JSON.stringify({ optOut: true }),
      });
      setCustomers(current => current.filter(entry => entry.id !== customer.id));
      setNotice(`Se retiró el consentimiento de ${customer.customer_name}.`);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'No se pudo retirar el consentimiento.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="title-pixel text-xl text-white">Clientes 📣</h1>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Solo aparecen clientes que aceptaron recibir promociones. Los mensajes se envían manualmente por WhatsApp.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="shrink-0 text-xs font-semibold text-yellow-300 underline">
          Actualizar
        </button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-[#00C853]/30 bg-[#00C853]/10 p-3 text-sm text-[#00C853]">{notice}</p>}
      {loading && <p className="text-sm text-white/60">Cargando clientes...</p>}
      {!loading && !error && customers.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-[#16161b] p-5 text-sm text-white/60">
          Aún no hay clientes con consentimiento para recibir promociones.
        </p>
      )}

      <div className="space-y-3">
        {customers.map(customer => (
          <article key={customer.id} className="space-y-3 rounded-2xl border border-white/10 bg-[#16161b] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-white">{customer.customer_name}</h2>
                <p className="mt-1 text-sm text-white/60">{customer.phone}</p>
                <p className="mt-1 text-[11px] text-white/40">Último pedido: {formatDate(customer.last_order_at)}</p>
              </div>
              <span className="rounded-full bg-[#00C853]/10 px-2.5 py-1 text-[10px] font-bold text-[#00C853]">
                Aceptó promociones
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={whatsappUrl(customer)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-black"
              >
                Abrir WhatsApp
              </a>
              <button
                type="button"
                disabled={busyId === customer.id}
                onClick={() => void revokeConsent(customer)}
                className="rounded-xl border border-red-400/30 px-4 py-2.5 text-xs font-bold text-red-300 disabled:opacity-50"
              >
                {busyId === customer.id ? 'Actualizando...' : 'Retirar consentimiento'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
