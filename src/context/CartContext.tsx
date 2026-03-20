import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartAddon, CartItem, CartState, MenuItem, Addon } from '../types/menu';

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; selectedAddons: Addon[] } }
  | { type: 'REMOVE_ITEM'; payload: { cartItemId: string } }
  | { type: 'INCREMENT'; payload: { cartItemId: string } }
  | { type: 'DECREMENT'; payload: { cartItemId: string } }
  | { type: 'INCREMENT_ADDON'; payload: { cartItemId: string; addonId: string } }
  | { type: 'DECREMENT_ADDON'; payload: { cartItemId: string; addonId: string } }
  | { type: 'REMOVE_ADDON'; payload: { cartItemId: string; addonId: string } }
  | { type: 'CLEAR' };

function mapAddonsForCart(addons: Addon[]): CartAddon[] {
  const addonMap = new Map<string, CartAddon>();
  addons.forEach(addon => {
    const existing = addonMap.get(addon.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      addonMap.set(addon.id, { addon, quantity: 1 });
    }
  });
  return Array.from(addonMap.values());
}

function calcItemTotal(item: MenuItem, addons: CartAddon[], qty: number): number {
  const finalPriceAddon = addons.find(entry => entry.addon.pricingMode === 'final');
  const basePrice = finalPriceAddon ? finalPriceAddon.addon.price : item.price;
  const addonsTotal = addons.reduce((sum, entry) => {
    if (entry.addon.pricingMode === 'final') return sum;
    return sum + (entry.addon.price * entry.quantity);
  }, 0);

  return (basePrice * qty) + addonsTotal;
}

function isFinalPriceAddon(addons: CartAddon[], addonId: string): boolean {
  return addons.some(entry => entry.addon.id === addonId && entry.addon.pricingMode === 'final');
}

function recalcItem(cartItem: CartItem): CartItem {
  return {
    ...cartItem,
    totalPrice: calcItemTotal(cartItem.menuItem, cartItem.selectedAddons, cartItem.quantity),
  };
}

function createCartItemId(menuItemId: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${menuItemId}-${crypto.randomUUID()}`;
  }

  return `${menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, selectedAddons } = action.payload;
      const id = createCartItemId(menuItem.id);
      const mappedAddons = mapAddonsForCart(selectedAddons);
      const newItem: CartItem = {
        id,
        menuItem,
        quantity: 1,
        selectedAddons: mappedAddons,
        totalPrice: calcItemTotal(menuItem, mappedAddons, 1),
      };
      const items = [...state.items, newItem];
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter(i => i.id !== action.payload.cartItemId);
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'INCREMENT': {
      const items = state.items.map(i =>
        i.id === action.payload.cartItemId
          ? recalcItem({ ...i, quantity: i.quantity + 1 })
          : i
      );
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'DECREMENT': {
      const items = state.items
        .map(i =>
          i.id === action.payload.cartItemId
            ? recalcItem({ ...i, quantity: i.quantity - 1 })
            : i
        )
        .filter(i => i.quantity > 0);
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'INCREMENT_ADDON': {
      const items = state.items.map(i => {
        if (i.id !== action.payload.cartItemId) return i;
        if (isFinalPriceAddon(i.selectedAddons, action.payload.addonId)) return i;
        const updatedAddons = i.selectedAddons.map(entry =>
          entry.addon.id === action.payload.addonId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
        return recalcItem({ ...i, selectedAddons: updatedAddons });
      });
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'DECREMENT_ADDON': {
      const items = state.items.map(i => {
        if (i.id !== action.payload.cartItemId) return i;
        if (isFinalPriceAddon(i.selectedAddons, action.payload.addonId)) return i;
        const updatedAddons = i.selectedAddons
          .map(entry =>
            entry.addon.id === action.payload.addonId
              ? { ...entry, quantity: entry.quantity - 1 }
              : entry
          )
          .filter(entry => entry.quantity > 0);
        return recalcItem({ ...i, selectedAddons: updatedAddons });
      });
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'REMOVE_ADDON': {
      const items = state.items.map(i => {
        if (i.id !== action.payload.cartItemId) return i;
        if (isFinalPriceAddon(i.selectedAddons, action.payload.addonId)) return i;
        const updatedAddons = i.selectedAddons.filter(entry => entry.addon.id !== action.payload.addonId);
        return recalcItem({ ...i, selectedAddons: updatedAddons });
      });
      return { items, total: items.reduce((s, i) => s + i.totalPrice, 0) };
    }
    case 'CLEAR':
      return { items: [], total: 0 };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, selectedAddons: Addon[]) => void;
  removeItem: (cartItemId: string) => void;
  increment: (cartItemId: string) => void;
  decrement: (cartItemId: string) => void;
  incrementAddon: (cartItemId: string, addonId: string) => void;
  decrementAddon: (cartItemId: string, addonId: string) => void;
  removeAddon: (cartItemId: string, addonId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const addItem = (menuItem: MenuItem, selectedAddons: Addon[]) =>
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, selectedAddons: [...selectedAddons] } });
  const removeItem = (cartItemId: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId } });
  const increment = (cartItemId: string) =>
    dispatch({ type: 'INCREMENT', payload: { cartItemId } });
  const decrement = (cartItemId: string) =>
    dispatch({ type: 'DECREMENT', payload: { cartItemId } });
  const incrementAddon = (cartItemId: string, addonId: string) =>
    dispatch({ type: 'INCREMENT_ADDON', payload: { cartItemId, addonId } });
  const decrementAddon = (cartItemId: string, addonId: string) =>
    dispatch({ type: 'DECREMENT_ADDON', payload: { cartItemId, addonId } });
  const removeAddon = (cartItemId: string, addonId: string) =>
    dispatch({ type: 'REMOVE_ADDON', payload: { cartItemId, addonId } });
  const clear = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      increment,
      decrement,
      incrementAddon,
      decrementAddon,
      removeAddon,
      clear,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
