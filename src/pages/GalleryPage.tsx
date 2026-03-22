import { getImageUrl } from '../data/menuData';

const galleryPhotos = [
  { src: getImageUrl('Galeria 1.jpeg'), alt: 'Salchipapita clásica' },
  { src: getImageUrl('Galeria 2.jpeg'), alt: 'Salchiper personal' },
  { src: getImageUrl('Galeria 3.jpeg'), alt: 'Quetzalcóatl' },
  { src: getImageUrl('Galeria 4.jpg'), alt: 'Maicito Milenial' },
  { src: getImageUrl('Galeria 5.jpg'), alt: 'Malandro' },
  { src: getImageUrl('Galeria 6.jpg'), alt: 'Amorguesa' },
  { src: getImageUrl('Galeria7.jpg'), alt: 'Negrita' },
  { src: getImageUrl('Galeria 8.jpg'), alt: 'Papitas entocinadas' },
];

export default function GalleryPage() {
  return (
    <div className="section-shell py-10 sm:py-14">
      <section>
        <span className="section-kicker">Galeria</span>
        <h1 className="mt-5 text-5xl leading-tight text-[#4A2800] sm:text-6xl"><span className="font-display">Un vistazo a nuestros platos favoritos.</span></h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[#6A3A00]">
          Esta galeria muestra la energia visual de Mucha Mazorca: platos cargados, coloridos y listos para compartir.
        </p>
      </section>

      <section className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryPhotos.map((photo, idx) => (
          <article
            key={photo.src}
            className={`self-start overflow-hidden rounded-[24px] border border-[#FF6D00]/35 bg-[#FFF3E0] shadow-[0_15px_30px_rgba(255,109,0,0.15)] ${
              idx !== 0 && idx % 4 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
            }`}
          >
              <div className="relative bg-[#FFE4C2]">
              <img
                src={photo.src}
                alt={photo.alt}
                className={idx <= 2
                  ? 'aspect-square w-full object-cover object-center transition-transform duration-500 hover:scale-105'
                  : 'h-64 w-full object-cover transition-transform duration-500 hover:scale-105'}
                loading="lazy"
                decoding="async"
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
