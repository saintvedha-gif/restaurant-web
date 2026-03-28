import { useEffect, useMemo, useState, useCallback } from 'react';
import { getImageUrl } from '../data/getImageUrl';
import { useSearchParams } from 'react-router-dom';
import { categories, menuItems } from '../data/menuData';
import type { MenuItem } from '../types/menu';
import CategoryNav from '../components/CategoryNav';
import MenuCard from '../components/MenuCard';
import ProductDetailPage from './ProductDetailPage';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const initialCategory = searchParams.get('categoria');
    const exists = categories.some(category => category.id === initialCategory);
    return exists && initialCategory ? initialCategory : categories[0].id;
  });

  const itemsByCategory = useMemo(
    () => categories.reduce<Record<string, MenuItem[]>>((acc, category) => {
      acc[category.id] = menuItems.filter(item => item.categoryId === category.id);
      return acc;
    }, {}),
    []
  );

  const [showCopied, setShowCopied] = useState(false);

  const shareMenu = useCallback(async () => {
    const url = 'https://saintvedha-gif.github.io/restaurant-web/menu';
    if (navigator.share) {
      await navigator.share({ title: 'Menú Mucha Mazorca 🌽', url });
    } else {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2500);
    }
  }, []);

  const currentCategory = categories.find(cat => cat.id === activeCategory) ?? categories[0];
  const currentItems = itemsByCategory[currentCategory.id] ?? [];
  const selectedItemId = searchParams.get('producto');

  const selectedItem = useMemo<MenuItem | null>(() => {
    if (!selectedItemId) return null;
    return menuItems.find(item => item.id === selectedItemId) ?? null;
  }, [selectedItemId]);

  useEffect(() => {
    if (!selectedItemId) return;
    if (selectedItem) return;

    const next = new URLSearchParams(searchParams);
    next.delete('producto');
    setSearchParams(next, { replace: true });
  }, [searchParams, selectedItem, selectedItemId, setSearchParams]);

  function openProductDetail(item: MenuItem) {
    const next = new URLSearchParams(searchParams);
    next.set('categoria', item.categoryId);
    next.set('producto', item.id);
    setSearchParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeProductDetail() {
    const next = new URLSearchParams(searchParams);
    next.delete('producto');
    setSearchParams(next, { replace: false });
  }

  function handleSelectCategory(categoryId: string) {
    if (categoryId === activeCategory) return;
    setActiveCategory(categoryId);
  }

  if (selectedItem) {
    return <ProductDetailPage item={selectedItem} onBack={closeProductDetail} />;
  }

  return (
    <div className="theme-page min-h-screen w-full max-w-full overflow-x-clip bg-[linear-gradient(180deg,#050505_0%,#0c0c0f_100%)] pb-32 text-white">
      <main className="section-shell min-w-0 w-full max-w-full overflow-x-clip py-6 lg:py-10">
        <div className="mb-5 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between w-full max-w-full overflow-x-clip">
          <div className="min-w-0 w-full max-w-full">
            <h1 className="title-pixel text-[1.65rem] font-black leading-[1.1] tracking-tight text-white sm:text-3xl break-words truncate">Nuestro menú</h1>
            <p className="mt-1 max-w-[24rem] text-sm text-white/65 break-words truncate">Escoge tu favorito y pídelo por WhatsApp</p>
          </div>
          <button
            type="button"
            onClick={shareMenu}
            className="btn-secondary-sm relative inline-flex w-full items-center justify-center gap-1.5 sm:w-auto sm:shrink-0"
          >
            <span>🔗</span>
            <span>Compartir menú</span>
            {showCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-yellow-300 shadow-lg">
                ¡Enlace copiado!
              </span>
            )}
          </button>
        </div>
        <section className="mt-0">
          {/* Scroll de categorías por fuera del card */}
          <div className="mb-4">
            <CategoryNav
              categories={categories}
              activeId={activeCategory}
              onSelect={handleSelectCategory}
            />
          </div>
          <section
            className="rounded-[28px] border border-yellow-400/18 bg-[#101014] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.28)] sm:p-7"
          >
            <div className="flex flex-col gap-3 border-b border-yellow-400/12 pb-5 sm:flex-row sm:items-end sm:justify-between mt-0">
              <h2 className="title-pixel flex items-center gap-2 text-xl font-black text-white sm:gap-3 sm:text-3xl md:text-4xl">
                {currentCategory.id === 'postres' ? (
                  <>
                    <span className="leading-tight">POSTRECITOS</span>
                    <span className="ml-1 text-xs font-bold text-white/60 sm:text-base">BY</span>
                    <img
                      src={getImageUrl('Logo_Ladino.png')}
                      alt="Logo Ladino"
                      className="ml-1 h-[2.2em] w-[2.2em] sm:h-[2.7em] sm:w-[2.7em] object-contain inline-block align-middle"
                      style={{ borderRadius: '50%' }}
                    />
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-sm sm:h-11 sm:w-11 sm:text-xl">{currentCategory.emoji}</span>
                    <span className="leading-tight">{currentCategory.name}</span>
                  </>
                )}
              </h2>
              <span className="rounded-full bg-yellow-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-300">
                {currentItems.length} opciones
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              {currentItems.map(item => (
                <MenuCard key={item.id} item={item} onSelect={openProductDetail} />
              ))}
            </div>
          </section>
        </section>
      </main>

    </div>
  );
}
