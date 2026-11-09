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
    isSubscribed().then(setActive).catch(() => {});
  }, [supported]);

  if (!supported) return null;
  if (typeof Notification !== 'undefined' && Notification.permission === 'denied' && !active) return null;

  async function handleClick() {
    setBusy(true);
    setMsg('');
    if (active) {
      await unsubscribePush();
      setActive(false);
    } else {
      const result = await subscribePush();
      if (result === 'ok') setActive(true);
      else if (result === 'denied') setMsg('No diste permiso para avisos.');
      else setMsg('No se pudo activar. Intenta de nuevo.');
    }
    setBusy(false);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-yellow-300 transition-all active:scale-95 disabled:opacity-60"
      >
        {active ? '🔔 Avisos activados' : '🔔 Activar avisos'}
      </button>
      {msg && <p className="mt-1 text-center text-[11px] text-red-400">{msg}</p>}
    </div>
  );
}
