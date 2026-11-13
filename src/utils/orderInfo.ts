import type { OrderData } from '../types/order';

const STORAGE_KEY = 'mm_order_info';

export const DEFAULT_ORDER: OrderData = {
  type: 'domicilio',
  name: '',
  phone: '',
  address: '',
  reference: '',
  coords: null,
};

// Recuerda los datos del cliente en su propio celular (no guarda la ubicacion GPS).
export function loadOrder(): OrderData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ORDER;
    const p = JSON.parse(raw);
    return {
      type: p.type === 'recoger' ? 'recoger' : 'domicilio',
      name: String(p.name ?? ''),
      phone: String(p.phone ?? ''),
      address: String(p.address ?? ''),
      reference: String(p.reference ?? ''),
      coords: null,
    };
  } catch {
    return DEFAULT_ORDER;
  }
}

export function saveOrder(order: OrderData): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        type: order.type,
        name: order.name,
        phone: order.phone,
        address: order.address,
        reference: order.reference,
      })
    );
  } catch {
    // si el navegador no deja guardar, no pasa nada
  }
}

export function clearSavedOrder(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The browser may block local storage.
  }
}

export function isOrderValid(order: OrderData): boolean {
  const nameOk = order.name.trim().length >= 2;
  const phoneOk = order.phone.replace(/\D/g, '').length >= 7;
  if (!nameOk || !phoneOk) return false;
  if (order.type === 'recoger') return true;
  return order.address.trim().length >= 5 || order.coords !== null;
}

export function formatOrderInfo(order: OrderData): string[] {
  const lines = [
    `📦 Tipo: ${order.type === 'domicilio' ? 'Domicilio' : 'Recoger en el local'}`,
    `👤 Nombre: ${order.name.trim()}`,
    `📞 Teléfono: ${order.phone.trim()}`,
  ];
  if (order.type === 'domicilio') {
    if (order.address.trim()) lines.push(`🏠 Dirección: ${order.address.trim()}`);
    if (order.reference.trim()) lines.push(`📝 Referencia: ${order.reference.trim()}`);
    if (order.coords) {
      lines.push(`📍 Ubicación: https://www.google.com/maps?q=${order.coords.lat},${order.coords.lng}`);
    }
  }
  return lines;
}
