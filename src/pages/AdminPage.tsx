import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import AdminLogin from '../components/admin/AdminLogin';
import AdminProducts from '../components/admin/AdminProducts';
import AdminPromos from '../components/admin/AdminPromos';
import AdminSettings from '../components/admin/AdminSettings';
import AdminNotifications from '../components/admin/AdminNotifications';
import AdminOrders from '../components/admin/AdminOrders';
import AdminAccount from '../components/admin/AdminAccount';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminGallery from '../components/admin/AdminGallery';

type Tab = 'inicio' | 'pedidos' | 'productos' | 'promos' | 'clientes' | 'galeria' | 'personalizar' | 'avisos' | 'cuenta';

const navigation: { id: Tab; label: string; icon: string; description: string }[] = [
  { id: 'inicio', label: 'Resumen', icon: '⌂', description: 'Accesos rápidos y estado del panel' },
  { id: 'pedidos', label: 'Pedidos', icon: '▤', description: 'Revisa y gestiona pedidos' },
  { id: 'productos', label: 'Productos', icon: '◈', description: 'Edita el menú y disponibilidad' },
  { id: 'promos', label: 'Promociones', icon: '✳', description: 'Crea y administra promociones' },
  { id: 'clientes', label: 'Clientes', icon: '♧', description: 'Contactos que aceptaron recibir promociones' },
  { id: 'galeria', label: 'Galería', icon: '▧', description: 'Sube y administra fotos de la galería' },
  { id: 'personalizar', label: 'Personalizar sitio', icon: '◉', description: 'Ajusta el diseño y contenido' },
  { id: 'avisos', label: 'Notificaciones', icon: '♧', description: 'Envía avisos a tus clientes' },
  { id: 'cuenta', label: 'Cuenta', icon: '⚙', description: 'Correo y contraseña del panel' },
];

export default function AdminPage() {
  const [session, setSession] = useState<boolean | undefined>(undefined);
  const [adminEmail, setAdminEmail] = useState('');
  const [tab, setTab] = useState<Tab>('inicio');

  useEffect(() => {
    void (async () => {
      try {
        const admin = await apiFetch<{ email: string }>('/api/auth/me');
        setAdminEmail(admin.email);
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
    setAdminEmail('');
    setSession(false);
  };

  if (session === undefined) {
    return (
      <div className="theme-page min-h-screen bg-[#050505] text-white">
        <p className="p-8 text-center text-white/70">Cargando panel...</p>
      </div>
    );
  }

  if (!session) {
    return <div className="theme-page min-h-screen bg-[#050505] text-white"><AdminLogin /></div>;
  }

  const activeItem = navigation.find(item => item.id === tab) ?? navigation[0];
  const content = tab === 'inicio' ? (
    <section className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-[#1a1914] to-[#111116] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Panel de administración</p>
        <h1 className="title-pixel mt-3 text-xl leading-relaxed text-white sm:text-2xl">Hola, bienvenido 🌽</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
          Administra el menú, los pedidos y la información de Mucha Mazorca desde un solo lugar.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {navigation.filter(item => item.id !== 'inicio').map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className="group flex min-h-32 flex-col items-start rounded-2xl border border-white/10 bg-[#111116] p-5 text-left transition hover:border-yellow-400/40 hover:bg-[#17171d]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-xl text-yellow-300">{item.icon}</span>
            <span className="mt-4 font-bold text-white group-hover:text-yellow-200">{item.label}</span>
            <span className="mt-1 text-xs leading-5 text-white/50">{item.description}</span>
          </button>
        ))}
      </div>
    </section>
  ) : tab === 'pedidos' ? (
    <AdminOrders onLogout={handleLogout} />
  ) : tab === 'productos' ? (
    <AdminProducts onLogout={handleLogout} />
  ) : tab === 'personalizar' ? (
    <AdminSettings />
  ) : tab === 'clientes' ? (
    <AdminCustomers />
  ) : tab === 'galeria' ? (
    <AdminGallery />
  ) : tab === 'avisos' ? (
    <AdminNotifications />
  ) : tab === 'cuenta' ? (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <AdminAccount email={adminEmail} onEmailChange={setAdminEmail} />
    </div>
  ) : (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="title-pixel text-xl text-white">Promociones ✳</h1>
        <button type="button" onClick={handleLogout} className="text-xs font-semibold text-white/60 underline">Cerrar sesión</button>
      </div>
      <AdminPromos />
    </div>
  );

  return (
    <div className="theme-page min-h-screen bg-[#08080b] text-white lg:flex">
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-[#0d0d11] p-4 lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2 py-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-2xl">🌽</span>
          <div>
            <p className="text-sm font-black text-white">MUCHA MAZORCA</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-300">Administración</p>
          </div>
        </div>
        <p className="mb-2 mt-7 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">Menú principal</p>
        <nav className="space-y-1" aria-label="Navegación del panel">
          {navigation.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                tab === item.id ? 'bg-yellow-400 text-black' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="w-6 text-center text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <p className="truncate text-xs font-bold text-white/75">{adminEmail}</p>
          <button type="button" onClick={handleLogout} className="mt-3 text-xs font-semibold text-white/45 underline hover:text-yellow-300">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0d11]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.18em] text-yellow-300 lg:hidden">Mucha Mazorca · Panel</p>
              <h1 className="mt-1 truncate text-base font-black text-white sm:text-lg">{activeItem.label}</h1>
            </div>
            <div className="hidden max-w-[240px] truncate rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 sm:block lg:max-w-xs">
              {adminEmail}
            </div>
            <button type="button" onClick={handleLogout} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/65 hover:border-yellow-400/40 hover:text-yellow-200 lg:hidden">
              Salir
            </button>
          </div>
          <nav className="-mb-3 mt-3 flex gap-2 overflow-x-auto pb-3 lg:hidden" aria-label="Navegación del panel">
            {navigation.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? 'page' : undefined}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                  tab === item.id ? 'bg-yellow-400 text-black' : 'border border-white/10 bg-white/[0.03] text-white/65'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </header>
        <main>{content}</main>
      </div>
    </div>
  );
}
