import { useLayoutEffect } from 'react';
import twemoji from '@twemoji/api';

export function useTwemoji(deps: unknown[] = []) {
  useLayoutEffect(() => {
    // Se ejecuta antes de que el navegador pinte, así el emoji nativo
    // nunca llega a mostrarse antes de convertirse (evita el parpadeo).
    twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}