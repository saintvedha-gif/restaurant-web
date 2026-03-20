import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice, WHATSAPP_NUMBER } from '../data/menuData';

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
  const count = state.items.reduce((s, i) => s + i.quantity, 0);

  function buildWhatsAppMessage(): string {
    if (state.items.length === 0) return '';
    let msg = '🌽 *Pedido MUCHA MAZORCA*\n\n';
    state.items.forEach(item => {
      msg += `• *${item.menuItem.name}* x${item.quantity}\n`;
      if (item.selectedAddons.length > 0) {
        item.selectedAddons.forEach(entry => {
          if (entry.addon.pricingMode === 'final') {
            msg += `   ↳ Tamaño: ${entry.addon.name} ${formatPrice(entry.addon.price)}\n`;
            return;
          }

          msg += `   ↳ ${entry.addon.name} x${entry.quantity} +${formatPrice(entry.addon.price * entry.quantity)}\n`;
        });
      }
      msg += `   Subtotal: ${formatPrice(item.totalPrice)}\n`;
    });
    msg += `\n*Total: ${formatPrice(state.total)}*`;
    return encodeURIComponent(msg);
  }

  function handleOrder() {
    const msg = buildWhatsAppMessage();
    if (!msg) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      {/* FAB Button */}
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-[24px] border border-[#d1b07a] bg-[#8a673d] px-6 py-4 text-white shadow-[0_18px_50px_rgba(48,30,12,0.36)] transition-all active:scale-95 hover:border-yellow-400/70"
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
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3a2b17]/55 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-[32px] border border-[#d1b07a] bg-[#7b5a34] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d1b07a] px-5 pb-3 pt-5 shrink-0">
              <h2 className="text-2xl text-zinc-100"><span className="font-display">Tu pedido</span></h2>
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a673d] text-zinc-100 transition-colors hover:bg-[#9a7546]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {state.items.length === 0 && (
                <div className="py-12 text-center text-zinc-400">
                  <p className="text-5xl mb-3">🌽</p>
                  <p className="text-2xl text-zinc-100"><span className="font-display">Tu carrito está vacío</span></p>
                  <p className="mt-2 text-sm">Agrega algo delicioso desde el menú.</p>
                </div>
              )}
              {state.items.map(cartItem => (
                <div key={cartItem.id} className="rounded-[24px] border border-[#d1b07a] bg-[#8a673d] p-4 shadow-[0_14px_36px_rgba(48,30,12,0.28)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight text-zinc-100">
                        {cartItem.menuItem.emoji} {cartItem.menuItem.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">Base x{cartItem.quantity}</p>
                      <p className="mt-2 font-black text-yellow-300">{formatPrice(cartItem.totalPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => decrement(cartItem.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a7546] font-bold text-zinc-100 transition-colors hover:bg-[#ae8550]"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-black text-zinc-100">{cartItem.quantity}</span>
                      <button
                        onClick={() => increment(cartItem.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-black transition-colors hover:bg-yellow-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(cartItem.id)}
                    className="mt-3 text-xs font-semibold text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>

                  {cartItem.selectedAddons.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-[#d1b07a] pt-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">Adicionales</p>
                      {cartItem.selectedAddons.map(entry => {
                        const isFinalPriceOption = entry.addon.pricingMode === 'final';

                        return (
                        <div key={`${cartItem.id}-${entry.addon.id}`} className="flex items-center justify-between gap-2 rounded-xl border border-[#dcb983] bg-[#7b5a34] px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-zinc-200">
                              {entry.addon.emoji} {entry.addon.name}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {isFinalPriceOption ? `Tamaño seleccionado · ${formatPrice(entry.addon.price)}` : `${formatPrice(entry.addon.price)} c/u`}
                            </p>
                          </div>

                          {isFinalPriceOption ? (
                            <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow-300">
                              Tamaño
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decrementAddon(cartItem.id, entry.addon.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9a7546] text-sm font-bold text-zinc-100 ring-1 ring-[#dcb983]"
                              >
                                −
                              </button>
                              <span className="w-4 text-center text-xs font-black text-zinc-100">{entry.quantity}</span>
                              <button
                                onClick={() => incrementAddon(cartItem.id, entry.addon.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeAddon(cartItem.id, entry.addon.id)}
                                className="ml-1 text-[11px] font-semibold text-red-500 hover:text-red-700"
                              >
                                Quitar
                              </button>
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
              <div className="space-y-3 border-t border-[#d1b07a] px-5 py-4 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-300">Total del pedido</span>
                  <span className="text-xl font-black text-zinc-100">{formatPrice(state.total)}</span>
                </div>
                <button
                  onClick={handleOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-yellow-400 py-4 text-lg font-black text-black shadow-lg shadow-yellow-900/20 transition-all hover:bg-yellow-300 active:scale-95"
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
