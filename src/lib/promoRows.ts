import type { Promo, PromoType } from '../data/promos';

export interface PromoRow {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string | null;
  link: string | null;
  active: boolean;
  type: PromoType;
  value: number;
  buy_qty: number;
  get_qty: number;
  product_ids: string[];
  category_ids: string[];
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  days: number[];
  sort_order: number;
}

export function rowToPromo(r: PromoRow): Promo {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    badge: r.badge,
    image: r.image ?? undefined,
    link: r.link ?? '/menu',
    active: r.active,
    type: r.type,
    value: r.value,
    buyQty: r.buy_qty,
    getQty: r.get_qty,
    productIds: r.product_ids ?? [],
    categoryIds: r.category_ids ?? [],
    startDate: r.start_date ?? undefined,
    endDate: r.end_date ?? undefined,
    startTime: r.start_time ?? undefined,
    endTime: r.end_time ?? undefined,
    days: r.days ?? [],
  };
}
