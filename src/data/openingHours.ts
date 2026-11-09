export type DayKey = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

export const OPENING_HOURS: Record<DayKey, { open: number; close: number; label: string; closed?: boolean }> = {
  lunes: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  martes: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  miercoles: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  jueves: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  viernes: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
  sabado: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
  domingo: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
};

export function normalizeDay(value: string): DayKey {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'domingo') return 'domingo';
  if (normalized === 'lunes') return 'lunes';
  if (normalized === 'martes') return 'martes';
  if (normalized === 'miercoles') return 'miercoles';
  if (normalized === 'jueves') return 'jueves';
  if (normalized === 'viernes') return 'viernes';
  return 'sabado';
}

export function getCurrentColombiaTime() {
  const formatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find(part => part.type === 'weekday')?.value ?? 'lunes';
  const hour = Number(parts.find(part => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find(part => part.type === 'minute')?.value ?? '0');

  return {
    day: normalizeDay(weekday),
    hour,
    minute,
    minutes: hour * 60 + minute,
    timeLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

export function isOpenNow(day: DayKey, minutesOfDay: number): boolean {
  const today = OPENING_HOURS[day];
  if (!today.closed) {
    if (minutesOfDay >= today.open && minutesOfDay < Math.min(today.close, 24 * 60)) return true;
  }

  // Horario que pasa de medianoche: el dia anterior sigue abierto en la madrugada
  const previous = OPENING_HOURS[DAY_ORDER[(DAY_ORDER.indexOf(day) + 6) % 7]];
  if (!previous.closed && previous.close > 24 * 60) {
    return minutesOfDay < previous.close - 24 * 60;
  }

  return false;
}

export interface HoursSetting {
  open: string; // 'HH:MM'
  close: string; // 'HH:MM'
  closed: boolean;
}

export const DAY_ORDER: DayKey[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
export const DAY_LABELS: Record<DayKey, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};
const DAY_SHORT: Record<DayKey, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};

export function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Aplica el horario guardado en el panel sobre OPENING_HOURS.
export function applyHours(hours: Record<DayKey, HoursSetting>): void {
  for (const day of DAY_ORDER) {
    const h = hours[day];
    const entry = OPENING_HOURS[day];
    if (h.closed) {
      entry.open = 0;
      entry.close = 0;
      entry.closed = true;
      entry.label = 'Cerrado';
      continue;
    }
    const open = toMinutes(h.open);
    let close = toMinutes(h.close);
    if (close <= open) close += 24 * 60; // cierra pasada la medianoche
    entry.open = open;
    entry.close = close;
    entry.closed = false;
    entry.label = `${formatClock(open)} - ${formatClock(close)}`;
  }
}

// Agrupa dias seguidos con el mismo horario: [{ days: 'Lun - Jue', label: '5:00 PM - 10:00 PM' }]
export function groupedHours(): { days: string; label: string }[] {
  const groups: { first: DayKey; last: DayKey; label: string }[] = [];
  for (const day of DAY_ORDER) {
    const label = OPENING_HOURS[day].label;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.last = day;
    else groups.push({ first: day, last: day, label });
  }
  return groups.map(g => ({
    days: g.first === g.last ? DAY_SHORT[g.first] : `${DAY_SHORT[g.first]} - ${DAY_SHORT[g.last]}`,
    label: g.label,
  }));
}
