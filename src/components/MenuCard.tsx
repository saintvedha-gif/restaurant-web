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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {item.image && (
          <div className="order-first h-44 w-full shrink-0 overflow-hidden rounded-[14px] bg-[#7b5a34] ring-1 ring-[#dcb983] sm:order-last sm:h-32 sm:w-32">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400/10 text-lg">
              {item.emoji}
            </span>
            <h3 className="text-lg leading-tight text-zinc-100 transition-colors group-hover:text-yellow-300 sm:text-xl">
              {item.name}
            </h3>
            {item.tags?.includes('popular') && (
              <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-yellow-300">
                Popular
              </span>
            )}
            {item.tags?.includes('nuevo') && (
              <span className="rounded-full bg-[#9a7546] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-100">
                Nuevo
              </span>
            )}
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300 sm:line-clamp-2">{item.description}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-black text-yellow-300">{formatPrice(item.price)}</p>
            <span className="inline-flex items-center justify-center rounded-full border border-[#475569] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 sm:py-1">
              Ver detalle
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
