import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, getSizedImageUrl, menuItems } from '../data/menuData';
import PromoBanner from '../components/PromoBanner';
import { getText } from '../data/siteSettings';

const topItems = menuItems.filter(item => item.tags?.includes('popular')).slice(0, 4);

export default function HomePage() {
  const topsTrackRef = useRef<HTMLDivElement>(null);
  const [activeTop, setActiveTop] = useState(0);

  const goToTop = (index: number) => {
    const track = topsTrackRef.current;
    if (!track) return;

    const nextIndex = Math.max(0, Math.min(index, topItems.length - 1));
    const card = track.children[nextIndex] as HTMLElement | undefined;
    if (!card) return;

    setActiveTop(nextIndex);
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  };

  const updateActiveTop = () => {
    const track = topsTrackRef.current;
    if (!track) return;

    const trackLeft = track.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    Array.from(track.children).forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveTop(nearestIndex);
  };

  return (
    <div className="theme-page bg-[#050505] text-white">
      {/* ── HERO ── */}
      <section className="section-shell grid min-h-[min(75vh,720px)] items-center gap-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="anim-fade-right">
          <h1 className="brand-pixel-card w-fit max-w-full">
            <span className="brand-pixel-line brand-pixel-line--top">MUCHA</span>
            <span className="brand-pixel-line brand-pixel-line--bottom mt-3">MAZORCA</span>
          </h1>
          <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-8 text-white/75 sm:text-lg">
            {getText('heroText')}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              to="/menu"
              className="w-full rounded-full bg-yellow-400 px-7 py-4 text-center text-sm font-extrabold uppercase tracking-[0.15em] text-black shadow-[0_6px_20px_rgba(255,214,10,0.22)] transition-all hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto"
            >
              {getText('heroButton1')}
            </Link>
            <Link
              to="/contacto"
              className="btn-secondary w-full sm:w-auto"
            >
              {getText('heroButton2')}
            </Link>
          </div>
        </div>

        <div className="anim-fade-left mx-auto w-full max-w-[430px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[32px] bg-yellow-400" />
            <div className="relative h-full w-full overflow-hidden rounded-[32px] border-4 border-yellow-400 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <img
                src={getSizedImageUrl(getImageUrl('FONDO1.jpg'), 960)}
                alt="Mucha Mazorca especial"
                className="h-full w-full object-cover object-[center_85%]"
                loading="eager"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 430px"
              />
            </div>
          </div>
        </div>
      </section>

      <PromoBanner />

      {/* ── TOP productos ── */}
      <section className="theme-home-top overflow-hidden bg-[#0e0e12] py-14 sm:py-16">
        <div className="section-shell">
          <div className="flex items-center justify-between gap-4">
            <h2 className="title-pixel flex min-w-0 items-center gap-3 text-2xl font-black text-white sm:gap-4 sm:text-3xl lg:text-4xl">
              <svg
                aria-hidden="true"
                viewBox="0 0 48 48"
                className="h-8 w-8 shrink-0 text-yellow-300 sm:h-10 sm:w-10"
                fill="currentColor"
              >
                <path d="M7 39h34v4H7zm2-3-3-21 10 7L24 7l8 15 10-7-3 21H9zm6-4h18l1-9-8 6-7-11-6 11-7-5 1 8z" />
              </svg>
              <span className="min-w-0">
                <span>{getText('topTitleA')}</span>{' '}
                <span className="text-yellow-300">{getText('topTitleB')}</span>
              </span>
            </h2>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Ver tops anteriores"
                onClick={() => goToTop(activeTop - 1)}
                disabled={activeTop === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/70 text-yellow-300 transition-colors hover:bg-yellow-400 hover:text-black disabled:border-white/20 disabled:text-white/40 disabled:hover:bg-transparent disabled:hover:text-white/40 sm:h-11 sm:w-11"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6M9 12h12" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Ver siguientes tops"
                onClick={() => goToTop(activeTop + 1)}
                disabled={activeTop === topItems.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/70 text-yellow-300 transition-colors hover:bg-yellow-400 hover:text-black disabled:border-white/20 disabled:text-white/40 disabled:hover:bg-transparent disabled:hover:text-white/40 sm:h-11 sm:w-11"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6m6 6H3" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={topsTrackRef}
            onScroll={updateActiveTop}
            className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-5 pt-1 sm:mt-9 sm:gap-5"
            style={{ scrollbarWidth: 'none' }}
          >
            {topItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/menu?categoria=${item.categoryId}&producto=${item.id}`}
                aria-label={`${item.name}, puesto ${idx + 1}, ${formatPrice(item.price)}`}
                className={`group relative w-[min(78vw,270px)] shrink-0 snap-start overflow-hidden rounded-[20px] border-2 bg-[#131318] shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300 hover:shadow-[0_0_30px_rgba(255,214,10,0.18)] sm:w-[270px] ${
                  activeTop === idx
                    ? 'border-yellow-400 shadow-[0_0_26px_rgba(255,214,10,0.2)]'
                    : 'border-yellow-400/20'
                }`}
              >
                <div className="relative h-36 overflow-hidden sm:h-40">
                  {(item.imageHero || item.image) && (
                    <img
                      src={getSizedImageUrl(item.imageHero || item.image!, 720)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 78vw, 270px"
                    />
                  )}
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-black shadow-lg">
                    #{idx + 1}
                  </span>
                </div>
                <div className="min-h-[94px] bg-gradient-to-b from-[#18181d] to-[#111115] px-4 py-3 text-center">
                  <h3 className="title-pixel line-clamp-1 text-sm leading-snug text-white sm:text-base">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">{item.description}</p>
                  <span className="mt-2 inline-block text-xs font-bold text-yellow-300">{formatPrice(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-2" aria-label="Seleccionar top">
            {topItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ir al top ${idx + 1}: ${item.name}`}
                aria-current={activeTop === idx ? 'true' : undefined}
                onClick={() => goToTop(idx)}
                className={`h-3 rounded-full transition-all ${
                  activeTop === idx ? 'w-3 bg-yellow-300' : 'w-3 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
