import { Link } from 'react-router-dom';
import { promos } from '../data/promos';
import { getSizedImageUrl } from '../data/menuData';
import { describeDiscount, isPromoActiveNow } from '../utils/promoEngine';

export default function PromoBanner() {
  const visibles = promos.filter(isPromoActiveNow);

  if (visibles.length === 0) return null;

  return (
    <section className="section-shell py-10">
      <h2 className="title-pixel text-2xl font-black text-white sm:text-3xl">
        PROMOS <span className="text-yellow-300">🔥</span>
      </h2>
      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none]">
        {visibles.map(p => (
          <Link
            key={p.id}
            to={p.link ?? '/menu'}
            className="group relative min-h-[170px] w-[85%] max-w-[380px] shrink-0 snap-start overflow-hidden rounded-[24px] border-2 border-yellow-400/30 bg-[#131318] shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-1 hover:border-yellow-300 sm:w-[340px]"
          >
            {p.image && (
              <img
                src={getSizedImageUrl(p.image, 640)}
                alt={p.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="relative flex h-full min-h-[170px] flex-col justify-end p-5">
              <span className="mb-2 w-fit rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                {p.badge}
              </span>
              <h3 className="title-pixel text-lg leading-snug text-white">{p.title}</h3>
              <p className="mt-1 text-sm text-white/70">
                {p.subtitle || (p.type !== 'none' ? describeDiscount(p) : '')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
