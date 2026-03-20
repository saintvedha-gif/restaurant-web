/// <reference types="vite/client" />
import { lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));

export default function App() {
  const basename = import.meta.env.MODE === 'production' ? '/restaurant-web' : '/';
  return (
    <CartProvider>
      <BrowserRouter basename={basename}>
        <Suspense fallback={<div className="section-shell py-16 text-center text-stone-700">Cargando...</div>}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/galeria" element={<GalleryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}
