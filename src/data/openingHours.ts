export type DayKey = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

export const OPENING_HOURS: Record<DayKey, { open: number; close: number; label: string }> = {
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
  const currentDaySchedule = OPENING_HOURS[day];

  if (currentDaySchedule.close > 24 * 60) {
    return minutesOfDay >= currentDaySchedule.open;
  }

  if (minutesOfDay >= currentDaySchedule.open && minutesOfDay < currentDaySchedule.close) {
    return true;
  }

  const previousDay = (
    {
      domingo: 'sabado',
      lunes: 'domingo',
      martes: 'lunes',
      miercoles: 'martes',
      jueves: 'miercoles',
      viernes: 'jueves',
      sabado: 'viernes',
    } as const
  )[day];

  const previousDaySchedule = OPENING_HOURS[previousDay];
  if (previousDaySchedule.close > 24 * 60) {
    const overnightClose = previousDaySchedule.close - 24 * 60;
    return minutesOfDay < overnightClose;
  }

  return false;
}