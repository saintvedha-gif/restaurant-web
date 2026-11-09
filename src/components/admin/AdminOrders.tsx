import { useCallback, useEffect, useState } from 'react';
import { formatPrice } from '../../data/menuData';
import { deleteOrder, listOrders, ORDER_STATUSES, updateOrderStatus } from '../../lib/orders';
import type { OrderRecord, OrderStatus } from '../../lib/orders';

interface Props {
  onLogout: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const selectClass =
  'w-full rounded-xl border border-yellow-400/30 bg-[#0c0c10] px-3 py-3 text-sm font-bold text-white focus:border-yellow-300 focus:outline-none';

export default function AdminOrders({ onLogout }: Props) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setOrders(await listOrders());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? `${loadError.message}. Verifica que la API de pedidos esté disponible y que tengas sesión activa.`
          : 'No se pudieron cargar los pedidos.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    setError('');
    try {
      await updateOrderStatus(orderId, status);
      setOrders(current => current.map(order =>
        order.id === orderId ? { ...order, status, updated_at: new Date().toISOString() } : order
      ));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeOrder(order: OrderRecord) {
    if (!window.confirm(`¿Eliminar el pedido de ${order.customer_name}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(order.id);
    setError('');
    try {
      await deleteOrder(order.id);
      setOrders(current => current.filter(entry => entry.id !== order.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el pedido.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="title-pixel text-xl text-white">Pedidos 🧾</h1>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void load()} className="text-xs font-semibold text-yellow-300 underline">
            Actualizar
          </button>
          <button type="button" onClick={onLogout} className="text-xs font-semibold text-white/60 underline">
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {loading && <p className="text-white/60">Cargando pedidos...</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="rounded-2xl border border-white/10 bg-[#16161b] p-5 text-sm text-white/60">
          Todavía no hay pedidos guardados.
        </p>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <article key={order.id} className="space-y-4 rounded-[22px] border border-yellow-400/20 bg-[#16161b] p-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white/50">{formatDate(order.created_at)}</p>
                <h2 className="mt-1 text-lg font-black text-white">{order.customer_name}</h2>
                <a className="text-sm text-yellow-300 underline" href={`tel:${order.phone}`}>{order.phone}</a>
              </div>
              <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                {order.fulfillment_type === 'domicilio' ? '🛵 Domicilio' : '🏃 Recoger'}
              </span>
            </header>

            {order.fulfillment_type === 'domicilio' && (
              <div className="space-y-1 text-sm text-white/75">
                {order.address && <p>Dirección: {order.address}</p>}
                {order.reference && <p>Referencia: {order.reference}</p>}
                {order.latitude !== null && order.longitude !== null && (
                  <a
                    className="inline-block text-yellow-300 underline"
                    href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 Ver ubicación en el mapa
                  </a>
                )}
              </div>
            )}

            <ul className="space-y-2 border-y border-white/10 py-3">
              {order.items.map((item, index) => (
                <li key={`${item.product_id}-${index}`} className="text-sm text-white/85">
                  <div className="flex items-start justify-between gap-3">
                    <span>{item.quantity} × {item.name}</span>
                    <span className="shrink-0 font-bold">{formatPrice(item.line_total)}</span>
                  </div>
                  {item.addons.length > 0 && (
                    <p className="mt-1 pl-3 text-xs text-white/50">
                      {item.addons.map(addon => `${addon.quantity > 1 ? `${addon.quantity} × ` : ''}${addon.name}`).join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor={`order-status-${order.id}`} className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-yellow-300">
                  Estado del pedido
                </label>
                <select
                  id={`order-status-${order.id}`}
                  className={selectClass}
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={event => void changeStatus(order.id, event.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div className="shrink-0 text-right">
                {order.discount_amount > 0 && (
                  <p className="text-xs text-[#00C853]">-{formatPrice(order.discount_amount)}</p>
                )}
                <p className="text-lg font-black text-white">{formatPrice(order.total)}</p>
              </div>
            </div>

            {order.promo_title && <p className="text-xs text-[#00C853]">🎁 {order.promo_title}</p>}
            {updatingId === order.id && <p className="text-xs text-white/50">Actualizando...</p>}
            {(order.status === 'completed' || order.status === 'cancelled') && (
              <button
                type="button"
                onClick={() => void removeOrder(order)}
                disabled={deletingId === order.id}
                className="text-xs font-semibold text-red-400 underline disabled:opacity-50"
              >
                {deletingId === order.id ? 'Eliminando...' : 'Eliminar registro'}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
