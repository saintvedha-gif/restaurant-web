import { getImageUrl } from '../data/menuData';

const galleryPhotos = [
  { src: getImageUrl('SALCHIPAPITAS.png'), alt: 'Salchipapita clásica' },
  { src: getImageUrl('SALCHIPER.jpg'), alt: 'Salchiper personal' },
  { src: getImageUrl('QUETZALCOATL.png'), alt: 'Quetzalcóatl' },
  { src: getImageUrl('MILENIAL.jpg'), alt: 'Maicito Milenial' },
  { src: getImageUrl('MALANDRO.png'), alt: 'Malandro' },
  { src: getImageUrl('Amorguesa.jpg'), alt: 'Amorguesa' },
  { src: getImageUrl('Negrita.jpg'), alt: 'Negrita' },
  { src: getImageUrl('PAPITAS-ENTOCINADAS.png'), alt: 'Papitas entocinadas' },
];

export default function GalleryPage() {
  return (
    <div className="section-shell py-10 sm:py-14">
      <section>
        <span className="section-kicker">Galeria</span>
        <h1 className="mt-5 text-5xl leading-tight text-white sm:text-6xl"><span className="font-display">Un vistazo a nuestros platos favoritos.</span></h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
          Esta galeria muestra la energia visual de Mucha Mazorca: platos cargados, coloridos y listos para compartir.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryPhotos.map((photo, idx) => (
          <article
            key={photo.src}
            className={`overflow-hidden rounded-[24px] border border-[#d1b07a] bg-[#7b5a34] shadow-[0_15px_30px_rgba(48,30,12,0.28)] ${
              idx % 4 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
            }`}
          >
            <div className="relative bg-[#6e532e]">
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
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
