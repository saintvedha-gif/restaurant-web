import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../../lib/api';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { applyCategories, type AdminCategory } from '../../lib/loadCategories';
import EmojiPicker from './EmojiPicker';

interface Props {
  onClose: () => void;
  onChanged: () => void;
}

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/35 focus:border-yellow-300 focus:outline-none';

export default function AdminCategories({ onClose, onChanged }: Props) {
  useBodyScrollLock(true);
  const [rows, setRows] = useState<AdminCategory[]>([]);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const categories = await apiFetch<AdminCategory[]>('/api/admin/categories');
      setRows(categories);
      applyCategories(categories.filter(category => category.active));
      setError('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), emoji: emoji.trim() }),
      });
      setName('');
      setEmoji('');
      await load();
      onChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(id: string) {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName.trim(), emoji: editEmoji.trim() }),
      });
      setEditing(null);
      await load();
      onChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  }

  async function updateCategory(id: string, action: 'active' | 'order', body: { active: boolean } | { direction: 'up' | 'down' }) {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/admin/categories/${id}/${action}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      await load();
      onChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo actualizar la categoría.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: AdminCategory) {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"? Solo se puede eliminar si no tiene productos.`)) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
      await load();
      onChanged();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo eliminar la categoría.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section className="max-h-[94vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-t-[28px] border border-yellow-400/20 bg-[#101014] p-5 text-white sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="title-pixel text-lg">Categorías del menú</h2>
            <p className="mt-2 text-sm text-white/55">Las categorías inactivas y sus productos no aparecen en el menú público.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="h-9 w-9 shrink-0 rounded-full bg-[#1a1a21] text-white">✕</button>
        </div>

        <form onSubmit={createCategory} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-[1fr_52px_auto]">
          <input className={fieldClass} value={name} onChange={event => setName(event.target.value)} placeholder="Nombre de categoría" minLength={2} maxLength={80} required />
          <EmojiPicker compact separator=" " value={name} onChange={value => { setName(value); setEmoji(''); }} maxLength={80} />
          <button type="submit" disabled={saving} className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black disabled:opacity-50">Crear</button>
        </form>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {loading && <p className="text-sm text-white/60">Cargando categorías...</p>}

        <div className="space-y-2">
          {rows.map((category, index) => (
            <article key={category.id} className={`rounded-2xl border border-white/10 bg-[#17171d] p-3 ${category.active ? '' : 'opacity-65'}`}>
              {editing === category.id ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_52px_auto_auto]">
                  <input className={fieldClass} value={editName} onChange={event => setEditName(event.target.value)} maxLength={80} minLength={2} aria-label="Nombre" />
                  <EmojiPicker compact separator=" " value={editName} onChange={value => { setEditName(value); setEditEmoji(''); }} maxLength={80} />
                  <button type="button" disabled={saving} onClick={() => void saveCategory(category.id)} className="rounded-xl bg-yellow-400 px-3 py-2 text-sm font-black text-black disabled:opacity-50">Guardar</button>
                  <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70">Cancelar</button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-bold">{category.emoji} {category.name}</span>
                  <button
                    type="button"
                    disabled={saving || index === 0}
                    onClick={() => void updateCategory(category.id, 'order', { direction: 'up' })}
                    aria-label={`Subir ${category.name}`}
                    className="h-9 w-9 rounded-lg border border-white/10 text-white disabled:opacity-30"
                  >↑</button>
                  <button
                    type="button"
                    disabled={saving || index === rows.length - 1}
                    onClick={() => void updateCategory(category.id, 'order', { direction: 'down' })}
                    aria-label={`Bajar ${category.name}`}
                    className="h-9 w-9 rounded-lg border border-white/10 text-white disabled:opacity-30"
                  >↓</button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditing(category.id);
                      setEditName(category.name);
                      setEditEmoji(category.emoji);
                    }}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/70"
                  >Editar</button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void updateCategory(category.id, 'active', { active: !category.active })}
                    className={`rounded-lg px-3 py-2 text-xs font-black ${category.active ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-red-500/15 text-red-400'}`}
                  >{category.active ? 'Activa' : 'Inactiva'}</button>
                  <button type="button" disabled={saving} onClick={() => void deleteCategory(category)} className="rounded-lg px-2 py-2 text-xs font-bold text-red-400 disabled:opacity-50">Eliminar</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
