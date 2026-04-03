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
  const [showToast, setShowToast] = useState(false);

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
    setShowToast(false);
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
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      setAdded(false);
      onClose();
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* TOAST — estilo inline para que nada lo bloquee */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: '#00C853',
          borderRadius: '24px',
          padding: '28px 48px',
        }}>
          <span style={{ fontSize: '52px', lineHeight: 1 }}>✓</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', whiteSpace: 'nowrap' }}>¡Agregado al pedido!</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>{item.name}</span>
        </div>
      )}

      <div className="flex h-full w-full flex-col overflow-hidden bg-[#FFF3E0] max-w-full">
        <div className="grid h-full w-full max-w-full grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative h-64 shrink-0 bg-[#FFE4C2] sm:h-80 lg:h-full max-w-full">
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
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E0]/95 text-xl text-[#FFD60A] backdrop-blur transition-colors hover:bg-[#FFE4C2]"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-col border-t border-[#FFD60A]/25 lg:border-l lg:border-t-0 max-w-full">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-7 max-w-full">
              <h2 className="font-display text-3xl sm:text-4xl leading-tight text-[#4A2800] break-words">
                <span>{item.name}</span>{' '}
                <span className="inline-flex items-center whitespace-nowrap">{item.emoji}</span>
              </h2>
              <p className="mt-3 text-base leading-8 text-[#6A3A00] break-words">{item.description}</p>
              <div className="mt-5 rounded-2xl border border-[#FFD60A]/35 bg-[#FFE4C2] px-4 py-4 w-full max-w-full overflow-x-auto">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FFD60A]">Precio base</p>
                <p className="mt-1 text-4xl font-black text-[#FFD60A]">{formatPrice(item.price)}</p>
              </div>

              <div className="mt-6 w-full max-w-full">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#4A2800]">Adicionales</h3>
                <p className="mt-1 text-xs text-[#8A5A2A]">Selecciona los que quieras y verás el valor de cada uno.</p>
              </div>

              {relevantGroups.map(group => (
                <div key={group.id} className="mt-5 w-full max-w-full">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#4A2800] break-words">{group.name}</h3>
                    <span className="text-xs text-[#8A5A2A] break-words">{group.subtitle}</span>
                  </div>
                  <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 w-full max-w-full">
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
                          className={`rounded-2xl border px-3 py-4 transition-colors text-left w-full max-w-full overflow-x-auto ${
                            isSelected
                              ? 'border-[#FFD60A]/60 bg-[#FFD60A]/10'
                              : disabled
                                ? 'cursor-not-allowed border-[#FFD60A]/15 bg-[#FFE4C2] opacity-40'
                                : 'border-[#FFD60A]/25 bg-[#FFF3E0] hover:bg-[#FFE4C2]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 w-full max-w-full">
                            <div className="flex items-center gap-2 min-w-0 w-0 flex-1">
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-[#00C853] bg-[#00C853]' : 'border-zinc-500'
                              }`}>
                                {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                              </div>
                              <span className="text-sm font-semibold text-[#6A3A00] leading-snug break-words">
                                {addon.emoji} {addon.name}
                              </span>
                            </div>
                            <span className="shrink-0 text-sm font-black text-[#FFD60A]">
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

            <div className="shrink-0 border-t border-[#FFD60A]/25 bg-[#FFF3E0] px-3 py-4 sm:px-6 w-full max-w-full">
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
                    ? 'scale-95 bg-[#00C853] text-white'
                    : 'bg-[#FFD60A] text-black hover:bg-[#FFE45C] hover:text-black active:scale-95'
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