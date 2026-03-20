export interface Addon {
  id: string;
  name: string;
  emoji: string;
  price: number;
  pricingMode?: 'additive' | 'final';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  categoryId: string;
  addons?: string[]; // addon group ids
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  slug: string;
}

export interface AddonGroup {
  id: string;
  name: string;
  subtitle: string;
  minSelections?: number;
  maxSelections: number;
  addons: Addon[];
}

export interface CartItem {
  id: string; // unique cart item id
  menuItem: MenuItem;
  quantity: number;
  selectedAddons: CartAddon[];
  totalPrice: number;
}

export interface CartAddon {
  addon: Addon;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}
