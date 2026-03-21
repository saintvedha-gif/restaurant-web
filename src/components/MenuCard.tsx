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
      className="group w-full rounded-[18px] border border-[#FF6D00]/30 bg-[#FFE4C2] p-3 text-left shadow-[0_8px_20px_rgba(255,109,0,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#FF6D00]/70 hover:shadow-[0_16px_34px_rgba(255,109,0,0.25)] sm:p-4"
    >
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-base sm:h-9 sm:w-9 sm:text-lg">
              {item.emoji}
            </span>
            <h3 className="text-base font-bold leading-tight text-[#4A2800] transition-colors group-hover:text-yellow-300 sm:text-xl">
              {item.name}
            </h3>
            {item.tags?.includes('popular') && (
              <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-yellow-300">
                Popular
              </span>
            )}
            {item.tags?.includes('nuevo') && (
              <span className="rounded-full bg-[#FF6D00]/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#FF6D00]">
                Nuevo
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#6A3A00]">{item.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-base font-black text-yellow-300 sm:text-lg" style={{ textShadow: '0 0 3px #4A2800, 0 0 6px #4A2800, -1px -1px 0 #4A2800, 1px -1px 0 #4A2800, -1px 1px 0 #4A2800, 1px 1px 0 #4A2800, 0 -1px 0 #4A2800, 0 1px 0 #4A2800' }}>
              {formatPrice(item.price)}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-[#FF6D00]/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#6A3A00]">
              Ver detalle
            </span>
          </div>
        </div>

        {item.image && (
          <div className="shrink-0 overflow-hidden rounded-[12px] bg-[#FFF3E0] ring-1 ring-[#FF6D00]/30" style={{width: '88px', height: '88px'}}>
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
