import type { CartAddon, CartItem } from '../types/menu';

const STORAGE_KEY = 'mm_order_history';
const MAX_ENTRIES = 20;

export interface HistoryLine {
  menuItemId: string;
  name: string;
  quantity: number;
  addons: CartAddon[];
}

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'domicilio' | 'recoger';
  total: number;
  promoTitle?: string;
  lines: HistoryLine[];
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // si el navegador no deja guardar, no pasa nada
  }
}

export function saveToHistory(
  items: CartItem[],
  total: number,
  type: 'domicilio' | 'recoger',
  promoTitle?: string
): void {
  if (items.length === 0) return;
  const entry: HistoryEntry = {
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    type,
    total,
    promoTitle,
    lines: items.map(i => ({
      menuItemId: i.menuItem.id,
      name: i.menuItem.name,
      quantity: i.quantity,
      addons: i.selectedAddons,
    })),
  };
  persist([entry, ...loadHistory()].slice(0, MAX_ENTRIES));
}

export function clearHistory(): void {
  persist([]);
}
