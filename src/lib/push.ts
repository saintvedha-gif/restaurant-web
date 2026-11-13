import { apiFetch } from './api';
import { getReadyServiceWorker } from './pwa';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

export function pushSupported(): boolean {
  return (
    import.meta.env.PROD &&
    !!VAPID_PUBLIC_KEY &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function isSubscribed(): Promise<boolean> {
  const reg = await getReadyServiceWorker();
  return (await reg.pushManager.getSubscription()) !== null;
}

export async function subscribePush(): Promise<'ok' | 'denied'> {
  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const reg = await getReadyServiceWorker();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!) as BufferSource,
    }));

  const json = sub.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) {
    throw new Error('El navegador no entregó los datos de la suscripción.');
  }

  await apiFetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint: json.endpoint, keys: { p256dh, auth } }),
  });
  return 'ok';
}

export async function unsubscribePush(): Promise<void> {
  const reg = await getReadyServiceWorker();
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
}
