export interface Addon {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  categoryId?: string | null;
  price: number;
  pricingMode?: 'additive' | 'final';
  minAdds?: number | null;
  maxAdds?: number | null;
  active?: boolean;
  sortOrder?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  imageHero?: string;
  categoryId: string;
  addons?: string[]; // addon group ids
  tags?: string[];
  maxSelections?: number;
  addonGroupLimits?: Record<string, { minSelections?: number; maxSelections?: number }>;
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
  maxSelections: number;
  minSelections?: number;
  addons: Addon[];
  active?: boolean;
  sortOrder?: number;
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
