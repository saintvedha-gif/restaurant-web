import type { AddonGroup } from '../types/menu';

const PRODUCT_ADDON_LIMITS: Record<string, Partial<Record<string, number>>> = {
  salchiper: { 'adicionales-salchi': 8 },
  salchipapita: { 'adicionales-salchi': 10 },
  salchipapota: { 'adicionales-salchi': 12 },
  salchifeliz: { 'adicionales-salchi': 3 },
};

const MAICITO_SIZE_LIMITS: Record<string, number> = {
  'milenial-pequeno': 2,
  'maicito37-pequeno': 2,
  'milenial-mediano': 3,
  'maicito37-mediano': 3,
  'milenial-grande': 3,
  'maicito37-grande': 3,
};

export const AMORGUESA_ARMABLE_ADDON_LIMITS: Record<string, number> = {
  'amor-tocino': 3,
  'amor-croqueta': 3,
  'amor-pepinillos': 3,
  'amor-cebolla': 2,
  'amor-philadelphia': 5,
};

export const AMORGUESA_ARMABLE_QUESO_LIMITS: Record<string, number> = {
  'amor-queso-cheddar': 2,
  'amor-colbyjack': 2,
  'amor-mozzarella': 2,
  'amor-mix-quesos': 2,
};

const AMORGUESA_WITH_LIMITS_IDS = ['amorguesa-armable', 'amorguesa-clasica'] as const;
const MAICITO_SIZE_GROUP_IDS = ['tamano-milenial', 'tamano-maicito-37'] as const;

export const AMORGUESA_COMBINED_MAX = 5;

export function isAmorguesaWithLimits(itemId: string) {
  return AMORGUESA_WITH_LIMITS_IDS.includes(itemId as typeof AMORGUESA_WITH_LIMITS_IDS[number]);
}

export function isMaicitoSizeGroup(groupId: string) {
  return MAICITO_SIZE_GROUP_IDS.includes(groupId as typeof MAICITO_SIZE_GROUP_IDS[number]);
}

export function getEffectiveGroupMax(
  itemId: string,
  groupId: string,
  defaultMax: number,
  selectedSizeId?: string
): number {
  if (groupId === 'adicionales-salchi' || groupId === 'adicionales-maicito') {
    if (itemId === 'negrita') return 2;
    if (itemId === 'quetzalcoatl') return 3;

    if (itemId === 'viene-la-paloma' || itemId === 'milenial' || itemId === 'malandro') {
      const sizeLimit = selectedSizeId ? MAICITO_SIZE_LIMITS[selectedSizeId] : undefined;
      if (sizeLimit) return sizeLimit;
    }
  }

  if (isAmorguesaWithLimits(itemId) && groupId === 'adicionales-amorguesa') {
    return AMORGUESA_COMBINED_MAX;
  }

  return PRODUCT_ADDON_LIMITS[itemId]?.[groupId] ?? defaultMax;
}

export function getEffectiveGroupLimits(
  itemId: string,
  group: Pick<AddonGroup, 'id' | 'maxSelections' | 'minSelections'>,
  selectedSizeId?: string
) {
  const isAmorguesaGroup =
    isAmorguesaWithLimits(itemId) &&
    (group.id === 'adicionales-amorguesa' || group.id === 'quesos-amorguesa');

  return {
    minSelections: isAmorguesaGroup ? 0 : (group.minSelections ?? 0),
    maxSelections: getEffectiveGroupMax(itemId, group.id, group.maxSelections, selectedSizeId),
  };
}

export function getPerAddonLimit(itemId: string, groupId: string, addonId: string) {
  if (!isAmorguesaWithLimits(itemId)) {
    return undefined;
  }

  if (groupId === 'adicionales-amorguesa') {
    return AMORGUESA_ARMABLE_ADDON_LIMITS[addonId];
  }

  if (groupId === 'quesos-amorguesa') {
    return AMORGUESA_ARMABLE_QUESO_LIMITS[addonId];
  }

  return undefined;
}
