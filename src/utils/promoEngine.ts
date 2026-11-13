import type { CartItem } from '../types/menu';
import type { Promo } from '../data/promos';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function getColombiaToday(): { date: string; dow: number; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  return { date, dow, time: `${values.hour}:${values.minute}` };
}

export function isPromoActiveNow(p: Promo): boolean {
  if (!p.active) return false;
  const { date, dow, time } = getColombiaToday();
  if (p.startDate && date < p.startDate) return false;
  if (p.endDate && date > p.endDate) return false;
  if (p.days.length > 0 && !p.days.includes(dow)) return false;
  if (p.startTime && time < p.startTime) return false;
  if (p.endTime && time > p.endTime) return false;
  return true;
}

function eligibleItems(p: Promo, items: CartItem[]): CartItem[] {
  const scoped = p.productIds.length > 0 || p.categoryIds.length > 0;
  if (!scoped) return items;
  return items.filter(
    i => p.productIds.includes(i.menuItem.id) || p.categoryIds.includes(i.menuItem.categoryId)
  );
}

export function discountFor(p: Promo, items: CartItem[]): number {
  if (p.type === 'none') return 0;
  const eligible = eligibleItems(p, items);
  const subtotal = eligible.reduce((sum, i) => sum + i.totalPrice, 0);
  if (subtotal <= 0) return 0;

  if (p.type === 'percent') return Math.round((subtotal * p.value) / 100);
  if (p.type === 'amount') return Math.min(p.value, subtotal);

  // take_pay: lleva getQty, paga buyQty
  if (p.getQty <= p.buyQty || p.buyQty < 1) return 0;
  let amount = 0;
  for (const i of eligible) {
    const sets = Math.floor(i.quantity / p.getQty);
    const freeUnits = sets * (p.getQty - p.buyQty);
    amount += freeUnits * (i.totalPrice / i.quantity);
  }
  return Math.round(amount);
}

// Solo se aplica UNA promo: la que mas descuento le da al cliente.
export function calculateBestDiscount(
  items: CartItem[],
  promos: Promo[]
): { promo: Promo | null; amount: number } {
  let best: Promo | null = null;
  let bestAmount = 0;
  for (const p of promos) {
    if (!isPromoActiveNow(p)) continue;
    const amount = discountFor(p, items);
    if (amount > bestAmount) {
      best = p;
      bestAmount = amount;
    }
  }
  const total = items.reduce((sum, i) => sum + i.totalPrice, 0);
  return { promo: best, amount: Math.min(bestAmount, total) };
}

export function describeDiscount(p: Promo): string {
  if (p.type === 'percent') return `${p.value}% de descuento`;
  if (p.type === 'amount') return `$${p.value.toLocaleString('es-CO')} menos`;
  if (p.type === 'take_pay') return `Lleva ${p.getQty}, paga ${p.buyQty}`;
  return 'Solo anuncio';
}

export function describeSchedule(p: Promo): string {
  const days = p.days.length === 0 || p.days.length === 7 ? 'Todos los días' : p.days.map(d => DAY_NAMES[d]).join(', ');
  const from = p.startDate ? `desde ${p.startDate}` : '';
  const to = p.endDate ? `hasta ${p.endDate}` : 'sin fecha de fin';
  const hours = p.startTime && p.endTime ? `${p.startTime}–${p.endTime}` : '';
  return [days, from, to, hours].filter(Boolean).join(' · ');
}
