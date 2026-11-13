import { useEffect, useState } from 'react';
import { isSubscribed, pushSupported, subscribePush, unsubscribePush } from '../lib/push';

interface Props {
  className?: string;
}

export default function PushButton({ className = '' }: Props) {
  const supported = pushSupported();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!supported) return;
    let cancelled = false;
    isSubscribed()
      .then(value => {
        if (!cancelled) setActive(value);
      })
      .catch(error => {
        if (!cancelled) {
          setMsg(error instanceof Error ? error.message : 'No se pudo revisar el estado de los avisos.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [supported]);

  if (!supported) return null;
  if (Notification.permission === 'denied' && !active) {
    return (
      <p className={`${className} text-center text-[11px] text-white/55`}>
        Los avisos están bloqueados en los permisos de este navegador.
      </p>
    );
  }

  async function handleClick() {
    setBusy(true);
    setMsg('');
    try {
      if (active) {
        await unsubscribePush();
        setActive(false);
      } else {
        const result = await subscribePush();
        if (result === 'ok') {
          setActive(true);
        } else {
          setMsg('No diste permiso para avisos.');
        }
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'No se pudo actualizar los avisos. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-yellow-300 transition-all active:scale-95 disabled:opacity-60"
      >
        {busy ? 'Procesando...' : active ? '🔔 Avisos activados' : '🔔 Activar avisos'}
      </button>
      {msg && (
        <p className="mt-1 text-center text-[11px] text-yellow-200" role="status" aria-live="polite">
          {msg}
        </p>
      )}
    </div>
  );
}
