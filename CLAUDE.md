# Guía de Claude — frontend

Para reducir contexto, lee este índice y luego solo los archivos de la función solicitada. No recorras `node_modules/`, `dist/` ni imágenes para tareas de código.

## Mapa

- Rutas: `src/App.tsx`; arranque/carga inicial: `src/main.tsx`.
- Páginas: `src/pages/`; panel/tablas: `src/pages/AdminPage.tsx`, `src/components/admin/`.
- Catálogo y fallbacks: `src/data/`; contratos: `src/types/`.
- API y loaders: `src/lib/api.ts`, `src/lib/load*.ts`, `src/lib/orders.ts`.
- Carrito: `src/context/CartContext.tsx`, `src/pages/ProductDetailPage.tsx`, `src/components/CartDrawer.tsx`.
- Estilos: `src/index.css`; deploy frontend: `.github/workflows/deploy.yml`.

## Reglas

1. Seguir el flujo UI → loader/cliente API → endpoint del repositorio hermano `mucha-mazorca-api` → validación/BD cuando aplique.
2. La API es autoridad para precios y pedidos. No calcular totales confiables solo en el cliente.
3. Cuando la API falla, revisar los loaders y datos de respaldo antes de cambiar su comportamiento.
4. Cambios persistentes pueden requerir cambios coordinados en el repo de API y una migración. No tocar producción ni aplicar SQL sin autorización explícita.
5. Ejecutar `npm run build`; ejecutar pruebas de API si se modificó el contrato backend.
6. Nunca leer/mostrar secretos de `.env`, incluirlos en `VITE_*` ni versionar respaldos.

Para páginas, desarrollo y publicación de Hostinger, consulta `README.md`. Para migraciones y despliegue de API, consulta el README del repositorio API.
