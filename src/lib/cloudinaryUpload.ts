const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadImage(file: File): Promise<string> {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
  if (!cloud || !preset) throw new Error('Falta configurar Cloudinary en .env.local');
  if (!file.type.startsWith('image/')) throw new Error('El archivo debe ser una imagen');
  if (file.size > MAX_BYTES) throw new Error('La foto pesa mas de 8 MB');

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message ?? 'No se pudo subir la foto');
  }
  return json.secure_url as string;
}
