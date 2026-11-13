import type { Category } from '../types/menu';
import { categories, menuItems } from '../data/menuData';
import { apiFetch } from './api';

export interface AdminCategory extends Category {
  active: boolean;
  sortOrder: number;
}

export function applyCategories(items: Category[]) {
  categories.splice(0, categories.length, ...items);
  const activeIds = new Set(items.map(item => item.id));
  const visibleItems = menuItems.filter(item => activeIds.has(item.categoryId));
  menuItems.splice(0, menuItems.length, ...visibleItems);
}

export async function loadCategoriesFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const result = await Promise.race([
      apiFetch<Category[]>('/api/categories'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    if (result) applyCategories(result);
  } catch {
    // Keep the built-in categories if the API is unavailable.
  }
}
