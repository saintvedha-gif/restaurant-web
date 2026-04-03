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
        <h1 className="title-pixel mt-5 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">Un vistazo a nuestros platos favoritos.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/65">
          Esta galeria muestra la energia visual de Mucha Mazorca: platos cargados, coloridos y listos para compartir.
        </p>
      </section>

      <section className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryPhotos.map((photo, idx) => (
          <article
            key={photo.src}
            className={`self-start overflow-hidden rounded-[24px] border border-yellow-400/18 bg-[#101014] shadow-[0_15px_30px_rgba(0,0,0,0.3)] ${
              idx !== 0 && idx % 4 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
            }`}
          >
              <div className="relative bg-[#121217]">
              <img
                src={photo.src}
                alt={photo.alt}
                className={idx <= 2
                  ? 'aspect-square w-full object-cover object-center transition-transform duration-500 hover:scale-105'
                  : 'h-64 w-full object-cover transition-transform duration-500 hover:scale-105'}
                style={
                  idx === 0
                    ? { objectPosition: 'center 85%' }
                    : idx === 3
                      ? { objectPosition: 'center 52%' }
                      : idx === 6
                        ? { objectPosition: 'center 70%' }
                        : idx === 7
                          ? { objectPosition: 'center 75%' }
                      : undefined
                }
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
