import { useState } from 'react';
import { uploadImage } from '../../lib/cloudinaryUpload';
import { getSizedImageUrl } from '../../data/menuData';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error subiendo la foto');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c10]">
        {value ? (
          <img src={getSizedImageUrl(value, 500)} alt="Foto del producto" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-white/40">Sin foto</span>
        )}
      </div>
      <label className="block w-full cursor-pointer rounded-xl border border-yellow-400/40 bg-yellow-400/10 py-3 text-center text-sm font-black text-yellow-300 active:scale-95">
        {uploading ? 'Subiendo foto...' : value ? '📷 Cambiar foto' : '📷 Subir foto'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={e => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
