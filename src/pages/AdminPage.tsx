import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import AdminLogin from '../components/admin/AdminLogin';
import AdminProducts from '../components/admin/AdminProducts';
import AdminPromos from '../components/admin/AdminPromos';
import AdminSettings from '../components/admin/AdminSettings';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminOrders from '../components/admin/AdminOrders';

type Tab = 'pedidos' | 'productos' | 'promos' | 'personalizar' | 'avisos';

export default function AdminPage() {
  const [session, setSession] = useState<boolean | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('productos');

  useEffect(() => {
    void (async () => {
      try {
        await apiFetch<{ email: string }>('/api/auth/me');
        setSession(true);
      } catch {
        setSession(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore, we still sign out locally
    }
    setSession(false);
  };

  const tabClass = (t: Tab) =>
    `rounded-xl px-1 py-3 text-xs font-black ${tab === t ? 'bg-yellow-400 text-black' : 'border border-white/10 bg-[#0c0c10] text-white/70'}`;

  let content;
  if (session === undefined) {
    content = <p className="p-8 text-center text-white/70">Cargando...</p>;
  } else if (!session) {
    content = <AdminLogin />;
  } else {
    content = (
      <div className="mx-auto max-w-2xl px-4 pt-5">
        <div className="mb-4 grid grid-cols-5 gap-2">
          <button type="button" className={tabClass('pedidos')} onClick={() => setTab('pedidos')}>🧾 Pedidos</button>
          <button type="button" className={tabClass('productos')} onClick={() => setTab('productos')}>🍔 Productos</button>
          <button type="button" className={tabClass('promos')} onClick={() => setTab('promos')}>🔥 Promos</button>
          <button type="button" className={tabClass('personalizar')} onClick={() => setTab('personalizar')}>🎨 Estilo</button>
          <button type="button" className={tabClass('avisos')} onClick={() => setTab('avisos')}>🔔 Avisos</button>
        </div>
        {tab === 'pedidos' ? (
          <AdminOrders onLogout={handleLogout} />
        ) : tab === 'productos' ? (
          <AdminProducts onLogout={handleLogout} />
        ) : tab === 'personalizar' ? (
          <AdminSettings />
        ) : tab === 'avisos' ? (
          <AdminNotifications />
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="title-pixel text-xl text-white">Promos 🔥</h1>
              <button type="button" onClick={handleLogout} className="text-xs font-semibold text-white/60 underline">Cerrar sesión</button>
            </div>
            <AdminPromos />
          </div>
        )}
      </div>
    );
  }

  return <div className="theme-page min-h-screen bg-[#050505] text-white">{content}</div>;
}
