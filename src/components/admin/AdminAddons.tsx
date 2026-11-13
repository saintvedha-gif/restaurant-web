import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../../lib/api';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { applyAddonGroups } from '../../lib/loadAddonGroups';
import type { Addon, AddonGroup } from '../../types/menu';
import type { AdminCategory } from '../../lib/loadCategories';
import EmojiPicker from './EmojiPicker';

type AdminAddonGroup = Omit<AddonGroup, 'addons'> & { addons: AdminAddon[]; active: boolean; sortOrder: number };
type AdminAddon = Addon & { active: boolean; sortOrder: number };

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';

export default function AdminAddons({ onClose }: { onClose?: () => void }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [groups, setGroups] = useState<AdminAddonGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [groupFormId, setGroupFormId] = useState<string | null>(null);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubtitle, setGroupSubtitle] = useState('');
  const [groupMin, setGroupMin] = useState('0');
  const [groupMax, setGroupMax] = useState('1');
  const [optionFormId, setOptionFormId] = useState<string | null>(null);
  const [optionFormOpen, setOptionFormOpen] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionEmoji, setOptionEmoji] = useState('');
  const [optionDescription, setOptionDescription] = useState('');
  const [optionCategoryId, setOptionCategoryId] = useState('');
  const [optionPrice, setOptionPrice] = useState('0');
  const [optionPricingMode, setOptionPricingMode] = useState<'additive' | 'final'>('additive');
  const [optionMinAdds, setOptionMinAdds] = useState('');
  const [optionMaxAdds, setOptionMaxAdds] = useState('');
  const [optionActive, setOptionActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useBodyScrollLock(Boolean(onClose) || optionFormOpen);

  const load = useCallback(async () => {
    try {
      const result = await apiFetch<AdminAddonGroup[]>('/api/admin/addons');
      setGroups(result);
      applyAddonGroups(result);
      setSelectedGroupId(current => result.some(group => group.id === current) ? current : result[0]?.id ?? '');
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar adicionales y tamaños.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void apiFetch<AdminCategory[]>('/api/admin/categories')
      .then(setCategories)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las categorías.'));
  }, []);

  const selectedGroup = groups.find(group => group.id === selectedGroupId);
  const visibleAddons = selectedGroup?.addons.filter(option =>
    !filterCategoryId || !option.categoryId || option.categoryId === filterCategoryId
  ) ?? [];

  function resetGroupForm() {
    setGroupFormOpen(false);
    setGroupFormId(null);
    setGroupName('');
    setGroupSubtitle('');
    setGroupMin('0');
    setGroupMax('1');
  }

  function editGroup(group: AdminAddonGroup) {
    setGroupFormOpen(true);
    setGroupFormId(group.id);
    setGroupName(group.name);
    setGroupSubtitle(group.subtitle);
    setGroupMin(String(group.minSelections ?? 0));
    setGroupMax(String(group.maxSelections));
  }

  async function saveGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minSelections = Number(groupMin);
    const maxSelections = Number(groupMax);
    if (minSelections > maxSelections) {
      setError('El mínimo del grupo no puede superar el máximo.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = { name: groupName.trim(), subtitle: groupSubtitle.trim(), minSelections, maxSelections };
      if (groupFormId) {
        await apiFetch(`/api/admin/addons/groups/${groupFormId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const created = await apiFetch<AdminAddonGroup>('/api/admin/addons/groups', { method: 'POST', body: JSON.stringify(payload) });
        setSelectedGroupId(created.id);
      }
      resetGroupForm();
      await load();
      setNotice('Grupo guardado.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el grupo.');
    } finally {
      setSaving(false);
    }
  }

  function resetOptionForm() {
    setOptionFormOpen(false);
    setOptionFormId(null);
    setOptionName('');
    setOptionEmoji('');
    setOptionDescription('');
    setOptionCategoryId('');
    setOptionPrice('0');
    setOptionPricingMode('additive');
    setOptionMinAdds('');
    setOptionMaxAdds('');
    setOptionActive(true);
  }

  function editOption(option: AdminAddon) {
    setOptionFormOpen(true);
    setOptionFormId(option.id);
    setOptionName(option.name);
    setOptionEmoji(option.emoji);
    setOptionDescription(option.description ?? '');
    setOptionCategoryId(option.categoryId ?? '');
    setOptionPrice(String(option.price));
    setOptionPricingMode(option.pricingMode ?? 'additive');
    setOptionMinAdds(option.minAdds == null ? '' : String(option.minAdds));
    setOptionMaxAdds(option.maxAdds == null ? '' : String(option.maxAdds));
    setOptionActive(option.active);
  }

  async function saveOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedGroup) return;
    const minAdds = optionMinAdds ? Number(optionMinAdds) : null;
    const maxAdds = optionMaxAdds ? Number(optionMaxAdds) : null;
    if (minAdds !== null && maxAdds !== null && minAdds > maxAdds) {
      setError('El mínimo por pedido no puede superar el máximo.');
      return;
    }
    if (optionPricingMode === 'final' && ((minAdds !== null && minAdds > 1) || (maxAdds !== null && maxAdds > 1))) {
      setError('Los tamaños de precio final solo se pueden seleccionar una vez.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        name: optionName.trim(),
        description: optionDescription.trim(),
        emoji: optionEmoji.trim(),
        categoryId: optionCategoryId || null,
        price: Number(optionPrice),
        pricingMode: optionPricingMode,
        minAdds,
        maxAdds,
        active: optionActive,
      };
      if (optionFormId) {
        await apiFetch(`/api/admin/addons/groups/${selectedGroup.id}/options/${optionFormId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/api/admin/addons/groups/${selectedGroup.id}/options`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      resetOptionForm();
      await load();
      setNotice('Adicional o tamaño guardado.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el adicional.');
    } finally {
      setSaving(false);
    }
  }

  async function sendAction(path: string, method: 'PATCH' | 'DELETE', body?: object, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiFetch(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo completar la acción.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 pb-24 pt-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="title-pixel text-xl text-white">Adicionales y tamaños</h1>
            <p className="mt-2 text-sm text-white/55">Crea grupos, define precios y límites, pausa opciones y ordénalas.</p>
          </div>
          {onClose && <button type="button" onClick={onClose} aria-label="Cerrar administración de adicionales" className="h-9 w-9 shrink-0 rounded-full bg-[#1a1a21] text-white">✕</button>}
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300" role="alert">{error}</p>}
      {notice && <p className="rounded-xl border border-[#00C853]/20 bg-[#00C853]/10 p-3 text-sm text-[#00C853]" role="status">{notice}</p>}

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#141419] p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-black text-white">Grupos de opciones</h2>
          <button type="button" onClick={() => { setSelectedGroupId(''); setGroupFormOpen(true); setGroupFormId(null); setGroupName(''); setGroupSubtitle(''); setGroupMin('0'); setGroupMax('1'); }} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black">
            + Nuevo grupo
          </button>
        </div>
        {loading ? <p className="text-sm text-white/50">Cargando...</p> : (
          <div className="space-y-2">
            {groups.map((group, index) => (
              <article key={group.id} className={`rounded-xl border p-3 ${selectedGroupId === group.id ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-white/10 bg-[#0e0e12]'} ${group.active ? '' : 'opacity-55'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => { setSelectedGroupId(group.id); resetOptionForm(); }} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-bold text-white">{group.name}</span>
                    <span className="text-xs text-white/45">Mín. {group.minSelections ?? 0} · Máx. {group.maxSelections} · {group.addons.length} opciones</span>
                  </button>
                  <button type="button" disabled={saving || index === 0} onClick={() => void sendAction(`/api/admin/addons/groups/${group.id}/order`, 'PATCH', { direction: 'up' })} aria-label={`Subir ${group.name}`} className="h-8 w-8 rounded-lg border border-white/10 text-white disabled:opacity-30">↑</button>
                  <button type="button" disabled={saving || index === groups.length - 1} onClick={() => void sendAction(`/api/admin/addons/groups/${group.id}/order`, 'PATCH', { direction: 'down' })} aria-label={`Bajar ${group.name}`} className="h-8 w-8 rounded-lg border border-white/10 text-white disabled:opacity-30">↓</button>
                  <button type="button" disabled={saving} onClick={() => editGroup(group)} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-white/70">Editar</button>
                  <button type="button" disabled={saving} onClick={() => void sendAction(`/api/admin/addons/groups/${group.id}/active`, 'PATCH', { active: !group.active })} className={`rounded-lg px-2 py-2 text-xs font-bold ${group.active ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/15 text-red-400'}`}>{group.active ? 'Activo' : 'Inactivo'}</button>
                  <button type="button" disabled={saving} onClick={() => void sendAction(`/api/admin/addons/groups/${group.id}`, 'DELETE', undefined, `¿Eliminar el grupo ${group.name}? Debes quitarlo primero de los productos que lo usan.`)} className="px-1 text-xs text-red-400">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {groupFormOpen && (
          <form onSubmit={saveGroup} className="grid gap-2 rounded-xl border border-yellow-400/20 bg-[#0e0e12] p-3 sm:grid-cols-2">
            <div className="flex gap-2">
              <input className={fieldClass} value={groupName} onChange={event => setGroupName(event.target.value)} placeholder="Nombre del grupo" minLength={2} maxLength={120} required />
              <EmojiPicker compact separator=" " value={groupName} onChange={setGroupName} maxLength={120} />
            </div>
            <div className="flex gap-2">
              <input className={fieldClass} value={groupSubtitle} onChange={event => setGroupSubtitle(event.target.value)} placeholder="Instrucción opcional" maxLength={255} />
              <EmojiPicker compact separator=" " value={groupSubtitle} onChange={setGroupSubtitle} maxLength={255} />
            </div>
            <label className="text-xs text-white/60">Mínimo de selecciones
              <input className={`${fieldClass} mt-1`} type="number" min="0" max="30" value={groupMin} onChange={event => setGroupMin(event.target.value)} onWheel={event => event.currentTarget.blur()} required />
            </label>
            <label className="text-xs text-white/60">Máximo de selecciones
              <input className={`${fieldClass} mt-1`} type="number" min="1" max="30" value={groupMax} onChange={event => setGroupMax(event.target.value)} onWheel={event => event.currentTarget.blur()} required />
            </label>
            <button type="submit" disabled={saving} className="rounded-xl bg-yellow-400 py-3 text-sm font-black text-black disabled:opacity-50">{saving ? 'Guardando...' : groupFormId ? 'Guardar grupo' : 'Crear grupo'}</button>
            <button type="button" onClick={resetGroupForm} className="rounded-xl border border-white/10 py-3 text-sm text-white/70">Cancelar</button>
          </form>
        )}
      </section>

      {selectedGroup && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-[#141419] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-black text-white">{selectedGroup.name}</h2>
              <p className="mt-1 text-xs text-white/50">Precio final reemplaza el precio base; precio adicional se suma.</p>
            </div>
            <button type="button" onClick={() => { resetOptionForm(); setOptionFormOpen(true); }} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-black text-black">+ Agregar opción</button>
          </div>

          <label className="block text-xs font-bold text-white/65">
            Filtrar por categoría del menú
            <select className={`${fieldClass} mt-1`} value={filterCategoryId} onChange={event => setFilterCategoryId(event.target.value)}>
              <option value="">Todas</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.emoji} {category.name}{category.active ? '' : ' (inactiva)'}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            {visibleAddons.map(option => {
              const index = selectedGroup.addons.findIndex(addon => addon.id === option.id);
              const categoryName = categories.find(category => category.id === option.categoryId)?.name;
              return (
              <article key={`${selectedGroup.id}-${option.id}`} className={`flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#0e0e12] p-3 ${option.active ? '' : 'opacity-50'}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{option.emoji} {option.name}</p>
                  {option.description && <p className="mt-1 text-xs text-white/55">{option.description}</p>}
                  <p className="text-xs text-white/50">
                    {Number(option.price).toLocaleString('es-CO')} COP · {option.pricingMode === 'final' ? 'Precio final' : 'Adicional'}
                    {categoryName ? ` · ${categoryName}` : ' · Todas las categorías'}
                    {option.minAdds ? ` · Mín. ${option.minAdds}` : ''}
                    {option.maxAdds ? ` · Máx. ${option.maxAdds}` : ''}
                  </p>
                </div>
                <button type="button" disabled={saving || index === 0} onClick={() => void sendAction(`/api/admin/addons/groups/${selectedGroup.id}/options/${option.id}/order`, 'PATCH', { direction: 'up' })} aria-label={`Subir ${option.name}`} className="h-8 w-8 rounded-lg border border-white/10 text-white disabled:opacity-30">↑</button>
                <button type="button" disabled={saving || index === selectedGroup.addons.length - 1} onClick={() => void sendAction(`/api/admin/addons/groups/${selectedGroup.id}/options/${option.id}/order`, 'PATCH', { direction: 'down' })} aria-label={`Bajar ${option.name}`} className="h-8 w-8 rounded-lg border border-white/10 text-white disabled:opacity-30">↓</button>
                <button type="button" disabled={saving} onClick={() => editOption(option)} className="rounded-lg border border-white/10 px-2 py-2 text-xs text-white/70">Editar</button>
                <button type="button" disabled={saving} onClick={() => void sendAction(`/api/admin/addons/groups/${selectedGroup.id}/options/${option.id}/active`, 'PATCH', { active: !option.active })} className={`rounded-lg px-2 py-2 text-xs font-bold ${option.active ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/15 text-red-400'}`}>{option.active ? 'Activa' : 'Inactiva'}</button>
                <button type="button" disabled={saving} onClick={() => void sendAction(`/api/admin/addons/groups/${selectedGroup.id}/options/${option.id}`, 'DELETE', undefined, `¿Eliminar ${option.name} del grupo?`)} className="px-1 text-xs text-red-400">Eliminar</button>
              </article>
            )})}
            {visibleAddons.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-sm text-white/55">No hay adicionales asignados a esta categoría.</p>}
          </div>
        </section>
      )}

      {optionFormOpen && selectedGroup && (
        <div className="fixed inset-0 z-[10020] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={saveOption}
            role="dialog"
            aria-modal="true"
            aria-labelledby="addon-option-title"
            className="max-h-[94vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#1a1a1f] p-5 text-white sm:rounded-[28px]"
          >
            <div className="flex items-center justify-between">
              <h2 id="addon-option-title" className="text-lg font-bold">{optionFormId ? 'Editar adicional' : 'Nuevo adicional'}</h2>
              <button type="button" onClick={resetOptionForm} aria-label="Cerrar" className="h-9 w-9 rounded-full bg-[#0c0c10] text-white">✕</button>
            </div>

            <label className="block text-xs font-bold">
              Nombre
              <div className="mt-1 grid grid-cols-[1fr_52px] gap-2">
                <input className={fieldClass} value={optionName} onChange={event => setOptionName(event.target.value)} placeholder="Nombre del adicional" minLength={1} maxLength={120} required />
                <EmojiPicker compact separator=" " value={optionName} onChange={value => { setOptionName(value); setOptionEmoji(''); }} maxLength={120} />
              </div>
            </label>

            <label className="block text-xs font-bold">
              Categoría
              <select className={`${fieldClass} mt-1`} value={optionCategoryId} onChange={event => setOptionCategoryId(event.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.emoji} {category.name}{category.active ? '' : ' (inactiva)'}</option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold">
              Precio (COP)
              <input className={`${fieldClass} mt-1`} type="text" inputMode="numeric" value={optionPrice} onChange={event => setOptionPrice(event.target.value.replace(/[^\d]/g, ''))} placeholder="Ej. 8000" required />
            </label>

            <label className="block text-xs font-bold">
              Descripción (opcional)
              <div className="mt-1 flex items-start gap-2">
                <textarea className={fieldClass} rows={3} value={optionDescription} onChange={event => setOptionDescription(event.target.value)} maxLength={255} />
                <div className="pt-1">
                  <EmojiPicker compact separator=" " value={optionDescription} onChange={setOptionDescription} maxLength={255} />
                </div>
              </div>
            </label>

            <label className="block text-xs font-bold">
              Tipo de precio
              <select className={`${fieldClass} mt-1`} value={optionPricingMode} onChange={event => setOptionPricingMode(event.target.value as 'additive' | 'final')}>
                <option value="additive">Se suma al producto</option>
                <option value="final">Reemplaza el precio del producto</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold">
                Mínimo por pedido
                <input className={`${fieldClass} mt-1`} type="number" min="1" max="30" value={optionMinAdds} onChange={event => setOptionMinAdds(event.target.value)} onWheel={event => event.currentTarget.blur()} placeholder="Sin mínimo" />
              </label>
              <label className="text-xs font-bold">
                Máximo por pedido
                <input className={`${fieldClass} mt-1`} type="number" min="1" max="30" value={optionMaxAdds} onChange={event => setOptionMaxAdds(event.target.value)} onWheel={event => event.currentTarget.blur()} placeholder="Sin máximo" />
              </label>
            </div>
            <p className="-mt-2 text-[11px] leading-4 text-white/45">Si se indica un mínimo, al elegir este adicional se agregará esa cantidad. Déjalo vacío para no limitar.</p>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="h-4 w-4 accent-cyan-400" checked={optionActive} onChange={event => setOptionActive(event.target.checked)} />
              Adicional activo
            </label>

            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-cyan-400 py-3 text-sm font-black text-[#061116] disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={resetOptionForm} className="rounded-xl border border-white/10 py-3 text-sm font-bold text-white/80">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
