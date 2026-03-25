import { useRef, type WheelEvent } from 'react';
import type { Category } from '../types/menu';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function nudgeScroll(direction: 'left' | 'right') {
    const container = scrollRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -260 : 260;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  }

  function handleWheelScroll(event: WheelEvent<HTMLDivElement>) {
    const container = scrollRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (!hasOverflow) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      container.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }
  }

  function handleClick(id: string) {
    onSelect(id);
    // Scroll active tab into view
    const container = scrollRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-cat="${id}"]`) as HTMLElement | null;
    if (btn) {
      const offset = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }

  return (
    <nav className="sticky top-20 z-30 w-full max-w-full overflow-x-clip rounded-[18px] border border-yellow-400/18 bg-[#101014] shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
      <div className="px-2 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50 sm:hidden">
        Desliza las categorías
      </div>
      <div className="relative w-full overflow-x-clip">
        {/* Botones de scroll solo en desktop */}
        <button
          type="button"
          onClick={() => nudgeScroll('left')}
          className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-400/25 bg-[#0d0d12]/90 text-yellow-300 transition-colors hover:bg-[#18181d] lg:inline-flex"
          aria-label="Desplazar categorías a la izquierda"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => nudgeScroll('right')}
          className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-400/25 bg-[#0d0d12]/90 text-yellow-300 transition-colors hover:bg-[#18181d] lg:inline-flex"
          aria-label="Desplazar categorías a la derecha"
        >
          ›
        </button>

        <div
          ref={scrollRef}
          onWheel={handleWheelScroll}
          className="flex min-w-0 w-full flex-nowrap gap-1 overflow-x-auto px-1.5 py-2 scrollbar-none sm:px-3 md:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              data-cat={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`flex shrink-0 min-w-0 max-w-[90vw] snap-start items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-bold transition-all sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm ${
                activeId === cat.id
                  ? 'bg-[#FFD60A] text-black shadow-md shadow-[#FFD60A]/30 font-extrabold'
                  : 'bg-[#17171d] text-white/75 hover:bg-[#202028] hover:text-[#FFD60A]'
              }`}
            >
              <span>{cat.emoji}</span>
              <span className="leading-none tracking-[0.02em] sm:tracking-normal">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
