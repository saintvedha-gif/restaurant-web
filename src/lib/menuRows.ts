import type { MenuItem } from '../types/menu';

export interface MenuRow {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image: string | null;
  image_hero: string | null;
  category_id: string;
  addons: string[];
  tags: string[];
  max_selections: number | null;
  addon_group_limits?: Record<string, { minSelections?: number; maxSelections?: number }>;
  available: boolean;
  sort_order: number;
}

export function rowToItem(row: MenuRow): MenuItem {
  let addonGroupLimits = row.addon_group_limits;
  if (typeof addonGroupLimits === 'string') {
    try {
      addonGroupLimits = JSON.parse(addonGroupLimits) as MenuRow['addon_group_limits'];
    } catch {
      addonGroupLimits = undefined;
    }
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    emoji: row.emoji,
    image: row.image ?? undefined,
    imageHero: row.image_hero ?? undefined,
    categoryId: row.category_id,
    addons: row.addons && row.addons.length > 0 ? row.addons : undefined,
    tags: row.tags && row.tags.length > 0 ? row.tags : undefined,
    maxSelections: row.max_selections ?? undefined,
    addonGroupLimits,
  };
}
