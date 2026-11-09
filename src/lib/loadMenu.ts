import type { MenuItem } from '../types/menu';
import { menuItems } from '../data/menuData';
import { apiFetch } from './api';

// Trae el menu de la API y reemplaza el menu local.
// Si falla, tarda mucho o viene vacio, se queda el menu local.
export async function loadMenuFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const result = await Promise.race([
      apiFetch<MenuItem[]>('/api/menu'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    if (!result || result.length === 0) return;
    menuItems.splice(0, menuItems.length, ...result);
  } catch {
    // se queda el menu local
  }
}
