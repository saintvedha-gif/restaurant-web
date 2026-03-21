import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, menuItems } from '../data/menuData';

const topItems = menuItems.filter(item => item.tags?.includes('popular')).slice(0, 4);

export default function HomePage() {
  return (
    <div className="theme-page bg-[#FFECD2] text-[#4A2800]">
      {/* ── HERO ── */}
      <section className="section-shell grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="anim-fade-right">
          <h1 className="brand-pixel-card w-fit max-w-full">
            <span className="brand-pixel-line brand-pixel-line--top">MUCHA</span>
            <span className="brand-pixel-line brand-pixel-line--bottom mt-3">MAZORCA</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#4A2800] sm:text-lg">
            Somos un restaurante creado para que disfrutes
cada bocado. Nuestra especialidad es cocinar
con amor y convertir tus ideas en verdaderas
obras de sabor.
Arma tus salchipapas y maicitos a tu antojo… ¡te
esperamos!   🌽🔥
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="rounded-full bg-[#FF6D00] px-7 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_6px_20px_rgba(255,109,0,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#FF3D00]"
            >
              Explorar menú
            </Link>
            <Link
              to="/contacto"
              className="btn-secondary"
            >
              Contactate con MM
            </Link>
          </div>
        </div>

        <div className="anim-fade-left mx-auto w-full max-w-[430px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[32px] bg-[#FFD60A]" />
            <div className="relative h-full w-full overflow-hidden rounded-[32px] border-4 border-[#FFD60A] shadow-[0_20px_50px_rgba(255,109,0,0.25)]">
              <img
                src={getImageUrl('FONDO3.jpeg')}
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
      <section className="theme-home-top bg-[#FFD60A] py-20">
        <div className="section-shell">
          <div className="anim-fade-up text-center">
            <h2 className="text-4xl text-[#4A2800] sm:text-5xl">
              <span className="font-display">NUESTROS</span>{' '}
              <span className="font-display text-[#FF3D00]">TOP 🔥</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {topItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/menu?categoria=${item.categoryId}&producto=${item.id}`}
                className={`anim-fade-up overflow-hidden rounded-[24px] border-2 border-[#FF6D00]/40 bg-white shadow-[0_8px_28px_rgba(255,109,0,0.18)] transition-all hover:-translate-y-1.5 hover:border-[#FF6D00] hover:shadow-[0_16px_40px_rgba(255,109,0,0.35)] ${
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
                  <span className="absolute bottom-4 right-4 rounded-full bg-[#FF6D00] px-4 py-1.5 text-sm font-black text-white shadow-lg">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#4A2800]">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
