import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { rowToPromo } from '../../lib/promoRows';
import type { PromoRow } from '../../lib/promoRows';
import { describeDiscount, describeSchedule, isPromoActiveNow } from '../../utils/promoEngine';
import PromoEditor from './PromoEditor';

type Editing = { row: PromoRow | null } | null;

export default function AdminPromos() {
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Editing>(null);

  const mapRows = (items: Array<{ id: string; title: string; subtitle: string; badge: string; image?: string; link?: string; active?: boolean; type: 'none' | 'percent' | 'take_pay' | 'amount'; value: number; buyQty: number; getQty: number; productIds?: string[]; categoryIds?: string[]; startDate?: string; endDate?: string; days?: number[]; sortOrder?: number; }> = []): PromoRow[] =>
    items.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      badge: item.badge,
      image: item.image ?? null,
      link: item.link ?? null,
      active: Boolean(item.active),
      type: item.type,
      value: item.value,
      buy_qty: item.buyQty,
      get_qty: item.getQty,
      product_ids: item.productIds ?? [],
      category_ids: item.categoryIds ?? [],
      start_date: item.startDate ?? null,
      end_date: item.endDate ?? null,
      days: item.days ?? [],
      sort_order: item.sortOrder ?? 0,
    }));

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Array<{ id: string; title: string; subtitle: string; badge: string; image?: string; link?: string; active?: boolean; type: 'none' | 'percent' | 'take_pay' | 'amount'; value: number; buyQty: number; getQty: number; productIds?: string[]; categoryIds?: string[]; startDate?: string; endDate?: string; days?: number[]; sortOrder?: number; }>>('/api/admin/promos');
      setRows(mapRows(data ?? []));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar las promos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(row: PromoRow) {
    const next = !row.active;
    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, active: next } : r)));
    try {
      await apiFetch(`/api/admin/promos/${row.id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ active: next }),
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la promo');
      void load();
    }
  }

  const nextSort = rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;

  return (
    <div className="pb-24">
      <button
        type="button"
        onClick={() => setEditing({ row: null })}
        className="mb-3 w-full rounded-xl bg-yellow-400 py-3 text-base font-black text-black active:scale-95"
      >
        + Nueva promo
      </button>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-white/60">Cargando...</p>}
      {!loading && rows.length === 0 && !error && (
        <p className="text-white/60">Todavía no hay promos. Crea la primera.</p>
      )}

      <div className="space-y-2">
        {rows.map(r => {
          const live = isPromoActiveNow(rowToPromo(r));
          return (
            <div key={r.id} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16161b] p-3 ${r.active ? '' : 'opacity-50'}`}>
              <button type="button" onClick={() => setEditing({ row: r })} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-bold text-white">{r.title}</p>
                <p className="text-xs font-black text-yellow-300">{describeDiscount(rowToPromo(r))}</p>
                <p className="text-[11px] text-white/50">{describeSchedule(rowToPromo(r))}</p>
                {live && <span className="mt-1 inline-block rounded-full bg-[#00C853]/15 px-2 py-0.5 text-[10px] font-black text-[#00C853]">VIGENTE HOY</span>}
              </button>
              <button
                type="button"
                onClick={() => toggleActive(r)}
                className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black uppercase ${r.active ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/15 text-red-400'}`}
              >
                {r.active ? 'Activa' : 'Apagada'}
              </button>
            </div>
          );
        })}
      </div>

      {editing && (
        <PromoEditor
          row={editing.row}
          nextSort={nextSort}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
