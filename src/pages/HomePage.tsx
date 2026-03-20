import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, menuItems } from '../data/menuData';

const topItems = menuItems.filter(item => item.tags?.includes('popular')).slice(0, 2);

export default function HomePage() {
  return (
    <div>
      <section className="section-shell grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="anim-fade-right">
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-300">El sabor urbano definitivo</span>
          <h1 className="mt-4 text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            <span className="font-display">SABOREA LA</span>
            <br />
            <span className="font-display text-yellow-400">PERFECCIÓN</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-zinc-300 sm:text-lg">
            Mazorcadas y salchipapas creadas con ingredientes premium para paladares que buscan lo mejor de Cúcuta.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="rounded-lg bg-yellow-400 px-7 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-black transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Explorar menú
            </Link>
            <Link
              to="/contacto"
              className="rounded-lg border border-zinc-700 px-7 py-4 text-sm font-extrabold uppercase tracking-[0.15em] text-white transition-colors hover:border-yellow-400 hover:text-yellow-300"
            >
              Contacto
            </Link>
          </div>
        </div>

        <div className="anim-fade-left mx-auto w-full max-w-[430px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[24px] border-2 border-yellow-400/70" />
            <div className="h-full w-full overflow-hidden rounded-[24px] border border-[#d1b07a] bg-[#8a673d]">
              <img
                src={getImageUrl('QUETZALCOATL.png')}
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

      <section className="bg-[linear-gradient(180deg,#7b5a34_0%,#a0743d_100%)] py-20">
        <div className="section-shell">
          <div className="anim-fade-up text-center">
            <h2 className="text-4xl text-white sm:text-5xl">
              <span className="font-display">NUESTROS</span>{' '}
              <span className="font-display text-yellow-400">TOP 🔥</span>
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
                  {item.image && (
                    <img
                      src={item.image}
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
