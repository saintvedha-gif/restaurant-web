import type { MenuItem } from '../types/menu';
import { formatPrice, getSizedImageUrl } from '../data/menuData';

interface Props {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function MenuCard({ item, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="group w-full min-w-0 max-w-full overflow-x-clip rounded-[18px] border border-yellow-400/15 bg-[#16161b] p-3 text-left shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition-all hover:-translate-y-0.5 hover:border-yellow-300/60 hover:shadow-[0_16px_34px_rgba(0,0,0,0.34)] sm:p-4"
    >
      <div className="flex min-w-0 max-w-full flex-row items-center gap-3 sm:gap-4 overflow-x-clip">
        <div className="min-w-0 max-w-full flex-1 overflow-x-clip">
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 overflow-x-clip">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-yellow-400/10 px-0.5 text-[11px] leading-none sm:h-9 sm:w-9 sm:px-0 sm:text-base">
              {item.emoji}
            </span>
            <h3 className="title-pixel min-w-0 break-words text-sm leading-snug text-white transition-colors group-hover:text-yellow-300 sm:text-base">
              {item.name}
            </h3>
            {item.tags?.includes('popular') && (
              <span className="rounded-full border border-yellow-400/30 bg-[#FFD60A] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-black shadow-[0_2px_8px_rgba(0,0,0,0.3)] sm:text-xs sm:tracking-[0.12em]">
                Popular
              </span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-white/60">{item.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-base font-black text-yellow-300 sm:text-lg" style={{ textShadow: '0 0 8px rgba(255,214,10,0.22)' }}>
              {formatPrice(item.price)}
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-yellow-400/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 sm:px-3 sm:text-xs sm:tracking-[0.2em]">
              Ver detalle
            </span>
          </div>
        </div>

        {item.image && (
          <div className="shrink-0 overflow-hidden rounded-[12px] bg-[#101014] ring-1 ring-yellow-400/15" style={{width: '88px', height: '88px'}}>
            <img
              src={getSizedImageUrl(item.image, 220)}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="88px"
              width={88}
              height={88}
            />
          </div>
        )}
      </div>
    </button>
  );
}
