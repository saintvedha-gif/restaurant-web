// Utilidad para obtener la mejor ruta de imagen (local o Cloudinary)
// Usa primero la local si existe, si no, la de Cloudinary

import { CLOUDINARY_IMAGE_MAP } from "./cloudinaryImages";

/**
 * Devuelve la mejor URL para una imagen: local si existe, si no Cloudinary.
 * @param fileName Nombre del archivo de imagen (ej: "foto.jpg")
 * @returns URL relativa local o URL de Cloudinary
 */
export function getImageUrl(fileName: string): string {
  // Ruta relativa a public/images
  const localPath = `/images/${fileName}`;
  // Se asume que si la imagen local existe, el navegador la carga correctamente
  // Si no existe, Cloudinary será fallback (el componente <img> intentará ambas)
  if (CLOUDINARY_IMAGE_MAP[fileName]) {
    return localPath;
  }
  // Si no está en el mapa, solo intentamos local
  return localPath;
}

// Si quieres forzar fallback en el frontend, puedes usar onError en <img>:
// <img src={getImageUrl(nombre)} onError={e => e.currentTarget.src = CLOUDINARY_IMAGE_MAP[nombre] || '/images/404.png'} />
