import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { addonGroups, formatPrice, WHATSAPP_NUMBER } from '../data/menuData';

const PRODUCT_ADDON_LIMITS: Record<string, Partial<Record<string, number>>> = {
  salchiper: { 'adicionales-salchi': 8 },
  salchipapita: { 'adicionales-salchi': 10 },
  salchipapota: { 'adicionales-salchi': 12 },
  salchifeliz: { 'adicionales-salchi': 3 },
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
  'amor-philadelphia': 5,
};

const AMORGUESA_ARMABLE_QUESO_LIMITS: Record<string, number> = {
  'amor-queso-cheddar': 2,
  'amor-colbyjack': 2,
  'amor-mozzarella': 2,
  'amor-mix-quesos': 2,
};



const AMORGUESA_WITH_LIMITS_IDS = ['amorguesa-armable', 'amorguesa-clasica'] as const;

function isAmorguesaWithLimits(itemId: string) {
  return AMORGUESA_WITH_LIMITS_IDS.includes(itemId as typeof AMORGUESA_WITH_LIMITS_IDS[number]);
}

function getEffectiveGroupLimit(itemId: string, groupId: string, defaultMax: number, selectedSizeId?: string) {
  if (groupId === 'adicionales-salchi') {
    if (itemId === 'negrita') return 2;
    if (itemId === 'quetzalcoatl') return 3;

    if (itemId === 'viene-la-paloma' || itemId === 'milenial' || itemId === 'malandro') {
      const sizeLimit = selectedSizeId ? MAICITO_SIZE_LIMITS[selectedSizeId] : undefined;
      if (sizeLimit) return sizeLimit;
    }
  }

  return PRODUCT_ADDON_LIMITS[itemId]?.[groupId] ?? defaultMax;
}

