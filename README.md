# 🌽 Mucha Mazorca - Sitio Web del Restaurante

Sitio web moderno y elegante para el restaurante **Mucha Mazorca**, construido con tecnologías contemporáneas para ofrecer una experiencia de usuario excepcional.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnología](#tecnología)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Características Principales](#características-principales)
- [Scripts Disponibles](#scripts-disponibles)
- [Configuración](#configuración)
- [Despliegue](#despliegue)

---

## ✨ Características

- **Menú Interactivo**: Catálogo completo de productos con sistema de carrito integrado
- **Galería de Imágenes**: Visualización moderna de los platos del restaurante
- **Sistema de Carrito**: Carrito de compras funcional con Context API
- **Página de Contacto**: Formulario para consultas y reservas
- **Optimización de Imágenes**: Integración con Cloudinary para imágenes optimizadas
- **Emojis Nativos**: Soporte para emojis con Twemoji
- **Responsivo**: Diseño mobile-first que se adapta a todos los dispositivos
- **Animaciones Sutiles**: Transiciones suaves y efectos visuales elegantes
- **Optimizado para SEO**: Sitemap, robots.txt y metaetiquetas configuradas

---

## 🛠️ Tecnología

### Stack Principal
- **React** 18.3.1 - Biblioteca UI moderna
- **TypeScript** 5.6.2 - Tipado estático para mayor seguridad
- **Vite** 6.0.1 - Empaquetador ultra rápido
- **Tailwind CSS** 3.4.14 - Framework de utilidades CSS

### Enrutamiento
- **React Router** 7.4.0 - Navegación y rutas del sitio

### Estilizado
- **PostCSS** 8.4.47 - Procesador de CSS
- **Autoprefixer** 10.4.20 - Prefijos de navegador automáticos

### Imágenes y Medios
- **Cloudinary** 2.8.0 - Gestión y optimización de imágenes en la nube
- **@twemoji/api** 17.0.2 - Soporte para emojis unicode

---

## 📥 Instalación

### Requisitos Previos
- Node.js 16+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd restaurant-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno (si es necesario)**
```bash
# Crear archivo .env si es necesario para Cloudinary u otras APIs
```

4. **Iniciar servidor de desarrollo**
```bash
npm start
```

El sitio estará disponible en `http://localhost:5173`

---

## 🚀 Desarrollo

### Iniciar modo desarrollo
```bash
npm run dev
```

Vite compilará automáticamente los cambios y refrescará el navegador en tiempo real.

### Compilar para producción
```bash
npm run build
```

Genera una carpeta `dist/` optimizada y lista para desplegar.

### Previsualizar build
```bash
npm run preview
```

### Subir imágenes a Cloudinary
```bash
npm run images:cloudinary:upload
```

Este script sincroniza todas las imágenes de `assets-source/images/` con Cloudinary.

---

## 📁 Estructura del Proyecto

```
restaurant-web/
├── public/                    # Archivos estáticos públicos
│   ├── 404.html             # Página de error 404
│   ├── robots.txt           # Instrucciones para buscadores
│   ├── site.webmanifest     # Manifest para PWA
│   ├── sitemap.xml          # Mapa del sitio
│   └── images/              # Imágenes estáticas
├── src/                      # Código fuente
│   ├── components/           # Componentes reutilizables
│   │   ├── CartDrawer.tsx        # Carrito lateral
│   │   ├── CategoryNav.tsx       # Navegación de categorías
│   │   ├── MenuCard.tsx          # Tarjeta de producto
│   │   ├── ProductModal.tsx      # Modal de detalles del producto
│   │   └── SiteLayout.tsx        # Layout general del sitio
│   ├── pages/                # Páginas principales
│   │   ├── HomePage.tsx          # Página de inicio
│   │   ├── MenuPage.tsx          # Página del menú
│   │   ├── ContactPage.tsx       # Página de contacto
│   │   ├── GalleryPage.tsx       # Página de galería
│   │   └── ProductDetailPage.tsx # Detalles del producto
│   ├── context/              # Context API
│   │   └── CartContext.tsx       # Lógica del carrito
│   ├── hooks/                # Hooks personalizados
│   │   └── useTwemoji.ts        # Hook para emojis
│   ├── data/                 # Datos y configuración
│   │   ├── menuData.ts           # Datos del menú
│   │   ├── addonRules.ts         # Reglas de complementos
│   │   ├── cloudinaryImages.ts   # Mapeo de imágenes Cloudinary
│   │   └── getImageUrl.ts        # Utilitario para URLs de imágenes
│   ├── types/                # Tipos TypeScript
│   │   └── menu.ts               # Tipos del menú
│   ├── App.tsx               # Componente principal
│   ├── main.tsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── assets-source/            # Fuentes de activos (original)
│   └── images/               # Imágenes originales
├── scripts/                  # Scripts de utilidad
│   ├── generate-favicons.mjs # Genera favicons
│   └── upload-cloudinary.mjs # Sube imágenes a Cloudinary
├── tailwind.config.js        # Configuración de Tailwind
├── postcss.config.js         # Configuración de PostCSS
├── vite.config.ts            # Configuración de Vite
├── tsconfig.json             # Configuración de TypeScript
├── index.html                # HTML principal
└── package.json              # Dependencias del proyecto
```

---

## 🎯 Características Principales

### 1. **Gestión de Menú**
El menú se define en `src/data/menuData.ts` con estructura de categorías y productos. Cada producto puede tener complementos (add-ons) configurables con reglas específicas.

### 2. **Carrito de Compras**
Sistema robusto basado en Context API (`src/context/CartContext.tsx`):
- Agregar/eliminar productos
- Ajustar cantidades
- Aplicar modificadores (add-ons)
- Persistencia de datos (opcional)

### 3. **Optimización de Imágenes**
Integración con Cloudinary para:
- Redimensionamiento automático
- Compresión optimizada
- CDN global para mayor velocidad
- Respaldo de imágenes locales

### 4. **Componentes Reutilizables**
Arquitectura modular con componentes agnósticos que facilitan el mantenimiento:
- `MenuCard`: Tarjeta de producto
- `ProductModal`: Modal para detalles y opciones
- `CategoryNav`: Navegación entre categorías

### 5. **Emojis Nativos**
Hook personalizado `useTwemoji` para renderizar emojis modernos y consistentes en todos los navegadores.

---

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia servidor de desarrollo (alias de `dev`) |
| `npm run dev` | Inicia servidor de desarrollo con Vite |
| `npm run build` | Compila TypeScript y construye para producción |
| `npm run preview` | Previsualiza la build de producción localmente |
| `npm run images:cloudinary:upload` | Sube imágenes a Cloudinary |

---

## ⚙️ Configuración

### Tailwind CSS
Archivo: `tailwind.config.js`
- Paleta de colores personalizada
- Extensiones de utilidades
- Modo oscuro (si está habilitado)

### Vite
Archivo: `vite.config.ts`
- Plugin de React habilitado
- Code splitting automático
- Optimizaciones de build

### TypeScript
Archivo: `tsconfig.json`
- Strict mode habilitado
- JSX configurado para React
- Resolución de módulos optimizada

---

## 🌐 Despliegue

### GitHub Pages
El proyecto está optimizado para desplegar en GitHub Pages:

1. **Actualizar `base` en `vite.config.ts`** si el repositorio no es de usuario:
```typescript
export default defineConfig({
  base: '/restaurant-web/', // Para https://user.github.io/restaurant-web
  // ...
})
```

2. **Build y deploy**:
```bash
npm run build
# Los archivos en dist/ se despliegan automáticamente
```

### Otros Hosting
El proyecto es compatible con cualquier host estático:
- Vercel
- Netlify
- AWS S3
- Firebase Hosting

Solo requiere servir el contenido de la carpeta `dist/` generada por el build.

---

## 📱 SEO y Metaetiquetas

El proyecto incluye:
- **robots.txt** - Directivas para motores de búsqueda
- **sitemap.xml** - Mapa completo del sitio
- **site.webmanifest** - Configuración PWA
- **404.html** - Página de error personalizada

Asegúrate de actualizar metaetiquetas en `index.html` según sea necesario.

---

## 🎨 Diseño

El sitio sigue un diseño elegante y minimalista con:
- Paleta cálida (madera, terracota, crema)
- Animaciones sutiles y transiciones suaves
- Tipografía limpia y legible
- Enfoque mobile-first
- Consistencia visual en todos los componentes

---

## 🔗 URLs Principales

- **Inicio** - `/`
- **Menú** - `/menu`
- **Contacto** - `/contacto`
- **Galería** - `/galeria`

---

## 📄 Licencia

Este proyecto es propiedad de Restaurante Mucha Mazorca. Derechos reservados.

---

## 💡 Notas de Desarrollo

- El proyecto utiliza **lazy loading** para las páginas (optimización de bundle)
- El carrito solo aparece en la página de menú
- Las imágenes se sirven desde Cloudinary en producción, con fallback a local
- Se recomienda minificar las imágenes fuente antes de subirlas a Cloudinary

---

**Última actualización:** Mayo 2026
