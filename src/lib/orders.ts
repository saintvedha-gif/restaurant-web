import type { CartItem } from '../types/menu';
import type { OrderData } from '../types/order';
import { apiFetch } from './api';

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'on_route'
  | 'completed'
  | 'cancelled';

export interface OrderItemSnapshot {
  product_id: string;
  name: string;
  quantity: number;
  base_price: number;
  line_total: number;
  addons: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface OrderRecord {
  id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  fulfillment_type: OrderData['type'];
  customer_name: string;
  phone: string;
  address: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount_amount: number;
  total: number;
  promo_title: string | null;
  privacy_consent_at: string;
}

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'ready', label: 'Listo para recoger' },
  { value: 'on_route', label: 'En camino' },
  { value: 'completed', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface CreateOrderInput {
  order: OrderData;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  promoTitle?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<void> {
  const { order, items } = input;
  await apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      fulfillment_type: order.type,
      customer_name: order.name.trim(),
      phone: order.phone.trim(),
      address: order.type === 'domicilio' ? order.address.trim() || null : null,
      reference: order.type === 'domicilio' ? order.reference.trim() || null : null,
      latitude: order.type === 'domicilio' ? order.coords?.lat ?? null : null,
      longitude: order.type === 'domicilio' ? order.coords?.lng ?? null : null,
      items: items.map(item => ({
        product_id: item.menuItem.id,
        quantity: item.quantity,
        addons: item.selectedAddons.map(({ addon, quantity }) => ({ id: addon.id, quantity })),
      })),
      privacy_consent_at: new Date().toISOString(),
    }),
  });
}

export async function listOrders(): Promise<OrderRecord[]> {
  return apiFetch<OrderRecord[]>('/api/admin/orders');
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await apiFetch(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  await apiFetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
}
