import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { categories } from '../../data/menuData';
import { makeId } from '../../lib/ids';
import type { PromoRow } from '../../lib/promoRows';
import type { PromoType } from '../../data/promos';
import ImageUploader from './ImageUploader';

interface Props {
  row: PromoRow | null;
  nextSort: number;
  onClose: () => void;
  onSaved: () => void;
}

type Scope = 'all' | 'categories' | 'products';
interface ProductOption {
  id: string;
  name: string;
}

const input =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';
const label = 'mb-1 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow-300';
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export default function PromoEditor({ row, nextSort, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(row?.title ?? '');
  const [subtitle, setSubtitle] = useState(row?.subtitle ?? '');
  const [badge, setBadge] = useState(row?.badge ?? 'PROMO');
  const [image, setImage] = useState(row?.image ?? '');
  const [active, setActive] = useState(row?.active ?? true);
  const [type, setType] = useState<PromoType>(row?.type ?? 'none');
  const [value, setValue] = useState(String(row?.value ?? 10));
  const [buyQty, setBuyQty] = useState(String(row?.buy_qty ?? 1));
  const [getQty, setGetQty] = useState(String(row?.get_qty ?? 2));
  const [scope, setScope] = useState<Scope>(
    row?.product_ids?.length ? 'products' : row?.category_ids?.length ? 'categories' : 'all'
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(row?.category_ids ?? []);
  const [productIds, setProductIds] = useState<string[]>(row?.product_ids ?? []);
  const [startDate, setStartDate] = useState(row?.start_date ?? '');
  const [endDate, setEndDate] = useState(row?.end_date ?? '');
  const [days, setDays] = useState<number[]>(row?.days ?? []);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<Array<{ id: string; name: string }>>('/api/admin/menu');
        setProducts((data ?? []).map(item => ({ id: item.id, name: item.name })));
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  async function handleSave() {
    if (title.trim().length < 2) return setError('Ponle un título a la promo');
    const v = Math.round(Number(value));
    const buy = Math.round(Number(buyQty));
    const get = Math.round(Number(getQty));
    if (type === 'percent' && (!(v >= 1) || v > 100)) return setError('El porcentaje debe ser de 1 a 100');
    if (type === 'amount' && !(v > 0)) return setError('Pon cuántos pesos se descuentan');
    if (type === 'take_pay' && (!(buy >= 1) || !(get > buy))) return setError('"Lleva" debe ser mayor que "paga"');
    if (type !== 'none' && scope === 'categories' && categoryIds.length === 0) return setError('Elige al menos una categoría');
    if (type !== 'none' && scope === 'products' && productIds.length === 0) return setError('Elige al menos un producto');
    if (startDate && endDate && endDate < startDate) return setError('La fecha final es antes que la inicial');

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim() || 'PROMO',
      image: image || undefined,
      link: '/menu',
      active,
      type,
      value: type === 'percent' || type === 'amount' ? v : 0,
      buyQty: type === 'take_pay' ? buy : 1,
      getQty: type === 'take_pay' ? get : 2,
      productIds: type !== 'none' && scope === 'products' ? productIds : [],
      categoryIds: type !== 'none' && scope === 'categories' ? categoryIds : [],
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      days: days.length === 7 ? [] : [...days].sort(),
    };

    setSaving(true);
    setError('');

    try {
      if (row) {
        await apiFetch(`/api/admin/promos/${row.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/promos', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            id: makeId(title),
            sortOrder: nextSort,
          }),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!row) return;
    if (!window.confirm(`¿Eliminar la promo "${row.title}"?`)) return;
    setSaving(true);

    try {
      await apiFetch(`/api/admin/promos/${row.id}`, { method: 'DELETE' });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  }

  const shownProducts = products.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const chip = (on: boolean) =>
    `rounded-full px-3 py-2 text-xs font-black ${on ? 'bg-yellow-400 text-black' : 'border border-white/10 bg-[#0c0c10] text-white/70'}`;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-[28px] border border-yellow-400/20 bg-[#101014] p-5">
        <div className="flex items-center justify-between">
          <h2 className="title-pixel text-lg text-white">{row ? 'Editar promo' : 'Nueva promo'}</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-[#1a1a21] text-white">✕</button>
        </div>

        <ImageUploader value={image} onChange={setImage} />

        <div>
          <label className={label}>Título</label>
          <input className={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Miércoles de promo" />
        </div>
        <div>
          <label className={label}>Texto corto (opcional)</label>
          <input className={input} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Si lo dejas vacío, se genera solo" />
        </div>
        <div>
          <label className={label}>Etiqueta</label>
          <input className={input} value={badge} onChange={e => setBadge(e.target.value)} placeholder="SOLO HOY" />
        </div>

        <div>
          <label className={label}>Tipo de promo</label>
          <select className={input} value={type} onChange={e => setType(e.target.value as PromoType)}>
            <option value="none">Solo anuncio (sin descuento automático)</option>
            <option value="percent">% de descuento</option>
            <option value="take_pay">Lleva más, paga menos (2x1, 3x2...)</option>
            <option value="amount">Descuento en pesos</option>
          </select>
        </div>

        {(type === 'percent' || type === 'amount') && (
          <div>
            <label className={label}>{type === 'percent' ? 'Porcentaje (%)' : 'Pesos a descontar'}</label>
            <input className={input} type="number" inputMode="numeric" value={value} onChange={e => setValue(e.target.value)} />
          </div>
        )}

        {type === 'take_pay' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Lleva</label>
              <input className={input} type="number" inputMode="numeric" value={getQty} onChange={e => setGetQty(e.target.value)} />
            </div>
            <div>
              <label className={label}>Paga</label>
              <input className={input} type="number" inputMode="numeric" value={buyQty} onChange={e => setBuyQty(e.target.value)} />
            </div>
            <p className="col-span-2 text-xs text-white/50">2x1 = lleva 2, paga 1. 3x2 = lleva 3, paga 2.</p>
          </div>
        )}

        {type !== 'none' && (
          <div className="space-y-2">
            <label className={label}>¿A qué aplica?</label>
            <select className={input} value={scope} onChange={e => setScope(e.target.value as Scope)}>
              <option value="all">Todo el pedido</option>
              <option value="categories">Categorías específicas</option>
              <option value="products">Productos específicos</option>
            </select>

            {scope === 'categories' && (
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => setCategoryIds(toggle(categoryIds, c.id))} className={chip(categoryIds.includes(c.id))}>
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            )}

            {scope === 'products' && (
              <div className="space-y-2">
                <input className={input} placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-[#0c0c10] p-2">
                  {shownProducts.map(p => (
                    <label key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-white">
                      <input type="checkbox" className="h-5 w-5" checked={productIds.includes(p.id)} onChange={() => setProductIds(toggle(productIds, p.id))} />
                      {p.name}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-white/50">{productIds.length} seleccionados</p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className={label}>Días de la semana (sin marcar = todos)</label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((d, i) => (
              <button key={d} type="button" onClick={() => setDays(toggle(days, i))} className={chip(days.includes(i))}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Desde</label>
            <input className={input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={label}>Hasta</label>
            <input className={input} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <p className="col-span-2 text-xs text-white/50">Si dejas las fechas vacías, la promo no vence nunca.</p>
        </div>

        <label className="flex items-center gap-3 text-sm text-white">
          <input type="checkbox" className="h-5 w-5" checked={active} onChange={e => setActive(e.target.checked)} />
          Promo activa
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-yellow-400 py-3 text-base font-black text-black disabled:opacity-50 active:scale-95"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        {row && (
          <button type="button" onClick={handleDelete} disabled={saving} className="w-full py-2 text-sm font-semibold text-red-400">
            Eliminar promo
          </button>
        )}
      </div>
    </div>
  );
}
