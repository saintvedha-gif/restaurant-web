interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let serviceWorkerRegistration: Promise<ServiceWorkerRegistration> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = 12000): Promise<T> {
  let timeoutId = 0;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]).finally(() => window.clearTimeout(timeoutId));
}

// Se llama al arrancar: guarda el aviso de instalacion del navegador y registra el service worker.
export function initPwa(): void {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    serviceWorkerRegistration = navigator.serviceWorker.register('/sw.js');
    serviceWorkerRegistration.catch(error => {
      serviceWorkerRegistration = null;
      console.error('No se pudo registrar la aplicación para uso sin conexión.', error);
    });
  }
}

export function subscribePwa(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function canPromptInstall(): boolean {
  return deferred !== null;
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const promptEvent = deferred;
  if (!promptEvent) return 'unavailable';

  deferred = null;
  notify();
  try {
    await withTimeout(promptEvent.prompt(), 'El navegador no respondió a la solicitud de instalación.');
    const choice = await withTimeout(
      promptEvent.userChoice,
      'La solicitud de instalación sigue abierta. Complétala en el aviso del navegador.',
      60000
    );
    return choice.outcome;
  } finally {
    notify();
  }
}

export async function getReadyServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Este navegador no permite notificaciones push.');
  }

  try {
    const registrationPromise =
      serviceWorkerRegistration ?? navigator.serviceWorker.register('/sw.js');
    serviceWorkerRegistration = registrationPromise;
    const registration = await withTimeout(
      registrationPromise,
      'El registro de notificaciones tardó demasiado.'
    );
    if (registration.active) return registration;
    return await withTimeout(
      navigator.serviceWorker.ready,
      'La aplicación todavía no está lista para notificaciones.'
    );
  } catch (error) {
    serviceWorkerRegistration = null;
    throw error instanceof Error
      ? error
      : new Error('No se pudo iniciar el servicio de notificaciones.');
  }
}

export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

export function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
