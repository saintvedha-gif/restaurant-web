import { useEffect, useMemo, useState } from 'react';
import { WHATSAPP_NUMBER } from '../data/menuData';

const LOCATION_LABEL = 'Cucuta, Colombia';
const INSTAGRAM_HANDLE = '@muchamazork';
const MAPS_QUERY = '7.8761769,-72.4871155';
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;
const MAPS_LINK = 'https://maps.app.goo.gl/fuBfCxAti2QiLeNx6?g_st=aw';

type DayKey = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

const SERVICE_TYPES = [
  { id: 'domicilio', name: 'A domicilio', note: 'Entrega gratuita.' },
  { id: 'llevar', name: 'Para llevar' },
  { id: 'local', name: 'En el local' },
];

const DAY_ORDER: DayKey[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const OPENING_HOURS: Record<DayKey, { open: number; close: number; label: string }> = {
  lunes: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  martes: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  miercoles: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  jueves: { open: 17 * 60, close: 22 * 60, label: '5:00 PM - 10:00 PM' },
  viernes: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
  sabado: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
  domingo: { open: 18 * 60, close: 23 * 60, label: '6:00 PM - 11:00 PM' },
};

function normalizeDay(value: string): DayKey {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'miercoles') return 'miercoles';
  if (normalized === 'sabado') return 'sabado';
  if (normalized === 'domingo') return 'domingo';
  if (normalized === 'lunes') return 'lunes';
  if (normalized === 'martes') return 'martes';
  if (normalized === 'jueves') return 'jueves';
  return 'viernes';
}

function getCurrentColombiaTime() {
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
    minutes: hour * 60 + minute,
    timeLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

export default function ContactPage() {
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(tick => tick + 1);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const currentStatus = useMemo(() => {
    const now = getCurrentColombiaTime();
    const today = OPENING_HOURS[now.day];
    const isOpen = now.minutes >= today.open && now.minutes < today.close;

    return {
      isOpen,
      day: now.day,
      timeLabel: now.timeLabel,
      statusLabel: isOpen ? 'Abierto ahora' : 'Cerrado ahora',
      helperLabel: isOpen ? `Hasta las ${today.label.split(' - ')[1]}` : `Hoy abre de ${today.label}`,
    };
  }, [clockTick]);

  return (
    <div className="section-shell py-8 sm:py-12">
      <section className="rounded-[28px] border border-[#d1b07a] bg-[#7b5a34] p-4 shadow-[0_16px_34px_rgba(48,30,12,0.28)] sm:p-6 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
              <h2 className="text-2xl text-zinc-100"><span className="font-display">Ubicacion</span></h2>
              <p className="mt-2 text-zinc-300">{LOCATION_LABEL}</p>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2563eb]"
              >
                Como llegar
              </a>
            </article>

            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
              <h2 className="text-2xl text-zinc-100"><span className="font-display">WhatsApp</span></h2>
              <p className="mt-2 text-zinc-300">+57 350 338 4530</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-[#10b981] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#059669]"
              >
                Enviar mensaje
              </a>
            </article>

            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
              <h2 className="text-2xl text-zinc-100"><span className="font-display">Instagram</span></h2>
              <p className="mt-2 text-zinc-300">{INSTAGRAM_HANDLE}</p>
              <a
                href="https://www.instagram.com/muchamazork?igsh=am82a3lsM2ExZ2lm"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full bg-[linear-gradient(90deg,#7c3aed_0%,#ec4899_100%)] px-5 py-2.5 text-sm font-bold text-white"
              >
                Seguir
              </a>
            </article>
          </div>

          <div className="space-y-4">
            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
              <h2 className="text-2xl text-zinc-100"><span className="font-display">Tipos de servicio</span></h2>
              <div className="mt-4 space-y-3">
                {SERVICE_TYPES.map(service => (
                  <div key={service.id} className="rounded-xl border border-[#d1b07a] bg-[#7b5a34] p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-100">{service.name}</p>
                      <span className="text-emerald-300">✓</span>
                    </div>
                    {service.note && <p className="mt-1 text-sm text-zinc-300">{service.note}</p>}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl text-zinc-100"><span className="font-display">Horarios de atencion</span></h2>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ${
                    currentStatus.isOpen
                      ? 'bg-emerald-500/20 text-emerald-200'
                      : 'bg-rose-500/20 text-rose-200'
                  }`}
                >
                  {currentStatus.statusLabel}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">Hora actual Cúcuta: {currentStatus.timeLabel} · {currentStatus.helperLabel}</p>

              <div className="mt-4 space-y-2">
                {DAY_ORDER.map(day => {
                  const schedule = OPENING_HOURS[day];
                  const isToday = day === currentStatus.day;

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        isToday ? 'bg-yellow-400/15 text-yellow-200' : 'text-zinc-200'
                      }`}
                    >
                      <span className="capitalize">{day}</span>
                      <span>{schedule.label}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[22px] border border-[#d1b07a] bg-[#8a673d] p-5">
            <h2 className="text-2xl text-zinc-100"><span className="font-display">Encuentra nuestra ubicacion</span></h2>
            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#d1b07a]">
              <iframe
                title="Mapa Mucha Mazorca"
                src={MAPS_EMBED}
                loading="lazy"
                className="h-[420px] w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-[linear-gradient(90deg,#fb923c_0%,#f97316_100%)] px-5 py-2.5 text-sm font-bold text-white"
            >
              Como llegar
            </a>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
