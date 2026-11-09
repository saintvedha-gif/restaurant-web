import { useEffect, useState } from 'react';
import { OPENING_HOURS, getCurrentColombiaTime, isOpenNow } from '../data/openingHours';
import type { DayKey } from '../data/openingHours';
import { DELIVERY_CONFIG } from '../data/deliveryConfig';

const DAYS: DayKey[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

const DAY_NAMES: Record<DayKey, string> = {
  domingo: 'el domingo',
  lunes: 'el lunes',
  martes: 'el martes',
  miercoles: 'el miércoles',
  jueves: 'el jueves',
  viernes: 'el viernes',
  sabado: 'el sábado',
};

function getNextOpening(day: DayKey, minutes: number): string {
  const today = OPENING_HOURS[day];
  if (!today.closed && minutes < today.open) return `hoy a las ${formatTime(today.open)}`;
  for (let i = 1; i <= 7; i++) {
    const next = DAYS[(DAYS.indexOf(day) + i) % 7];
    const h = OPENING_HOURS[next];
    if (!h.closed) return `${i === 1 ? 'mañana' : DAY_NAMES[next]} a las ${formatTime(h.open)}`;
  }
  return 'pronto';
}

interface TimeRowProps {
  label: string;
  min: number;
  max: number;
}

function TimeRow({ label, min, max }: TimeRowProps) {
  const fill = Math.min(100, Math.round((max / 90) * 100));
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{label}</span>
        <span className="text-sm font-black text-yellow-300">
          {min}-{max} min
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-700"
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}

interface Props {
  embedded?: boolean;
}

export default function StatusBar({ embedded = false }: Props) {
  const [now, setNow] = useState(() => getCurrentColombiaTime());

  useEffect(() => {
    const id = window.setInterval(() => setNow(getCurrentColombiaTime()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const open = isOpenNow(now.day, now.minutes);

  const card = (
    <div className="rounded-[20px] border border-yellow-400/20 bg-[#131318] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.26)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="relative flex h-3 w-3">
          {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C853] opacity-60" />}
          <span className={`relative inline-flex h-3 w-3 rounded-full ${open ? 'bg-[#00C853]' : 'bg-red-500'}`} />
        </span>
        <span className="text-sm font-black uppercase tracking-[0.1em] text-white">
          {open ? 'Abierto ahora' : 'Cerrado'}
        </span>
        <span className="text-xs text-white/60">
          {open
            ? `Hoy hasta las ${formatTime(OPENING_HOURS[now.day].close)}`
            : `Abrimos ${getNextOpening(now.day, now.minutes)}`}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
        <TimeRow label="🛵 Domicilio" min={DELIVERY_CONFIG.deliveryMin} max={DELIVERY_CONFIG.deliveryMax} />
        <TimeRow label="🏃 Recoger" min={DELIVERY_CONFIG.pickupMin} max={DELIVERY_CONFIG.pickupMax} />
      </div>
    </div>
  );

  if (embedded) return <div className="mb-5">{card}</div>;
  return <section className="section-shell pt-4">{card}</section>;
}
