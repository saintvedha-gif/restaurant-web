import { useEffect, useMemo, useState, type ReactNode } from 'react';
import twemoji from '@twemoji/api';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../data/menuData';

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/muchamazork', handle: '@muchamazork' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@muchamazorca', handle: '@muchamazorca' },
];

type DayKey = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

const OPENING_HOURS: Record<DayKey, { open: number; close: number }> = {
  lunes: { open: 17 * 60, close: 22 * 60 },
  martes: { open: 17 * 60, close: 22 * 60 },
  miercoles: { open: 17 * 60, close: 22 * 60 },
  jueves: { open: 17 * 60, close: 22 * 60 },
  viernes: { open: 18 * 60, close: 23 * 60 },
  sabado: { open: 18 * 60, close: 23 * 60 },
  domingo: { open: 18 * 60, close: 23 * 60 },
};

function normalizeDay(value: string): DayKey {
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
    hour,
    minute,
  };
}

function isOpenNow(day: DayKey, minutesOfDay: number) {
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

export default function SiteLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockTick, setClockTick] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const location = useLocation();

  const parseTwemoji = () => {
    twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const parseTimer = window.setTimeout(() => {
      parseTwemoji();
    }, 0);

    return () => window.clearTimeout(parseTimer);
  }, [location.pathname, mobileMenuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(current => current + 1);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateFloatingVisibility = () => {
      const isHomePage = location.pathname === '/' || location.pathname === '';
      if (!isHomePage) {
        setShowFloatingActions(false);
        return;
      }

      if (window.innerWidth >= 640) {
        setShowFloatingActions(true);
        return;
      }

      if (window.scrollY > 220) {
        setShowFloatingActions(true);
      }
    };

    updateFloatingVisibility();
    window.addEventListener('scroll', updateFloatingVisibility, { passive: true });
    window.addEventListener('resize', updateFloatingVisibility);

    return () => {
      window.removeEventListener('scroll', updateFloatingVisibility);
      window.removeEventListener('resize', updateFloatingVisibility);
    };
  }, [location.pathname]);

  const openNow = useMemo(() => {
    const now = getCurrentColombiaTime();
    const minutesOfDay = now.hour * 60 + now.minute;
    return isOpenNow(now.day, minutesOfDay);
  }, [clockTick]);

  return (
    <div className="theme-page relative min-h-screen bg-[linear-gradient(180deg,#050505_0%,#0a0a0d_55%,#111114_100%)] text-[#F5F5F5]">
      <div className="theme-topbar relative z-0 border-b border-yellow-400/15 bg-[linear-gradient(90deg,#090909_0%,#111114_70%,#17171c_100%)]">
        <div className="section-shell py-2 text-xs font-semibold">
          {/* Fila 1: redes + estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SocialIcon href="https://www.instagram.com/muchamazork" label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" className="fill-current stroke-none" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@muchamazorca" label="TikTok">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M14.8 3h2.2c.2 1.9 1.5 3.6 3.4 4.2v2.3a7.2 7.2 0 0 1-3.4-1.1v6.4a5.1 5.1 0 1 1-5.1-5.1c.3 0 .7 0 1 .1v2.3a2.8 2.8 0 1 0 1.9 2.7V3z" />
                </svg>
              </SocialIcon>
            </div>

            {/* Badge estado: pill con color de fondo */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-black uppercase tracking-[0.08em] ${
              openNow
                ? 'border border-[#8ED3A5] bg-[#CFF5D6] text-[#2D7A3E]'
                : 'border border-[#8A2A43] bg-[#5B1022] text-[#F6CDD7]'
            }`}>
              <span className={`h-2 w-2 rounded-full ${openNow ? 'bg-[#5FBF7A]' : 'bg-[#C05A78]'}`} />
              {openNow ? 'Abierto ahora' : 'Cerrado ahora'}
            </span>

            {/* Ubicación — solo en desktop */}
            <p className="hidden font-semibold sm:block">📍 Cúcuta, Norte de Santander</p>
          </div>

          {/* Fila 2: ubicación en móvil */}
          <p className="mt-1 text-center font-semibold sm:hidden">📍 Cúcuta, Norte de Santander</p>
        </div>
      </div>

      <header className="theme-header anim-fade-down sticky top-0 z-40 border-b border-yellow-400/15 bg-[linear-gradient(90deg,#090909_0%,#101014_60%,#18181d_100%)] shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <NavLink to="/" className="theme-logo flex items-center gap-2 leading-none">
            <span className="logo-corn text-[1.45rem] drop-shadow-[0_6px_12px_rgba(255,214,10,0.15)] sm:text-[1.8rem] md:text-[2rem]">🌽</span>
            <span className="title-pixel text-[0.82rem] font-black leading-none text-white sm:text-[1rem] md:text-[1.2rem]">
              MUCHA
            </span>
            <span className="theme-logo-accent title-pixel text-[0.82rem] font-black leading-none sm:text-[1rem] md:text-[1.2rem]">
              MAZORCA
            </span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(current => !current)}
            className="theme-menu-button inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 text-yellow-300 transition-colors hover:bg-yellow-400/15 md:hidden"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-xl leading-none">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/menu">Menú</NavItem>
            <NavItem to="/galeria">Galería</NavItem>
            <NavItem to="/contacto" asCta>
              <span className="title-pixel">Pide ahora</span>
            </NavItem>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="theme-mobile-panel border-t border-yellow-400/15 bg-[linear-gradient(90deg,#090909_0%,#15151a_100%)] md:hidden">
            <div className="section-shell grid gap-3 py-4">
              <MobileNavItem to="/">Inicio</MobileNavItem>
              <MobileNavItem to="/menu">Menú</MobileNavItem>
              <MobileNavItem to="/galeria">Galería</MobileNavItem>
              <MobileNavItem to="/contacto" asCta><span className="title-pixel">Pide ahora</span></MobileNavItem>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-0">
        <Outlet />
      </main>

      {showFloatingActions && (
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-3 sm:bottom-6 sm:right-5">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#00C853] text-white shadow-[0_12px_24px_rgba(0,200,83,0.35)] transition-colors duration-200 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:font-bold"
        >
          <span className="text-base">💬</span>
          <span className="hidden sm:inline">¡Pide ya!</span>
        </a>
      </div>
      )}

      <footer className="theme-footer relative z-0 mt-16 border-t border-yellow-400/15 bg-[linear-gradient(180deg,#101014_0%,#050505_100%)] pb-8 pt-14">
        <div className="section-shell grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-none">
              <span className="logo-corn text-[1.5rem] drop-shadow-[0_6px_12px_rgba(255,214,10,0.15)]">🌽</span>
              <span className="title-pixel text-[0.82rem] font-black text-white sm:text-[1rem]">MUCHA</span>
              <span className="title-pixel text-[0.82rem] font-black text-yellow-400 sm:text-[1rem]">MAZORCA</span>
            </p>
            <p className="mt-4 text-sm leading-7 text-white/70">
              ¡Tu antojo, tu combinacion, tu Mucha Mazorca!💛🌽
            </p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-300">Horario</p>
            <p className="mt-3 text-sm text-white/70">Lun - Jue: 5:00 PM - 10:00 PM</p>
            <p className="mt-2 text-sm text-white/70">Vie - Dom: 6:00 PM - 11:00 PM</p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-300">Contacto</p>
            <p className="mt-3 text-sm leading-7 text-white/70">Cl. 41 #58, Barrio Bogota </p>
            <p className="text-sm text-white/70">Cúcuta, Norte de Santander</p>
            <div className="mt-3 space-y-2">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-semibold text-white/70 transition-colors hover:text-[#FFD60A]"
                >
                  {social.name} · {social.handle}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="section-shell mt-12 border-t border-yellow-400/10 pt-6 text-xs text-white/45">
          © 2026 Mucha Mazorca - Diseño Profesional Full Stack
        </p>
      </footer>
    </div>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="theme-social inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-yellow-400/25 bg-yellow-400/10 text-yellow-300 transition-colors hover:bg-yellow-400/15 hover:border-yellow-400/40"
    >
      {children}
    </a>
  );
}

function NavItem({ to, children, asCta = false }: { to: string; children: ReactNode; asCta?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        asCta
          ? 'theme-nav-cta inline-flex items-center justify-center rounded-lg px-4 py-2 text-center text-sm font-extrabold uppercase tracking-[0.14em] transition-colors'
          : `theme-nav-link text-sm font-bold transition-colors ${isActive ? 'theme-nav-link-active underline underline-offset-4 decoration-2' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavItem({ to, children, asCta = false }: { to: string; children: ReactNode; asCta?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        asCta
          ? 'theme-mobile-nav-cta rounded-2xl px-4 py-4 text-center text-sm font-extrabold uppercase tracking-[0.14em] transition-colors'
              : `theme-mobile-nav-link rounded-2xl border px-4 py-4 text-center text-sm font-bold transition-colors ${isActive ? 'theme-mobile-nav-link-active' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}
