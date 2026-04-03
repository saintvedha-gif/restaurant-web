/// <reference types="vite/client" />
import { lazy, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SiteLayout from './components/SiteLayout';
import CartDrawer from './components/CartDrawer';

const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));

function ConditionalCartDrawer() {
  const location = useLocation();
  const showCartDrawer = location.pathname === '/menu';
  return showCartDrawer ? <CartDrawer /> : null;
}

export default function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <CartProvider>
      <BrowserRouter basename={basename}>
        <Suspense fallback={<div className="section-shell py-16 text-center text-white/70">Cargando...</div>}>
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
        <ConditionalCartDrawer />
      </BrowserRouter>
    </CartProvider>
  );
}
