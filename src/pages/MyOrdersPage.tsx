import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, menuItems } from '../data/menuData';
import { clearHistory, loadHistory } from '../utils/orderHistory';
import type { HistoryEntry } from '../utils/orderHistory';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MyOrdersPage() {
  const { addLine } = useCart();
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);
  const [notice, setNotice] = useState('');

  function repeat(entry: HistoryEntry) {
    let added = 0;
    const missing: string[] = [];
    for (const line of entry.lines) {
      const current = menuItems.find(m => m.id === line.menuItemId);
      if (!current) {
        missing.push(line.name);
        continue;
      }
      const flatAddons = line.addons.flatMap(a => Array.from({ length: a.quantity }, () => a.addon));
      addLine(current, flatAddons, line.quantity);
      added += 1;
    }
    setNotice(
      added === 0
        ? 'Ninguno de esos productos está disponible ahora.'
        : `✅ Agregado al carrito.${missing.length ? ` Ya no están: ${missing.join(', ')}.` : ''} Ábrelo con el botón del carrito.`
    );
  }

  function handleClear() {
    if (!window.confirm('¿Borrar todo el historial de pedidos?')) return;
    clearHistory();
    setEntries([]);
  }

  return (
    <div className="theme-page bg-[#050505] text-white">
      <div className="section-shell max-w-2xl py-10">
        <h1 className="title-pixel text-2xl text-white sm:text-3xl">Mis pedidos 🧾</h1>
        <p className="mt-2 text-sm text-white/60">Guardados solo en este celular. Repite uno con un toque.</p>

        {notice && <p className="mt-4 rounded-xl border border-[#00C853]/40 bg-[#00C853]/10 p-3 text-sm font-bold text-[#00C853]">{notice}</p>}

        {entries.length === 0 && (
          <div className="mt-8 rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-6 text-center">
            <p className="text-4xl">🌽</p>
            <p className="mt-2 text-white/70">Todavía no has hecho pedidos desde este celular.</p>
            <Link to="/menu" className="mt-4 inline-block rounded-full bg-yellow-400 px-6 py-3 text-sm font-extrabold uppercase text-black">
              Ver el menú
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {entries.map(e => (
            <div key={e.id} className="rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-yellow-300">
                  {formatDate(e.date)} · {e.type === 'domicilio' ? '🛵 Domicilio' : '🏃 Recoger'}
                </p>
                <p className="text-sm font-black text-white">{formatPrice(e.total)}</p>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                {e.lines.map((l, i) => (
                  <li key={`${l.menuItemId}-${i}`}>
                    {l.quantity} x {l.name}
                    {l.addons.length > 0 && (
                      <span className="text-white/50"> ({l.addons.map(a => a.addon.name).join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
              {e.promoTitle && <p className="mt-2 text-xs text-[#00C853]">🎁 {e.promoTitle}</p>}
              <button
                type="button"
                onClick={() => repeat(e)}
                className="mt-3 w-full rounded-xl bg-yellow-400 py-3 text-sm font-black text-black active:scale-95"
              >
                🔁 Repetir este pedido
              </button>
            </div>
          ))}
        </div>

        {entries.length > 0 && (
          <button type="button" onClick={handleClear} className="mt-6 text-xs font-semibold text-white/50 underline">
            Borrar historial
          </button>
        )}
      </div>
    </div>
  );
}
