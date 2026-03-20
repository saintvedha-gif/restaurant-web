import { useEffect, useMemo, useState } from 'react';
import { addonGroups, formatPrice } from '../data/menuData';
import { useCart } from '../context/CartContext';
import type { Addon, AddonGroup, MenuItem } from '../types/menu';

interface Props {
  item: MenuItem;
  onBack: () => void;
}

const EXCLUDED_SALCHI_COUNT_IDS = new Set(['takis', 'extra-salsas', 'papita-casco']);

function getMaicitoMaxBySize(selectedAddons: Addon[]): number {
  const sizeId = selectedAddons.find(
    addon => addon.pricingMode === 'final' && addon.id.includes('pequeno')
  )?.id;
  if (sizeId) return 2;
  return 3;
}

function getEffectiveGroupLimits(itemId: string, group: AddonGroup, selectedAddons: Addon[]) {
  let minSelections = group.minSelections ?? 0;
  let maxSelections = group.maxSelections;
  let excludedFromCount = new Set<string>();
  const isAddonOptionsGroup = group.id === 'adicionales-salchi' || group.id === 'adicionales-maicito';

  if (isAddonOptionsGroup && ['milenial', 'malandro', 'viene-la-paloma', 'quetzalcoatl', 'negrita'].includes(itemId)) {
    maxSelections = getMaicitoMaxBySize(selectedAddons);
  }

  if (itemId === 'negrita' && isAddonOptionsGroup) {
    maxSelections = 2;
  }

  if (itemId === 'salchipapota' && group.id === 'adicionales-salchi') {
    minSelections = 4;
    excludedFromCount = EXCLUDED_SALCHI_COUNT_IDS;
  }

  return { minSelections, maxSelections, excludedFromCount };
}

function countSelectedInGroup(
  selectedAddons: Addon[],
  groupAddonIds: string[],
  excludedFromCount: Set<string>
) {
  return selectedAddons.filter(
    addon => groupAddonIds.includes(addon.id) && !excludedFromCount.has(addon.id)
  ).length;
}

