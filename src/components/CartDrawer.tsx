import { useState, useEffect } from 'react';
import OrderForm from './OrderForm';
import { saveToHistory } from '../utils/orderHistory';
import { getContactInfo, getText, siteSettings } from '../data/siteSettings';
import { buildWhatsAppText } from '../utils/whatsappMessage';
import { promos } from '../data/promos';
import { calculateBestDiscount } from '../utils/promoEngine';
import type { OrderData } from '../types/order';
import { clearSavedOrder, DEFAULT_ORDER, formatOrderInfo, isOrderValid, loadOrder, saveOrder } from '../utils/orderInfo';
import { createOrder } from '../lib/orders';
import { useCart } from '../context/CartContext';
import { addonGroups, formatPrice } from '../data/menuData';
import {
  AMORGUESA_COMBINED_MAX,
  getEffectiveGroupMax,
  getPerAddonLimit,
  isAmorguesaWithLimits,
} from '../data/addonRules';

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
  const [order, setOrder] = useState<OrderData>(loadOrder);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderNotice, setOrderNotice] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const orderValid = isOrderValid(order);
  const legacyWhatsAppMode = !siteSettings.deliveryEnabled && !siteSettings.pickupEnabled;
  const discount = calculateBestDiscount(state.items, promos);
  const finalTotal = state.total - discount.amount;

  useEffect(() => {
    if (legacyWhatsAppMode) {
      clearSavedOrder();
      setMarketingConsent(false);
      setOrder(current => current.name || current.phone || current.address || current.reference || current.coords
        ? { ...DEFAULT_ORDER }
        : current);
      return;
    }
    saveOrder(order);
  }, [legacyWhatsAppMode, order]);
  useEffect(() => {
    if (legacyWhatsAppMode) return;
    const availableType = siteSettings.deliveryEnabled ? 'domicilio' : 'recoger';
    if (
      (order.type === 'domicilio' && !siteSettings.deliveryEnabled) ||
      (order.type === 'recoger' && !siteSettings.pickupEnabled)
    ) {
      setOrder(current => ({ ...current, type: availableType, coords: null }));
    }
  }, [legacyWhatsAppMode, order.type]);
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

    // Unir todos los productos (comida y bebida) en un solo bloque, sin encabezados
    const allItems = [...foodItems, ...drinkItems];
    const itemsBlock = allItems.length > 0
      ? allItems.map(formatCartItemLine).join('\n\n')
      : '';

    const msg = legacyWhatsAppMode
      ? itemsBlock
      : buildWhatsAppText(siteSettings.whatsappTemplate, {
      productos: itemsBlock,
      promo: discount.promo ? `🎁 Promo: ${discount.promo.title} (-${formatPrice(discount.amount)})` : '',
      total: formatPrice(finalTotal),
      datos: formatOrderInfo(order).join('\n'),
      nombre: order.name.trim(),
    });

    return encodeURIComponent(msg);
  }


  function handleOrder() {
    if (legacyWhatsAppMode ? state.items.length === 0 : !orderValid) return;
    setShowConfirm(true);
  }

  async function confirmAndSendOrder() {
    const msg = buildWhatsAppMessage();
    setShowConfirm(false);
    if (!msg) return;

    window.open(
      `https://wa.me/${getContactInfo().whatsappNumber}?text=${msg}`,
      '_blank',
      'noopener,noreferrer'
    );
    if (legacyWhatsAppMode) {
      setOrderNotice({ type: 'success', text: 'WhatsApp abierto con los productos. En este modo no guardamos datos personales ni pedidos.' });
      setMarketingConsent(false);
      return;
    }
    saveToHistory(state.items, finalTotal, order.type, discount.promo?.title);

    setSavingOrder(true);
    setOrderNotice(null);
    try {
      await createOrder({
        order,
        items: state.items,
        subtotal: state.total,
        discountAmount: discount.amount,
        total: finalTotal,
        promoTitle: discount.promo?.title,
        marketingConsent,
      });
      setOrderNotice({ type: 'success', text: 'Pedido guardado en el panel y WhatsApp abierto.' });
    } catch (error) {
      setOrderNotice({
        type: 'warning',
        text: `WhatsApp está abierto, pero el pedido no se guardó en el panel: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      });
    } finally {
      setSavingOrder(false);
      setMarketingConsent(false);
    }
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
          <span className="font-black text-yellow-300">{formatPrice(finalTotal)}</span>
        </button>
      )}

      {/* Drawer */}
      {open && (
        <>
          {/* Modal de confirmación antes de WhatsApp */}
          {showConfirm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="relative rounded-3xl bg-white p-7 max-w-xs w-full text-center shadow-2xl border-2 border-yellow-300/40">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors text-xl font-black shadow-sm focus:outline-none"
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <p className="text-base text-[#4A2800] font-semibold mb-6 mt-2">
                  {getText('confirmMessage')}
                </p>
                <button
                  onClick={confirmAndSendOrder}
                  className="mt-2 w-full rounded-xl bg-yellow-400 py-3 text-lg font-black text-black shadow transition-all hover:bg-yellow-300 active:scale-95 border-2 border-yellow-300"
                >
                  Okay 😄 </button>
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
                        <button
                          type="button"
                          aria-expanded={expandedItems[cartItem.id] ?? true}
                          onClick={() => setExpandedItems(current => ({
                            ...current,
                            [cartItem.id]: !(current[cartItem.id] ?? true),
                          }))}
                          className="flex w-full items-center justify-between text-left text-[11px] font-extrabold uppercase tracking-[0.18em] text-yellow-300"
                        >
                          <span>Adicionales y tamaños ({cartItem.selectedAddons.length})</span>
                          <span aria-hidden="true">{(expandedItems[cartItem.id] ?? true) ? '⌃' : '⌄'}</span>
                        </button>
                        {(expandedItems[cartItem.id] ?? true) && cartItem.selectedAddons.map(entry => {
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
                          const groupAddonIds = currentGroup
                            ? currentGroup.addons
                              .filter(addon => !addon.categoryId || addon.categoryId === cartItem.menuItem.categoryId)
                              .map(addon => addon.id)
                            : [];
                          const currentGroupCount = groupAddonIds.length > 0
                            ? cartItem.selectedAddons
                              .filter(addonEntry => groupAddonIds.includes(addonEntry.addon.id))
                              .reduce((sum, addonEntry) => sum + addonEntry.quantity, 0)
                            : 0;
                          const effectiveGroupMax = currentGroup
                            ? getEffectiveGroupMax(
                              cartItem.menuItem.id,
                              currentGroup.id,
                              currentGroup.maxSelections,
                              selectedSizeId,
                              cartItem.menuItem.addonGroupLimits?.[currentGroup.id]?.maxSelections
                            )
                            : 999;


                          // Unificar límite de 5 entre adicionales y quesos para amorguesa-armable
                          let totalAdicionalesQuesos = 0;
                          if (isAmorguesa) {
                            totalAdicionalesQuesos = cartItem.selectedAddons
                              .filter(a => a.addon.id.startsWith('amor-') && !a.addon.id.startsWith('amor-salsa'))
                              .reduce((sum, a) => sum + a.quantity, 0);
                          }

                          const perAddonLimit = entry.addon.maxAdds !== undefined
                            ? entry.addon.maxAdds ?? undefined
                            : getPerAddonLimit(cartItem.menuItem.id, currentGroup?.id ?? '', entry.addon.id);
                          let canIncrement = false;
                          if (!isFinalPriceOption) {
                            if (isAmorguesa) {
                              canIncrement = totalAdicionalesQuesos < AMORGUESA_COMBINED_MAX;
                            } else if (
                              currentGroup &&
                              (currentGroup.id === 'adicionales-salchi' || currentGroup.id === 'adicionales-maicito')
                            ) {
                              canIncrement = currentGroupCount < effectiveGroupMax;
                            } else {
                              canIncrement = currentGroupCount < effectiveGroupMax;
                            }
                            if (perAddonLimit !== undefined && entry.quantity >= perAddonLimit) {
                              canIncrement = false;
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
                                    ? `Tamaño seleccionado · ${formatPrice(entry.addon.price)}`
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
                                    disabled={entry.quantity <= (entry.addon.minAdds ?? 1)}
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {state.items.length > 0 && legacyWhatsAppMode && (
                  <p className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-xs leading-5 text-yellow-100/75">
                    El restaurante recibe pedidos por WhatsApp. No pediremos ni guardaremos tus datos personales en este modo.
                  </p>
                )}
                {state.items.length > 0 && !legacyWhatsAppMode && (
                  <OrderForm
                    value={order}
                    onChange={setOrder}
                    deliveryEnabled={siteSettings.deliveryEnabled}
                    pickupEnabled={siteSettings.pickupEnabled}
                    marketingConsent={marketingConsent}
                    onMarketingConsentChange={setMarketingConsent}
                  />
                )}
              </div>

              {/* Footer */}
              {state.items.length > 0 && (
                <div className="space-y-3 border-t border-yellow-400/20 px-5 py-4 shrink-0">
                  {orderNotice && (
                    <p
                      role="status"
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        orderNotice.type === 'success'
                          ? 'border-[#00C853]/40 bg-[#00C853]/10 text-[#00C853]'
                          : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-100'
                      }`}
                    >
                      {orderNotice.text}
                    </p>
                  )}
                  {discount.promo && (
                    <div className="flex items-center justify-between rounded-xl border border-[#00C853]/40 bg-[#00C853]/10 px-3 py-2 text-sm font-bold text-[#00C853]">
                      <span>🎁 {discount.promo.title}</span>
                      <span>-{formatPrice(discount.amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white/75">Total del pedido</span>
                    <span className="text-xl font-black text-white">{formatPrice(finalTotal)}</span>
                  </div>
                  <p className="text-[11px] leading-4 text-white/55">
                    Al hacer el pedido, tus datos se enviarán al restaurante para gestionarlo. Si compartes tu ubicación, también se guardarán las coordenadas.
                  </p>
                  <button
                    onClick={handleOrder}
                    disabled={(!legacyWhatsAppMode && !orderValid) || savingOrder}
                    className="disabled:cursor-not-allowed disabled:opacity-50 flex w-full items-center justify-center gap-2 rounded-[22px] bg-yellow-400 py-4 text-lg font-black text-black shadow-lg shadow-black/30 transition-all hover:bg-yellow-300 active:scale-95"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {savingOrder ? 'Guardando pedido...' : legacyWhatsAppMode ? 'Continuar por WhatsApp' : 'Pedir por WhatsApp'}
                  </button>
                  {!legacyWhatsAppMode && !orderValid && (<p className="text-center text-xs text-white/55">Completa tu nombre, celular y dirección para pedir</p>)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
