import { DEFAULT_SETTINGS, FONT_SPECS } from '../data/siteSettings';
import type { SiteSettings } from '../data/siteSettings';

// Estas dos ya se cargan desde index.css
const PRELOADED = new Set(['Press Start 2P', 'Sora', 'Inter']);

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function loadFont(name: string): void {
  const spec = FONT_SPECS[name];
  if (!spec || PRELOADED.has(name)) return;
  const id = `font-${name.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const family = name.replace(/ /g, '+') + (spec.wght ? `:wght@${spec.wght}` : '');
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.appendChild(link);
}

export function fontFamilyValue(name: string): string {
  const spec = FONT_SPECS[name];
  return `'${name}', ${spec ? spec.fallback : 'sans-serif'}`;
}

export function applyTheme(s: SiteSettings): void {
  const root = document.documentElement;

  const rgb = hexToRgb(s.accent);
  if (!rgb || s.accent.toLowerCase() === DEFAULT_SETTINGS.accent.toLowerCase()) {
    root.style.removeProperty('--accent-400');
    root.style.removeProperty('--accent-300');
  } else {
    const light = rgb.map(v => Math.round(v + (255 - v) * 0.25));
    root.style.setProperty('--accent-400', rgb.join(' '));
    root.style.setProperty('--accent-300', light.join(' '));
  }

  if (s.titleFont === DEFAULT_SETTINGS.titleFont) {
    root.style.removeProperty('--font-title');
  } else {
    loadFont(s.titleFont);
    root.style.setProperty('--font-title', fontFamilyValue(s.titleFont));
  }

  if (s.bodyFont === DEFAULT_SETTINGS.bodyFont) {
    root.style.removeProperty('--font-body');
  } else {
    loadFont(s.bodyFont);
    root.style.setProperty('--font-body', fontFamilyValue(s.bodyFont));
  }
}
