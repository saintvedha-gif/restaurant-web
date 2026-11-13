import type { AddonGroup } from '../types/menu';
import { addonGroups } from '../data/menuData';
import { apiFetch } from './api';

export function applyAddonGroups(groups: AddonGroup[]) {
  const activeGroups = groups
    .filter(group => group.active !== false)
    .map(group => ({ ...group, addons: group.addons.filter(addon => addon.active !== false) }));
  addonGroups.splice(0, addonGroups.length, ...activeGroups);
}

export async function loadAddonGroupsFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const groups = await Promise.race([
      apiFetch<AddonGroup[]>('/api/addons'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (groups) applyAddonGroups(groups);
  } catch {
    // Keep the built-in addon catalog if the API is unavailable.
  }
}
