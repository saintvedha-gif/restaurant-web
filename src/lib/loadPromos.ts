import type { Promo } from '../data/promos';
import { promos } from '../data/promos';
import { apiFetch } from './api';

// Trae las promos de la API. Si la consulta funciona, REEMPLAZA las de respaldo
// (aunque no haya ninguna). Si falla o tarda mucho, se quedan las de respaldo.
export async function loadPromosFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const result = await Promise.race([
      apiFetch<Promo[]>('/api/promos'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    if (!result) return;
    promos.splice(0, promos.length, ...result);
  } catch {
    // se quedan las promos de respaldo
  }
}
