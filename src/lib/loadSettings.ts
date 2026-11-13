import { DEFAULT_SETTINGS, FONT_SPECS, siteSettings } from '../data/siteSettings';
import { DAY_ORDER, applyHours } from '../data/openingHours';
import type { DayKey, HoursSetting } from '../data/openingHours';
import { apiFetch } from './api';

// Trae los ajustes guardados en la API. Si falla, se quedan los originales.
export async function loadSettingsFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const result = await Promise.race([
      apiFetch<Partial<typeof DEFAULT_SETTINGS>>('/api/settings'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);

    if (!result) return;
    const d = result as Partial<typeof DEFAULT_SETTINGS>;
    siteSettings.accent = typeof d.accent === 'string' && /^#[0-9a-f]{6}$/i.test(d.accent) ? d.accent : DEFAULT_SETTINGS.accent;
    siteSettings.titleFont = d.titleFont && FONT_SPECS[d.titleFont] ? d.titleFont : DEFAULT_SETTINGS.titleFont;
    siteSettings.bodyFont = d.bodyFont && FONT_SPECS[d.bodyFont] ? d.bodyFont : DEFAULT_SETTINGS.bodyFont;
    siteSettings.texts = d.texts && typeof d.texts === 'object' ? d.texts : {};
    siteSettings.whatsappTemplate =
      typeof d.whatsappTemplate === 'string' && d.whatsappTemplate.includes('{productos}')
        ? d.whatsappTemplate
        : DEFAULT_SETTINGS.whatsappTemplate;

    const wa = typeof d.whatsappNumber === 'string' ? d.whatsappNumber.replace(/\D/g, '') : '';
    siteSettings.whatsappNumber = /^\d{10,15}$/.test(wa) ? wa : DEFAULT_SETTINGS.whatsappNumber;
    siteSettings.deliveryEnabled = d.deliveryEnabled !== false;
    siteSettings.pickupEnabled = d.pickupEnabled !== false;
    siteSettings.address = typeof d.address === 'string' && d.address.trim() ? d.address.trim() : DEFAULT_SETTINGS.address;
    siteSettings.city = typeof d.city === 'string' && d.city.trim() ? d.city.trim() : DEFAULT_SETTINGS.city;
    siteSettings.mapsLink = typeof d.mapsLink === 'string' && /^https?:\/\//.test(d.mapsLink) ? d.mapsLink : '';

    const saved = (d.hours ?? {}) as Partial<Record<DayKey, HoursSetting>>;
    const time = /^([01]\d|2[0-3]):[0-5]\d$/;
    const hours = { ...DEFAULT_SETTINGS.hours };
    for (const day of DAY_ORDER) {
      const h = saved[day];
      if (h && time.test(h.open) && time.test(h.close)) {
        hours[day] = { open: h.open, close: h.close, closed: h.closed === true };
      }
    }
    siteSettings.hours = hours;
    applyHours(hours);
  } catch {
    // se quedan los ajustes originales
  }
}
