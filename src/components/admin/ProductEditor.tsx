import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { categories } from '../../data/menuData';
import type { AddonGroup } from '../../types/menu';
import type { MenuRow } from '../../lib/menuRows';
import ImageUploader from './ImageUploader';
import EmojiPicker from './EmojiPicker';

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
  useBodyScrollLock(true);
  const [name, setName] = useState(row?.name ?? '');
  const [description, setDescription] = useState(row?.description ?? '');
  const [price, setPrice] = useState(row ? String(row.price) : '');
  const [emoji, setEmoji] = useState(row?.emoji ?? '🌽');
  const [image, setImage] = useState(row?.image ?? '');
  const [categoryId, setCategoryId] = useState(row?.category_id ?? categories[0]?.id ?? '');
  const [popular, setPopular] = useState(row?.tags?.includes('popular') ?? false);
  const [available, setAvailable] = useState(row?.available ?? true);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [selectedAddonGroups, setSelectedAddonGroups] = useState<string[]>(row?.addons ?? []);
  const [addonGroupLimits, setAddonGroupLimits] = useState(row?.addon_group_limits ?? {});
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const visibleAddonGroups = useMemo(
    () => addonGroups
      .map(group => ({
        ...group,
        addons: group.addons.filter(addon => !addon.categoryId || addon.categoryId === categoryId),
      }))
      .filter(group => group.addons.length > 0),
    [addonGroups, categoryId],
  );

  useEffect(() => {
    void apiFetch<AddonGroup[]>('/api/admin/addons')
      .then(setAddonGroups)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar adicionales.'))
      .finally(() => setGroupsLoading(false));
  }, []);

  async function handleSave() {
    const priceNum = Math.round(Number(price));
    if (name.trim().length < 2) return setError('Ponle un nombre al producto');
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError('El precio no es válido');
    if (!categoryId) return setError('Crea o activa una categoría antes de guardar productos');

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
      addons: selectedAddonGroups,
      addonGroupLimits: Object.fromEntries(
        Object.entries(addonGroupLimits).filter(([groupId]) => selectedAddonGroups.includes(groupId))
      ),
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
          <div className="flex gap-2">
            <input className={input} value={name} onChange={e => setName(e.target.value)} />
            <EmojiPicker compact separator=" " value={name} onChange={setName} />
          </div>
        </div>
        <div>
          <label className={label}>Descripción</label>
          <div className="flex items-start gap-2">
            <textarea className={input} rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            <div className="pt-1">
              <EmojiPicker compact separator=" " value={description} onChange={setDescription} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={label}>Precio (COP)</label>
            <input className={input} type="text" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value.replace(/[^\d]/g, ''))} placeholder="Ej. 25000" />
          </div>
          <div>
            <label className={label}>Emoji</label>
            <EmojiPicker value={emoji} onChange={setEmoji} maxLength={64} />
          </div>
        </div>
        <div>
          <label className={label}>Categoría</label>
          <select className={input} value={categoryId} onChange={e => {
            const nextCategory = e.target.value;
            setCategoryId(nextCategory);
            const allowedGroupIds = new Set(addonGroups
              .filter(group => group.addons.some(addon => !addon.categoryId || addon.categoryId === nextCategory))
              .map(group => group.id));
            setSelectedAddonGroups(current => current.filter(groupId => allowedGroupIds.has(groupId)));
          }}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div>
            <p className={label}>Adicionales y tamaños de este producto</p>
            <p className="text-xs text-white/50">Selecciona los grupos que verá el cliente y ajusta sus límites para este producto.</p>
          </div>
          {groupsLoading && <p className="text-sm text-white/50">Cargando grupos...</p>}
          {!groupsLoading && addonGroups.length === 0 && <p className="text-sm text-white/50">No hay grupos creados todavía. Créelos desde “Adicionales y tamaños”.</p>}
          {visibleAddonGroups.map(group => {
            const selected = selectedAddonGroups.includes(group.id);
            const groupLimits = addonGroupLimits[group.id] ?? {};
            return (
              <div key={group.id} className={`rounded-xl border p-3 ${selected ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-white/10 bg-[#0c0c10]'}`}>
                <label className="flex items-start gap-3 text-sm text-white">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-yellow-400"
                    checked={selected}
                    onChange={event => setSelectedAddonGroups(current =>
                      event.target.checked
                        ? [...current, group.id]
                        : current.filter(id => id !== group.id)
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{group.name}{group.active === false ? ' (inactivo)' : ''}</span>
                    <span className="text-xs text-white/50">{group.addons.length} opciones · global {group.minSelections ?? 0}–{group.maxSelections}</span>
                  </span>
                </label>
                {selected && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pl-7">
                    <label className="text-xs text-white/60">Mínimo para este producto
                      <input
                        className={`${input} mt-1`}
                        type="number"
                        min="0"
                        max="30"
                        onWheel={event => event.currentTarget.blur()}
                        value={groupLimits.minSelections ?? group.minSelections ?? 0}
                        onChange={event => setAddonGroupLimits(current => ({
                          ...current,
                          [group.id]: { ...current[group.id], minSelections: Number(event.target.value) },
                        }))}
                      />
                    </label>
                    <label className="text-xs text-white/60">Máximo para este producto
                      <input
                        className={`${input} mt-1`}
                        type="number"
                        min="1"
                        max="30"
                        onWheel={event => event.currentTarget.blur()}
                        value={groupLimits.maxSelections ?? group.maxSelections}
                        onChange={event => setAddonGroupLimits(current => ({
                          ...current,
                          [group.id]: { ...current[group.id], maxSelections: Number(event.target.value) },
                        }))}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
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
