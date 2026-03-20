import type { MenuItem } from '../types/menu';
import { formatPrice } from '../data/menuData';

interface Props {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function MenuCard({ item, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group w-full rounded-[18px] border border-[#d1b07a] bg-[#8a673d] p-3 text-left shadow-[0_10px_24px_rgba(48,30,12,0.28)] transition-all hover:-translate-y-0.5 hover:border-yellow-400/70 hover:shadow-[0_16px_34px_rgba(48,30,12,0.35)] sm:p-4"
    >
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-base sm:h-9 sm:w-9 sm:text-lg">
              {item.emoji}
            </span>
            <h3 className="text-base font-bold leading-tight text-zinc-100 transition-colors group-hover:text-yellow-300 sm:text-xl">
              {item.name}
            </h3>
            {item.tags?.includes('popular') && (
              <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-yellow-300">
                Popular
              </span>
            )}
            {item.tags?.includes('nuevo') && (
              <span className="rounded-full bg-[#9a7546] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-100">
                Nuevo
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-zinc-300">{item.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-base font-black text-yellow-300 sm:text-lg">{formatPrice(item.price)}</p>
            <span className="inline-flex items-center justify-center rounded-full border border-[#475569] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200">
              Ver detalle
            </span>
          </div>
        </div>

        {item.image && (
          <div className="shrink-0 overflow-hidden rounded-[12px] bg-[#7b5a34] ring-1 ring-[#dcb983]" style={{width: '88px', height: '88px'}}>
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width={88}
              height={88}
            />
          </div>
        )}
      </div>
    </button>
  );
}
