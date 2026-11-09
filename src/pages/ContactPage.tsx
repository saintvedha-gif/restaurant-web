import { useEffect, useMemo, useState } from 'react';
import { DAY_ORDER as WEEK_ORDER, OPENING_HOURS, getCurrentColombiaTime, isOpenNow } from '../data/openingHours';
import { getContactInfo } from '../data/siteSettings';

const INSTAGRAM_HANDLE = '@muchamazork';

const SERVICE_TYPES: { id: string; name: string; note?: string }[] = [
  { id: 'domicilio', name: 'A domicilio' },
  { id: 'llevar', name: 'Para llevar' },
  { id: 'local', name: 'En el local' },
];

const DAY_ORDER = [...WEEK_ORDER];

export default function ContactPage() {
  const contact = getContactInfo();
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
    const isOpen = isOpenNow(now.day, now.minutes);

    return {
      isOpen,
      day: now.day,
      timeLabel: now.timeLabel,
      statusLabel: isOpen ? 'Abierto ahora' : 'Cerrado ahora',
      helperLabel: isOpen ? `Hasta las ${today.label.split(' - ')[1]}` : today.closed ? 'Hoy no abrimos' : `Hoy abre de ${today.label}`,
    };
  }, [clockTick]);

  return (
    <div className="section-shell py-8 sm:py-12">
      <section className="rounded-[28px] border border-yellow-400/18 bg-[#101014] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.3)] sm:p-6 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
              <h2 className="text-xl text-white"><span className="title-pixel">Ubicacion</span></h2>
              <p className="mt-2 text-white/70">{contact.address}, {contact.city}</p>
              <a
                href={contact.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-sm mt-4"
              >
                Como llegar
              </a>
            </article>

            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
              <h2 className="text-xl text-white"><span className="title-pixel">WhatsApp</span></h2>
              <p className="mt-2 text-white/70">{contact.whatsappDisplay}</p>
              <a
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-sm mt-4"
              >
                Enviar mensaje
              </a>
            </article>

            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
              <h2 className="text-xl text-white"><span className="title-pixel">Instagram</span></h2>
              <p className="mt-2 text-white/70">{INSTAGRAM_HANDLE}</p>
              <a
                href="https://www.instagram.com/muchamazork?igsh=am82a3lsM2ExZ2lm"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary-sm mt-4"
              >
                Seguir
              </a>
            </article>
          </div>

          <div className="space-y-4">
            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
              <h2 className="text-xl text-white"><span className="title-pixel">Tipos de servicio</span></h2>
              <div className="mt-4 space-y-3">
                {SERVICE_TYPES.map(service => (
                  <div key={service.id} className="rounded-xl border border-yellow-400/10 bg-[#101014] p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{service.name}</p>
                      <span className="text-yellow-300">✓</span>
                    </div>
                    {service.note && <p className="mt-1 text-sm text-white/65">{service.note}</p>}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl text-white"><span className="title-pixel">Horarios de atencion</span></h2>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ${
                    currentStatus.isOpen
                      ? 'border border-[#8ED3A5] bg-[#CFF5D6] text-[#2D7A3E]'
                      : 'border border-[#8A2A43] bg-[#5B1022] text-[#F6CDD7]'
                  }`}
                >
                  {currentStatus.statusLabel}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/65">Hora actual Cúcuta: {currentStatus.timeLabel} · {currentStatus.helperLabel}</p>

              <div className="mt-4 space-y-2">
                {DAY_ORDER.map(day => {
                  const schedule = OPENING_HOURS[day];
                  const isToday = day === currentStatus.day;

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        isToday ? 'bg-yellow-400/12 text-yellow-400 font-bold' : 'text-white/65'
                      }`}
                    >
                      <span className="capitalize">{day}</span>
                      <span>{schedule.label}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[22px] border border-yellow-400/15 bg-[#141419] p-5">
            <h2 className="text-xl text-white"><span className="title-pixel">Encuentra nuestra ubicacion</span></h2>
            <div className="mt-4 overflow-hidden rounded-[18px] border border-yellow-400/15">
              <iframe
                title="Mapa Mucha Mazorca"
                src={contact.mapsEmbed}
                loading="lazy"
                className="h-[420px] w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <a
              href={contact.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-sm mt-4"
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
