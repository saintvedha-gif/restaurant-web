import { useRef } from 'react';
import type { Category } from '../types/menu';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <nav className="sticky top-20 z-30 rounded-[24px] border border-[#d1b07a] bg-[#7b5a34] shadow-[0_16px_30px_rgba(48,30,12,0.28)]">
      <div className="px-4 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 sm:hidden">
        Desliza las categorías
      </div>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto gap-2 px-3 py-3 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            data-cat={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`flex shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2.5 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
              activeId === cat.id
                ? 'bg-yellow-400 text-black shadow-md shadow-yellow-700/25'
                : 'bg-[#9a7546] text-zinc-100 hover:bg-[#ae8550] hover:text-yellow-300'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
