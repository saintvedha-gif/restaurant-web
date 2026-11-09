import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { categories } from '../../data/menuData';
import type { MenuRow } from '../../lib/menuRows';
import ImageUploader from './ImageUploader';

interface Props {
  row: MenuRow | null;
  nextSort: number;
  onClose: () => void;
  onSaved: () => void;
}

const input =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';
const label = 'mb-1 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow-300';

function makeId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'producto'}-${Date.now().toString(36)}`;
}

export default function ProductEditor({ row, nextSort, onClose, onSaved }: Props) {
  const [name, setName] = useState(row?.name ?? '');
  const [description, setDescription] = useState(row?.description ?? '');
  const [price, setPrice] = useState(row ? String(row.price) : '');
  const [emoji, setEmoji] = useState(row?.emoji ?? '🌽');
  const [image, setImage] = useState(row?.image ?? '');
  const [categoryId, setCategoryId] = useState(row?.category_id ?? categories[0].id);
  const [popular, setPopular] = useState(row?.tags?.includes('popular') ?? false);
  const [available, setAvailable] = useState(row?.available ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const priceNum = Math.round(Number(price));
    if (name.trim().length < 2) return setError('Ponle un nombre al producto');
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError('El precio no es válido');

    const tags = new Set(row?.tags ?? []);
    if (popular) tags.add('popular');
    else tags.delete('popular');

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      emoji: emoji.trim() || '🌽',
      image: image || undefined,
      categoryId,
      tags: Array.from(tags),
      available,
    };

    setSaving(true);
    setError('');

    try {
      if (row) {
        await apiFetch(`/api/admin/menu/${row.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/admin/menu', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            id: makeId(name),
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
    if (!window.confirm(`¿Eliminar "${row.name}" para siempre?`)) return;
    setSaving(true);

    try {
      await apiFetch(`/api/admin/menu/${row.id}`, { method: 'DELETE' });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-[28px] border border-yellow-400/20 bg-[#101014] p-5">
        <div className="flex items-center justify-between">
          <h2 className="title-pixel text-lg text-white">{row ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-[#1a1a21] text-white">✕</button>
        </div>

        <ImageUploader value={image} onChange={setImage} />

        <div>
          <label className={label}>Nombre</label>
          <input className={input} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className={label}>Descripción</label>
          <textarea className={input} rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={label}>Precio (COP)</label>
            <input className={input} type="number" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label className={label}>Emoji</label>
            <input className={input} value={emoji} onChange={e => setEmoji(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={label}>Categoría</label>
          <select className={input} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm text-white">
          <input type="checkbox" className="h-5 w-5" checked={available} onChange={e => setAvailable(e.target.checked)} />
          Disponible (si lo desmarcas, se oculta del menú)
        </label>
        <label className="flex items-center gap-3 text-sm text-white">
          <input type="checkbox" className="h-5 w-5" checked={popular} onChange={e => setPopular(e.target.checked)} />
          Mostrarlo en "Nuestros Top" de la página principal
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
            Eliminar producto
          </button>
        )}
      </div>
    </div>
  );
}
