import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories, menuItems } from '../data/menuData';
import type { MenuItem } from '../types/menu';
import CategoryNav from '../components/CategoryNav';
import MenuCard from '../components/MenuCard';
import CartDrawer from '../components/CartDrawer';
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
    return (
      <>
        <ProductDetailPage item={selectedItem} onBack={closeProductDetail} />
        <CartDrawer />
      </>
    );
  }

  return (
    <div className="theme-page min-h-screen bg-[linear-gradient(180deg,#FFECD2_0%,#FFF3E0_100%)] pb-32 text-[#4A2800]">
      <main className="section-shell py-6 lg:py-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black leading-tight tracking-tight text-[#4A2800] sm:text-3xl">Nuestro menú</h1>
            <p className="mt-0.5 text-sm text-[#6A3A00]">Escoge tu favorito y pídelo por WhatsApp</p>
          </div>
          <button
            type="button"
            onClick={shareMenu}
            className="btn-secondary-sm relative flex shrink-0 items-center gap-1.5"
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
        <section>
          <CategoryNav
            categories={categories}
            activeId={activeCategory}
            onSelect={handleSelectCategory}
          />
        </section>

        <section className="mt-8">
          <section
            className="rounded-[28px] border border-[#FF6D00]/35 bg-[#FFF3E0] p-5 shadow-[0_16px_34px_rgba(255,109,0,0.15)] sm:p-7"
          >
              <div className="flex flex-col gap-3 border-b border-[#FF6D00]/25 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="flex items-center gap-3 text-3xl sm:text-4xl">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FF6D00]/15 text-xl">{currentCategory.emoji}</span>
                <span>{currentCategory.name}</span>
              </h2>
              <span className="rounded-full bg-[#FF6D00]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF6D00]">
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

      <CartDrawer />
    </div>
  );
}
