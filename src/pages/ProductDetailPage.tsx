import { useEffect, useMemo, useState } from 'react';
import { addonGroups, formatPrice } from '../data/menuData';
import { useCart } from '../context/CartContext';
import type { Addon, AddonGroup, MenuItem } from '../types/menu';

interface Props {
  item: MenuItem;
  onBack: () => void;
}

const PRODUCT_ADDON_LIMITS: Record<string, Partial<Record<string, number>>> = {
  salchiper: { 'adicionales-salchi': 8 },
  salchipapita: { 'adicionales-salchi': 10 },
  salchipapota: { 'adicionales-salchi': 12 },
};

const MAICITO_SIZE_LIMITS: Record<string, number> = {
  'milenial-pequeno': 2,
  'maicito37-pequeno': 2,
  'milenial-mediano': 3,
  'maicito37-mediano': 3,
  'milenial-grande': 3,
  'maicito37-grande': 3,
};

// Límites específicos por addon individual para amorguesa-armable
const AMORGUESA_ARMABLE_ADDON_LIMITS: Record<string, number> = {
  'amor-tocino': 3,
  'amor-croqueta': 3,
  'amor-pepinillos': 3,
  'amor-cebolla': 2,
  'amor-philadelphia': 5, // sin límite específico, pero cuenta en total
};

const AMORGUESA_ARMABLE_QUESO_LIMITS: Record<string, number> = {
  'amor-queso-cheddar': 2,
  'amor-colbyjack': 2,
  'amor-mozzarella': 2,
  'amor-mix-quesos': 2,
};

const AMORGUESA_WITH_LIMITS_IDS = ['amorguesa-armable', 'amorguesa-clasica'] as const;
const MAICITO_SIZE_GROUP_IDS = ['tamano-milenial', 'tamano-maicito-37'] as const;

function isAmorguesaWithLimits(itemId: string) {
  return AMORGUESA_WITH_LIMITS_IDS.includes(itemId as typeof AMORGUESA_WITH_LIMITS_IDS[number]);
}

function isMaicitoSizeGroup(groupId: string) {
  return MAICITO_SIZE_GROUP_IDS.includes(groupId as typeof MAICITO_SIZE_GROUP_IDS[number]);
}

function getEffectiveGroupLimits(itemId: string, group: AddonGroup, selectedAddons: Addon[]) {
  if (group.id === 'adicionales-salchi') {
    if (itemId === 'negrita') {
      return {
        minSelections: group.minSelections ?? 0,
        maxSelections: 2,
      };
    }

    if (itemId === 'quetzalcoatl') {
      return {
        minSelections: group.minSelections ?? 0,
        maxSelections: 3,
      };
    }

    if (itemId === 'viene-la-paloma' || itemId === 'milenial' || itemId === 'malandro') {
      const selectedSize = selectedAddons.find(addon => addon.pricingMode === 'final');
      const sizeLimit = selectedSize ? MAICITO_SIZE_LIMITS[selectedSize.id] : undefined;

      if (sizeLimit) {
        return {
          minSelections: group.minSelections ?? 0,
          maxSelections: sizeLimit,
        };
      }
    }
  }

  // Para amorguesa-armable, el máximo total de adicionales es 5 y mínimo 0 (validación en handleAdd)
  if (isAmorguesaWithLimits(itemId) && group.id === 'adicionales-amorguesa') {
    return {
      minSelections: 0,
      maxSelections: 5,
    };
  }

  return {
    minSelections: group.minSelections ?? 0,
    maxSelections: PRODUCT_ADDON_LIMITS[itemId]?.[group.id] ?? group.maxSelections,
  };
}

function countSelectedInGroup(selectedAddons: Addon[], groupAddonIds: string[]) {
  return selectedAddons.filter(addon => groupAddonIds.includes(addon.id)).length;
}

function getAddonQuantity(selectedAddons: Addon[], addonId: string) {
  return selectedAddons.filter(addon => addon.id === addonId).length;
}

function getPerAddonLimit(itemId: string, groupId: string, addonId: string) {
  if (isAmorguesaWithLimits(itemId)) {
    if (groupId === 'adicionales-amorguesa') {
      return AMORGUESA_ARMABLE_ADDON_LIMITS[addonId];
    }

    if (groupId === 'quesos-amorguesa') {
      return AMORGUESA_ARMABLE_QUESO_LIMITS[addonId];
    }
  }

  return undefined;
}

