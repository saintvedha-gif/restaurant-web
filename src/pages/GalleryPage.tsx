const galleryPhotos = [
  '/images/SALCHIPAPITAS.png',
  '/images/SALCHIPER.jpg',
  '/images/QUETZALCOATL.png',
  '/images/MILENIAL.jpg',
  '/images/MALANDRO.png',
  '/images/Amorguesa.jpg',
  '/images/Negrita.jpg',
  '/images/PAPITAS-ENTOCINADAS.png',
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
            key={photo}
            className={`overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900 shadow-[0_15px_30px_rgba(0,0,0,0.28)] ${
              idx % 4 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
            }`}
          >
            <img
              src={photo}
              alt={`Foto de plato ${idx + 1}`}
              className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </article>
        ))}
      </section>
    </div>
  );
}
