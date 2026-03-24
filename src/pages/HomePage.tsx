import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, menuItems } from '../data/menuData';

const topItems = menuItems.filter(item => item.tags?.includes('popular')).slice(0, 4);

export default function HomePage() {
  return (
    <div className="theme-page bg-[#050505] text-white">
      {/* ── HERO ── */}
      <section className="section-shell grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="anim-fade-right">
          <h1 className="brand-pixel-card w-fit max-w-full">
            <span className="brand-pixel-line brand-pixel-line--top">MUCHA</span>
            <span className="brand-pixel-line brand-pixel-line--bottom mt-3">MAZORCA</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
            Somos un restaurante creado para que disfrutes
cada bocado. Nuestra especialidad es cocinar
con amor y convertir tus ideas en verdaderas
obras de sabor.
Arma tus salchipapas y maicitos a tu antojo… ¡te
esperamos!   🌽🔥
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              to="/menu"
              className="w-full rounded-full bg-[#FFD60A] px-7 py-4 text-center text-sm font-extrabold uppercase tracking-[0.15em] text-black shadow-[0_6px_20px_rgba(255,214,10,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#FFE45C] sm:w-auto"
            >
              Explorar menú
            </Link>
            <Link
              to="/contacto"
              className="btn-secondary w-full sm:w-auto"
            >
              Contactate con MM
            </Link>
          </div>
        </div>

        <div className="anim-fade-left mx-auto w-full max-w-[430px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[32px] bg-[#FFD60A]" />
            <div className="relative h-full w-full overflow-hidden rounded-[32px] border-4 border-[#FFD60A] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <img
                src={getImageUrl('Fondo 1.png')}
                alt="Mucha Mazorca especial"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP productos ── */}
      <section className="theme-home-top bg-[#0e0e12] py-20">
        <div className="section-shell">
          <div className="anim-fade-up text-center">
            <h2 className="title-pixel text-4xl font-black text-white sm:text-5xl">
              <span>NUESTROS</span>{' '}
              <span className="text-yellow-300">TOP 🔥</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {topItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/menu?categoria=${item.categoryId}&producto=${item.id}`}
                className={`anim-fade-up overflow-hidden rounded-[24px] border-2 border-yellow-400/20 bg-[#131318] shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1.5 hover:border-yellow-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.38)] ${
                  idx === 0 ? 'anim-delay-1' : 'anim-delay-2'
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  {(item.imageHero || item.image) && (
                    <img
                      src={item.imageHero || item.image!}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="absolute bottom-4 right-4 rounded-full bg-[#FFD60A] px-4 py-1.5 text-sm font-black text-black shadow-lg">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="title-pixel text-xl leading-snug text-white">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