function shouldHideGroupMeta(itemId: string, groupId: string) {
  return isAmorguesaWithLimits(itemId) && [
    'salsas-amorguesa',
    'quesos-amorguesa',
    'adicionales-amorguesa',
  ].includes(groupId);
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
      // For groups with final-price options, default to the option matching listed price.
      if (group.addons.some(addon => addon.pricingMode === 'final')) {
        const matchingSize = group.addons.find(addon => addon.price === item.price);
        if (matchingSize) return [matchingSize];
      }

      return [];
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
    return countSelectedInGroup(selectedAddons, groupAddonIds);
  }, [item.id, relevantGroups, selectedAddons]);

  const basePrice = selectedSize ? selectedSize.price : item.price;
  const totalPrice = basePrice + nonSizeAddonsTotal;

  function selectFinalAddon(addon: Addon, group: AddonGroup) {
    setValidationError('');
    const groupAddonIds = group.addons.map(groupAddon => groupAddon.id);
    setSelectedAddons(prev => [
      ...prev.filter(selectedAddon => !groupAddonIds.includes(selectedAddon.id)),
      addon,
    ]);
  }

  function selectSingleAddon(addon: Addon, group: AddonGroup) {
    setValidationError('');
    const groupAddonIds = group.addons.map(groupAddon => groupAddon.id);
    setSelectedAddons(prev => [
      ...prev.filter(selectedAddon => !groupAddonIds.includes(selectedAddon.id)),
      addon,
    ]);
  }

  function changeAddonQuantity(addon: Addon, group: AddonGroup, delta: 1 | -1) {
    setValidationError('');
    const { minSelections, maxSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);
    const groupAddonIds = group.addons.map(groupAddon => groupAddon.id);
    const currentGroupCount = countSelectedInGroup(selectedAddons, groupAddonIds);
    const currentAddonQuantity = getAddonQuantity(selectedAddons, addon.id);

    if (delta === 1) {
      // Validar límites específicos por addon para amorguesa-armable
      if (isAmorguesaWithLimits(item.id) && group.id === 'adicionales-amorguesa') {
        const addonLimit = AMORGUESA_ARMABLE_ADDON_LIMITS[addon.id];
        if (addonLimit && currentAddonQuantity >= addonLimit) {
          setValidationError(`Máximo ${addonLimit} de ${addon.name}.`);
          return;
        }
      }

      // Validar límites específicos por addon para quesos en amorguesa-armable
      if (isAmorguesaWithLimits(item.id) && group.id === 'quesos-amorguesa') {
        const quesoLimit = AMORGUESA_ARMABLE_QUESO_LIMITS[addon.id];
        if (quesoLimit && currentAddonQuantity >= quesoLimit) {
          setValidationError(`Máximo ${quesoLimit} de ${addon.name}.`);
          return;
        }
      }

      if (currentGroupCount >= maxSelections) {
        setValidationError(`Máximo ${maxSelections} adicional(es) en este grupo.`);
        return;
      }
      setSelectedAddons(prev => [...prev, addon]);
      return;
    }

    if (currentAddonQuantity === 0 || currentGroupCount <= minSelections) return;

    setSelectedAddons(prev => {
      const removeIndex = prev.findIndex(selectedAddon => selectedAddon.id === addon.id);
      if (removeIndex === -1) return prev;
      return prev.filter((_, index) => index !== removeIndex);
    });
  }

  function handleAdd() {
    const missingGroup = relevantGroups.find(group => {
      const { minSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);
      const groupIds = group.addons.map(a => a.id);
      const selectedCount = countSelectedInGroup(selectedAddons, groupIds);

      if (minSelections === 0) return false;
      return selectedCount < minSelections;
    });

    const exceededGroup = relevantGroups.find(group => {
      const { maxSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);
      if (maxSelections <= 0) return false;
      const groupIds = group.addons.map(a => a.id);
      const selectedCount = countSelectedInGroup(selectedAddons, groupIds);
      return selectedCount > maxSelections;
    });

    // Validar mínimo 1 adicional en amorguesa-armable (excluyendo salsas)
    let minAdicionalError = '';
    if (isAmorguesaWithLimits(item.id)) {
      const adicionalesGroup = relevantGroups.find(g => g.id === 'adicionales-amorguesa');
      if (adicionalesGroup) {
        const adicionalesIds = adicionalesGroup.addons.map(a => a.id);
        const selectedAdicionalesCount = countSelectedInGroup(selectedAddons, adicionalesIds);
        if (selectedAdicionalesCount === 0) {
          minAdicionalError = 'Debes elegir mínimo 1 adicional para la amorguesa.';
        }
      }
    }

    // Validar límites específicos por addon para amorguesa-armable
    let addonsGroupError = '';
    if (isAmorguesaWithLimits(item.id)) {
      const adicionales = selectedAddons.filter(a => a.id.startsWith('amor-') && !a.id.startsWith('amor-queso') && !a.id.startsWith('amor-salsa'));
      const quesos = selectedAddons.filter(a => a.id.startsWith('amor-queso'));

      // Validar límites en adicionales
      for (const [addonId, limit] of Object.entries(AMORGUESA_ARMABLE_ADDON_LIMITS)) {
        const count = adicionales.filter(a => a.id === addonId).length;
        if (count > limit) {
          const addon = adicionales.find(a => a.id === addonId);
          addonsGroupError = `Superaste el máximo de ${addon?.name || addonId}: máx ${limit}, seleccionaste ${count}.`;
          break;
        }
      }

      // Validar límites en quesos
      if (!addonsGroupError) {
        for (const [quesoId, limit] of Object.entries(AMORGUESA_ARMABLE_QUESO_LIMITS)) {
          const count = quesos.filter(a => a.id === quesoId).length;
          if (count > limit) {
            const queso = quesos.find(a => a.id === quesoId);
            addonsGroupError = `Superaste el máximo de ${queso?.name || quesoId}: máx ${limit}, seleccionaste ${count}.`;
            break;
          }
        }
      }
    }

    if (minAdicionalError) {
      setValidationError(minAdicionalError);
      return;
    }

    if (missingGroup) {
      setValidationError(`Debes elegir ${missingGroup.name.toLowerCase()} para continuar.`);
      return;
    }

    if (exceededGroup) {
      setValidationError(`Superaste el máximo permitido en ${exceededGroup.name.toLowerCase()}.`);
      return;
    }

    if (addonsGroupError) {
      setValidationError(addonsGroupError);
      return;
    }

    addItem(item, [...selectedAddons]);
    setSelectedAddons(defaultSelections);
    setValidationError('');
    setAdded(true);
    setTimeout(() => setAdded(false), 700);
  }

  return (
    <div className="theme-page min-h-screen bg-[linear-gradient(180deg,#050505_0%,#0c0c0f_100%)] pb-36 text-[#F5F5F5]">
      <header className="sticky top-0 z-30 border-b border-yellow-400/20 bg-[#101014] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <button
            onClick={onBack}
            className="btn-secondary-sm gap-2"
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
              <h1 className="title-pixel text-3xl leading-tight text-white sm:text-4xl">
                {item.name} {item.emoji}
              </h1>
              <p className="mt-3 text-base leading-8 text-white/75">{item.description}</p>

              <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-[#141419] px-5 py-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-yellow-300">Precio base</p>
                <p className="mt-1 text-4xl font-black text-yellow-300">{formatPrice(item.price)}</p>
              </div>

              {relevantGroups.map(group => (
                <div key={group.id} className="mt-5">
                  {(() => {
                    const { minSelections, maxSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);
                    const hideGroupMeta = shouldHideGroupMeta(item.id, group.id);

                    return (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="title-pixel text-sm uppercase text-white">{group.name}</h3>
                    {!hideGroupMeta && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/55">
                        {minSelections > 0
                          ? `Mínimo ${minSelections} opción(es) · Máximo ${maxSelections}`
                          : `Máximo ${maxSelections}`}
                      </span>
                    </div>
                    )}
                  </div>
                    );
                  })()}

                  {!shouldHideGroupMeta(item.id, group.id) && (
                    <p className="mt-1 text-xs text-white/55">
                      {group.id.startsWith('tamano')
                        ? group.subtitle
                        : group.subtitle}
                    </p>
                  )}

                  <div className={`mt-3 grid gap-3 ${group.id === 'salsas-amorguesa' || isMaicitoSizeGroup(group.id) ? 'grid-cols-3 gap-2' : 'sm:grid-cols-2'}`}>
                    {group.addons.map(addon => {
                      const quantity = getAddonQuantity(selectedAddons, addon.id);
                      const groupAddons = group.addons.map(a => a.id);
                      const { minSelections, maxSelections } = getEffectiveGroupLimits(item.id, group, selectedAddons);
                      const currentGroupCount = countSelectedInGroup(selectedAddons, groupAddons);
                      const isFinalPriceOption = addon.pricingMode === 'final';
                      const isSauceSingleSelect = group.id === 'salsas-amorguesa';
                      const perAddonLimit = getPerAddonLimit(item.id, group.id, addon.id);
                      
                      // Validar límites específicos por addon para amorguesa-armable
                      let canIncrement = isFinalPriceOption ? true : currentGroupCount < maxSelections;
                      if (!isFinalPriceOption && isAmorguesaWithLimits(item.id)) {
                        if (group.id === 'adicionales-amorguesa') {
                          const addonLimit = AMORGUESA_ARMABLE_ADDON_LIMITS[addon.id];
                          if (addonLimit && quantity >= addonLimit) {
                            canIncrement = false;
                          }
                        } else if (group.id === 'quesos-amorguesa') {
                          const quesoLimit = AMORGUESA_ARMABLE_QUESO_LIMITS[addon.id];
                          if (quesoLimit && quantity >= quesoLimit) {
                            canIncrement = false;
                          }
                        }
                      }
                      
                      const canDecrement = isFinalPriceOption ? quantity === 0 && minSelections === 0 : quantity > 0 && currentGroupCount > minSelections;
                      const isSelected = quantity > 0;

                      if (isSauceSingleSelect) {
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => selectSingleAddon(addon, group)}
                            className={`rounded-xl border px-2 py-2 text-center transition-colors ${
                              isSelected
                                ? 'border-yellow-300/70 bg-yellow-400/12'
                                : 'border-white/10 bg-[#121217] hover:border-yellow-300/50 hover:bg-[#18181d]'
                            }`}
                          >
                            <p className="text-[11px] font-semibold leading-tight text-white">{addon.emoji} {addon.name}</p>
                          </button>
                        );
                      }

                      if (isFinalPriceOption) {
                        return (
                          <button
                            key={addon.id}
                            onClick={() => selectFinalAddon(addon, group)}
                            className={`border text-left transition-colors ${
                              isMaicitoSizeGroup(group.id)
                                ? 'rounded-xl px-2 py-2'
                                : 'rounded-2xl px-4 py-4'
                            } ${
                              isSelected
                                ? 'border-yellow-300 bg-yellow-400/10'
                                : 'border-white/10 bg-[#121217] hover:border-yellow-300/50 hover:bg-[#18181d]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className={`${isMaicitoSizeGroup(group.id) ? 'text-[11px]' : 'text-sm'} font-semibold leading-snug text-white`}>{addon.emoji} {addon.name}</p>
                              <span className={`${isMaicitoSizeGroup(group.id) ? 'text-[11px]' : 'text-sm'} shrink-0 font-black text-yellow-300`}>{formatPrice(addon.price)}</span>
                            </div>
                          </button>
                        );
                      }

                      return (
                        <div
                          key={addon.id}
                          className={`rounded-2xl border transition-colors ${
                            group.id === 'salsas-amorguesa'
                              ? `px-3 py-3 ${isSelected ? 'border-yellow-300/70 bg-yellow-400/10' : 'border-white/10 bg-[#121217]'}`
                              : `px-4 py-4 ${isSelected ? 'border-yellow-300/70 bg-yellow-400/10' : 'border-white/10 bg-[#121217]'}`
                          }`}
                        >
                          {group.id !== 'salsas-amorguesa' && (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold leading-snug text-white">{addon.emoji} {addon.name}</p>
                                  {perAddonLimit && <p className="mt-1 text-xs text-white/55">Máx. {perAddonLimit}</p>}
                                  {addon.price > 0 && <p className="mt-1 text-xs text-white/55">+ {formatPrice(addon.price)} c/u</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => changeAddonQuantity(addon, group, -1)}
                                    disabled={!canDecrement}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0b0b0e] text-lg font-black text-white transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                                  >
                                    −
                                  </button>
                                  <span className="w-7 text-center text-sm font-black text-yellow-300">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => changeAddonQuantity(addon, group, 1)}
                                    disabled={!canIncrement}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-lg font-black text-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-35"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {item.id === 'salchiper' && salchiperCountableAdds >= 6 && (
                <div className="mt-5 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-200">
                  ✅ Desde 6 adicionales te lo enviamos en envase más grande.
                </div>
              )}
            </div>

            <div className="border-t border-yellow-400/20 bg-[#101014] px-5 py-4 sm:px-7">
              {validationError && <p className="mb-2 text-center text-xs font-semibold text-red-600">{validationError}</p>}
              <button
                onClick={handleAdd}
                className={`w-full rounded-2xl py-4 text-lg font-black transition-all ${
                  added
                    ? 'scale-95 bg-white text-black'
                    : 'bg-[#FFD60A] text-black hover:bg-[#FFE45C] active:scale-95'
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
