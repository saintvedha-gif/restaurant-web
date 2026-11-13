import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { categories, formatPrice, getSizedImageUrl } from '../../data/menuData';
import AdminCategories from './AdminCategories';
import AdminAddons from './AdminAddons';
import type { MenuRow } from '../../lib/menuRows';
import ProductEditor from './ProductEditor';

interface Props {
  onLogout: () => void;
}

type Editing = { row: MenuRow | null } | null;

export default function AdminProducts({ onLogout }: Props) {
  const [rows, setRows] = useState<MenuRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('todas');
  const [editing, setEditing] = useState<Editing>(null);
  const [manageCategories, setManageCategories] = useState(false);
  const [manageAddons, setManageAddons] = useState(false);
  const [, setCategoryVersion] = useState(0);

  const mapRows = (items: Array<{ id: string; name: string; description: string; price: number; emoji: string; image?: string; imageHero?: string; categoryId: string; addons?: string[]; addonGroupLimits?: Record<string, { minSelections?: number; maxSelections?: number }>; tags?: string[]; maxSelections?: number; available?: boolean; sortOrder?: number; }> = []): MenuRow[] =>
    items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      emoji: item.emoji,
      image: item.image ?? null,
      image_hero: item.imageHero ?? null,
      category_id: item.categoryId,
      addons: item.addons ?? [],
      addon_group_limits: item.addonGroupLimits,
      tags: item.tags ?? [],
      max_selections: item.maxSelections ?? null,
      available: Boolean(item.available),
      sort_order: item.sortOrder ?? 0,
    }));

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Array<{ id: string; name: string; description: string; price: number; emoji: string; image?: string; imageHero?: string; categoryId: string; addons?: string[]; addonGroupLimits?: Record<string, { minSelections?: number; maxSelections?: number }>; tags?: string[]; maxSelections?: number; available?: boolean; sortOrder?: number; }>>('/api/admin/menu');
      setRows(mapRows(data ?? []));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el menú');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      r => (cat === 'todas' || r.category_id === cat) && (!q || r.name.toLowerCase().includes(q))
    );
  }, [rows, search, cat]);

  async function toggleAvailable(row: MenuRow) {
    const next = !row.available;
    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, available: next } : r)));
    try {
      await apiFetch(`/api/admin/menu/${row.id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ available: next }),
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el producto');
      void load();
    }
  }

  const nextSort = rows.reduce((max, r) => Math.max(max, r.sort_order), 0) + 1;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="title-pixel text-xl text-white">Productos 🌽</h1>
        <button type="button" onClick={onLogout} className="text-xs font-semibold text-white/60 underline">Cerrar sesión</button>
      </div>

      <button
        type="button"
        onClick={() => setEditing({ row: null })}
        className="mb-3 w-full rounded-xl bg-yellow-400 py-3 text-base font-black text-black active:scale-95"
      >
        + Nuevo producto
      </button>
      <button
        type="button"
        onClick={() => setManageCategories(true)}
        className="mb-3 w-full rounded-xl border border-yellow-400/30 bg-yellow-400/10 py-3 text-sm font-bold text-yellow-200 active:scale-95"
      >
        Administrar categorías
      </button>
      <button
        type="button"
        onClick={() => setManageAddons(true)}
        className="mb-3 w-full rounded-xl border border-yellow-400/30 bg-yellow-400/10 py-3 text-sm font-bold text-yellow-200 active:scale-95"
      >
        Administrar adicionales y tamaños
      </button>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <input
          className="rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white"
          value={cat}
          onChange={e => setCat(e.target.value)}
        >
          <option value="todas">Todas</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {loading && <p className="text-white/60">Cargando...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-white/60">No hay productos. Crea uno desde el botón nuevo.</p>
      )}

      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16161b] p-3 ${r.available ? '' : 'opacity-50'}`}>
            <button type="button" onClick={() => setEditing({ row: r })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0c0c10]">
                {r.image ? <img src={getSizedImageUrl(r.image, 120)} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl">{r.emoji}</span>}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{r.name}</p>
                <p className="text-sm font-black text-yellow-300">{formatPrice(r.price)}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleAvailable(r)}
              className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black uppercase ${r.available ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/15 text-red-400'}`}
            >
              {r.available ? 'Disponible' : 'Agotado'}
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <ProductEditor
          row={editing.row}
          nextSort={nextSort}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
      {manageCategories && (
        <AdminCategories
          onClose={() => setManageCategories(false)}
          onChanged={() => setCategoryVersion(version => version + 1)}
        />
      )}
      {manageAddons && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto bg-[#08080b]">
          <AdminAddons onClose={() => setManageAddons(false)} />
        </div>
      )}
    </div>
  );
}
