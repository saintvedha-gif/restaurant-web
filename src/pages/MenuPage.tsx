import { useEffect, useMemo, useState } from 'react';
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#8a6637_0%,#a0743d_100%)] pb-32 text-zinc-100">
      <main className="section-shell py-10 lg:py-14">
        <section>
          <CategoryNav
            categories={categories}
            activeId={activeCategory}
            onSelect={handleSelectCategory}
          />
        </section>

        <section className="mt-8">
          <section
            className="rounded-[28px] border border-[#d1b07a] bg-[#7b5a34] p-5 shadow-[0_16px_34px_rgba(48,30,12,0.28)] sm:p-7"
          >
            <div className="flex flex-col gap-3 border-b border-[#d1b07a] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="flex items-center gap-3 text-3xl sm:text-4xl">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400/10 text-xl">{currentCategory.emoji}</span>
                <span>{currentCategory.name}</span>
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

      <CartDrawer />
    </div>
  );
}