export default function ProductDetailPage({ item, onBack }: Props) {
  const { addItem } = useCart();
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [added, setAdded] = useState(false);
  const [validationError, setValidationError] = useState('');

  const relevantGroups: AddonGroup[] = useMemo(
    () => (item.addons
      ? item.addons.map(id => addonGroups.find(g => g.id === id)).filter(Boolean) as AddonGroup[]
      : []),
    [item.addons]
  );

  const defaultSelections = useMemo(
    () => relevantGroups.flatMap(group => {
      const minSelections = group.minSelections ?? 0;
      if (minSelections === 0) return [];

      // For groups with final-price options, default to the option matching listed price.
      if (group.addons.some(addon => addon.pricingMode === 'final')) {
        const matchingSize = group.addons.find(addon => addon.price === item.price);
        if (matchingSize) return [matchingSize];
      }

      return group.addons.slice(0, minSelections);
    }),
    [item.price, relevantGroups]
  );

  useEffect(() => {
    setSelectedAddons(defaultSelections);
    setValidationError('');
    setAdded(false);
  }, [defaultSelections, item.id]);

  const finalPriceAddonIds = useMemo(
    () => relevantGroups
      .flatMap(group => group.addons)
      .filter(addon => addon.pricingMode === 'final')
      .map(addon => addon.id),
    [relevantGroups]
  );

  const selectedSize = selectedAddons.find(addon => finalPriceAddonIds.includes(addon.id));
  const nonSizeAddonsTotal = selectedAddons
    .filter(addon => !finalPriceAddonIds.includes(addon.id))
    .reduce((s, a) => s + a.price, 0);

  const salchiperCountableAdds = useMemo(() => {
    if (item.id !== 'salchiper') return 0;

    const salchiGroup = relevantGroups.find(group => group.id === 'adicionales-salchi');
    if (!salchiGroup) return 0;

    const groupAddonIds = salchiGroup.addons.map(addon => addon.id);
    return countSelectedInGroup(selectedAddons, groupAddonIds, EXCLUDED_SALCHI_COUNT_IDS);
  }, [item.id, relevantGroups, selectedAddons]);

  const basePrice = selectedSize ? selectedSize.price : item.price;
  const totalPrice = basePrice + nonSizeAddonsTotal;

  function toggleAddon(addon: Addon, group: AddonGroup) {
    setValidationError('');
    const { minSelections, maxSelections, excludedFromCount } = getEffectiveGroupLimits(item.id, group, selectedAddons);
    const groupAddonIds = group.addons.map(a => a.id);
    const isSelected = selectedAddons.some(a => a.id === addon.id);
    const currentGroupCount = countSelectedInGroup(selectedAddons, groupAddonIds, excludedFromCount);

    if (isSelected) {
      if (!excludedFromCount.has(addon.id) && currentGroupCount <= minSelections) return;
      setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
      return;
    }

    if (maxSelections === 1) {
      setSelectedAddons(prev => [
        ...prev.filter(a => !groupAddonIds.includes(a.id)),
        addon,
      ]);
      return;
    }

    if (!excludedFromCount.has(addon.id) && currentGroupCount >= maxSelections) return;
    setSelectedAddons(prev => [...prev, addon]);
  }

  function handleAdd() {
    const missingGroup = relevantGroups.find(group => {
      const { minSelections, excludedFromCount } = getEffectiveGroupLimits(item.id, group, selectedAddons);
      if (minSelections === 0) return false;
      const groupIds = group.addons.map(a => a.id);
      const selectedCount = countSelectedInGroup(selectedAddons, groupIds, excludedFromCount);
      return selectedCount < minSelections;
    });

    const exceededGroup = relevantGroups.find(group => {
      const { maxSelections, excludedFromCount } = getEffectiveGroupLimits(item.id, group, selectedAddons);
      if (maxSelections <= 0) return false;
      const groupIds = group.addons.map(a => a.id);
      const selectedCount = countSelectedInGroup(selectedAddons, groupIds, excludedFromCount);
      return selectedCount > maxSelections;
    });

    if (missingGroup) {
      setValidationError(`Debes elegir ${missingGroup.name.toLowerCase()} para continuar.`);
      return;
    }

    if (exceededGroup) {
      setValidationError(`Superaste el máximo permitido en ${exceededGroup.name.toLowerCase()}.`);
      return;
    }

    addItem(item, selectedAddons);
    setSelectedAddons(defaultSelections);
    setValidationError('');
    setAdded(true);
    setTimeout(() => setAdded(false), 700);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#8a6637_0%,#a0743d_100%)] pb-36 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-[#d1b07a] bg-[#7b5a34] shadow-[0_10px_24px_rgba(48,30,12,0.28)]">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#dcb983] bg-[#8a673d] px-4 py-2 text-sm font-bold text-zinc-100 hover:border-yellow-400 hover:text-yellow-300"
          >
            <span>←</span>
            <span>Volver al menu</span>
          </button>
          <p className="hidden text-sm font-bold uppercase tracking-[0.18em] text-yellow-300 sm:block">Detalle del producto</p>
        </div>
      </header>

      <main className="section-shell py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          <section className="paper-panel overflow-hidden lg:sticky lg:top-28">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="h-[280px] w-full object-cover sm:h-[340px] lg:h-[420px]"
                loading="lazy"
                decoding="async"
              />
            )}
          </section>

          <section className="paper-panel flex min-h-[500px] flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <h1 className="font-display text-4xl leading-tight text-zinc-100 sm:text-5xl">
                {item.name} {item.emoji}
              </h1>
              <p className="mt-3 text-base leading-8 text-zinc-300">{item.description}</p>

              <div className="mt-5 rounded-2xl border border-[#d1b07a] bg-[#8a673d] px-5 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-yellow-300">Precio base</p>
                <p className="mt-1 text-4xl font-black text-yellow-300">{formatPrice(item.price)}</p>
              </div>

              {relevantGroups.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-100">Adicionales</h2>
                  <p className="mt-1 text-xs text-zinc-400">Selecciona los que quieras y revisa el precio de cada uno.</p>
                </div>
              )}

              {relevantGroups.map(group => (
                <div key={group.id} className="mt-5">
                  {(() => {
                    const { minSelections, maxSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);

                    return (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-100">{group.name}</h3>
                    <span className="text-xs text-zinc-400">
                      {minSelections > 0
                        ? `Mínimo ${minSelections} opción(es) · Máximo ${maxSelections}`
                        : `Máximo ${maxSelections}`}
                    </span>
                  </div>
                    );
                  })()}

                  {item.id === 'salchipapota' && group.id === 'adicionales-salchi' && (
                    <p className="mt-2 text-[11px] text-zinc-400">
                      Para el mínimo de 4 no cuentan: Takis, Extra-salsas ni Base de papita casco.
                    </p>
                  )}

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      const groupAddons = group.addons.map(a => a.id);
                      const { maxSelections, excludedFromCount } = getEffectiveGroupLimits(item.id, group, selectedAddons);
                      const currentGroupCount = countSelectedInGroup(selectedAddons, groupAddons, excludedFromCount);
                      const disabled = maxSelections === 1 
                        ? false 
                        : !isSelected && !excludedFromCount.has(addon.id) && currentGroupCount >= maxSelections;
                      const isFinalPriceOption = addon.pricingMode === 'final';

                      return (
                        <button
                          key={addon.id}
                          onClick={() => !disabled && toggleAddon(addon, group)}
                          disabled={disabled}
                          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                            isSelected
                              ? 'border-yellow-400/70 bg-yellow-400/10'
                              : disabled
                                  ? 'cursor-not-allowed border-[#d1b07a] bg-[#8a673d] opacity-40'
                                  : 'border-[#d1b07a] bg-[#7b5a34] hover:bg-[#8a673d]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-snug text-zinc-200">{addon.emoji} {addon.name}</p>
                            </div>
                            <span className="shrink-0 text-sm font-black text-yellow-300">{isFinalPriceOption ? formatPrice(addon.price) : `+ ${formatPrice(addon.price)}`}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {item.id === 'salchiper' && salchiperCountableAdds >= 6 && (
                <div className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  ✅ Desde 6 adicionales te lo enviamos en envase más grande.
                </div>
              )}
            </div>

            <div className="border-t border-[#d1b07a] bg-[#7b5a34] px-5 py-4 sm:px-7">
              {validationError && <p className="mb-2 text-center text-xs font-semibold text-red-600">{validationError}</p>}
              <button
                onClick={handleAdd}
                className={`w-full rounded-2xl py-4 text-lg font-black transition-all ${
                  added
                    ? 'scale-95 bg-zinc-700 text-white'
                    : 'bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95'
                }`}
              >
                {added ? '✓ Agregado al pedido' : `Agregar al pedido · ${formatPrice(totalPrice)}`}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
