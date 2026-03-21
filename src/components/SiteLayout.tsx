import { useEffect, useMemo, useState, type ReactNode } from 'react';
import twemoji from '@twemoji/api';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../data/menuData';

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/muchamazork', handle: '@muchamazork' },
  { name: 'Facebook', href: 'https://www.facebook.com', handle: 'Mucha Mazorca' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@muchamazorca', handle: '@muchamazorca' },
];

type DayKey = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';
type ThemeMode = 'light' | 'dark';

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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const location = useLocation();

  const parseTwemoji = () => {
    twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let frameId = 0;

    const scheduleParse = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        parseTwemoji();
      });
    };

    scheduleParse();

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.addedNodes.length > 0) {
          scheduleParse();
          break;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    parseTwemoji();
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    window.localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick(current => current + 1);
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const openNow = useMemo(() => {
    const now = getCurrentColombiaTime();
    const minutesOfDay = now.hour * 60 + now.minute;
    return isOpenNow(now.day, minutesOfDay);
  }, [clockTick]);

  return (
    <div className="theme-page min-h-screen bg-[linear-gradient(180deg,#FFECD2_0%,#FFF3E0_55%,#FFE4C2_100%)] text-[#4A2800]">
      <div className="corn-bg pointer-events-none fixed inset-0 z-50 select-none" aria-hidden="true" />
      <div className="theme-topbar border-b border-[#CC5500]/40 bg-[linear-gradient(90deg,#FF6D00_0%,#FF8C00_50%,#FFD60A_100%)]">
        <div className="section-shell py-2 text-xs font-semibold">
          {/* Fila 1: redes + estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SocialIcon href="https://www.facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v6h3v-6h3l.5-3H12v-2.5c0-.8.7-1.5 1.5-1.5z" />
                </svg>
              </SocialIcon>
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
                ? 'bg-[#4A2800]/15 text-[#4A2800] border border-[#4A2800]/30'
                : 'bg-[#FF3D00]/20 text-[#7A0000] border border-[#FF3D00]/40'
            }`}>
              <span className={`h-2 w-2 rounded-full ${openNow ? 'bg-[#00A843]' : 'bg-[#FF3D00]'}`} />
              {openNow ? 'Abierto ahora' : 'Cerrado ahora'}
            </span>

            {/* Ubicación — solo en desktop */}
            <p className="hidden font-semibold sm:block">📍 Cúcuta, Norte de Santander</p>
          </div>

          {/* Fila 2: ubicación en móvil */}
          <p className="mt-1 text-center font-semibold sm:hidden">📍 Cúcuta, Norte de Santander</p>
        </div>
      </div>

      <header className="theme-header anim-fade-down sticky top-0 z-40 border-b border-[#FF6D00]/40 bg-[linear-gradient(90deg,#FF6D00_0%,#FF8C00_50%,#FFD60A_100%)] shadow-[0_8px_20px_rgba(255,109,0,0.4)]">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <NavLink to="/" className="theme-logo text-2xl leading-none tracking-tight sm:text-3xl">
            <span className="font-display"><span className="logo-corn">🌽</span> MUCHA</span>
            <span className="theme-logo-accent font-display drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">MAZORCA</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(current => !current)}
            className="theme-menu-button inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4A2800]/30 bg-[#4A2800]/15 text-[#4A2800] transition-colors hover:bg-[#4A2800]/25 md:hidden"
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
              Pide ahora
            </NavItem>
            <button
              type="button"
              onClick={() => setThemeMode(current => (current === 'light' ? 'dark' : 'light'))}
              className="theme-toggle"
              aria-label={themeMode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              title={themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {themeMode === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="theme-mobile-panel border-t border-[#4A2800]/20 bg-[linear-gradient(90deg,#FF6D00_0%,#FFD60A_100%)] md:hidden">
            <div className="section-shell grid gap-3 py-4">
              <MobileNavItem to="/">Inicio</MobileNavItem>
              <MobileNavItem to="/menu">Menú</MobileNavItem>
              <MobileNavItem to="/galeria">Galería</MobileNavItem>
              <MobileNavItem to="/contacto" asCta>Pide ahora</MobileNavItem>
              <button
                type="button"
                onClick={() => setThemeMode(current => (current === 'light' ? 'dark' : 'light'))}
                className="theme-toggle w-full"
                aria-label={themeMode === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                {themeMode === 'light' ? '🌙 Activar modo oscuro' : '☀️ Activar modo claro'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#00C853] text-white shadow-[0_12px_24px_rgba(0,200,83,0.35)] transition-transform hover:scale-[1.04] sm:bottom-6 sm:right-5 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:font-bold"
      >
        <span className="text-base">💬</span>
        <span className="hidden sm:inline">¡Pide ya!</span>
      </a>

      <footer className="theme-footer mt-16 border-t border-[#FF6D00]/30 bg-[linear-gradient(180deg,#FFF3E0_0%,#FFE4C2_100%)] pb-8 pt-14">
        <div className="section-shell grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-2xl leading-none tracking-tight text-[#4A2800]">
              <span className="font-display"><span className="logo-corn">🌽</span> MUCHA</span>
              <span className="font-display text-[#FF6D00]">MAZORCA</span>
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6A3A00]">
              ¡Tu antojo, tu combinacion, tu Mucha Mazorca!💛🌽
            </p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6D00]">Horario</p>
            <p className="mt-3 text-sm text-[#6A3A00]">Lun - Jue: 5:00 PM - 10:00 PM</p>
            <p className="mt-2 text-sm text-[#6A3A00]">Vie - Dom: 6:00 PM - 11:00 PM</p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6D00]">Contacto</p>
            <p className="mt-3 text-sm leading-7 text-[#6A3A00]">Cl. 41 #58, Barrio Bogota </p>
            <p className="text-sm text-[#6A3A00]">Cúcuta, Norte de Santander</p>
            <div className="mt-3 space-y-2">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-semibold text-[#6A3A00] transition-colors hover:text-[#FFD60A]"
                >
                  {social.name} · {social.handle}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="section-shell mt-12 border-t border-[#FF6D00]/15 pt-6 text-xs text-[#8A5A2A]">
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
      className="theme-social inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#4A2800]/25 bg-[#4A2800]/12 text-[#4A2800] transition-colors hover:bg-[#4A2800]/25 hover:border-[#4A2800]/50"
    >
      {children}
    </a>
  );
}

function NavItem({ to, children, asCta = false }: { to: string; children: string; asCta?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        asCta
          ? 'theme-nav-cta rounded-lg px-4 py-2 text-sm font-extrabold uppercase tracking-[0.14em] transition-colors'
          : `theme-nav-link text-sm font-bold transition-colors ${isActive ? 'theme-nav-link-active underline underline-offset-4 decoration-2' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavItem({ to, children, asCta = false }: { to: string; children: string; asCta?: boolean }) {
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
