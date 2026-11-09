import { getImageUrl } from './menuData';

export type PromoType = 'none' | 'percent' | 'take_pay' | 'amount';

export interface Promo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image?: string;
  link?: string;
  active: boolean;
  type: PromoType;
  value: number;
  buyQty: number;
  getQty: number;
  productIds: string[];
  categoryIds: string[];
  startDate?: string;
  endDate?: string;
  days: number[]; // 0 = domingo ... 6 = sabado. Vacio = todos los dias
}

// Promos de respaldo: se usan si la API no esta disponible.
export const promos: Promo[] = [
  {
    id: 'matrimonios',
    title: 'Matrimonios en descuento',
    subtitle: 'Cambia este texto desde el panel',
    badge: 'PROMO',
    image: getImageUrl('MATRIMONIO.jpg'),
    link: '/menu',
    active: true,
    type: 'none',
    value: 0,
    buyQty: 1,
    getQty: 2,
    productIds: [],
    categoryIds: [],
    days: [],
  },
];
