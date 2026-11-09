import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

const TEMPLATES = [
  { title: '¡Ya abrimos! 🌽', body: 'Hoy te esperamos con todo el sabor. Pide ya.', url: '/menu' },
  { title: 'Miércoles de promo 🔥', body: 'Hoy hay promo en Mucha Mazorca. Mira el menú.', url: '/menu' },
  { title: 'Matrimonios en descuento 💍', body: 'Aprovecha el descuento, solo por tiempo limitado.', url: '/menu' },
];

const DESTINATIONS = [
  { url: '/menu', label: 'El menú' },
  { url: '/', label: 'La página principal' },
  { url: '/mis-pedidos', label: 'Mis pedidos' },
];

const input =
  'w-full rounded-xl border border-white/10 bg-[#0c0c10] px-3 py-3 text-base text-white placeholder:text-white/30 focus:border-yellow-300 focus:outline-none';
const label = 'mb-1 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-yellow-300';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/menu');
  const [count, setCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<{ count: number }>('/api/admin/push/count');
        setCount(data.count ?? 0);
      } catch {
        setCount(0);
      }
    })();
  }, []);

  async function handleSend() {
    setError('');
    setMsg('');
    if (!title.trim() || !body.trim()) return setError('Escribe el título y el mensaje');
    if (!window.confirm(`¿Enviar este aviso a ${count ?? 'todas las'} personas?`)) return;

    setSending(true);
    try {
      const data = await apiFetch<{ sent: number; removed: number; total: number }>('/api/admin/push/send', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url }),
      });
      setMsg(`✅ Enviado a ${data.sent ?? 0} de ${data.total ?? 0} personas.`);
      setCount((data.total ?? 0) - (data.removed ?? 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setTimeout(() => setSending(false), 8000); // evita mandar dos veces sin querer
    }
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4">
        <p className={label}>🔔 Clientes con avisos activados</p>
        <p className="text-3xl font-black text-white">{count ?? '...'}</p>
        <p className="mt-1 text-xs text-white/50">Solo les llega a quienes tocaron "Activar avisos" en la página o la app.</p>
      </div>

      <div className="space-y-3 rounded-[24px] border border-yellow-400/20 bg-[#16161b] p-4">
        <p className={label}>Plantillas rápidas</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.title}
              type="button"
              onClick={() => {
                setTitle(t.title);
                setBody(t.body);
                setUrl(t.url);
              }}
              className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs font-black text-yellow-300"
            >
              {t.title}
            </button>
          ))}
        </div>

        <div>
          <label className={label}>Título</label>
          <input className={input} maxLength={80} value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={label}>Mensaje</label>
          <textarea className={input} rows={3} maxLength={200} value={body} onChange={e => setBody(e.target.value)} />
        </div>
        <div>
          <label className={label}>Al tocar el aviso, abre</label>
          <select className={input} value={url} onChange={e => setUrl(e.target.value)}>
            {DESTINATIONS.map(d => (
              <option key={d.url} value={d.url}>{d.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {msg && <p className="text-sm font-bold text-[#00C853]">{msg}</p>}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="w-full rounded-xl bg-[#FFD60A] py-3 text-base font-black text-black disabled:opacity-50 active:scale-95"
        >
          {sending ? 'Enviando...' : '📣 Enviar aviso'}
        </button>
      </div>
    </div>
  );
}
