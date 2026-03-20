import { useEffect, useState } from 'react';
import type { MenuItem, AddonGroup, Addon } from '../types/menu';
import { addonGroups, formatPrice } from '../data/menuData';
import { useCart } from '../context/CartContext';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

export default function ProductModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [added, setAdded] = useState(false);
  const [validationError, setValidationError] = useState('');

  const relevantGroups: AddonGroup[] = item.addons
    ? item.addons.map(id => addonGroups.find(g => g.id === id)).filter(Boolean) as AddonGroup[]
    : [];

  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const totalPrice = item.price + addonsTotal;

  useEffect(() => {
    const defaults = relevantGroups.flatMap(group => {
      const minSelections = group.minSelections ?? 0;
      return minSelections > 0 ? group.addons.slice(0, minSelections) : [];
    });
    setSelectedAddons(defaults);
    setValidationError('');
    setAdded(false);
  }, [item.id]);

  function toggleAddon(addon: Addon, group: AddonGroup) {
    setValidationError('');
    const groupMax = group.maxSelections;
    const groupMin = group.minSelections ?? 0;
    const groupAddonIds = group.addons.map(a => a.id);
    const isSelected = selectedAddons.some(a => a.id === addon.id);
    const currentGroupCount = selectedAddons.filter(a => groupAddonIds.includes(a.id)).length;

    if (isSelected) {
      if (currentGroupCount <= groupMin) return;
      setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
    } else {
      if (groupMax === 1) {
        setSelectedAddons(prev => [
          ...prev.filter(a => !groupAddonIds.includes(a.id)),
          addon,
        ]);
        return;
      }
      if (currentGroupCount >= groupMax) return;
      setSelectedAddons(prev => [...prev, addon]);
    }
  }

  function handleAdd() {
    const missingGroup = relevantGroups.find(group => {
      const minSelections = group.minSelections ?? 0;
      if (minSelections === 0) return false;
      const groupIds = group.addons.map(a => a.id);
      const selectedCount = selectedAddons.filter(a => groupIds.includes(a.id)).length;
      return selectedCount < minSelections;
    });

    if (missingGroup) {
      setValidationError(`Debes elegir ${missingGroup.name.toLowerCase()} para continuar.`);
      return;
    }

    addItem(item, selectedAddons);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-wheat-50">
        <div className="grid h-full lg:grid-cols-[1.15fr_1fr]">
          <div className="relative h-64 shrink-0 bg-wheat-100 sm:h-80 lg:h-full">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-forest-700 backdrop-blur transition-colors hover:bg-white"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-col border-t border-mustard-100 lg:border-l lg:border-t-0">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              <h2 className="font-display text-4xl leading-tight text-stone-900 sm:text-5xl">
                {item.name} {item.emoji}
              </h2>
              <p className="mt-3 text-base leading-8 text-stone-600">{item.description}</p>
              <div className="mt-5 rounded-2xl border border-mustard-100 bg-white/80 px-5 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-mustard-700">Precio base</p>
                <p className="mt-1 text-4xl font-black text-forest-700">{formatPrice(item.price)}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Adicionales</h3>
                <p className="mt-1 text-xs text-stone-500">Selecciona los que quieras y verás el valor de cada uno.</p>
              </div>

              {relevantGroups.map(group => (
                <div key={group.id} className="mt-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">{group.name}</h3>
                    <span className="text-xs text-stone-500">{group.subtitle}</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      const groupAddons = group.addons.map(a => a.id);
                      const currentGroupCount = selectedAddons.filter(a => groupAddons.includes(a.id)).length;
                      const disabled = !isSelected && currentGroupCount >= group.maxSelections;
                      return (
                        <button
                          key={addon.id}
                          onClick={() => !disabled && toggleAddon(addon, group)}
                          disabled={disabled}
                          className={`rounded-2xl border px-4 py-4 transition-colors text-left ${
                            isSelected
                              ? 'border-olive-300 bg-olive-50'
                              : disabled
                                ? 'cursor-not-allowed border-mustard-100 bg-white opacity-40'
                                : 'border-mustard-100 bg-white hover:bg-wheat-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-olive-500 bg-olive-500' : 'border-stone-300'
                              }`}>
                                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                              </div>
                              <span className="text-sm font-semibold text-stone-800 leading-snug">
                                {addon.emoji} {addon.name}
                              </span>
                            </div>
                            <span className="shrink-0 text-sm font-black text-forest-700">
                              + {formatPrice(addon.price)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>

            <div className="shrink-0 border-t border-mustard-100 bg-wheat-50 px-6 py-4 sm:px-8">
              {validationError && (
                <p className="mb-2 text-center text-xs font-semibold text-red-600">{validationError}</p>
              )}
              {selectedAddons.length > 0 && (
                <p className="mb-2 text-center text-xs text-stone-500">
                  {selectedAddons.length} adicional(es) seleccionado(s)
                </p>
              )}
              <button
                onClick={handleAdd}
                disabled={added}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                  added
                    ? 'scale-95 bg-olive-500 text-white'
                    : 'bg-mustard-400 text-forest-700 hover:bg-mustard-300 active:scale-95'
                }`}
              >
                {added ? '✓ ¡Agregado!' : `Agregar · ${formatPrice(totalPrice)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