export default function CartDrawer() {
  const { 
    state,
    removeItem,
    increment,
    decrement,
    incrementAddon,
    decrementAddon,
    removeAddon,
    clear,
  } = useCart();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const count = state.items.reduce((s, i) => s + i.quantity, 0);

  // Prevenir scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  function buildWhatsAppMessage(): string {
    if (state.items.length === 0) return '';
    const emojiHeart = '\uD83D\uDC9B';
    const drinkCategoryIds = new Set(['frappes', 'soditas', 'bebidas']);
    const foodItems = state.items.filter(item => !drinkCategoryIds.has(item.menuItem.categoryId));
    const drinkItems = state.items.filter(item => drinkCategoryIds.has(item.menuItem.categoryId));

    const formatCartItemLine = (cartItem: typeof state.items[number]) => {
      const baseLine = `${cartItem.quantity} x ${cartItem.menuItem.name}`;
      const addonLines = cartItem.selectedAddons.map(entry => {
        const qtyLabel = entry.quantity > 1 ? ` x${entry.quantity}` : '';
        const prefix = entry.addon.pricingMode === 'final' ? '   - Tamaño: ' : '   - ';
        return `${prefix}${entry.addon.name}${qtyLabel}`;
      });

      return [baseLine, ...addonLines].join('\n');
    };

    const foodBlock = foodItems.length > 0
      ? foodItems.map(formatCartItemLine).join('\n\n')
      : 'Sin comida';

    const drinkBlock = drinkItems.length > 0
      ? drinkItems.map(formatCartItemLine).join('\n\n')
      : 'Sin bebida';

    const msg = [
      `${emojiHeart} Holaaaa, deseo ordenar este manjar de dioses:`,
      '',
      'Comida',
      foodBlock,
      '',
      'Bebida',
      drinkBlock,
      '',
      `💰 Total: ${formatPrice(state.total)}`,
    ].join('\n');

    return encodeURIComponent(msg);
  }


  function handleOrder() {
    setShowConfirm(true);
  }

  function confirmAndSendOrder() {
    const msg = buildWhatsAppMessage();
    setShowConfirm(false);
    if (!msg) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {/* FAB Button */}
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-1/2 z-[999] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-[24px] border border-yellow-400/40 bg-[#121216] px-6 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all active:scale-95 hover:border-yellow-300 hover:bg-[#18181d]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 font-black text-sm text-black">
            {count}
          </span>
          <span className="flex-1 text-center font-bold uppercase tracking-[0.18em] text-sm">Ver pedido</span>
          <span className="font-black text-yellow-300">{formatPrice(state.total)}</span>
        </button>
      )}

      {/* Drawer */}
      {open && (
                {/* Modal de confirmación antes de WhatsApp */}
                {showConfirm && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="rounded-2xl bg-white p-6 max-w-xs w-full text-center shadow-2xl">
                      <p className="text-base text-[#4A2800] font-semibold mb-4">
                        Si llegas a tener algún problema con tu pedido, recuerda comunicarte con MM🌽, para poderte solucionar y que no te lleves una mala experiencia 🫶🏻
                      </p>
                      <button
                        onClick={confirmAndSendOrder}
                        className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-lg font-black text-black shadow transition-all hover:bg-yellow-300 active:scale-95"
                      >
                        Okay 🫶🏻
                      </button>
                    </div>
                  </div>
                )}
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm overscroll-none touch-none"
          style={{ overscrollBehavior: 'none', touchAction: 'none' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-[32px] border border-yellow-400/20 bg-[#101014] shadow-2xl overscroll-contain" style={{ overscrollBehavior: 'contain' }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-yellow-400/20 px-5 pb-3 pt-5 shrink-0">
              <h2 className="text-xl text-white"><span className="title-pixel">Tu pedido</span></h2>
              <div className="flex gap-2">
                {state.items.length > 0 && (
                  <button
                    onClick={clear}
                    className="px-2 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-500 hover:underline"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a21] text-white transition-colors hover:bg-[#21212a]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 overscroll-contain" style={{ overscrollBehavior: 'contain' }}>
              {state.items.length === 0 && (
                <div className="py-12 text-center text-white/65">
                  <p className="text-5xl mb-3">🌽</p>
                  <p className="text-xl text-white"><span className="title-pixel">Tu carrito esta vacio</span></p>
                  <p className="mt-2 text-sm">Agrega algo delicioso desde el menú.</p>
                </div>
              )}
              {state.items.map(cartItem => (
                <div key={cartItem.id} className="rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.28)]">
                  {(() => {
                    const selectedSize = cartItem.selectedAddons.find(entry => entry.addon.pricingMode === 'final');
                    const baseDisplayPrice = selectedSize ? selectedSize.addon.price : cartItem.menuItem.price;

                    return (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight text-white">
                        {cartItem.menuItem.emoji} {cartItem.menuItem.name}
                      </p>
                      <p className="mt-1 text-xs text-white/55">Base x{cartItem.quantity}</p>
                      <p className="mt-2 font-black text-yellow-300">{formatPrice(baseDisplayPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => decrement(cartItem.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0c0c10] font-bold text-white transition-colors hover:bg-[#17171d]"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-black text-white">{cartItem.quantity}</span>
                      <button
                        onClick={() => increment(cartItem.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-black transition-colors hover:bg-yellow-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                    );
                  })()}
                  <button
                    onClick={() => removeItem(cartItem.id)}
                    className="mt-3 text-xs font-semibold text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>

                  {cartItem.selectedAddons.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-yellow-400/15 pt-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-yellow-300">Adicionales</p>
                      {cartItem.selectedAddons.map(entry => {
                        const isFinalPriceOption = entry.addon.pricingMode === 'final';
                        const isAmorguesaSauce = entry.addon.id.startsWith('amor-salsa');
                        const isAmorguesa = isAmorguesaWithLimits(cartItem.menuItem.id);
                        const selectedSizeId = cartItem.selectedAddons.find(addonEntry => addonEntry.addon.pricingMode === 'final')?.addon.id;
                        const allowedGroups = (cartItem.menuItem.addons ?? [])
                          .map(groupId => addonGroups.find(group => group.id === groupId))
                          .filter(Boolean);
                        const currentGroup = allowedGroups.find(group =>
                          group?.addons.some(addon => addon.id === entry.addon.id)
                        );
                        const groupAddonIds = currentGroup ? currentGroup.addons.map(addon => addon.id) : [];
                        const currentGroupCount = groupAddonIds.length > 0
                          ? cartItem.selectedAddons
                            .filter(addonEntry => groupAddonIds.includes(addonEntry.addon.id))
                            .reduce((sum, addonEntry) => sum + addonEntry.quantity, 0)
                          : 0;
                        const effectiveGroupMax = currentGroup
                          ? getEffectiveGroupLimit(
                            cartItem.menuItem.id,
                            currentGroup.id,
                            currentGroup.maxSelections,
                            selectedSizeId
                          )
                          : 999;


                        // Unificar límite de 5 entre adicionales y quesos para amorguesa-armable
                        let totalAdicionalesQuesos = 0;
                        if (isAmorguesa) {
                          totalAdicionalesQuesos = cartItem.selectedAddons
                            .filter(a => a.addon.id.startsWith('amor-') && !a.addon.id.startsWith('amor-salsa'))
                            .reduce((sum, a) => sum + a.quantity, 0);
                        }

                        let canIncrement = isFinalPriceOption ? false : currentGroupCount < effectiveGroupMax;
                        if (isAmorguesa && !isFinalPriceOption) {
                          // Límite combinado de 5 entre adicionales y quesos: si ya hay 5, ningún botón + debe estar habilitado
                          if (totalAdicionalesQuesos >= 5) {
                            canIncrement = false;
                          } else {
                            if (entry.addon.id in AMORGUESA_ARMABLE_ADDON_LIMITS) {
                              const limit = AMORGUESA_ARMABLE_ADDON_LIMITS[entry.addon.id];
                              canIncrement = canIncrement && entry.quantity < limit;
                            } else if (entry.addon.id in AMORGUESA_ARMABLE_QUESO_LIMITS) {
                              const limit = AMORGUESA_ARMABLE_QUESO_LIMITS[entry.addon.id];
                              canIncrement = canIncrement && entry.quantity < limit;
                            }
                          }
                        }

                        return (
                        <div key={`${cartItem.id}-${entry.addon.id}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#111116] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white">
                              {entry.addon.emoji} {entry.addon.name}
                            </p>
                            <p className="text-[11px] text-white/55">
                              {isFinalPriceOption
                                ? `Tamano seleccionado · ${formatPrice(entry.addon.price)}`
                                : isAmorguesaSauce
                                  ? 'Salsa seleccionada'
                                  : `${entry.quantity} x ${formatPrice(entry.addon.price)}`}
                            </p>
                          </div>

                      {isFinalPriceOption ? (
                            <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow-300">
                              Tamaño
                            </span>
                          ) : isAmorguesaSauce ? (
                            <button
                              onClick={() => removeAddon(cartItem.id, entry.addon.id)}
                              className="ml-1 text-[10px] font-semibold text-red-400 hover:text-red-300"
                            >✕</button>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => decrementAddon(cartItem.id, entry.addon.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0c0c10] text-xs font-bold text-white hover:bg-[#17171d]"
                              >−</button>
                              <span className="w-4 text-center text-xs font-black text-white">{entry.quantity}</span>
                              <button
                                onClick={() => canIncrement && incrementAddon(cartItem.id, entry.addon.id)}
                                disabled={!canIncrement}
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  canIncrement
                                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                }`}
                              >+</button>
                              <button
                                onClick={() => removeAddon(cartItem.id, entry.addon.id)}
                                className="ml-1 text-[10px] font-semibold text-red-400 hover:text-red-300"
                              >✕</button>
                            </div>
                          )}
                        </div>
                      );})}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="space-y-3 border-t border-yellow-400/20 px-5 py-4 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/75">Total del pedido</span>
                  <span className="text-xl font-black text-white">{formatPrice(state.total)}</span>
                </div>
                <button
                  onClick={handleOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#FFD60A] py-4 text-lg font-black text-black shadow-lg shadow-black/30 transition-all hover:bg-[#FFE45C] active:scale-95"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
