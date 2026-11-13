const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export async function apiFetch<T>(path: string, options: RequestInit = {}, timeoutMs = 2500): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type') && options.body != null) {
    headers.set('Content-Type', 'application/json');
  }

  const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (isWrite) {
    headers.set('X-Requested-With', 'mm-panel');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method,
      credentials: 'include',
      headers,
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (response.status === 401) {
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Error de la API');
    }

    return data as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error de la API';
    if (message === 'La petición tardó demasiado') throw error;
    if ((error as Error)?.name === 'AbortError') {
      throw new Error('La petición tardó demasiado');
    }
    throw new Error(message);
  } finally {
    clearTimeout(timeout);
  }
}
