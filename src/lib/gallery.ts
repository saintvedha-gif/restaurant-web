import { getImageUrl } from '../data/menuData';
import { apiFetch } from './api';

export interface GalleryImage {
  id?: number;
  imageUrl: string;
  altText: string;
  sortOrder?: number;
}

export const galleryImages: GalleryImage[] = [
  { imageUrl: getImageUrl('Galeria 1.jpeg'), altText: 'Salchipapita clásica' },
  { imageUrl: getImageUrl('Galeria 2.jpeg'), altText: 'Salchiper personal' },
  { imageUrl: getImageUrl('Galeria 3.jpeg'), altText: 'Quetzalcóatl' },
  { imageUrl: getImageUrl('Galeria 4.jpg'), altText: 'Maicito Milenial' },
  { imageUrl: getImageUrl('Galeria 5.jpg'), altText: 'Malandro' },
  { imageUrl: getImageUrl('Galeria 6.jpg'), altText: 'Amorguesa' },
  { imageUrl: getImageUrl('Galeria7.jpg'), altText: 'Negrita' },
  { imageUrl: getImageUrl('Galeria 8.jpg'), altText: 'Papitas entocinadas' },
];

export async function loadGalleryFromApi(timeoutMs = 2500): Promise<void> {
  try {
    const result = await Promise.race([
      apiFetch<GalleryImage[]>('/api/gallery'),
      new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (result) galleryImages.splice(0, galleryImages.length, ...result);
  } catch {
    // Keep the built-in gallery when the API is unavailable.
  }
}
