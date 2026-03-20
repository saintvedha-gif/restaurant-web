import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, menuItems } from '../data/menuData';

const topItems = menuItems.filter(item => item.tags?.includes('popular')).slice(0, 4);

export default function HomePage() {
  return (
    <div>
      <section className="section-shell grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="anim-fade-right">
          <span className="inline-flex rounded-full border border-[#fffefb] bg-[#f0c648]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.28em] text-[#f0d27d]">🔥 Sabor que antoja</span>
          <h1 className="mt-4 leading-[0.92]">
            <span className="block font-display text-6xl text-[#ffffff] sm:text-7xl lg:text-8xl">SOMOS</span>
            <span className="mt-1 block font-display text-4xl text-[#f2c94c] sm:text-5xl lg:text-6xl">MUCHA MAZORCA</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-zinc-300 sm:text-lg">
            Somos Mucha Mazorca, el restaurante que te permite armar tus salchipapas a tu gusto con los mejores ingredientes de la ciudad. ¡Pide hoy y date ese gustico bien cargado! 🌽🔥
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="rounded-lg bg-[#f0c648] px-7 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-black transition-all hover:-translate-y-0.5 hover:bg-[#f7e2a4]"
            >
              Explorar menú
            </Link>
            <Link
              to="/contacto"
              className="rounded-lg border border-[#c7aa75] px-7 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:border-[#f0c648] hover:text-[#f0d27d]"
            >
              Contacto
            </Link>
          </div>
        </div>

        <div className="anim-fade-left mx-auto w-full max-w-[430px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[24px] border-2 border-[#e5bc52]/65" />
            <div className="h-full w-full overflow-hidden rounded-[24px] border border-[#d1b07a] bg-[#84633a]">
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

      <section className="bg-[linear-gradient(180deg,#765733_0%,#906c3f_100%)] py-20">
        <div className="section-shell">
          <div className="anim-fade-up text-center">
            <h2 className="text-4xl text-white sm:text-5xl">
              <span className="font-display">NUESTROS</span>{' '}
              <span className="font-display text-[#f2c94c]">TOP 🔥</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {topItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/menu?categoria=${item.categoryId}&producto=${item.id}`}
                className={`anim-fade-up overflow-hidden rounded-[24px] border border-[#d1b07a] bg-[#8a673d] transition-all hover:-translate-y-1.5 hover:border-yellow-400/70 ${
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
                  <span className="absolute bottom-4 right-4 rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-black text-black">
                    {formatPrice(item.price)}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
