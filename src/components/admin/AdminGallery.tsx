import { useCallback, useEffect, useState } from 'react';
import ImageUploader from './ImageUploader';
import { apiFetch } from '../../lib/api';
import { getSizedImageUrl } from '../../data/menuData';
import type { GalleryImage } from '../../lib/gallery';

interface ManagedImage extends GalleryImage {
  id: number;
  publicId: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setImages(await apiFetch<ManagedImage[]>('/api/admin/gallery'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la galería.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addImage() {
    if (!imageUrl) {
      setError('Primero sube una imagen.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiFetch('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify({ imageUrl, altText }),
      });
      setImageUrl('');
      setAltText('');
      setNotice('Imagen agregada a la galería.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo agregar la imagen.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(image: ManagedImage) {
    if (!window.confirm(`¿Eliminar "${image.altText || 'esta imagen'}" de la galería y borrarla de Cloudinary? Esta acción no se puede deshacer.`)) return;
    setDeletingId(image.id);
    setError('');
    setNotice('');
    try {
      await apiFetch(`/api/admin/gallery/${image.id}`, { method: 'DELETE' }, 20000);
      setImages(current => current.filter(entry => entry.id !== image.id));
      setNotice('Imagen eliminada de la galería y de Cloudinary.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la imagen.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-5">
      <section className="space-y-3 rounded-2xl border border-yellow-400/20 bg-[#16161b] p-4">
        <div>
          <h1 className="title-pixel text-lg text-white">Galería 📸</h1>
          <p className="mt-2 text-xs leading-5 text-white/55">Las imágenes nuevas se suben a Cloudinary y aparecen en la página pública al agregarlas aquí.</p>
        </div>
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
        <label className="block text-xs font-bold text-yellow-300">
          Descripción para accesibilidad
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none"
            value={altText}
            maxLength={180}
            onChange={event => setAltText(event.target.value)}
            placeholder="Describe brevemente el plato"
          />
        </label>
        <button
          type="button"
          disabled={!imageUrl || saving}
          onClick={() => void addImage()}
          className="w-full rounded-xl bg-yellow-400 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Agregando...' : 'Agregar a la galería'}
        </button>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-[#00C853]/30 bg-[#00C853]/10 p-3 text-sm text-[#00C853]">{notice}</p>}
      {loading && <p className="text-sm text-white/60">Cargando galería...</p>}
      {!loading && !error && images.length === 0 && <p className="text-sm text-white/60">La galería está vacía.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {images.map(image => (
          <article key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#16161b]">
            <img src={getSizedImageUrl(image.imageUrl, 600)} alt={image.altText} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">{image.altText || 'Imagen de galería'}</p>
              <button
                type="button"
                disabled={deletingId === image.id}
                onClick={() => void deleteImage(image)}
                className="shrink-0 rounded-lg border border-red-400/30 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-50"
              >
                {deletingId === image.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
